import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Middleware uses the edge-compatible auth config (no Node.js deps).
 * The full authorize() logic runs on the server side in auth.ts.
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Protect admin routes (except login page, API routes, and static assets)
  matcher: ["/admin/:path*"],
};
