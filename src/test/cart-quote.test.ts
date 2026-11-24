import { describe, expect, it } from "vitest";
import { calculateCartQuote } from "@/lib/prototype-data";

describe("Cart without a free-shipping offer", () => {
  it("does not assume a zero shipping fee or final total for a Rp485.000 purchase", () => {
    const quote = calculateCartQuote(485000);
    expect(quote.itemsTotal).toBe(485000);
    expect(quote.shipping).toBeNull();
    expect(quote.grandTotal).toBeNull();
  });
});