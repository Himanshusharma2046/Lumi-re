import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
// Import all models to ensure they're registered with Mongoose
import "@/models";
import Product from "@/models/Product";
import Metal from "@/models/Metal";
import Gemstone from "@/models/Gemstone";
import Category from "@/models/Category";
import { requireAdmin, apiError, apiSuccess } from "@/lib/api-helpers";
import { createProductSchema, productFiltersSchema } from "@/lib/validators";
import { slugify, generateUniqueSlug } from "@/lib/utils";
import {
  calculatePrice,
  resolveMetalPrices,
  resolveGemstonePrices,
} from "@/lib/price-calculator";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryFilter = Record<string, any>;

// GET /api/products — paginated, filtered product list
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = productFiltersSchema.safeParse(searchParams);
    if (!parsed.success) return apiError(parsed.error.issues[0].message);

    const filters = parsed.data;
    const query: QueryFilter = { isActive: true };

    if (filters.category) query.category = filters.category;
    if (filters.subcategory) query.subcategory = filters.subcategory;
    if (filters.gender) query.gender = filters.gender;
    if (filters.occasion) query.occasion = { $in: [filters.occasion] };
    if (filters.tags) query.tags = { $in: filters.tags };
    if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;

    if (filters.metal) {
      query["metalComposition.metal"] = filters.metal;
    }
    if (filters.gemstone) {
      query["gemstoneComposition.gemstone"] = filters.gemstone;
    }

    if (filters.minPrice || filters.maxPrice) {
      query.finalPrice = {};
      if (filters.minPrice) query.finalPrice.$gte = filters.minPrice;
      if (filters.maxPrice) query.finalPrice.$lte = filters.maxPrice;
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Sort
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      price_asc: { finalPrice: 1, _id: 1 },
      price_desc: { finalPrice: -1, _id: -1 },
      newest: { createdAt: -1, _id: -1 },
      oldest: { createdAt: 1, _id: 1 },
      name_asc: { name: 1, _id: 1 },
      name_desc: { name: -1, _id: -1 },
    };
    const sort = sortMap[filters.sort] || { createdAt: -1, _id: -1 };

    const page = filters.page;
    const limit = filters.limit;

    // Cursor-based pagination (for large datasets / infinite scroll)
    if (filters.cursor) {
      try {
        const cursorDoc = await Product.findById(filters.cursor)
          .select("finalPrice createdAt name")
          .lean();

        if (cursorDoc) {
          // Determine cursor field based on sort
          const sortKey = Object.keys(sort)[0]; // primary sort field
          const sortDir = Object.values(sort)[0]; // 1 or -1
          const cursorValue = (cursorDoc as unknown as Record<string, unknown>)[sortKey];
          const op = sortDir === 1 ? "$gt" : "$lt";

          // Compound cursor condition: sort field + _id for tie-breaking
          query.$or = [
            { [sortKey]: { [op]: cursorValue } },
            { [sortKey]: cursorValue, _id: { [op]: cursorDoc._id } },
          ];
        }
      } catch {
        // Invalid cursor — ignore and fall through to offset pagination
      }
    }

    const skip = filters.cursor ? 0 : (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("category", "name slug")
        .lean(),
      Product.countDocuments(
        filters.cursor
          ? { ...query, $or: undefined }
          : query
      ),
    ]);

    const nextCursor =
      products.length === limit
        ? (products[products.length - 1] as { _id: { toString(): string } })._id.toString()
        : null;

    return apiSuccess({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: filters.cursor ? !!nextCursor : page * limit < total,
        hasPrev: page > 1,
        nextCursor,
      },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return apiError("Failed to fetch products", 500);
  }
}

// POST /api/products — create product (admin only)
export async function POST(req: NextRequest) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    await dbConnect();

    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    const data = parsed.data;

    // Check SKU uniqueness
    const existingSku = await Product.findOne({ sku: data.sku });
    if (existingSku) {
      return apiError(`Product with SKU "${data.sku}" already exists`, 409);
    }

    // Generate unique slug
    const baseSlug = slugify(data.name);
    const slug = await generateUniqueSlug(baseSlug, async (s) => {
      const existing = await Product.findOne({ slug: s });
      return !!existing;
    });

    // Resolve prices from Metal/Gemstone docs
    const metalIds = [...new Set(data.metalComposition.map((m) => m.metal))];
    const gemstoneIds = [...new Set(data.gemstoneComposition.map((g) => g.gemstone))];

    const [metalDocs, gemstoneDocs] = await Promise.all([
      Metal.find({ _id: { $in: metalIds } }).lean(),
      Gemstone.find({ _id: { $in: gemstoneIds } }).lean(),
    ]);

    const metalMap = new Map(metalDocs.map((m) => [m._id.toString(), m]));
    const gemstoneMap = new Map(gemstoneDocs.map((g) => [g._id.toString(), g]));

    const metalEntries = resolveMetalPrices(
      data.metalComposition as any,
      metalMap as any
    );
    const gemstoneEntries = resolveGemstonePrices(
      data.gemstoneComposition as any,
      gemstoneMap as any
    );

    // Calculate price
    const priceBreakdown = calculatePrice({
      metalEntries,
      gemstoneEntries,
      additionalCharges: data.additionalCharges,
      gstPercentage: data.gstPercentage,
      discount: data.discount,
    });

    const product = await Product.create({
      ...data,
      slug,
      calculatedPrice: priceBreakdown.calculatedPrice,
      finalPrice: priceBreakdown.finalPrice,
    });

    return apiSuccess(product, 201);
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    if (error.code === 11000) {
      return apiError("Product with this SKU or slug already exists", 409);
    }
    return apiError("Failed to create product", 500);
  }
}
