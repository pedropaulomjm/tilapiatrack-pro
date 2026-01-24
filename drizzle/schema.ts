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

/**
 * Alimentadores automáticos
 */
export const feeders = mysqlTable("feeders", {
  id: int("id").autoincrement().primaryKey(),
  tankId: int("tankId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  model: varchar("model", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive", "maintenance"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Feeder = typeof feeders.$inferSelect;
export type InsertFeeder = typeof feeders.$inferInsert;

/**
 * Programações de alimentação
 */
export const feedingSchedules = mysqlTable("feeding_schedules", {
  id: int("id").autoincrement().primaryKey(),
  feederId: int("feederId").notNull(),
  tankId: int("tankId").notNull(),
  time: varchar("time", { length: 5 }).notNull(),
  quantity: decimal("quantity", { precision: 8, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeedingSchedule = typeof feedingSchedules.$inferSelect;
export type InsertFeedingSchedule = typeof feedingSchedules.$inferInsert;

/**
 * Registros de alimentação
 */
export const feedingRecords = mysqlTable("feeding_records", {
  id: int("id").autoincrement().primaryKey(),
  tankId: int("tankId").notNull(),
  feederId: int("feederId"),
  quantityPlanned: decimal("quantityPlanned", { precision: 8, scale: 2 }),
  quantityActual: decimal("quantityActual", { precision: 8, scale: 2 }),
  costPerUnit: decimal("costPerUnit", { precision: 10, scale: 2 }),
  totalCost: decimal("totalCost", { precision: 10, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

export type FeedingRecord = typeof feedingRecords.$inferSelect;
export type InsertFeedingRecord = typeof feedingRecords.$inferInsert;

/**
 * Amostragem de peso por tanque
 */
export const weightSamples = mysqlTable("weight_samples", {
  id: int("id").autoincrement().primaryKey(),
  tankId: int("tankId").notNull(),
  sampleSize: int("sampleSize"), // número de peixes amostrados
  averageWeight: decimal("averageWeight", { precision: 8, scale: 3 }), // peso médio em gramas
  totalWeight: decimal("totalWeight", { precision: 10, scale: 2 }), // peso total da amostra
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

export type WeightSample = typeof weightSamples.$inferSelect;
export type InsertWeightSample = typeof weightSamples.$inferInsert;

/**
 * Itens de estoque
 */
export const stockItems = mysqlTable("stock_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  unit: varchar("unit", { length: 50 }).notNull(),
  currentQuantity: decimal("currentQuantity", { precision: 12, scale: 2 }).default("0").notNull(),
  minQuantity: decimal("minQuantity", { precision: 12, scale: 2 }),
  maxQuantity: decimal("maxQuantity", { precision: 12, scale: 2 }),
  lastUnitCost: decimal("lastUnitCost", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StockItem = typeof stockItems.$inferSelect;
export type InsertStockItem = typeof stockItems.$inferInsert;

/**
 * Movimentações de estoque
 */
export const stockMovements = mysqlTable("stock_movements", {
  id: int("id").autoincrement().primaryKey(),
  stockItemId: int("stockItemId").notNull(),
  type: mysqlEnum("type", ["entry", "exit", "adjustment"]).notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 2 }).notNull(),
  unitCost: decimal("unitCost", { precision: 10, scale: 2 }),
  totalCost: decimal("totalCost", { precision: 12, scale: 2 }),
  reference: varchar("reference", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = typeof stockMovements.$inferInsert;

/**
 * Fornecedores
 */
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  cnpj: varchar("cnpj", { length: 20 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

/**
 * Histórico de preços por fornecedor
 */
export const supplierPrices = mysqlTable("supplier_prices", {
  id: int("id").autoincrement().primaryKey(),
  supplierId: int("supplierId").notNull(),
  stockItemId: int("stockItemId").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SupplierPrice = typeof supplierPrices.$inferSelect;
export type InsertSupplierPrice = typeof supplierPrices.$inferInsert;

/**
 * Transações financeiras
 */
export const financialTransactions = mysqlTable("financial_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tankId: int("tankId"),
  type: mysqlEnum("type", ["income", "expense"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  isFixed: boolean("isFixed").default(false).notNull(),
  isDirect: boolean("isDirect").default(true).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = typeof financialTransactions.$inferInsert;

/**
 * Referências técnicas de parâmetros de água
 */
export const waterParameterReferences = mysqlTable("water_parameter_references", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  parameter: varchar("parameter", { length: 100 }).notNull(),
  optimalMin: decimal("optimalMin", { precision: 8, scale: 2 }),
  optimalMax: decimal("optimalMax", { precision: 8, scale: 2 }),
  warningMin: decimal("warningMin", { precision: 8, scale: 2 }),
  warningMax: decimal("warningMax", { precision: 8, scale: 2 }),
  criticalMin: decimal("criticalMin", { precision: 8, scale: 2 }),
  criticalMax: decimal("criticalMax", { precision: 8, scale: 2 }),
  unit: varchar("unit", { length: 50 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WaterParameterReference = typeof waterParameterReferences.$inferSelect;
export type InsertWaterParameterReference = typeof waterParameterReferences.$inferInsert;



/**
 * Câmeras de segurança
 */
export const securityCameras = mysqlTable("security_cameras", {
  id: int("id").autoincrement().primaryKey(),
  tankId: int("tankId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  streamUrl: text("streamUrl").notNull(),
  status: mysqlEnum("status", ["online", "offline", "maintenance"]).default("offline").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SecurityCamera = typeof securityCameras.$inferSelect;
export type InsertSecurityCamera = typeof securityCameras.$inferInsert;

/**
 * Expansão de dados de tanques
 */
export const tankDetails = mysqlTable("tank_details", {
  id: int("id").autoincrement().primaryKey(),
  tankId: int("tankId").notNull().unique(),
  populationDensity: decimal("populationDensity", { precision: 10, scale: 2 }),
  currentPopulation: int("currentPopulation").default(0),
  cyclePhase: mysqlEnum("cyclePhase", ["alevinagem", "juvenil", "engorda", "venda"]),
  mortalityRate: decimal("mortalityRate", { precision: 5, scale: 2 }),
  costToDate: decimal("costToDate", { precision: 12, scale: 2 }),
  projectedSaleDate: timestamp("projectedSaleDate"),
  projectedCost: decimal("projectedCost", { precision: 12, scale: 2 }),
  projectedRevenue: decimal("projectedRevenue", { precision: 12, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TankDetails = typeof tankDetails.$inferSelect;
export type InsertTankDetails = typeof tankDetails.$inferInsert;


/**
 * Trilha de auditoria - rastreia todas as mudanças no sistema
 */
export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: mysqlEnum("action", ["create", "update", "delete", "restore"]).notNull(),
  entityType: varchar("entityType", { length: 50 }).notNull(), // "tank", "stock", "supplier", etc
  entityId: int("entityId").notNull(),
  entityName: varchar("entityName", { length: 255 }), // Nome do item deletado para referência
  changes: json("changes"), // JSON com antes/depois para updates
  reason: text("reason"), // Motivo da ação
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;


/**
 * Espécies de peixe
 */
export const fishSpecies = mysqlTable("fish_species", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  scientificName: varchar("scientificName", { length: 255 }),
  description: text("description"),
  idealTemperatureMin: decimal("idealTemperatureMin", { precision: 5, scale: 2 }),
  idealTemperatureMax: decimal("idealTemperatureMax", { precision: 5, scale: 2 }),
  idealPHMin: decimal("idealPHMin", { precision: 4, scale: 2 }),
  idealPHMax: decimal("idealPHMax", { precision: 4, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FishSpecies = typeof fishSpecies.$inferSelect;
export type InsertFishSpecies = typeof fishSpecies.$inferInsert;

/**
 * Parâmetros ideais globais por espécie
 */
export const speciesParameters = mysqlTable("species_parameters", {
  id: int("id").autoincrement().primaryKey(),
  speciesId: int("speciesId").notNull(),
  parameter: mysqlEnum("parameter", ["pH", "temperature", "dissolvedOxygen", "ammonia"]).notNull(),
  minSafe: decimal("minSafe", { precision: 8, scale: 2 }).notNull(),
  maxSafe: decimal("maxSafe", { precision: 8, scale: 2 }).notNull(),
  minCritical: decimal("minCritical", { precision: 8, scale: 2 }),
  maxCritical: decimal("maxCritical", { precision: 8, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SpeciesParameter = typeof speciesParameters.$inferSelect;
export type InsertSpeciesParameter = typeof speciesParameters.$inferInsert;

/**
 * Vincular tanques a espécies
 */
export const tankSpecies = mysqlTable("tank_species", {
  id: int("id").autoincrement().primaryKey(),
  tankId: int("tankId").notNull().unique(),
  speciesId: int("speciesId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TankSpecies = typeof tankSpecies.$inferSelect;
export type InsertTankSpecies = typeof tankSpecies.$inferInsert;
