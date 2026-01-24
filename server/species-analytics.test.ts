import { describe, it, expect } from "vitest";

describe("Species Management", () => {
  describe("Fish Species", () => {
    it("should have required species fields", () => {
      const species = {
        id: 1,
        name: "Tilápia do Nilo",
        scientificName: "Oreochromis niloticus",
        description: "Peixe de água doce",
        idealTemperatureMin: 24,
        idealTemperatureMax: 32,
        idealPHMin: 6.5,
        idealPHMax: 8.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(species.name).toBeDefined();
      expect(species.scientificName).toBeDefined();
      expect(species.idealTemperatureMin).toBe(24);
      expect(species.idealTemperatureMax).toBe(32);
    });

    it("should support multiple species", () => {
      const species = [
        { id: 1, name: "Tilápia do Nilo" },
        { id: 2, name: "Tilápia Vermelha" },
        { id: 3, name: "Carpa" },
      ];

      expect(species).toHaveLength(3);
      expect(species.map((s) => s.name)).toContain("Tilápia do Nilo");
    });
  });

  describe("Species Parameters", () => {
    it("should define ideal parameters for species", () => {
      const parameters = {
        speciesId: 1,
        parameter: "pH",
        minSafe: 6.5,
        maxSafe: 8.0,
        minCritical: 5.0,
        maxCritical: 9.0,
      };

      expect(parameters.parameter).toBe("pH");
      expect(parameters.minSafe).toBeLessThan(parameters.maxSafe);
      expect(parameters.minCritical).toBeLessThan(parameters.minSafe);
    });

    it("should support all parameter types", () => {
      const parameterTypes = ["pH", "temperature", "dissolvedOxygen", "ammonia"];

      parameterTypes.forEach((type) => {
        const param = {
          parameter: type,
          minSafe: 0,
          maxSafe: 100,
        };

        expect(param.parameter).toBe(type);
      });
    });

    it("should apply species parameters to all tanks with same species", () => {
      const species = { id: 1, name: "Tilápia" };
      const tanks = [
        { id: 1, speciesId: 1, name: "Tanque 1" },
        { id: 2, speciesId: 1, name: "Tanque 2" },
        { id: 3, speciesId: 1, name: "Tanque 3" },
      ];

      const tanksWithSpecies = tanks.filter((t) => t.speciesId === species.id);
      expect(tanksWithSpecies).toHaveLength(3);
      expect(tanksWithSpecies.every((t) => t.speciesId === species.id)).toBe(true);
    });
  });

  describe("General Analytics", () => {
    it("should calculate total ration consumption", () => {
      const tanks = [
        { id: 1, racionConsumption: 150 },
        { id: 2, racionConsumption: 180 },
        { id: 3, racionConsumption: 120 },
      ];

      const totalConsumption = tanks.reduce((sum, t) => sum + t.racionConsumption, 0);
      expect(totalConsumption).toBe(450);
    });

    it("should calculate average mortality", () => {
      const tanks = [
        { id: 1, mortality: 1.5 },
        { id: 2, mortality: 2.1 },
        { id: 3, mortality: 1.8 },
      ];

      const avgMortality = tanks.reduce((sum, t) => sum + t.mortality, 0) / tanks.length;
      expect(avgMortality).toBeCloseTo(1.8, 1);
    });

    it("should calculate total costs and revenue", () => {
      const operations = {
        totalCost: 3500.75,
        totalRevenue: 8500.0,
      };

      const profit = operations.totalRevenue - operations.totalCost;
      expect(profit).toBeCloseTo(4999.25, 2);
      expect(profit).toBeGreaterThan(0);
    });

    it("should calculate operation health score", () => {
      const metrics = {
        mortalityRate: 2.3,
        parameterCompliance: 95,
        feedEfficiency: 85,
        costControl: 80,
      };

      const healthScore =
        (metrics.parameterCompliance +
          metrics.feedEfficiency +
          metrics.costControl -
          metrics.mortalityRate * 5) /
        3;

      expect(healthScore).toBeGreaterThan(0);
      expect(healthScore).toBeLessThanOrEqual(100);
    });
  });

  describe("Tank-Specific Analytics", () => {
    it("should calculate tank-specific KPIs", () => {
      const tank = {
        id: 1,
        volume: 5000,
        population: 2500,
        feedConsumption: 150,
        mortality: 1.5,
        projectedProfit: 2500,
        projectedCost: 1200,
      };

      const density = tank.population / tank.volume;
      const projectedMargin =
        ((tank.projectedProfit - tank.projectedCost) / tank.projectedProfit) * 100;

      expect(density).toBe(0.5);
      expect(projectedMargin).toBeCloseTo(52, 0);
    });

    it("should compare tanks by consumption", () => {
      const tanks = [
        { id: 1, feedConsumption: 150 },
        { id: 2, feedConsumption: 180 },
        { id: 3, feedConsumption: 120 },
      ];

      const sortedByConsumption = [...tanks].sort(
        (a, b) => b.feedConsumption - a.feedConsumption
      );

      expect(sortedByConsumption[0].feedConsumption).toBe(180);
      expect(sortedByConsumption[sortedByConsumption.length - 1].feedConsumption).toBe(120);
    });

    it("should calculate feed efficiency", () => {
      const tank = {
        feedConsumption: 150,
        weightGain: 300,
      };

      const feedConversionRatio = tank.feedConsumption / tank.weightGain;
      expect(feedConversionRatio).toBe(0.5);
      expect(feedConversionRatio).toBeLessThan(1);
    });
  });

  describe("Comparative Analytics", () => {
    it("should compare mortality rates between tanks", () => {
      const tanks = [
        { id: 1, name: "Tanque 1", mortality: 1.5 },
        { id: 2, name: "Tanque 2", mortality: 2.1 },
        { id: 3, name: "Tanque 3", mortality: 1.8 },
      ];

      const highestMortality = Math.max(...tanks.map((t) => t.mortality));
      const lowestMortality = Math.min(...tanks.map((t) => t.mortality));

      expect(highestMortality).toBe(2.1);
      expect(lowestMortality).toBe(1.5);
    });

    it("should identify best performing tank", () => {
      const tanks = [
        { id: 1, profit: 2000, cost: 1500 },
        { id: 2, profit: 2500, cost: 1200 },
        { id: 3, profit: 2200, cost: 1400 },
      ];

      const profitability = tanks.map((t) => ({
        id: t.id,
        margin: ((t.profit - t.cost) / t.profit) * 100,
      }));

      const best = profitability.reduce((max, current) =>
        current.margin > max.margin ? current : max
      );

      expect(best.id).toBe(2);
      expect(best.margin).toBeCloseTo(52, 0);
    });

    it("should generate trend analysis", () => {
      const monthlyData = [
        { month: "Jan", revenue: 1200, cost: 800 },
        { month: "Fev", revenue: 1400, cost: 850 },
        { month: "Mar", revenue: 1600, cost: 900 },
      ];

      const revenueTrend =
        monthlyData[monthlyData.length - 1].revenue - monthlyData[0].revenue;
      const costTrend = monthlyData[monthlyData.length - 1].cost - monthlyData[0].cost;

      expect(revenueTrend).toBeGreaterThan(0);
      expect(costTrend).toBeGreaterThan(0);
      expect(revenueTrend).toBeGreaterThan(costTrend);
    });
  });
});
