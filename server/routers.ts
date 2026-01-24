import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ TANK PROCEDURES ============
  tanks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getTanksByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const tank = await db.getTankById(input.id);
        if (!tank) throw new TRPCError({ code: "NOT_FOUND" });
        
        // Verify ownership
        if (tank.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        return tank;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        volume: z.string().optional(),
        location: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createTank({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        volume: z.string().optional(),
        location: z.string().optional(),
        status: z.enum(["active", "inactive", "maintenance"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const tank = await db.getTankById(input.id);
        if (!tank) throw new TRPCError({ code: "NOT_FOUND" });
        if (tank.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const { id, ...updateData } = input;
        return db.updateTank(id, updateData as any);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const tank = await db.getTankById(input.id);
        if (!tank) throw new TRPCError({ code: "NOT_FOUND" });
        if (tank.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.deleteTank(input.id);
      }),
  }),

  // ============ WATER QUALITY PROCEDURES ============
  waterQuality: router({
    getLatest: protectedProcedure
      .input(z.object({ tankId: z.number() }))
      .query(async ({ input, ctx }) => {
        const tank = await db.getTankById(input.tankId);
        if (!tank) throw new TRPCError({ code: "NOT_FOUND" });
        if (tank.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.getLatestWaterQualityData(input.tankId);
      }),

    getRange: protectedProcedure
      .input(z.object({
        tankId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input, ctx }) => {
        const tank = await db.getTankById(input.tankId);
        if (!tank) throw new TRPCError({ code: "NOT_FOUND" });
        if (tank.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.getWaterQualityDataRange(input.tankId, input.startDate, input.endDate);
      }),
  }),

  // ============ PARAMETER LIMITS PROCEDURES ============
  parameterLimits: router({
    getByTank: protectedProcedure
      .input(z.object({ tankId: z.number() }))
      .query(async ({ input, ctx }) => {
        const tank = await db.getTankById(input.tankId);
        if (!tank) throw new TRPCError({ code: "NOT_FOUND" });
        if (tank.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.getParameterLimitsByTank(input.tankId);
      }),

    set: protectedProcedure
      .input(z.object({
        tankId: z.number(),
        parameter: z.enum(["pH", "temperature", "dissolvedOxygen", "ammonia"]),
        minSafe: z.number(),
        maxSafe: z.number(),
        minCritical: z.number().optional(),
        maxCritical: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const tank = await db.getTankById(input.tankId);
        if (!tank) throw new TRPCError({ code: "NOT_FOUND" });
        if (tank.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.setParameterLimit(input);
      }),
  }),

  // ============ ALERTS PROCEDURES ============
  alerts: router({
    getByTank: protectedProcedure
      .input(z.object({
        tankId: z.number(),
        unresolved: z.boolean().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const tank = await db.getTankById(input.tankId);
        if (!tank) throw new TRPCError({ code: "NOT_FOUND" });
        if (tank.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.getAlertsByTank(input.tankId, input.unresolved);
      }),

    resolve: protectedProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return db.resolveAlert(input.alertId);
      }),
  }),

  // ============ PREDICTIONS PROCEDURES ============
  predictions: router({
    getLatest: protectedProcedure
      .input(z.object({ tankId: z.number() }))
      .query(async ({ input, ctx }) => {
        const tank = await db.getTankById(input.tankId);
        if (!tank) throw new TRPCError({ code: "NOT_FOUND" });
        if (tank.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.getLatestPredictionByTank(input.tankId);
      }),

    analyze: protectedProcedure
      .input(z.object({ tankId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const tank = await db.getTankById(input.tankId);
        if (!tank) throw new TRPCError({ code: "NOT_FOUND" });
        if (tank.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Get last 30 days of data
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const today = new Date();
        const historicalData = await db.getWaterQualityDataRange(input.tankId, thirtyDaysAgo, today);

        if (historicalData.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient data for analysis",
          });
        }

        // Prepare data summary for LLM
        const summary = {
          tankName: tank.name,
          dataPoints: historicalData.length,
          parameters: {
            pH: historicalData.map(d => d.pH).filter(Boolean),
            temperature: historicalData.map(d => d.temperature).filter(Boolean),
            dissolvedOxygen: historicalData.map(d => d.dissolvedOxygen).filter(Boolean),
            ammonia: historicalData.map(d => d.ammonia).filter(Boolean),
          },
        };

        // Call LLM for analysis
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert aquaculture specialist analyzing tilapia pond water quality data. Provide risk assessment and actionable recommendations.",
            },
            {
              role: "user",
              content: `Analyze this water quality data and provide risk assessment:\n${JSON.stringify(summary, null, 2)}\n\nProvide response in JSON format with fields: riskLevel (low/medium/high), riskDescription, recommendations`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  riskLevel: {
                    type: "string",
                    enum: ["low", "medium", "high"],
                  },
                  riskDescription: {
                    type: "string",
                  },
                  recommendations: {
                    type: "string",
                  },
                },
                required: ["riskLevel", "riskDescription", "recommendations"],
                additionalProperties: false,
              },
            },
          },
        });

        const analysisText = typeof response.choices?.[0]?.message?.content === "string"
          ? response.choices[0].message.content
          : "";

        const analysis = JSON.parse(analysisText);

        // Save prediction
        await db.createPrediction({
          tankId: input.tankId,
          riskLevel: analysis.riskLevel,
          riskDescription: analysis.riskDescription,
          recommendations: analysis.recommendations,
          dataPoints: historicalData.length,
        });

        return analysis;
      }),
  }),

  // ============ REPORT CONFIG PROCEDURES ============
  reportConfigs: router({
    getByUser: protectedProcedure.query(async ({ ctx }) => {
      return db.getReportConfigsByUser(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        tankId: z.number().optional(),
        frequency: z.enum(["daily", "weekly", "monthly"]),
        dayOfWeek: z.number().optional(),
        dayOfMonth: z.number().optional(),
        hour: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createReportConfig({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // ============ WEBHOOK TOKEN PROCEDURES ============
  webhookTokens: router({
    getByTank: protectedProcedure
      .input(z.object({ tankId: z.number() }))
      .query(async ({ input, ctx }) => {
        const tank = await db.getTankById(input.tankId);
        if (!tank) throw new TRPCError({ code: "NOT_FOUND" });
        if (tank.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.getWebhookTokensByTank(input.tankId);
      }),

    create: protectedProcedure
      .input(z.object({
        tankId: z.number(),
        name: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const tank = await db.getTankById(input.tankId);
        if (!tank) throw new TRPCError({ code: "NOT_FOUND" });
        if (tank.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.createWebhookToken(input);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return db.deleteWebhookToken(input.id);
      }),
  }),

  // ============ STOCK PROCEDURES ============
  stock: router({
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return db.deleteStockItem(input.id);
      }),
  }),

  // ============ SUPPLIERS PROCEDURES ============
  suppliers: router({
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return db.deleteSupplier(input.id);
      }),
  }),

  // ============ FEEDING PROCEDURES ============
  feeding: router({
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return db.deleteFeedingRecord(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
