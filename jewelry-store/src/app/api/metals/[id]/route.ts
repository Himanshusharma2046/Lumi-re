import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Metal from "@/models/Metal";
import Product from "@/models/Product";
import PriceHistory from "@/models/PriceHistory";
import { requireAdmin, apiError, apiSuccess } from "@/lib/api-helpers";
import { createMetalSchema, updateMetalPriceSchema } from "@/lib/validators";
import { isValidObjectId } from "@/lib/utils";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/metals/[id]
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!isValidObjectId(id)) return apiError("Invalid ID", 400);

    await dbConnect();
    const metal = await Metal.findById(id).lean();
    if (!metal) return apiError("Metal not found", 404);

    return apiSuccess(metal);
  } catch (error) {
    console.error("GET /api/metals/[id] error:", error);
    return apiError("Failed to fetch metal", 500);
  }
}

// PUT /api/metals/[id] — update metal (full update or price update)
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { error: authError, session } = await requireAdmin();
    if (authError) return authError;

    const { id } = await context.params;
    if (!isValidObjectId(id)) return apiError("Invalid ID", 400);

    await dbConnect();
    const metal = await Metal.findById(id);
    if (!metal) return apiError("Metal not found", 404);

    const body = await req.json();

    // Check if this is a price update (has variantIndex + newPrice)
    if (body.variantIndex !== undefined && body.newPrice !== undefined) {
      const parsed = updateMetalPriceSchema.safeParse(body);
      if (!parsed.success) return apiError(parsed.error.issues[0].message);

      const { variantIndex, newPrice } = parsed.data;
      if (variantIndex >= metal.variants.length) {
        return apiError(`Variant index ${variantIndex} out of range`, 400);
      }

      const oldPrice = metal.variants[variantIndex].pricePerGram;
      if (oldPrice === newPrice) {
        return apiSuccess(metal);
      }

      // Update price
      metal.variants[variantIndex].pricePerGram = newPrice;
      await metal.save();

      // Log to PriceHistory
      await PriceHistory.create({
        entityType: "metal",
        entityId: metal._id,
        variantName: metal.variants[variantIndex].name,
        oldPrice,
        newPrice,
        changedAt: new Date(),
        changedBy: session!.user!.id,
      });

      return apiSuccess(metal);
    }

    // Full update
    const parsed = createMetalSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message);

    // Check code uniqueness (exclude current)
    if (parsed.data.code !== metal.code) {
      const existing = await Metal.findOne({ code: parsed.data.code, _id: { $ne: id } });
      if (existing) {
        return apiError(`Metal with code "${parsed.data.code}" already exists`, 409);
      }
    }

    Object.assign(metal, parsed.data);
    await metal.save();
    return apiSuccess(metal);
  } catch (error) {
    console.error("PUT /api/metals/[id] error:", error);
    return apiError("Failed to update metal", 500);
  }
}

// DELETE /api/metals/[id] — soft delete
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id } = await context.params;
    if (!isValidObjectId(id)) return apiError("Invalid ID", 400);

    await dbConnect();
    const metal = await Metal.findById(id);
    if (!metal) return apiError("Metal not found", 404);

    // Check if any products reference this metal
    const productCount = await Product.countDocuments({
      "metalComposition.metal": id,
    });

    if (productCount > 0) {
      return apiError(
        `Cannot delete — ${productCount} product(s) use this metal. Remove references first.`,
        409
      );
    }

    metal.isDeleted = true;
    await metal.save();
    return apiSuccess({ message: "Metal deleted" });
  } catch (error) {
    console.error("DELETE /api/metals/[id] error:", error);
    return apiError("Failed to delete metal", 500);
  }
}
