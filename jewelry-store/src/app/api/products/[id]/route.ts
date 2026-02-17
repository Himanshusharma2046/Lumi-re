import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Metal from "@/models/Metal";
import Gemstone from "@/models/Gemstone";
import { requireAdmin, apiError, apiSuccess } from "@/lib/api-helpers";
import { updateProductSchema } from "@/lib/validators";
import { isValidObjectId, slugify, generateUniqueSlug } from "@/lib/utils";
import {
  calculatePrice,
  resolveMetalPrices,
  resolveGemstonePrices,
} from "@/lib/price-calculator";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/products/[id]
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!isValidObjectId(id)) return apiError("Invalid ID", 400);

    await dbConnect();
    const product = await Product.findById(id)
      .populate("category", "name slug subcategories")
      .populate("metalComposition.metal", "name code color variants")
      .populate("gemstoneComposition.gemstone", "name type variants")
      .lean();

    if (!product) return apiError("Product not found", 404);
    return apiSuccess(product);
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return apiError("Failed to fetch product", 500);
  }
}

// PUT /api/products/[id]
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id } = await context.params;
    if (!isValidObjectId(id)) return apiError("Invalid ID", 400);

    await dbConnect();
    const product = await Product.findById(id);
    if (!product) return apiError("Product not found", 404);

    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = { ...parsed.data };

    // SKU uniqueness check
    if (data.sku && data.sku !== product.sku) {
      const existingSku = await Product.findOne({ sku: data.sku, _id: { $ne: id } });
      if (existingSku) return apiError(`SKU "${data.sku}" already in use`, 409);
    }

    // Re-generate slug if name changed
    if (data.name && data.name !== product.name) {
      const baseSlug = slugify(data.name);
      data.slug = await generateUniqueSlug(baseSlug, async (s) => {
        const existing = await Product.findOne({ slug: s, _id: { $ne: id } });
        return !!existing;
      });
    }

    // Merge compositions
    const metalComp = (data.metalComposition as any) || product.metalComposition;
    const gemComp = (data.gemstoneComposition as any) || product.gemstoneComposition;
    const additionalCharges = data.additionalCharges || product.additionalCharges;
    const gstPercentage = data.gstPercentage ?? product.gstPercentage;
    const discount = data.discount !== undefined ? data.discount : product.discount;

    // Resolve prices & recalculate
    const metalIds = [...new Set(metalComp.map((m: any) => m.metal.toString()))] as string[];
    const gemstoneIds = [...new Set(gemComp.map((g: any) => g.gemstone.toString()))] as string[];

    const [metalDocs, gemstoneDocs] = await Promise.all([
      Metal.find({ _id: { $in: metalIds } } as any).lean(),
      Gemstone.find({ _id: { $in: gemstoneIds } } as any).lean(),
    ]);

    const metalMap = new Map(metalDocs.map((m) => [m._id.toString(), m]));
    const gemstoneMap = new Map(gemstoneDocs.map((g) => [g._id.toString(), g]));

    const metalEntries = resolveMetalPrices(metalComp, metalMap as any);
    const gemstoneEntries = resolveGemstonePrices(gemComp, gemstoneMap as any);

    const priceBreakdown = calculatePrice({
      metalEntries,
      gemstoneEntries,
      additionalCharges,
      gstPercentage,
      discount,
    });

    // Apply all updates
    Object.assign(product, data, {
      calculatedPrice: priceBreakdown.calculatedPrice,
      finalPrice: priceBreakdown.finalPrice,
    });

    await product.save();
    return apiSuccess(product);
  } catch (error: any) {
    console.error("PUT /api/products/[id] error:", error);
    if (error.code === 11000) {
      return apiError("Duplicate SKU or slug", 409);
    }
    return apiError("Failed to update product", 500);
  }
}

// DELETE /api/products/[id]
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id } = await context.params;
    if (!isValidObjectId(id)) return apiError("Invalid ID", 400);

    await dbConnect();
    const product = await Product.findByIdAndDelete(id);
    if (!product) return apiError("Product not found", 404);

    return apiSuccess({ message: "Product deleted" });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return apiError("Failed to delete product", 500);
  }
}
