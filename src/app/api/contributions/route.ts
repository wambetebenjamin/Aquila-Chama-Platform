import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, verifyCaptcha } from "@/lib/captcha";
import { getChama, logActivity, memberById, saveChama } from "@/lib/data";
import { makeId } from "@/lib/store";
import {
  contributionReminderMessage,
  sendWhatsApp,
  waLink,
} from "@/lib/whatsapp";
import { formatKES, formatMonth } from "@/lib/format";
import { badRequest, guard } from "../_lib/guard";
import type { Contribution } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createSchema = z.object({
  memberId: z.string().min(1),
  amount: z.coerce.number().int().min(1).max(10_000_000),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  method: z.enum(["MPESA", "BANK", "CASH"]),
  reference: z.string().min(3).max(60),
  status: z.enum(["PAID", "PENDING", "OVERDUE"]).default("PAID"),
  captchaToken: z.string().nullable().optional(),
});

const reminderSchema = z.object({
  action: z.literal("reminder"),
  memberId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

/** GET /api/contributions?month=&memberId=&status= — history with filters. */
export async function GET(request: Request) {
  const access = await guard();
  if (!access.ok) return access.response;

  const params = new URL(request.url).searchParams;
  const month = params.get("month");
  const memberId = params.get("memberId");
  const status = params.get("status");

  const chama = await getChama(access.session.user.chamaId || undefined);

  const contributions = chama.contributions.filter(
    (c) =>
      (!month || c.month === month) &&
      (!memberId || c.memberId === memberId) &&
      (!status || c.status === status),
  );

  return NextResponse.json({ ok: true, contributions });
}

/** POST /api/contributions — record a contribution, or send a reminder. */
export async function POST(request: Request) {
  const access = await guard(["ADMIN", "TREASURER"]);
  if (!access.ok) return access.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  // Reminder branch
  const reminder = reminderSchema.safeParse(payload);
  if (reminder.success) {
    const chama = await getChama(access.session.user.chamaId || undefined);
    const member = memberById(chama, reminder.data.memberId);
    if (!member) return badRequest("Member not found.");

    const message = contributionReminderMessage({
      chamaName: chama.settings.name,
      memberName: member.name,
      amount: chama.settings.contributionAmount,
      month: formatMonth(reminder.data.month),
    });

    const result = await sendWhatsApp(member.phone, message);
    await logActivity(
      chama,
      "contribution",
      `Reminder sent to ${member.name} for ${formatMonth(reminder.data.month)}.`,
    );
    await saveChama(chama);

    return NextResponse.json({
      ok: true,
      message: `Reminder ready for ${member.name}.`,
      delivered: result.delivered,
      link: result.link,
    });
  }

  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Check the contribution details.");
  }

  const captcha = await verifyCaptcha(parsed.data.captchaToken, clientIp(request));
  if (!captcha.ok) {
    return badRequest(
      "Security check failed. Please complete the challenge.",
      captcha.challengeRequired,
    );
  }

  const chama = await getChama(access.session.user.chamaId || undefined);
  const member = memberById(chama, parsed.data.memberId);
  if (!member) return badRequest("Member not found.");

  const contribution: Contribution = {
    id: makeId("con"),
    memberId: parsed.data.memberId,
    amount: parsed.data.amount,
    month: parsed.data.month,
    method: parsed.data.method,
    reference: parsed.data.reference,
    paidOn: new Date().toISOString().slice(0, 10),
    status: parsed.data.status,
  };

  chama.contributions.push(contribution);
  await logActivity(
    chama,
    "contribution",
    `${member.name} contributed ${formatKES(parsed.data.amount)} for ${formatMonth(parsed.data.month)}.`,
  );
  await saveChama(chama);

  const receipt =
    `Asante ${member.name}, ${chama.settings.name} received ${formatKES(parsed.data.amount)} ` +
    `for ${formatMonth(parsed.data.month)} (ref ${parsed.data.reference}).`;

  return NextResponse.json({
    ok: true,
    message: `Recorded ${formatKES(parsed.data.amount)} for ${member.name}.`,
    contribution,
    receiptLink: waLink(receipt, member.phone),
  });
}
