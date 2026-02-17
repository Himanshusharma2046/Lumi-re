import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Metal from "@/models/Metal";
import { requireAdmin, apiError, apiSuccess } from "@/lib/api-helpers";
import { createMetalSchema } from "@/lib/validators";

// GET /api/metals — list all metals
export async function GET() {
  try {
    await dbConnect();
    const metals = await Metal.find().sort({ name: 1 }).lean();
    return apiSuccess(metals);
  } catch (error) {
    console.error("GET /api/metals error:", error);
    return apiError("Failed to fetch metals", 500);
  }
}

// POST /api/metals — create a metal (admin only)
export async function POST(req: NextRequest) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    await dbConnect();

    const body = await req.json();
    const parsed = createMetalSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    // Check unique code
    const existing = await Metal.findOne({ code: parsed.data.code });
    if (existing) {
      return apiError(`Metal with code "${parsed.data.code}" already exists`, 409);
    }

    const metal = await Metal.create(parsed.data);
    return apiSuccess(metal, 201);
  } catch (error) {
    console.error("POST /api/metals error:", error);
    return apiError("Failed to create metal", 500);
  }
}
