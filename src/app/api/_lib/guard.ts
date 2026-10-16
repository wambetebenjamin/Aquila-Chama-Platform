import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Role } from "@/lib/types";

/**
 * Shared route guard for the protected API surface.
 * Sessions are role-based (ADMIN / TREASURER / MEMBER).
 */
export async function guard(roles?: Role[]) {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, message: "Sign in to continue." },
        { status: 401 },
      ),
    };
  }

  if (roles && roles.length > 0 && !roles.includes(session.user.role)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { ok: false, message: "Your role does not allow this action." },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const, session };
}

export function badRequest(message: string, challengeRequired = false) {
  return NextResponse.json({ ok: false, message, challengeRequired }, { status: 400 });
}

export function serverError(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 500 });
}
