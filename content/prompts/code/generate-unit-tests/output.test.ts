import { describe, expect, it } from "vitest";
import { formatPrice } from "./format-price";

describe("formatPrice", () => {
  describe("happy path", () => {
    it("formats whole numbers with two decimals", () => {
      expect(formatPrice(12, "GBP")).toBe("£12.00");
    });

    it("rounds half-up to the nearest penny", () => {
      expect(formatPrice(9.995, "USD")).toBe("$10.00");
      expect(formatPrice(9.994, "USD")).toBe("$9.99");
    });

    it("adds thousands separators", () => {
      expect(formatPrice(1234567.5, "EUR")).toBe("€1,234,567.50");
    });
  });

  describe("edge cases", () => {
    it("formats zero without a sign", () => {
      expect(formatPrice(0, "GBP")).toBe("£0.00");
      expect(formatPrice(-0, "GBP")).toBe("£0.00");
    });

    it("puts the minus sign before the currency symbol", () => {
      expect(formatPrice(-4.5, "GBP")).toBe("-£4.50");
    });

    it("supports zero-decimal currencies", () => {
      expect(formatPrice(1500, "JPY")).toBe("¥1,500");
    });

    it("handles very small amounts", () => {
      expect(formatPrice(0.001, "USD")).toBe("$0.00");
    });
  });

  describe("invalid input", () => {
    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
      "throws a RangeError for %s",
      (value) => {
        expect(() => formatPrice(value, "GBP")).toThrow(RangeError);
      },
    );

    it("throws for an unknown currency code", () => {
      // @ts-expect-error — deliberately invalid
      expect(() => formatPrice(10, "XYZ1")).toThrow(/currency/i);
    });
  });
});
