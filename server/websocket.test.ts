import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createServer } from "http";
import { initializeWebSocket, broadcastWaterQualityUpdate, broadcastNewAlert, getConnectedClientsCount } from "./websocket";
import type { WaterQualityData, Alert } from "../drizzle/schema";

describe("WebSocket", () => {
  let httpServer: ReturnType<typeof createServer>;
  let io: ReturnType<typeof initializeWebSocket>;

  beforeEach(() => {
    httpServer = createServer();
    io = initializeWebSocket(httpServer);
  });

  afterEach(() => {
    io.close();
    httpServer.close();
  });

  it("should initialize WebSocket server", () => {
    expect(io).toBeDefined();
    expect(io.engine).toBeDefined();
  });

  it("should broadcast water quality update", () => {
    const mockData: WaterQualityData = {
      id: 1,
      tankId: 1,
      pH: 7.5,
      temperature: 28.5,
      dissolvedOxygen: 6.2,
      ammonia: 0.1,
      timestamp: new Date(),
      createdAt: new Date(),
    };

    const emitSpy = vi.spyOn(io, "to");

    broadcastWaterQualityUpdate(1, mockData);

    expect(emitSpy).toHaveBeenCalledWith("tank:1");
  });

  it("should broadcast new alert", () => {
    const mockAlert: Alert = {
      id: 1,
      tankId: 1,
      parameter: "pH",
      alertType: "critical",
      value: 9.2,
      message: "pH crítico",
      isResolved: false,
      resolvedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const emitSpy = vi.spyOn(io, "to");

    broadcastNewAlert(1, mockAlert);

    expect(emitSpy).toHaveBeenCalledWith("tank:1");
  });

  it("should get connected clients count", () => {
    const count = getConnectedClientsCount();
    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("should handle room subscriptions", () => {
    // Teste básico de inicialização
    expect(io).toBeDefined();
    expect(io.engine).toBeDefined();
  });
});
