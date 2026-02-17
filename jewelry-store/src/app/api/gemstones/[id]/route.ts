import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Gemstone from "@/models/Gemstone";
import Product from "@/models/Product";
import PriceHistory from "@/models/PriceHistory";
import { requireAdmin, apiError, apiSuccess } from "@/lib/api-helpers";
import { createGemstoneSchema, updateGemstonePriceSchema } from "@/lib/validators";
import { isValidObjectId } from "@/lib/utils";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/gemstones/[id]
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!isValidObjectId(id)) return apiError("Invalid ID", 400);

    await dbConnect();
    const gemstone = await Gemstone.findById(id).lean();
    if (!gemstone) return apiError("Gemstone not found", 404);

    return apiSuccess(gemstone);
  } catch (error) {
    console.error("GET /api/gemstones/[id] error:", error);
    return apiError("Failed to fetch gemstone", 500);
  }
}

// PUT /api/gemstones/[id]
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { error: authError, session } = await requireAdmin();
    if (authError) return authError;

    const { id } = await context.params;
    if (!isValidObjectId(id)) return apiError("Invalid ID", 400);

    await dbConnect();
    const gemstone = await Gemstone.findById(id);
    if (!gemstone) return apiError("Gemstone not found", 404);

    const body = await req.json();

    // Price update shortcut
    if (body.variantIndex !== undefined && body.newPrice !== undefined) {
      const parsed = updateGemstonePriceSchema.safeParse(body);
      if (!parsed.success) return apiError(parsed.error.issues[0].message);

      const { variantIndex, newPrice } = parsed.data;
      if (variantIndex >= gemstone.variants.length) {
        return apiError(`Variant index ${variantIndex} out of range`, 400);
      }

      const oldPrice = gemstone.variants[variantIndex].pricePerCarat;
      if (oldPrice === newPrice) return apiSuccess(gemstone);

      gemstone.variants[variantIndex].pricePerCarat = newPrice;
      await gemstone.save();

      await PriceHistory.create({
        entityType: "gemstone",
        entityId: gemstone._id,
        variantName: gemstone.variants[variantIndex].name,
        oldPrice,
        newPrice,
        changedAt: new Date(),
        changedBy: session!.user!.id,
      });

      return apiSuccess(gemstone);
    }

    // Full update
    const parsed = createGemstoneSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message);

    Object.assign(gemstone, parsed.data);
    await gemstone.save();
    return apiSuccess(gemstone);
  } catch (error) {
    console.error("PUT /api/gemstones/[id] error:", error);
    return apiError("Failed to update gemstone", 500);
  }
}

// DELETE /api/gemstones/[id] — soft delete
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id } = await context.params;
    if (!isValidObjectId(id)) return apiError("Invalid ID", 400);

    await dbConnect();
    const gemstone = await Gemstone.findById(id);
    if (!gemstone) return apiError("Gemstone not found", 404);

    const productCount = await Product.countDocuments({
      "gemstoneComposition.gemstone": id,
    });

    if (productCount > 0) {
      return apiError(
        `Cannot delete — ${productCount} product(s) use this gemstone. Remove references first.`,
        409
      );
    }

    gemstone.isDeleted = true;
    await gemstone.save();
    return apiSuccess({ message: "Gemstone deleted" });
  } catch (error) {
    console.error("DELETE /api/gemstones/[id] error:", error);
    return apiError("Failed to delete gemstone", 500);
  }
}
