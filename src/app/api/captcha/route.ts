import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, verifyCaptcha } from "@/lib/captcha";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(1),
  action: z.string().optional(),
});

/**
 * POST /api/captcha
 * Server-side reCAPTCHA verification. Returns challengeRequired=true when the
 * v3 score falls below RECAPTCHA_MIN_SCORE (0.5), so the client can escalate
 * to the visible v2 challenge.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON body.", challengeRequired: true },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "A reCAPTCHA token is required.", challengeRequired: true },
      { status: 400 },
    );
  }

  const result = await verifyCaptcha(parsed.data.token, clientIp(request));

  return NextResponse.json({
    ok: result.ok,
    score: result.score,
    action: result.action,
    challengeRequired: result.challengeRequired,
    reason: result.reason,
  });
}
