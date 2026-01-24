import { Router, Request, Response } from "express";
import { z } from "zod";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";

const router = Router();

// Schema de validação para dados de sensores
const sensorDataSchema = z.object({
  pH: z.number().optional(),
  temperature: z.number().optional(),
  dissolvedOxygen: z.number().optional(),
  ammonia: z.number().optional(),
});

/**
 * POST /api/webhooks/sensors
 * Recebe dados de sensores IoT
 * Header: Authorization: Bearer <webhook_token>
 */
router.post("/sensors", async (req: Request, res: Response) => {
  try {
    // Extrair token do header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.substring(7);

    // Validar token
    const webhookToken = await db.getWebhookTokenByToken(token);
    if (!webhookToken || !webhookToken.isActive) {
      return res.status(401).json({ error: "Invalid or inactive token" });
    }

    // Validar dados
    const data = sensorDataSchema.parse(req.body);

    // Verificar se há pelo menos um parâmetro
    if (!data.pH && !data.temperature && !data.dissolvedOxygen && !data.ammonia) {
      return res.status(400).json({ error: "At least one parameter is required" });
    }

    // Registrar dados
    await db.recordWaterQualityData({
      tankId: webhookToken.tankId,
      ...data,
    });

    // Atualizar timestamp do webhook
    // (Implementar se necessário)

    // Verificar limites e criar alertas se necessário
    const limits = await db.getParameterLimitsByTank(webhookToken.tankId);
    const tank = await db.getTankById(webhookToken.tankId);

    for (const limit of limits) {
      let value: number | undefined;
      let parameter: string = limit.parameter;

      if (limit.parameter === "pH") value = data.pH;
      else if (limit.parameter === "temperature") value = data.temperature;
      else if (limit.parameter === "dissolvedOxygen") value = data.dissolvedOxygen;
      else if (limit.parameter === "ammonia") value = data.ammonia;

      if (value === undefined) continue;

      // Verificar se está fora dos limites críticos
      const minCritical = limit.minCritical ? Number(limit.minCritical) : undefined;
      const maxCritical = limit.maxCritical ? Number(limit.maxCritical) : undefined;
      const minSafe = limit.minSafe ? Number(limit.minSafe) : undefined;
      const maxSafe = limit.maxSafe ? Number(limit.maxSafe) : undefined;

      if (
        (minCritical && value < minCritical) ||
        (maxCritical && value > maxCritical)
      ) {
        const message = `CRÍTICO: ${parameter} = ${value} no tanque ${tank?.name}`;
        await db.createAlert({
          tankId: webhookToken.tankId,
          parameter: parameter as any,
          alertType: "critical",
          value,
          message,
        });

        // Notificar proprietário
        await notifyOwner({
          title: `Alerta Crítico - ${tank?.name}`,
          content: message,
        });
      }
      // Verificar se está fora dos limites seguros
      else if (
        (minSafe && value < minSafe) ||
        (maxSafe && value > maxSafe)
      ) {
        const message = `AVISO: ${parameter} = ${value} no tanque ${tank?.name}`;
        await db.createAlert({
          tankId: webhookToken.tankId,
          parameter: parameter as any,
          alertType: "warning",
          value,
          message,
        });
      }
    }

    // Log do evento
    await db.logSystemEvent({
      tankId: webhookToken.tankId,
      eventType: "sensor_data_received",
      description: `Dados de sensores recebidos: pH=${data.pH}, Temp=${data.temperature}, OD=${data.dissolvedOxygen}, Ammonia=${data.ammonia}`,
      metadata: data,
    });

    res.json({ success: true, tankId: webhookToken.tankId });
  } catch (error) {
    console.error("[Webhook] Error processing sensor data:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid data format", details: error.issues });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
