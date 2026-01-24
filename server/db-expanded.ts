import { eq, and, gte, lte, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  feeders,
  feedingSchedules,
  feedingRecords,
  stockItems,
  stockMovements,
  suppliers,
  supplierPrices,
  financialTransactions,
  waterParameterReferences,
  weightSamples,
  securityCameras,
  tankDetails,
} from "../drizzle/schema";

// ============== ALIMENTAÇÃO ==============

export async function createFeeder(data: typeof feeders.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(feeders).values(data);
}

export async function getFeedersbyTank(tankId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(feeders).where(eq(feeders.tankId, tankId));
}

export async function createFeedingSchedule(data: typeof feedingSchedules.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(feedingSchedules).values(data);
}

export async function getFeedingSchedules(tankId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(feedingSchedules).where(eq(feedingSchedules.tankId, tankId));
}

export async function recordFeeding(data: typeof feedingRecords.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(feedingRecords).values(data);
}

export async function getFeedingRecords(tankId: number, days: number = 7) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return db
    .select()
    .from(feedingRecords)
    .where(and(eq(feedingRecords.tankId, tankId), gte(feedingRecords.timestamp, startDate)))
    .orderBy(desc(feedingRecords.timestamp));
}

// ============== ESTOQUE ==============

export async function createStockItem(data: typeof stockItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(stockItems).values(data);
}

export async function getStockItems(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(stockItems).where(eq(stockItems.userId, userId));
}

export async function updateStockItem(id: number, data: Partial<typeof stockItems.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(stockItems).set(data).where(eq(stockItems.id, id));
}

export async function recordStockMovement(data: typeof stockMovements.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Atualizar quantidade do item
  const movement = data;
  const item = await db.select().from(stockItems).where(eq(stockItems.id, movement.stockItemId)).limit(1);
  
  if (item.length > 0) {
    const currentQty = parseFloat(item[0].currentQuantity?.toString() || "0");
    let newQty = currentQty;
    
    if (movement.type === "entry") {
      newQty = currentQty + parseFloat(movement.quantity?.toString() || "0");
    } else if (movement.type === "exit") {
      newQty = currentQty - parseFloat(movement.quantity?.toString() || "0");
    }
    
    await db.update(stockItems).set({ currentQuantity: newQty.toString() }).where(eq(stockItems.id, movement.stockItemId));
  }
  
  return db.insert(stockMovements).values(data);
}

export async function getStockMovements(stockItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(stockMovements).where(eq(stockMovements.stockItemId, stockItemId)).orderBy(desc(stockMovements.createdAt));
}

// ============== FORNECEDORES ==============

export async function createSupplier(data: typeof suppliers.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(suppliers).values(data);
}

export async function getSuppliers(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(suppliers).where(eq(suppliers.userId, userId));
}

export async function updateSupplier(id: number, data: Partial<typeof suppliers.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(suppliers).set(data).where(eq(suppliers.id, id));
}

export async function recordSupplierPrice(data: typeof supplierPrices.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(supplierPrices).values(data);
}

export async function getSupplierPriceHistory(supplierId: number, stockItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .select()
    .from(supplierPrices)
    .where(and(eq(supplierPrices.supplierId, supplierId), eq(supplierPrices.stockItemId, stockItemId)))
    .orderBy(desc(supplierPrices.date));
}

// ============== FINANCEIRO ==============

export async function recordFinancialTransaction(data: typeof financialTransactions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(financialTransactions).values(data);
}

export async function getFinancialTransactions(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (startDate && endDate) {
    return db
      .select()
      .from(financialTransactions)
      .where(and(eq(financialTransactions.userId, userId), gte(financialTransactions.date, startDate), lte(financialTransactions.date, endDate)))
      .orderBy(desc(financialTransactions.date));
  }
  
  return db.select().from(financialTransactions).where(eq(financialTransactions.userId, userId)).orderBy(desc(financialTransactions.date));
}

export async function deleteFinancialTransaction(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(financialTransactions).where(eq(financialTransactions.id, id));
}

// ============== REFERÊNCIAS TÉCNICAS ==============

export async function createWaterParameterReference(data: typeof waterParameterReferences.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(waterParameterReferences).values(data);
}

export async function getWaterParameterReferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(waterParameterReferences).where(eq(waterParameterReferences.userId, userId));
}

export async function updateWaterParameterReference(id: number, data: Partial<typeof waterParameterReferences.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(waterParameterReferences).set(data).where(eq(waterParameterReferences.id, id));
}

// ============== AMOSTRAGEM DE PESO ==============

export async function recordWeightSample(data: typeof weightSamples.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(weightSamples).values(data);
}

export async function getWeightSamples(tankId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(weightSamples).where(eq(weightSamples.tankId, tankId)).orderBy(desc(weightSamples.timestamp));
}

// ============== CÂMERAS ==============

export async function createSecurityCamera(data: typeof securityCameras.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(securityCameras).values(data);
}

export async function getSecurityCameras(tankId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(securityCameras).where(eq(securityCameras.tankId, tankId));
}

export async function updateSecurityCamera(id: number, data: Partial<typeof securityCameras.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(securityCameras).set(data).where(eq(securityCameras.id, id));
}

// ============== DETALHES DE TANQUES ==============

export async function createTankDetails(data: typeof tankDetails.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(tankDetails).values(data);
}

export async function getTankDetails(tankId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(tankDetails).where(eq(tankDetails.tankId, tankId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateTankDetails(tankId: number, data: Partial<typeof tankDetails.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData = { ...data, updatedAt: new Date() } as typeof tankDetails.$inferInsert;
  return db.update(tankDetails).set(updateData).where(eq(tankDetails.tankId, tankId));
}
