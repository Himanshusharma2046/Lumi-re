import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Edge-compatible auth config (no Node.js dependencies like bcrypt/mongoose).
 * Used by middleware for route protection.
 * The actual authorize() logic lives in auth.ts (Node.js runtime).
 */
export const authConfig = {
  providers: [
    // Credentials provider placeholder — actual authorize() is in auth.ts
    Credentials({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      const isLoginPage = request.nextUrl.pathname === "/admin/login";
      const isLoggedIn = !!auth?.user;

      if (isAdminRoute && !isLoginPage && !isLoggedIn) {
        return Response.redirect(
          new URL("/admin/login", request.nextUrl.origin)
        );
      }

      if (isLoginPage && isLoggedIn) {
        return Response.redirect(
          new URL("/admin", request.nextUrl.origin)
        );
      }

      return true;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
