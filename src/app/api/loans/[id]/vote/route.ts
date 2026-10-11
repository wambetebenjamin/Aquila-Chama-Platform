import { NextResponse } from "next/server";
import { z } from "zod";
import { getChama, logActivity, memberName, saveChama } from "@/lib/data";
import { formatKES } from "@/lib/format";
import { badRequest, guard } from "../../../_lib/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  guarantorId: z.string().min(1).optional(),
});

/**
 * POST /api/loans/[id]/vote
 * A guarantor approves or rejects. A majority of guarantors carries the
 * decision: approvals > half the guarantors means the loan is approved.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await guard();
  if (!access.ok) return access.response;

  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) return badRequest("Choose approve or reject.");

  const chama = await getChama(access.session.user.chamaId || undefined);
  const loan = chama.loans.find((l) => l.id === id);
  if (!loan) return badRequest("Loan not found.");

  const guarantorId =
    parsed.data.guarantorId ??
    (loan.guarantorIds.includes(access.session.user.memberId)
      ? access.session.user.memberId
      : access.session.user.memberId);

  if (!loan.guarantorIds.includes(guarantorId)) {
    return badRequest("Only a named guarantor can vote on this loan.");
  }

  loan.votes = [
    ...loan.votes.filter((v) => v.guarantorId !== guarantorId),
    {
      guarantorId,
      decision: parsed.data.decision,
      votedAt: new Date().toISOString().slice(0, 10),
    },
  ];

  const approvals = loan.votes.filter((v) => v.decision === "APPROVE").length;
  const rejections = loan.votes.filter((v) => v.decision === "REJECT").length;
  const needed = Math.floor(loan.guarantorIds.length / 2) + 1;

  const voter = memberName(chama, guarantorId);

  if (approvals >= needed && loan.status === "AWAITING_GUARANTORS") {
    loan.status = "APPROVED";
    await logActivity(
      chama,
      "loan",
      `Guarantors approved the loan of ${formatKES(loan.amount)} for ${memberName(chama, loan.memberId)}.`,
    );
  } else if (rejections >= needed && loan.status === "AWAITING_GUARANTORS") {
    loan.status = "REJECTED";
    await logActivity(
      chama,
      "loan",
      `Guarantors declined the loan of ${formatKES(loan.amount)} for ${memberName(chama, loan.memberId)}.`,
    );
  } else {
    await logActivity(
      chama,
      "loan",
      `${voter} voted ${parsed.data.decision.toLowerCase()} on the loan of ${formatKES(loan.amount)}.`,
    );
  }

  await saveChama(chama);

  return NextResponse.json({
    ok: true,
    message:
      loan.status === "APPROVED"
        ? "Guarantors approved the loan. An admin can now disburse it."
        : loan.status === "REJECTED"
          ? "Guarantors declined the loan."
          : "Vote recorded. Waiting for the remaining guarantors.",
    loan,
  });
}
