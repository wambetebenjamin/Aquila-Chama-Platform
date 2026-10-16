import { NextResponse } from "next/server";
import { z } from "zod";
import { getChama, logActivity, memberName, saveChama } from "@/lib/data";
import { formatKES } from "@/lib/format";
import { badRequest, guard } from "../../../_lib/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  disbursedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  reference: z.string().max(60).optional(),
});

/** POST /api/loans/[id]/disburse — admin records the disbursement. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await guard(["ADMIN"]);
  if (!access.ok) return access.response;

  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return badRequest("Check the disbursement date.");

  const chama = await getChama(access.session.user.chamaId || undefined);
  const loan = chama.loans.find((l) => l.id === id);
  if (!loan) return badRequest("Loan not found.");
  if (loan.status !== "APPROVED") {
    return badRequest("Only an approved loan can be disbursed.");
  }

  const disbursedOn =
    parsed.data.disbursedOn ?? new Date().toISOString().slice(0, 10);

  loan.status = "DISBURSED";
  loan.disbursedOn = disbursedOn;
  loan.nextDueDate = addMonth(disbursedOn);

  await logActivity(
    chama,
    "loan",
    `${formatKES(loan.amount)} disbursed to ${memberName(chama, loan.memberId)}.`,
  );
  await saveChama(chama);

  return NextResponse.json({
    ok: true,
    message: `Loan of ${formatKES(loan.amount)} marked as disbursed.`,
    loan,
  });
}

function addMonth(iso: string): string {
  const [y, m, d] = iso.split("-").map((n) => Number.parseInt(n, 10));
  const next = new Date(Date.UTC(y, (m ?? 1) - 1 + 1, d ?? 1));
  return next.toISOString().slice(0, 10);
}
