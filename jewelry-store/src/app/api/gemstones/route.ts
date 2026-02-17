import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Gemstone from "@/models/Gemstone";
import { requireAdmin, apiError, apiSuccess } from "@/lib/api-helpers";
import { createGemstoneSchema } from "@/lib/validators";

// GET /api/gemstones — list all gemstones
export async function GET() {
  try {
    await dbConnect();
    const gemstones = await Gemstone.find().sort({ name: 1 }).lean();
    return apiSuccess(gemstones);
  } catch (error) {
    console.error("GET /api/gemstones error:", error);
    return apiError("Failed to fetch gemstones", 500);
  }
}

// POST /api/gemstones — create a gemstone (admin only)
export async function POST(req: NextRequest) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    await dbConnect();

    const body = await req.json();
    const parsed = createGemstoneSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    const gemstone = await Gemstone.create(parsed.data);
    return apiSuccess(gemstone, 201);
  } catch (error) {
    console.error("POST /api/gemstones error:", error);
    return apiError("Failed to create gemstone", 500);
  }
}
