import { eq, and, or, desc, gte, lte, between } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  tanks,
  waterQualityData,
  alerts,
  parameterLimits,
  predictions,
  reportConfigs,
  webhookTokens,
  systemEvents,
  Tank,
  WaterQualityData,
  Alert,
  ParameterLimit,
  Prediction,
  ReportConfig,
  WebhookToken,
  SystemEvent
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ TANK QUERIES ============

export async function getTanksByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tanks).where(eq(tanks.userId, userId));
}

export async function getTankById(tankId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tanks).where(eq(tanks.id, tankId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTank(data: {
  userId: number;
  name: string;
  description?: string;
  volume?: string;
  location?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tanks).values({
    userId: data.userId,
    name: data.name,
    description: data.description,
    volume: data.volume as any,
    location: data.location,
  });
  
  return result;
}

export async function updateTank(tankId: number, data: Partial<Tank>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(tanks).set(data).where(eq(tanks.id, tankId));
}

export async function deleteTank(tankId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(tanks).where(eq(tanks.id, tankId));
}

// ============ WATER QUALITY DATA QUERIES ============

export async function recordWaterQualityData(data: {
  tankId: number;
  pH?: number;
  temperature?: number;
  dissolvedOxygen?: number;
  ammonia?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(waterQualityData).values({
    tankId: data.tankId,
    pH: data.pH as any,
    temperature: data.temperature as any,
    dissolvedOxygen: data.dissolvedOxygen as any,
    ammonia: data.ammonia as any,
  });
}

export async function getLatestWaterQualityData(tankId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(waterQualityData)
    .where(eq(waterQualityData.tankId, tankId))
    .orderBy(desc(waterQualityData.timestamp))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getWaterQualityDataRange(
  tankId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(waterQualityData)
    .where(
      and(
        eq(waterQualityData.tankId, tankId),
        between(waterQualityData.timestamp, startDate, endDate)
      )
    )
    .orderBy(waterQualityData.timestamp);
}

// ============ PARAMETER LIMITS QUERIES ============

export async function getParameterLimitsByTank(tankId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(parameterLimits).where(eq(parameterLimits.tankId, tankId));
}

export async function setParameterLimit(data: {
  tankId: number;
  parameter: "pH" | "temperature" | "dissolvedOxygen" | "ammonia";
  minSafe: number;
  maxSafe: number;
  minCritical?: number;
  maxCritical?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if limit already exists
  const existing = await db
    .select()
    .from(parameterLimits)
    .where(
      and(
        eq(parameterLimits.tankId, data.tankId),
        eq(parameterLimits.parameter, data.parameter)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    return db
      .update(parameterLimits)
      .set({
        minSafe: data.minSafe as any,
        maxSafe: data.maxSafe as any,
        minCritical: data.minCritical as any,
        maxCritical: data.maxCritical as any,
      })
      .where(eq(parameterLimits.id, existing[0].id));
  }
  
  return db.insert(parameterLimits).values({
    tankId: data.tankId,
    parameter: data.parameter,
    minSafe: data.minSafe as any,
    maxSafe: data.maxSafe as any,
    minCritical: data.minCritical as any,
    maxCritical: data.maxCritical as any,
  });
}

// ============ ALERT QUERIES ============

export async function createAlert(data: {
  tankId: number;
  parameter: "pH" | "temperature" | "dissolvedOxygen" | "ammonia";
  alertType: "warning" | "critical";
  value: number;
  message: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(alerts).values({
    tankId: data.tankId,
    parameter: data.parameter,
    alertType: data.alertType,
    value: data.value as any,
    message: data.message,
  });
}

export async function getAlertsByTank(tankId: number, unresolved = false) {
  const db = await getDb();
  if (!db) return [];
  
  if (unresolved) {
    return db
      .select()
      .from(alerts)
      .where(and(eq(alerts.tankId, tankId), eq(alerts.isResolved, false)))
      .orderBy(desc(alerts.createdAt));
  }
  
  return db.select().from(alerts).where(eq(alerts.tankId, tankId)).orderBy(desc(alerts.createdAt));
}

export async function resolveAlert(alertId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db
    .update(alerts)
    .set({
      isResolved: true,
      resolvedAt: new Date(),
    })
    .where(eq(alerts.id, alertId));
}

// ============ PREDICTION QUERIES ============

export async function createPrediction(data: {
  tankId: number;
  riskLevel: "low" | "medium" | "high";
  riskDescription: string;
  recommendations: string;
  dataPoints: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(predictions).values({
    tankId: data.tankId,
    riskLevel: data.riskLevel,
    riskDescription: data.riskDescription,
    recommendations: data.recommendations,
    dataPoints: data.dataPoints,
  });
}

export async function getLatestPredictionByTank(tankId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(predictions)
    .where(eq(predictions.tankId, tankId))
    .orderBy(desc(predictions.analysisDate))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

// ============ REPORT CONFIG QUERIES ============

export async function getReportConfigsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(reportConfigs).where(eq(reportConfigs.userId, userId));
}

export async function createReportConfig(data: {
  userId: number;
  tankId?: number;
  frequency: "daily" | "weekly" | "monthly";
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(reportConfigs).values({
    userId: data.userId,
    tankId: data.tankId,
    frequency: data.frequency,
    dayOfWeek: data.dayOfWeek,
    dayOfMonth: data.dayOfMonth,
    hour: data.hour ?? 9,
  });
}

// ============ WEBHOOK TOKEN QUERIES ============

export async function createWebhookToken(data: {
  tankId: number;
  name?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const token = `wh_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  
  return db.insert(webhookTokens).values({
    tankId: data.tankId,
    token,
    name: data.name,
  });
}

export async function getWebhookTokenByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(webhookTokens)
    .where(eq(webhookTokens.token, token))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getWebhookTokensByTank(tankId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(webhookTokens).where(eq(webhookTokens.tankId, tankId));
}

// ============ SYSTEM EVENT QUERIES ============

export async function logSystemEvent(data: {
  userId?: number;
  tankId?: number;
  eventType: string;
  description?: string;
  metadata?: Record<string, any>;
}) {
  const db = await getDb();
  if (!db) return;
  
  try {
    await db.insert(systemEvents).values({
      userId: data.userId,
      tankId: data.tankId,
      eventType: data.eventType,
      description: data.description,
      metadata: data.metadata,
    });
  } catch (error) {
    console.error("[Database] Failed to log system event:", error);
  }
}


// ============ DELETE FUNCTIONS ============

export async function deleteWebhookToken(tokenId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(webhookTokens).where(eq(webhookTokens.id, tokenId));
}

export async function deleteStockItem(itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Import stockItems table
  const { stockItems } = await import("../drizzle/schema");
  return db.delete(stockItems).where(eq(stockItems.id, itemId));
}

export async function deleteSupplier(supplierId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Import suppliers table
  const { suppliers } = await import("../drizzle/schema");
  return db.delete(suppliers).where(eq(suppliers.id, supplierId));
}

export async function deleteFeedingRecord(recordId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Import feedingRecords table
  const { feedingRecords } = await import("../drizzle/schema");
  return db.delete(feedingRecords).where(eq(feedingRecords.id, recordId));
}


// ============ AUDIT LOG FUNCTIONS ============

export async function logAuditEvent(data: {
  userId: number;
  action: "create" | "update" | "delete" | "restore";
  entityType: string;
  entityId: number;
  entityName?: string;
  changes?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) return;

  try {
    const { auditLog } = await import("../drizzle/schema");
    await db.insert(auditLog).values({
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      changes: data.changes,
      reason: data.reason,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  } catch (error) {
    console.error("[Database] Failed to log audit event:", error);
  }
}

export async function getAuditLogs(filters?: {
  userId?: number;
  entityType?: string;
  action?: "create" | "update" | "delete" | "restore";
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { auditLog } = await import("../drizzle/schema");
    
    const conditions: any[] = [];

    if (filters?.userId) {
      conditions.push(eq(auditLog.userId, filters.userId));
    }
    if (filters?.entityType) {
      conditions.push(eq(auditLog.entityType, filters.entityType));
    }
    if (filters?.action) {
      conditions.push(eq(auditLog.action, filters.action));
    }
    if (filters?.startDate) {
      conditions.push(gte(auditLog.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(auditLog.createdAt, filters.endDate));
    }

    let query: any = db.select().from(auditLog);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(auditLog.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  } catch (error) {
    console.error("[Database] Failed to get audit logs:", error);
    return [];
  }
}

// ============ SOFT DELETE FUNCTIONS ============

export async function softDeleteTank(tankId: number, userId: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const tank = await getTankById(tankId);
  if (!tank) throw new Error("Tank not found");

  // Log the deletion
  await logAuditEvent({
    userId,
    action: "delete",
    entityType: "tank",
    entityId: tankId,
    entityName: tank.name,
    reason,
  });

  // For now, perform hard delete as soft delete would require schema changes
  return db.delete(tanks).where(eq(tanks.id, tankId));
}

export async function softDeleteStockItem(itemId: number, userId: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { stockItems } = await import("../drizzle/schema");

    // Get item for logging
    const item = await db
      .select()
      .from(stockItems)
      .where(eq(stockItems.id, itemId))
      .limit(1);

    if (item.length === 0) throw new Error("Stock item not found");

    // Log the deletion
    await logAuditEvent({
      userId,
      action: "delete",
      entityType: "stock_item",
      entityId: itemId,
      entityName: item[0].name,
      reason,
    });

    return db.delete(stockItems).where(eq(stockItems.id, itemId));
  } catch (error) {
    console.error("[Database] Failed to soft delete stock item:", error);
    throw error;
  }
}

export async function softDeleteSupplier(supplierId: number, userId: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { suppliers } = await import("../drizzle/schema");

    // Get supplier for logging
    const supplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, supplierId))
      .limit(1);

    if (supplier.length === 0) throw new Error("Supplier not found");

    // Log the deletion
    await logAuditEvent({
      userId,
      action: "delete",
      entityType: "supplier",
      entityId: supplierId,
      entityName: supplier[0].name,
      reason,
    });

    return db.delete(suppliers).where(eq(suppliers.id, supplierId));
  } catch (error) {
    console.error("[Database] Failed to soft delete supplier:", error);
    throw error;
  }
}

export async function softDeleteFeedingRecord(recordId: number, userId: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { feedingRecords } = await import("../drizzle/schema");

    // Get record for logging
    const record = await db
      .select()
      .from(feedingRecords)
      .where(eq(feedingRecords.id, recordId))
      .limit(1);

    if (record.length === 0) throw new Error("Feeding record not found");

    // Log the deletion
    await logAuditEvent({
      userId,
      action: "delete",
      entityType: "feeding_record",
      entityId: recordId,
      entityName: `Alimentação - ${record[0].quantityActual || record[0].quantityPlanned}kg`,
      reason,
    });

    return db.delete(feedingRecords).where(eq(feedingRecords.id, recordId));
  } catch (error) {
    console.error("[Database] Failed to soft delete feeding record:", error);
    throw error;
  }
}

export async function softDeleteWebhookToken(tokenId: number, userId: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get token for logging
  const token = await db
    .select()
    .from(webhookTokens)
    .where(eq(webhookTokens.id, tokenId))
    .limit(1);

  if (token.length === 0) throw new Error("Webhook token not found");

  // Log the deletion
  await logAuditEvent({
    userId,
    action: "delete",
    entityType: "webhook_token",
    entityId: tokenId,
    entityName: token[0].name || token[0].token,
    reason,
  });

  return db.delete(webhookTokens).where(eq(webhookTokens.id, tokenId));
}
