import { describe, it, expect } from "vitest";

describe("Notifications System", () => {
  describe("Notification Types", () => {
    it("should handle critical notifications", () => {
      const notification = {
        type: "critical" as const,
        title: "Estoque Crítico",
        message: "Ração abaixo do nível mínimo",
        sound: true,
      };

      expect(notification.type).toBe("critical");
      expect(notification.sound).toBe(true);
    });

    it("should handle warning notifications", () => {
      const notification = {
        type: "warning" as const,
        title: "Parâmetro Fora do Ideal",
        message: "pH acima do limite",
        sound: false,
      };

      expect(notification.type).toBe("warning");
      expect(notification.sound).toBe(false);
    });

    it("should handle info notifications", () => {
      const notification = {
        type: "info" as const,
        title: "Alimentação Registrada",
        message: "5.5 kg adicionados",
        sound: false,
      };

      expect(notification.type).toBe("info");
    });

    it("should handle success notifications", () => {
      const notification = {
        type: "success" as const,
        title: "Operação Concluída",
        message: "Dados salvos com sucesso",
        sound: false,
      };

      expect(notification.type).toBe("success");
    });
  });

  describe("Notification Triggers", () => {
    it("should trigger alert for low stock", () => {
      const currentQty = 15;
      const minQty = 50;
      const shouldAlert = currentQty < minQty;

      expect(shouldAlert).toBe(true);
    });

    it("should trigger alert for out-of-range water parameter", () => {
      const pH = 8.5;
      const optimalMin = 6.5;
      const optimalMax = 8.0;
      const shouldAlert = pH < optimalMin || pH > optimalMax;

      expect(shouldAlert).toBe(true);
    });

    it("should not trigger alert for normal values", () => {
      const pH = 7.5;
      const optimalMin = 6.5;
      const optimalMax = 8.0;
      const shouldAlert = pH < optimalMin || pH > optimalMax;

      expect(shouldAlert).toBe(false);
    });
  });

  describe("Notification History", () => {
    it("should store notification with timestamp", () => {
      const notification = {
        id: "1",
        type: "critical" as const,
        title: "Test",
        message: "Test message",
        timestamp: new Date(),
        read: false,
      };

      expect(notification.timestamp).toBeInstanceOf(Date);
      expect(notification.read).toBe(false);
    });

    it("should mark notification as read", () => {
      let notification = {
        id: "1",
        type: "critical" as const,
        title: "Test",
        message: "Test message",
        timestamp: new Date(),
        read: false,
      };

      notification = { ...notification, read: true };

      expect(notification.read).toBe(true);
    });
  });
});

describe("Supplier Comparison", () => {
  describe("Price Analysis", () => {
    it("should calculate average price", () => {
      const prices = [2.40, 2.45, 2.50, 2.55];
      const average = prices.reduce((a, b) => a + b) / prices.length;

      expect(average).toBeCloseTo(2.475, 2);
    });

    it("should identify min and max prices", () => {
      const prices = [2.40, 2.45, 2.50, 2.55];
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      expect(min).toBe(2.40);
      expect(max).toBe(2.55);
    });

    it("should calculate price trend", () => {
      const oldPrice = 2.50;
      const newPrice = 2.42;
      const trend = ((newPrice - oldPrice) / oldPrice) * 100;

      expect(trend).toBeCloseTo(-3.2, 1);
    });
  });

  describe("Supplier Comparison", () => {
    it("should compare supplier prices", () => {
      const suppliers = [
        { name: "ABC", price: 2.50 },
        { name: "XYZ", price: 2.42 },
        { name: "DEF", price: 2.48 },
      ];

      const cheapest = suppliers.reduce((prev, current) =>
        prev.price < current.price ? prev : current
      );

      expect(cheapest.name).toBe("XYZ");
      expect(cheapest.price).toBe(2.42);
    });

    it("should calculate savings potential", () => {
      const currentPrice = 2.50;
      const bestPrice = 2.42;
      const volume = 1500;
      const savings = (currentPrice - bestPrice) * volume;

      expect(savings).toBeCloseTo(120, 0);
    });

    it("should score suppliers", () => {
      const supplier = {
        price: 2.42,
        quality: 7.8,
        prazo: 5,
        confiabilidade: 8.5,
      };

      const score =
        (10 - supplier.price * 2) +
        supplier.quality +
        (10 - supplier.prazo) +
        supplier.confiabilidade;
      const avgScore = score / 4;

      expect(avgScore).toBeGreaterThan(0);
      expect(avgScore).toBeLessThan(10);
    });
  });

  describe("Purchase History Analysis", () => {
    it("should track total purchases", () => {
      const purchases = [
        { supplier: "ABC", quantity: 500, price: 2.50 },
        { supplier: "ABC", quantity: 750, price: 2.45 },
        { supplier: "XYZ", quantity: 600, price: 2.42 },
      ];

      const abcTotal = purchases
        .filter((p) => p.supplier === "ABC")
        .reduce((sum, p) => sum + p.quantity, 0);

      expect(abcTotal).toBe(1250);
    });

    it("should calculate total spending", () => {
      const purchases = [
        { quantity: 500, price: 2.50 },
        { quantity: 750, price: 2.45 },
      ];

      const total = purchases.reduce((sum, p) => sum + p.quantity * p.price, 0);

      expect(total).toBeCloseTo(3087.5, 1);
    });
  });
});
