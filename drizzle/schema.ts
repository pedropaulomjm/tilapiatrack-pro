import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  json,
  datetime
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tanques de piscicultura
 */
export const tanks = mysqlTable("tanks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  volume: decimal("volume", { precision: 10, scale: 2 }), // em litros
  location: varchar("location", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive", "maintenance"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tank = typeof tanks.$inferSelect;
export type InsertTank = typeof tanks.$inferInsert;

/**
 * Limites de parâmetros por tanque
 */
export const parameterLimits = mysqlTable("parameter_limits", {
  id: int("id").autoincrement().primaryKey(),
  tankId: int("tankId").notNull(),
  parameter: mysqlEnum("parameter", ["pH", "temperature", "dissolvedOxygen", "ammonia"]).notNull(),
  minSafe: decimal("minSafe", { precision: 8, scale: 2 }).notNull(),
  maxSafe: decimal("maxSafe", { precision: 8, scale: 2 }).notNull(),
  minCritical: decimal("minCritical", { precision: 8, scale: 2 }),
  maxCritical: decimal("maxCritical", { precision: 8, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParameterLimit = typeof parameterLimits.$inferSelect;
export type InsertParameterLimit = typeof parameterLimits.$inferInsert;

/**
 * Dados de qualidade da água em tempo real
 */
export const waterQualityData = mysqlTable("water_quality_data", {
  id: int("id").autoincrement().primaryKey(),
  tankId: int("tankId").notNull(),
  pH: decimal("pH", { precision: 4, scale: 2 }),
  temperature: decimal("temperature", { precision: 5, scale: 2 }), // em Celsius
  dissolvedOxygen: decimal("dissolvedOxygen", { precision: 5, scale: 2 }), // em mg/L
  ammonia: decimal("ammonia", { precision: 5, scale: 2 }), // em mg/L
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WaterQualityData = typeof waterQualityData.$inferSelect;
export type InsertWaterQualityData = typeof waterQualityData.$inferInsert;

/**
 * Alertas do sistema
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  tankId: int("tankId").notNull(),
  parameter: mysqlEnum("parameter", ["pH", "temperature", "dissolvedOxygen", "ammonia"]).notNull(),
  alertType: mysqlEnum("alertType", ["warning", "critical"]).notNull(),
  value: decimal("value", { precision: 8, scale: 2 }).notNull(),
  message: text("message").notNull(),
  isResolved: boolean("isResolved").default(false).notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * Configuração de relatórios automáticos
 */
export const reportConfigs = mysqlTable("report_configs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tankId: int("tankId"),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly"]).notNull(),
  dayOfWeek: int("dayOfWeek"), // 0-6 para weekly
  dayOfMonth: int("dayOfMonth"), // 1-31 para monthly
  hour: int("hour").default(9).notNull(), // hora do dia (0-23)
  enabled: boolean("enabled").default(true).notNull(),
  lastSentAt: timestamp("lastSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReportConfig = typeof reportConfigs.$inferSelect;
export type InsertReportConfig = typeof reportConfigs.$inferInsert;

/**
 * Análises preditivas e insights gerados pelo LLM
 */
export const predictions = mysqlTable("predictions", {
  id: int("id").autoincrement().primaryKey(),
  tankId: int("tankId").notNull(),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]).notNull(),
  riskDescription: text("riskDescription").notNull(),
  recommendations: text("recommendations").notNull(),
  dataPoints: int("dataPoints"), // número de pontos de dados analisados
  analysisDate: timestamp("analysisDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = typeof predictions.$inferInsert;

/**
 * Tokens de webhook para autenticação de sensores IoT
 */
export const webhookTokens = mysqlTable("webhook_tokens", {
  id: int("id").autoincrement().primaryKey(),
  tankId: int("tankId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WebhookToken = typeof webhookTokens.$inferSelect;
export type InsertWebhookToken = typeof webhookTokens.$inferInsert;

/**
 * Histórico de eventos do sistema
 */
export const systemEvents = mysqlTable("system_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  tankId: int("tankId"),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SystemEvent = typeof systemEvents.$inferSelect;
export type InsertSystemEvent = typeof systemEvents.$inferInsert;
