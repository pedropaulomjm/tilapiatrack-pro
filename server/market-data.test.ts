import { describe, expect, it, afterAll } from "vitest";
import {
  getMarketSnapshot,
  getMarketContextText,
  tickMarket,
  stopMarketFeed,
} from "./marketData";

describe("marketData", () => {
  afterAll(() => {
    stopMarketFeed();
  });

  it("returns a populated snapshot with quotes, history and headlines", () => {
    const snapshot = getMarketSnapshot();

    expect(snapshot.quotes.length).toBeGreaterThan(10);
    expect(snapshot.headlines.length).toBeGreaterThan(0);

    for (const quote of snapshot.quotes) {
      expect(quote.price).toBeGreaterThan(0);
      expect(quote.high).toBeGreaterThanOrEqual(quote.low);
      expect(quote.bid).toBeLessThanOrEqual(quote.ask);
      expect(snapshot.history[quote.symbol]?.length).toBeGreaterThan(0);
    }

    const symbols = snapshot.quotes.map(q => q.symbol);
    expect(symbols).toContain("TILAPIA");
    expect(symbols).toContain("USDBRL");
    expect(symbols).toContain("MOWI");
  });

  it("updates prices and keeps invariants on tick", () => {
    const before = getMarketSnapshot();
    const updated = tickMarket();

    expect(updated.length).toBe(before.quotes.length);
    for (const quote of updated) {
      expect(quote.price).toBeGreaterThan(0);
      expect(quote.high).toBeGreaterThanOrEqual(quote.price);
      expect(quote.low).toBeLessThanOrEqual(quote.price);
      const prevClose = quote.prevClose;
      const expectedPct = ((quote.price - prevClose) / prevClose) * 100;
      expect(quote.changePct).toBeCloseTo(expectedPct, 1);
    }

    const after = getMarketSnapshot();
    for (const quote of after.quotes) {
      const points = after.history[quote.symbol];
      expect(points.length).toBeLessThanOrEqual(240);
      expect(points[points.length - 1].p).toBe(quote.price);
    }
  });

  it("produces a textual market context for the Fable 5 assistant", () => {
    const context = getMarketContextText();
    expect(context).toContain("Cotações ao vivo:");
    expect(context).toContain("TILAPIA");
    expect(context).toContain("manchetes");
  });
});
