import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Metal from "@/models/Metal";
import Gemstone from "@/models/Gemstone";
import { requireAdmin, apiError, apiSuccess } from "@/lib/api-helpers";
import {
  calculatePrice,
  resolveMetalPrices,
  resolveGemstonePrices,
} from "@/lib/price-calculator";

/**
 * Returns true if the value is a finite, non-NaN number.
 */
function isValidPrice(value: unknown): value is number {
  return typeof value === "number" && isFinite(value) && !isNaN(value);
}

// POST /api/prices/recalculate — Recalculate all product prices
export async function POST(req: NextRequest) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    await dbConnect();

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;

    // Load all metals & gemstones as plain objects
    const [allMetals, allGemstones] = await Promise.all([
      Metal.find({ isDeleted: false }).lean(),
      Gemstone.find({ isDeleted: false }).lean(),
    ]);

    const metalMap = new Map(allMetals.map((m) => [m._id.toString(), m]));
    const gemstoneMap = new Map(allGemstones.map((g) => [g._id.toString(), g]));

    // Fetch all products as plain objects to avoid Mongoose subdocument spread issues
    const products = await Product.find().lean();
    const BATCH_SIZE = 100;
    let updated = 0;
    let failed = 0;
    const failedProducts: { id: string; name: string; reason: string }[] = [];
    const changes: {
      productId: string;
      name: string;
      oldPrice: number;
      newPrice: number;
      diff: number;
    }[] = [];

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const bulkOps = [];

      for (const product of batch) {
        try {
          // Skip products with no composition entries
          const metalComp = Array.isArray(product.metalComposition)
            ? product.metalComposition
            : [];
          const gemComp = Array.isArray(product.gemstoneComposition)
            ? product.gemstoneComposition
            : [];

          if (metalComp.length === 0 && gemComp.length === 0) {
            updated++;
            continue;
          }

          const metalEntries = resolveMetalPrices(
            metalComp as any,
            metalMap as any
          );
          const gemstoneEntries = resolveGemstonePrices(
            gemComp as any,
            gemstoneMap as any
          );

          const additionalCharges = Array.isArray(product.additionalCharges)
            ? product.additionalCharges
            : [];
          const gstPercentage =
            typeof product.gstPercentage === "number" && !isNaN(product.gstPercentage)
              ? product.gstPercentage
              : 3;

          const breakdown = calculatePrice({
            metalEntries,
            gemstoneEntries,
            additionalCharges,
            gstPercentage,
            discount: product.discount || null,
          });

          // Final safety check: never write NaN to the database
          if (!isValidPrice(breakdown.finalPrice) || !isValidPrice(breakdown.calculatedPrice)) {
            console.error(
              `Price calc produced invalid values for product ${product._id} (${product.name}):`,
              { calculatedPrice: breakdown.calculatedPrice, finalPrice: breakdown.finalPrice }
            );
            failedProducts.push({
              id: product._id.toString(),
              name: product.name,
              reason: "Calculated price is NaN or Infinity",
            });
            failed++;
            continue;
          }

          const oldPrice = typeof product.finalPrice === "number" ? product.finalPrice : 0;
          const newPrice = breakdown.finalPrice;

          if (oldPrice !== newPrice) {
            changes.push({
              productId: product._id.toString(),
              name: product.name,
              oldPrice,
              newPrice,
              diff: Math.round((newPrice - oldPrice) * 100) / 100,
            });

            if (!dryRun) {
              bulkOps.push({
                updateOne: {
                  filter: { _id: product._id },
                  update: {
                    $set: {
                      calculatedPrice: breakdown.calculatedPrice,
                      finalPrice: breakdown.finalPrice,
                    },
                  },
                },
              });
            }
          }

          updated++;
        } catch (err: any) {
          const reason = err?.message || "Unknown error";
          console.error(`Price calc failed for product ${product._id} (${product.name}):`, reason);
          failedProducts.push({
            id: product._id.toString(),
            name: product.name,
            reason,
          });
          failed++;
        }
      }

      if (!dryRun && bulkOps.length > 0) {
        await Product.bulkWrite(bulkOps);
      }
    }

    // Summary stats
    const totalDiff = changes.reduce((sum, c) => sum + c.diff, 0);
    const priceIncreases = changes.filter((c) => c.diff > 0).length;
    const priceDecreases = changes.filter((c) => c.diff < 0).length;

    return apiSuccess({
      dryRun,
      processed: updated,
      failed,
      failedProducts: failedProducts.slice(0, 20),
      pricesChanged: changes.length,
      priceIncreases,
      priceDecreases,
      totalDiff: Math.round(totalDiff * 100) / 100,
      changes: changes.slice(0, 50), // Return first 50 for preview
    });
  } catch (error) {
    console.error("POST /api/prices/recalculate error:", error);
    return apiError("Price recalculation failed", 500);
  }
}
