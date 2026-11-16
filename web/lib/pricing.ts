/**
 * DEMONSTRATION PRICES ONLY.
 * Before production launch replace with approved Neva-Book price list,
 * verify VAT/taxes, delivery, material costs, and quantity discounts.
 */
export const demoPricing = {
  currency: "RUB",
  format: "20×20 см",
  includedSpreads: 10,
  minSpreads: 10,
  maxSpreads: 40,
  basePrice: 1900,
  additionalSpreadPrice: 90,
  fabricCoverSurcharge: 450,
  quantityDiscounts: [
    { min: 10, percent: 10 },
    { min: 3, percent: 5 },
  ],
} as const;

export type CoverType = "photo" | "fabric";

export function calculateDemoPrice(spreads: number, cover: CoverType, quantity: number) {
  const p = demoPricing;
  const safeSpreads = Math.max(p.minSpreads, Math.min(p.maxSpreads, Math.round(spreads)));
  const safeQuantity = Math.max(1, Math.min(99, Math.round(quantity)));
  const extraSpreads = safeSpreads - p.includedSpreads;
  const coverPrice = cover === "fabric" ? p.fabricCoverSurcharge : 0;
  const unitBeforeDiscount = p.basePrice + extraSpreads * p.additionalSpreadPrice + coverPrice;
  const discountPercent = p.quantityDiscounts.find((tier) => safeQuantity >= tier.min)?.percent ?? 0;
  const unitPrice = Math.round(unitBeforeDiscount * (1 - discountPercent / 100));
  const totalPrice = unitPrice * safeQuantity;
  return { safeSpreads, safeQuantity, extraSpreads, coverPrice, unitBeforeDiscount, discountPercent, unitPrice, totalPrice };
}
