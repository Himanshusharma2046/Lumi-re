import { roundPrice, safeNumber } from "./utils";
import type {
  IMetalCompositionEntry,
  IGemstoneCompositionEntry,
  IAdditionalCharge,
  IDiscount,
  IMetalVariant,
  IGemstoneVariant,
} from "@/types";

// ─── Types for calculation ───────────────────────────────

export interface MetalEntryWithPrice extends IMetalCompositionEntry {
  /** Resolved from the Metal document */
  pricePerGram: number;
}

export interface GemstoneEntryWithPrice extends IGemstoneCompositionEntry {
  /** Resolved from the Gemstone document */
  pricePerCarat: number;
}

export interface MetalCostBreakdown {
  variantName: string;
  part: string;
  weightInGrams: number;
  pricePerGram: number;
  rawMetalCost: number;
  wastageCost: number;
  makingCost: number;
  subtotal: number;
}

export interface GemstoneCostBreakdown {
  variantName: string;
  position: string;
  quantity: number;
  totalCaratWeight: number;
  pricePerCarat: number;
  rawGemstoneCost: number;
  stoneCharges: number;
  subtotal: number;
}

export interface PriceBreakdown {
  metals: MetalCostBreakdown[];
  gemstones: GemstoneCostBreakdown[];
  additionalCharges: IAdditionalCharge[];

  totalMetalCost: number;
  totalWastageCost: number;
  totalMakingCharges: number;
  totalGemstoneCost: number;
  totalStoneCharges: number;
  totalAdditionalCharges: number;

  subtotal: number;
  gstPercentage: number;
  gstAmount: number;
  calculatedPrice: number;

  discount: IDiscount | null;
  discountAmount: number;
  finalPrice: number;
}

// ─── Calculator ──────────────────────────────────────────

/**
 * Calculate full price breakdown for a product.
 *
 * This is the single source of truth for pricing logic.
 * Used by:
 *  - Admin product form (live preview)
 *  - Product save (pre-save hook or API)
 *  - Bulk recalculation when metal/gemstone prices change
 */
export function calculatePrice(params: {
  metalEntries: MetalEntryWithPrice[];
  gemstoneEntries: GemstoneEntryWithPrice[];
  additionalCharges: IAdditionalCharge[];
  gstPercentage: number;
  discount: IDiscount | null;
}): PriceBreakdown {
  const {
    metalEntries,
    gemstoneEntries,
    additionalCharges,
    gstPercentage,
    discount,
  } = params;

  // ── Step 1: Metal costs ──
  let totalMetalCost = 0;
  let totalWastageCost = 0;
  let totalMakingCharges = 0;

  const metals: MetalCostBreakdown[] = metalEntries.map((entry) => {
    const pricePerGram = safeNumber(entry.pricePerGram);
    const weightInGrams = safeNumber(entry.weightInGrams);
    const wastagePercentage = safeNumber(entry.wastagePercentage);
    const makingChargesVal = safeNumber(entry.makingCharges);

    const rawMetalCost = roundPrice(pricePerGram * weightInGrams);
    const wastageCost = roundPrice(
      rawMetalCost * (wastagePercentage / 100)
    );

    let makingCost: number;
    if (entry.makingChargeType === "flat") {
      makingCost = makingChargesVal;
    } else {
      makingCost = roundPrice(rawMetalCost * (makingChargesVal / 100));
    }

    const subtotal = roundPrice(rawMetalCost + wastageCost + makingCost);

    totalMetalCost += rawMetalCost;
    totalWastageCost += wastageCost;
    totalMakingCharges += makingCost;

    return {
      variantName: entry.variantName || "",
      part: entry.part || "",
      weightInGrams,
      pricePerGram,
      rawMetalCost,
      wastageCost,
      makingCost,
      subtotal,
    };
  });

  // ── Step 2: Gemstone costs ──
  let totalGemstoneCost = 0;
  let totalStoneCharges = 0;

  const gemstones: GemstoneCostBreakdown[] = gemstoneEntries.map((entry) => {
    const pricePerCarat = safeNumber(entry.pricePerCarat);
    const totalCaratWeight = safeNumber(entry.totalCaratWeight);
    const quantity = safeNumber(entry.quantity, 1);

    const rawGemstoneCost = roundPrice(pricePerCarat * totalCaratWeight);
    const stoneCharges = safeNumber(entry.stoneCharges);
    const subtotal = roundPrice(rawGemstoneCost + stoneCharges);

    totalGemstoneCost += rawGemstoneCost;
    totalStoneCharges += stoneCharges;

    return {
      variantName: entry.variantName || "",
      position: entry.position || "",
      quantity,
      totalCaratWeight,
      pricePerCarat,
      rawGemstoneCost,
      stoneCharges,
      subtotal,
    };
  });

  // ── Step 3: Additional charges ──
  const totalAdditionalCharges = additionalCharges.reduce(
    (sum, c) => sum + safeNumber(c.amount),
    0
  );

  // ── Step 4: Subtotal ──
  const subtotal = roundPrice(
    totalMetalCost +
      totalWastageCost +
      totalMakingCharges +
      totalGemstoneCost +
      totalStoneCharges +
      totalAdditionalCharges
  );

  // ── Step 5: Tax ──
  const safeGst = safeNumber(gstPercentage);
  const gstAmount = roundPrice(subtotal * (safeGst / 100));
  const calculatedPrice = roundPrice(subtotal + gstAmount);

  // ── Step 6: Discount ──
  let discountAmount = 0;
  if (discount && safeNumber(discount.value) > 0) {
    const discountValue = safeNumber(discount.value);
    if (discount.type === "percentage") {
      // Cap at 100%
      const pct = Math.min(discountValue, 100);
      discountAmount = roundPrice(calculatedPrice * (pct / 100));
    } else {
      // Flat discount — cap at calculatedPrice (no negative prices)
      discountAmount = Math.min(discountValue, calculatedPrice);
    }
  }

  const finalPrice = roundPrice(
    Math.max(0, calculatedPrice - discountAmount)
  );

  return {
    metals,
    gemstones,
    additionalCharges,

    totalMetalCost: roundPrice(totalMetalCost),
    totalWastageCost: roundPrice(totalWastageCost),
    totalMakingCharges: roundPrice(totalMakingCharges),
    totalGemstoneCost: roundPrice(totalGemstoneCost),
    totalStoneCharges: roundPrice(totalStoneCharges),
    totalAdditionalCharges: roundPrice(totalAdditionalCharges),

    subtotal,
    gstPercentage,
    gstAmount,
    calculatedPrice,

    discount,
    discountAmount,
    finalPrice,
  };
}

/**
 * Convert a Mongoose subdocument (or plain object) to a plain JS object.
 * Ensures numeric fields are safely extracted.
 */
function toPlainObject<T>(doc: T): T {
  if (doc && typeof doc === 'object' && 'toObject' in doc && typeof (doc as Record<string, unknown>).toObject === 'function') {
    return (doc as unknown as { toObject(): T }).toObject();
  }
  return doc;
}

// ─── Helpers for resolving prices from DB docs ───────────

/**
 * Resolve metal entries with current prices from Metal documents.
 * Used when recalculating product prices after a metal price update.
 */
export function resolveMetalPrices(
  metalComposition: IMetalCompositionEntry[],
  metalDocs: Map<string, { variants: IMetalVariant[] }>
): MetalEntryWithPrice[] {
  return metalComposition.map((rawEntry) => {
    // Convert Mongoose subdocument to plain object to avoid spread issues
    const entry = toPlainObject(rawEntry);

    const metalId = entry.metal?.toString();
    if (!metalId) {
      throw new Error(`Metal entry has no metal reference`);
    }

    const metalDoc = metalDocs.get(metalId);
    if (!metalDoc) {
      throw new Error(`Metal not found: ${metalId}`);
    }

    const variantIndex = safeNumber(entry.variantIndex, 0);
    const variant = metalDoc.variants[variantIndex];
    if (!variant) {
      throw new Error(
        `Metal variant index ${variantIndex} not found for metal ${metalId}`
      );
    }

    return {
      metal: entry.metal,
      variantName: entry.variantName || variant.name || "",
      variantIndex,
      weightInGrams: safeNumber(entry.weightInGrams),
      part: entry.part || "",
      wastagePercentage: safeNumber(entry.wastagePercentage, 3),
      makingCharges: safeNumber(entry.makingCharges),
      makingChargeType: entry.makingChargeType || "flat",
      pricePerGram: safeNumber(variant.pricePerGram),
    };
  });
}

/**
 * Resolve gemstone entries with current prices from Gemstone documents.
 */
export function resolveGemstonePrices(
  gemstoneComposition: IGemstoneCompositionEntry[],
  gemstoneDocs: Map<string, { variants: IGemstoneVariant[] }>
): GemstoneEntryWithPrice[] {
  return gemstoneComposition.map((rawEntry) => {
    // Convert Mongoose subdocument to plain object to avoid spread issues
    const entry = toPlainObject(rawEntry);

    const gemstoneId = entry.gemstone?.toString();
    if (!gemstoneId) {
      throw new Error(`Gemstone entry has no gemstone reference`);
    }

    const gemstoneDoc = gemstoneDocs.get(gemstoneId);
    if (!gemstoneDoc) {
      throw new Error(`Gemstone not found: ${gemstoneId}`);
    }

    const variantIndex = safeNumber(entry.variantIndex, 0);
    const variant = gemstoneDoc.variants[variantIndex];
    if (!variant) {
      throw new Error(
        `Gemstone variant index ${variantIndex} not found for gemstone ${gemstoneId}`
      );
    }

    return {
      gemstone: entry.gemstone,
      variantName: entry.variantName || variant.name || "",
      variantIndex,
      quantity: safeNumber(entry.quantity, 1),
      totalCaratWeight: safeNumber(entry.totalCaratWeight),
      setting: entry.setting || "",
      position: entry.position || "",
      certification: entry.certification || null,
      stoneCharges: safeNumber(entry.stoneCharges),
      pricePerCarat: safeNumber(variant.pricePerCarat),
    };
  });
}
