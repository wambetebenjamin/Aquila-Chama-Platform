import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { clientIp, verifyCaptcha } from "@/lib/captcha";
import { createChama } from "@/lib/data";
import { upsertUser } from "@/lib/users";
import { sendWhatsApp } from "@/lib/whatsapp";
import { formatKES } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  chamaName: z.string().min(2).max(120),
  registrationNumber: z.string().max(60).optional().default(""),
  county: z.string().min(2).max(60),
  contributionAmount: z.coerce.number().int().min(100).max(1_000_000),
  meetingDay: z.string().min(3).max(20),
  whatsappNumber: z.string().min(9).max(20),
  adminName: z.string().min(2).max(120),
  adminPhone: z.string().min(9).max(20),
  adminEmail: z.string().email(),
  captchaToken: z.string().nullable().optional(),
});

/**
 * POST /api/register
 * Chama registration: reCAPTCHA verified server-side, then a WhatsApp
 * confirmation is prepared (Cloud API when configured, wa.me link otherwise).
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message:
          parsed.error.issues[0]?.message ??
          "Please check the form and try again.",
      },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const captcha = await verifyCaptcha(data.captchaToken, clientIp(request));
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
    const chama = await createChama({
      name: data.chamaName,
      registrationNumber: data.registrationNumber,
      county: data.county,
      contributionAmount: data.contributionAmount,
      meetingDay: data.meetingDay,
      whatsappNumber: data.whatsappNumber,
      adminName: data.adminName,
      adminPhone: data.adminPhone,
      adminEmail: data.adminEmail,
    });

    const temporaryPassword = randomBytes(6).toString("base64url");
    await upsertUser({
      email: data.adminEmail,
      password: temporaryPassword,
      name: data.adminName,
      role: "ADMIN",
      chamaId: chama.id,
      memberId: chama.members[0]?.id,
    });

    const message =
      `Asante ${data.adminName}, ${data.chamaName} is now registered on Aquila Chama Platform. ` +
      `Monthly contribution ${formatKES(data.contributionAmount)}, meeting day ${data.meetingDay}. ` +
      `Sign in with ${data.adminEmail}. Your temporary password is ${temporaryPassword} - change it in Settings.`;

    const delivery = await sendWhatsApp(data.adminPhone, message);

    if (!delivery.delivered) {
      // No Cloud API token: keep the credential server-side rather than
      // echoing it back in the HTTP response.
      console.info(
        `[register] ${data.chamaName} registered. Temporary password for ${data.adminEmail} withheld from the response; deliver it via WhatsApp or SMTP.`,
      );
    }

    return NextResponse.json({
      ok: true,
      message: `${data.chamaName} is registered. We are finishing up on WhatsApp.`,
      chamaId: chama.id,
      whatsappLink: delivery.link,
      delivered: delivery.delivered,
    });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json(
      { ok: false, message: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
