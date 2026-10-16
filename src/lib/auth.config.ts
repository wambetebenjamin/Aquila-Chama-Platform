import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import type { Role } from "./types";

/**
 * Edge-safe half of the auth setup.
 *
 * `middleware.ts` runs on the edge, so it must not pull in node:crypto or the
 * credential store. It only needs to know whether a session exists — the role
 * claims are minted by the Node side in `lib/auth.ts` and ride along in the
 * same JWT.
 */

const googleEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export const authConfig = {
  providers: googleEnabled ? [Google] : [],
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  trustHost: true,
  callbacks: {
    /** Runs in middleware: blocks /app without a valid session. */
    authorized({ auth, request }) {
      const isProtected = request.nextUrl.pathname.startsWith("/app");
      if (!isProtected) return true;
      return Boolean(auth?.user);
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "MEMBER";
        token.chamaId = (user as { chamaId?: string }).chamaId ?? "";
        token.memberId = (user as { memberId?: string }).memberId ?? "";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = ((token.role as string) ?? "MEMBER") as Role;
        session.user.chamaId = (token.chamaId as string) ?? "";
        session.user.memberId = (token.memberId as string) ?? "";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
