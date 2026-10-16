import { NextResponse } from "next/server";
import { z } from "zod";
import { getChama } from "@/lib/data";
import { buildMonthlyReport } from "@/lib/pdf";
import { badRequest, guard } from "../../_lib/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}$/),
});

/**
 * POST /api/reports/generate
 * Builds the chama's monthly statement with jsPDF and streams it back as a
 * download. Contents: savings balance, contributions table, loans table,
 * meeting log and dividend calculation.
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

  const parsed = schema.safeParse(payload);
  if (!parsed.success) return badRequest("Choose a valid date range.");

  const chama = await getChama(access.session.user.chamaId || undefined);

  try {
    const { bytes, filename, summary } = buildMonthlyReport(
      chama,
      parsed.data.from,
      parsed.data.to,
    );

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Report-Period": summary.period,
      },
    });
  } catch (error) {
    console.error("[reports/generate]", error);
    return NextResponse.json(
      { ok: false, message: "Could not generate the report. Please try again." },
      { status: 500 },
    );
  }
}
