import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Tanks Router", () => {
  it("should create a tank", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tanks.create({
      name: "Test Tank",
      description: "A test tank",
      volume: "5000",
      location: "Test Location",
    });

    expect(result).toBeDefined();
  });

  it("should list tanks for a user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a tank first
    await caller.tanks.create({
      name: "Tank 1",
      volume: "1000",
    });

    // List tanks
    const tanks = await caller.tanks.list();
    expect(Array.isArray(tanks)).toBe(true);
    expect(tanks.length).toBeGreaterThan(0);
  });
});

describe("Parameter Limits Router", () => {
  it("should set parameter limits for a tank", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a tank
    const tankResult = await caller.tanks.create({
      name: "Limit Test Tank",
    });

    const tanks = await caller.tanks.list();
    const tankId = tanks[tanks.length - 1].id;

    // Set limits
    await caller.parameterLimits.set({
      tankId,
      parameter: "pH",
      minSafe: 6.5,
      maxSafe: 8.0,
      minCritical: 5.5,
      maxCritical: 9.0,
    });

    // Get limits
    const limits = await caller.parameterLimits.getByTank({ tankId });
    expect(limits.length).toBeGreaterThan(0);
    expect(limits[0].parameter).toBe("pH");
  });
});

describe("Water Quality Router", () => {
  it("should handle water quality data queries", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a tank
    const tanks = await caller.tanks.list();
    if (tanks.length === 0) {
      await caller.tanks.create({ name: "Water Quality Test Tank" });
    }

    const tankId = (await caller.tanks.list())[0].id;

    // Get latest data (should be null initially)
    const latest = await caller.waterQuality.getLatest({ tankId });
    expect(latest === null || latest === undefined || typeof latest === "object").toBe(true);
  });
});

describe("Alerts Router", () => {
  it("should retrieve alerts for a tank", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const tanks = await caller.tanks.list();
    if (tanks.length === 0) {
      await caller.tanks.create({ name: "Alert Test Tank" });
    }

    const tankId = (await caller.tanks.list())[0].id;

    // Get alerts
    const alerts = await caller.alerts.getByTank({ tankId, unresolved: true });
    expect(Array.isArray(alerts)).toBe(true);
  });
});

describe("Webhook Tokens Router", () => {
  it("should create a webhook token", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const tanks = await caller.tanks.list();
    if (tanks.length === 0) {
      await caller.tanks.create({ name: "Webhook Test Tank" });
    }

    const tankId = (await caller.tanks.list())[0].id;

    // Create token
    const result = await caller.webhookTokens.create({
      tankId,
      name: "Test Token",
    });

    expect(result).toBeDefined();

    // Get tokens
    const tokens = await caller.webhookTokens.getByTank({ tankId });
    expect(Array.isArray(tokens)).toBe(true);
  });
});
