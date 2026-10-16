import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, verifyCaptcha } from "@/lib/captcha";
import { sendContactEmail } from "@/lib/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  subject: z.string().min(2).max(160),
  message: z.string().min(5).max(4000),
  captchaToken: z.string().nullable().optional(),
});

/** POST /api/contact — Nodemailer delivery with reCAPTCHA v3. */
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
      { ok: false, message: "Please complete every field." },
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

  try {
    const result = await sendContactEmail({
      name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

    return NextResponse.json({
      ok: true,
      message: result.delivered
        ? "Message sent. We reply within one working day."
        : "Message received. We will reply within one working day.",
      delivered: result.delivered,
    });
  } catch (error) {
    console.error("[contact]", error);
    return NextResponse.json(
      { ok: false, message: "Could not send your message. Please WhatsApp us instead." },
      { status: 500 },
    );
  }
}
