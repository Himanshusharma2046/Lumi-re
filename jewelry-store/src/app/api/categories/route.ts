import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import { requireAdmin, apiError, apiSuccess } from "@/lib/api-helpers";
import { createCategorySchema } from "@/lib/validators";

// GET /api/categories — list all categories
export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    return apiSuccess(categories);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return apiError("Failed to fetch categories", 500);
  }
}

// POST /api/categories — create category (admin only)
export async function POST(req: NextRequest) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    await dbConnect();

    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message);

    // Check slug uniqueness
    const existing = await Category.findOne({ slug: parsed.data.slug });
    if (existing) {
      return apiError(`Category with slug "${parsed.data.slug}" already exists`, 409);
    }

    const category = await Category.create(parsed.data);
    return apiSuccess(category, 201);
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return apiError("Failed to create category", 500);
  }
}
