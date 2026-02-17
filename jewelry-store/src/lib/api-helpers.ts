import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Helper to protect admin API routes.
 * Returns the session if authenticated, or a 401 response.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  return { error: null, session };
}

/**
 * Standard JSON error response.
 */
export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standard JSON success response.
 */
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
