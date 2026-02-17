import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { requireAdmin, apiError, apiSuccess } from "@/lib/api-helpers";
import { createCategorySchema } from "@/lib/validators";
import { isValidObjectId } from "@/lib/utils";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/categories/[id]
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!isValidObjectId(id)) return apiError("Invalid ID", 400);

    await dbConnect();
    const category = await Category.findById(id).lean();
    if (!category) return apiError("Category not found", 404);

    return apiSuccess(category);
  } catch (error) {
    console.error("GET /api/categories/[id] error:", error);
    return apiError("Failed to fetch category", 500);
  }
}

// PUT /api/categories/[id]
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id } = await context.params;
    if (!isValidObjectId(id)) return apiError("Invalid ID", 400);

    await dbConnect();
    const category = await Category.findById(id);
    if (!category) return apiError("Category not found", 404);

    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0].message);

    // Check slug uniqueness (exclude current)
    if (parsed.data.slug !== category.slug) {
      const existing = await Category.findOne({ slug: parsed.data.slug, _id: { $ne: id } });
      if (existing) {
        return apiError(`Category with slug "${parsed.data.slug}" already exists`, 409);
      }
    }

    Object.assign(category, parsed.data);
    await category.save();
    return apiSuccess(category);
  } catch (error) {
    console.error("PUT /api/categories/[id] error:", error);
    return apiError("Failed to update category", 500);
  }
}

// DELETE /api/categories/[id]
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id } = await context.params;
    if (!isValidObjectId(id)) return apiError("Invalid ID", 400);

    await dbConnect();
    const category = await Category.findById(id);
    if (!category) return apiError("Category not found", 404);

    // Check if products reference this category
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return apiError(
        `Cannot delete — ${productCount} product(s) are in this category. Reassign them first.`,
        409
      );
    }

    await Category.findByIdAndDelete(id);
    return apiSuccess({ message: "Category deleted" });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    return apiError("Failed to delete category", 500);
  }
}
