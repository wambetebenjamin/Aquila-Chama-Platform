import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, verifyCaptcha } from "@/lib/captcha";
import { storeGet, storeSet } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  captchaToken: z.string().nullable().optional(),
});

const LIST_KEY = "newsletter:subscribers";

/** POST /api/newsletter — Vercel KV list + reCAPTCHA v3. */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const captcha = await verifyCaptcha(parsed.data.captchaToken, clientIp(request));
  if (!captcha.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: "Security check failed. Please complete the challenge.",
        challengeRequired: captcha.challengeRequired,
      },
      { status: 400 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const list = (await storeGet<string[]>(LIST_KEY)) ?? [];

  if (list.includes(email)) {
    return NextResponse.json({
      ok: true,
      message: "You are already subscribed. The next issue lands soon.",
    });
  }

  await storeSet(LIST_KEY, [...list, email]);

  return NextResponse.json({
    ok: true,
    message: "You are subscribed. Monthly chama tips are on the way.",
  });
}
