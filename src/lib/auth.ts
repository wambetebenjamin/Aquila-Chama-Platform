import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { findUser, verifyPassword } from "./users";

/**
 * NextAuth refuses to boot without a secret. `AUTH_SECRET` is required in every
 * real deployment (see .env.example); outside production we fall back to a fixed
 * local value so a fresh clone can sign in immediately. Change the demo
 * passwords before deploying.
 */
const secret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === "production"
    ? undefined
    : "aquila-chama-development-secret-not-for-production");

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  ...(secret ? { secret } : {}),
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Chama account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await findUser(email);
        if (!user) return null;
        if (!verifyPassword(password, user.hash, user.salt)) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          chamaId: user.chamaId,
          memberId: user.memberId,
        } as never;
      },
    }),
  ],
});

/** Convenience helper for server components: the session or null. */
export async function currentSession() {
  return auth();
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) return null;
  return session;
}
