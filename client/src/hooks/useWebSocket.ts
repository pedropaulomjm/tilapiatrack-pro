import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { WaterQualityData, Alert } from "../../../drizzle/schema";

interface UseWebSocketOptions {
  tankId?: number;
  enabled?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { tankId, enabled = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestWaterQuality, setLatestWaterQuality] = useState<WaterQualityData | null>(null);
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);
  const [resolvedAlerts, setResolvedAlerts] = useState<{ alertId: number; tankId: number }[]>([]);

  // Conectar ao WebSocket
  useEffect(() => {
    if (!enabled) return;

    // Obter URL do servidor
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const socketUrl = `${protocol}//${host}`;

    console.log("[WebSocket] Connecting to", socketUrl);

    const socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    // Eventos de conexão
    socket.on("connect", () => {
      console.log("[WebSocket] Connected");
      setIsConnected(true);

      // Subscrever ao tanque se fornecido
      if (tankId) {
        socket.emit("subscribe:tank", tankId);
      }
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("[WebSocket] Connection error:", error);
    });

    // Eventos de dados
    socket.on("water-quality:update", (data: WaterQualityData) => {
      console.log("[WebSocket] Water quality update:", data);
      setLatestWaterQuality(data);
    });

    socket.on("alert:new", (data: Alert) => {
      console.log("[WebSocket] New alert:", data);
      setLatestAlert(data);
    });

    socket.on("alert:resolved", (data: { alertId: number; tankId: number }) => {
      console.log("[WebSocket] Alert resolved:", data);
      setResolvedAlerts((prev) => [...prev, data]);
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [enabled, tankId]);

  // Subscrever/desinscrever de tanque
  const subscribeTank = useCallback((id: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("subscribe:tank", id);
      console.log("[WebSocket] Subscribed to tank", id);
    }
  }, []);

  const unsubscribeTank = useCallback((id: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("unsubscribe:tank", id);
      console.log("[WebSocket] Unsubscribed from tank", id);
    }
  }, []);

  return {
    isConnected,
    latestWaterQuality,
    latestAlert,
    resolvedAlerts,
    subscribeTank,
    unsubscribeTank,
    socket: socketRef.current,
  };
}
