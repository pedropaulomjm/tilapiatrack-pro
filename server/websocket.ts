import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import type { WaterQualityData, Alert } from "../drizzle/schema";

export interface ServerToClientEvents {
  "water-quality:update": (data: WaterQualityData) => void;
  "alert:new": (data: Alert) => void;
  "alert:resolved": (data: { alertId: number; tankId: number }) => void;
  "connection-status": (data: { status: "connected" | "disconnected" }) => void;
}

export interface ClientToServerEvents {
  "subscribe:tank": (tankId: number) => void;
  "unsubscribe:tank": (tankId: number) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: number;
  subscribedTanks: Set<number>;
}

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null = null;

export function initializeWebSocket(
  httpServer: HTTPServer
): SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
    console.log(`[WebSocket] User connected: ${socket.id}`);

    socket.data.subscribedTanks = new Set();

    // Evento de subscrição a tanque
    socket.on("subscribe:tank", (tankId: number) => {
      socket.data.subscribedTanks.add(tankId);
      socket.join(`tank:${tankId}`);
      console.log(`[WebSocket] Socket ${socket.id} subscribed to tank ${tankId}`);
    });

    // Evento de desinscrição de tanque
    socket.on("unsubscribe:tank", (tankId: number) => {
      socket.data.subscribedTanks.delete(tankId);
      socket.leave(`tank:${tankId}`);
      console.log(`[WebSocket] Socket ${socket.id} unsubscribed from tank ${tankId}`);
    });

    // Desconexão
    socket.on("disconnect", () => {
      console.log(`[WebSocket] User disconnected: ${socket.id}`);
    });

    // Erro
    socket.on("error", (error) => {
      console.error(`[WebSocket] Socket error for ${socket.id}:`, error);
    });
  });

  return io;
}

export function getWebSocketServer(): SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> | null {
  return io;
}

/**
 * Broadcast de atualização de qualidade da água para um tanque específico
 */
export function broadcastWaterQualityUpdate(tankId: number, data: WaterQualityData): void {
  if (!io) {
    console.warn("[WebSocket] WebSocket not initialized");
    return;
  }

  io.to(`tank:${tankId}`).emit("water-quality:update", data);
  console.log(`[WebSocket] Broadcasted water quality update for tank ${tankId}`);
}

/**
 * Broadcast de novo alerta para um tanque específico
 */
export function broadcastNewAlert(tankId: number, alert: Alert): void {
  if (!io) {
    console.warn("[WebSocket] WebSocket not initialized");
    return;
  }

  io.to(`tank:${tankId}`).emit("alert:new", alert);
  console.log(`[WebSocket] Broadcasted new alert for tank ${tankId}`);
}

/**
 * Broadcast de alerta resolvido para um tanque específico
 */
export function broadcastAlertResolved(tankId: number, alertId: number): void {
  if (!io) {
    console.warn("[WebSocket] WebSocket not initialized");
    return;
  }

  io.to(`tank:${tankId}`).emit("alert:resolved", { alertId, tankId });
  console.log(`[WebSocket] Broadcasted alert resolved for tank ${tankId}`);
}

/**
 * Broadcast para todos os clientes conectados
 */
export function broadcastToAll(event: string, data: unknown): void {
  if (!io) {
    console.warn("[WebSocket] WebSocket not initialized");
    return;
  }

  io.emit(event as any, data);
  console.log(`[WebSocket] Broadcasted to all clients: ${event}`);
}

/**
 * Obter número de clientes conectados
 */
export function getConnectedClientsCount(): number {
  if (!io) return 0;
  return io.engine.clientsCount;
}

/**
 * Obter clientes conectados a um tanque específico
 */
export function getClientsForTank(tankId: number): number {
  if (!io) return 0;
  const room = io.sockets.adapter.rooms.get(`tank:${tankId}`);
  return room ? room.size : 0;
}
