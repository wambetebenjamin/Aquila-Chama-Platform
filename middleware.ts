import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Edge middleware: every /app route requires a valid session.
 * Unauthenticated visitors are redirected to /signin?callbackUrl=...
 * Auth.js reads the `authorized` callback in lib/auth.config.ts.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/app/:path*"],
};

export default middleware;
