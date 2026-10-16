import { NextResponse } from "next/server";
import { z } from "zod";
import { getChama, logActivity, memberName, saveChama } from "@/lib/data";
import { makeId } from "@/lib/store";
import { formatKES } from "@/lib/format";
import { badRequest, guard } from "../../../_lib/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  amount: z.coerce.number().int().min(1).max(50_000_000),
  reference: z.string().min(2).max(60),
});

/** POST /api/loans/[id]/repay — record a monthly repayment. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await guard(["ADMIN", "TREASURER"]);
  if (!access.ok) return access.response;

  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) return badRequest("Check the repayment amount and reference.");

  const chama = await getChama(access.session.user.chamaId || undefined);
  const loan = chama.loans.find((l) => l.id === id);
  if (!loan) return badRequest("Loan not found.");

  loan.repayments.push({
    id: makeId("rep"),
    amount: parsed.data.amount,
    paidOn: new Date().toISOString().slice(0, 10),
    reference: parsed.data.reference,
  });
  loan.balance = Math.max(0, loan.balance - parsed.data.amount);
  loan.status = loan.balance === 0 ? "CLEARED" : "REPAYING";
  loan.nextDueDate = loan.balance === 0 ? undefined : shiftMonth(loan.nextDueDate);

  await logActivity(
    chama,
    "loan",
    `${memberName(chama, loan.memberId)} repaid ${formatKES(parsed.data.amount)}. Balance ${formatKES(loan.balance)}.`,
  );
  await saveChama(chama);

  return NextResponse.json({
    ok: true,
    message:
      loan.balance === 0
        ? "Loan fully repaid. Well done."
        : `Repayment recorded. Balance ${formatKES(loan.balance)}.`,
    loan,
  });
}

function shiftMonth(iso?: string): string | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map((n) => Number.parseInt(n, 10));
  const next = new Date(Date.UTC(y, (m ?? 1) - 1 + 1, d ?? 1));
  return next.toISOString().slice(0, 10);
}
