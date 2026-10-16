import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, verifyCaptcha } from "@/lib/captcha";
import { getChama, logActivity, memberById, saveChama } from "@/lib/data";
import { makeId } from "@/lib/store";
import { guarantorNotificationMessage, sendWhatsApp } from "@/lib/whatsapp";
import { formatKES } from "@/lib/format";
import { badRequest, guard } from "../_lib/guard";
import type { Loan } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const applySchema = z.object({
  amount: z.coerce.number().int().min(1000).max(50_000_000),
  purpose: z.string().min(5).max(240),
  guarantorIds: z.array(z.string().min(1)).length(2),
  termMonths: z.coerce.number().int().min(1).max(60).default(12),
  memberId: z.string().optional(),
  captchaToken: z.string().nullable().optional(),
});

/** GET /api/loans — loan book (protected). */
export async function GET() {
  const access = await guard();
  if (!access.ok) return access.response;

  const chama = await getChama(access.session.user.chamaId || undefined);
  return NextResponse.json({ ok: true, loans: chama.loans });
}

/**
 * POST /api/loans — apply for a loan.
 * Two guarantors are required; both are notified on WhatsApp immediately.
 */
export async function POST(request: Request) {
  const access = await guard();
  if (!access.ok) return access.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const parsed = applySchema.safeParse(payload);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Two guarantors are required.");
  }

  const captcha = await verifyCaptcha(parsed.data.captchaToken, clientIp(request));
  if (!captcha.ok) {
    return badRequest(
      "Security check failed. Please complete the challenge.",
      captcha.challengeRequired,
    );
  }

  const chama = await getChama(access.session.user.chamaId || undefined);

  // Members apply for themselves; admins and treasurers can apply on behalf.
  const memberId =
    access.session.user.role === "MEMBER"
      ? access.session.user.memberId
      : (parsed.data.memberId ?? access.session.user.memberId);

  if (!memberId) return badRequest("We could not match your account to a member record.");

  const applicant = memberById(chama, memberId);
  if (!applicant) return badRequest("Member not found.");

  const guarantors = parsed.data.guarantorIds.map((id) => memberById(chama, id));
  if (guarantors.some((g) => !g)) return badRequest("Both guarantors must be members.");
  if (parsed.data.guarantorIds.includes(memberId)) {
    return badRequest("You cannot guarantee your own loan.");
  }

  const rate = chama.settings.interestRate;
  const total = parsed.data.amount * (1 + rate / 100);
  const monthlyRepayment = Math.round(total / parsed.data.termMonths);

  const loan: Loan = {
    id: makeId("loan"),
    memberId,
    amount: parsed.data.amount,
    purpose: parsed.data.purpose,
    guarantorIds: parsed.data.guarantorIds,
    votes: [],
    status: "AWAITING_GUARANTORS",
    interestRate: rate,
    appliedOn: new Date().toISOString().slice(0, 10),
    termMonths: parsed.data.termMonths,
    monthlyRepayment,
    balance: Math.round(total),
    repayments: [],
  };

  chama.loans.push(loan);
  await logActivity(
    chama,
    "loan",
    `${applicant.name} applied for a loan of ${formatKES(parsed.data.amount)}.`,
  );
  await saveChama(chama);

  const voteUrl = `https://aquilachama.co.ke/app/loans?loan=${loan.id}`;
  const notifications = await Promise.all(
    guarantors.map((guarantor) =>
      guarantor
        ? sendWhatsApp(
            guarantor.phone,
            guarantorNotificationMessage({
              chamaName: chama.settings.name,
              guarantorName: guarantor.name,
              applicantName: applicant.name,
              amount: parsed.data.amount,
              purpose: parsed.data.purpose,
              voteUrl,
            }),
          )
        : null,
    ),
  );

  return NextResponse.json({
    ok: true,
    message: `Application submitted. Both guarantors have been notified on WhatsApp.`,
    loan,
    notifications: notifications.map((n) => ({
      delivered: n?.delivered ?? false,
      link: n?.link ?? null,
    })),
  });
}
