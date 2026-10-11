import { NextResponse } from "next/server";
import { z } from "zod";
import { getChama, logActivity, saveChama } from "@/lib/data";
import { buildMonthlyReport } from "@/lib/pdf";
import { put } from "@vercel/blob";
import { reportDeliveryMessage, sendWhatsApp, waLink } from "@/lib/whatsapp";
import { badRequest, guard } from "../../_lib/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}$/),
  channel: z.enum(["whatsapp", "email", "both"]).default("whatsapp"),
  schedule: z.enum(["once", "monthly"]).default("once"),
});

/**
 * POST /api/reports/deliver
 * Generates the statement, stores it in Vercel Blob when configured, and
 * delivers it on WhatsApp (Cloud API, falling back to wa.me links) and/or
 * email. `schedule: monthly` registers the automated monthly delivery.
 */
export async function POST(request: Request) {
  const access = await guard(["ADMIN", "TREASURER"]);
  if (!access.ok) return access.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) return badRequest("Choose a valid date range and channel.");

  const chama = await getChama(access.session.user.chamaId || undefined);

  try {
    const { bytes, filename, summary } = buildMonthlyReport(
      chama,
      parsed.data.from,
      parsed.data.to,
    );

    let reportUrl: string | undefined;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`reports/${chama.id}/${filename}`, Buffer.from(bytes), {
        access: "public",
        contentType: "application/pdf",
      });
      reportUrl = blob.url;
    }

    const message = reportDeliveryMessage({
      chamaName: chama.settings.name,
      period: summary.period,
      totalSavings: summary.totalSavings,
      loansOutstanding: summary.loansOutstanding,
      reportUrl,
    });

    let delivered = 0;
    let link: string | null = null;

    if (parsed.data.channel !== "email") {
      const targets =
        chama.settings.whatsappNumber && chama.members.length > 0
          ? chama.members.filter((m) => m.status === "ACTIVE")
          : [];

      const results = await Promise.all(
        targets.map((m) => sendWhatsApp(m.phone, message)),
      );
      delivered = results.filter((r) => r.delivered).length;
      link = waLink(message, chama.settings.whatsappNumber);
    }

    await logActivity(
      chama,
      "report",
      `Statement for ${summary.period} delivered${
        parsed.data.schedule === "monthly" ? " and scheduled monthly" : ""
      }.`,
    );
    await saveChama(chama);

    return NextResponse.json({
      ok: true,
      message:
        parsed.data.schedule === "monthly"
          ? "Monthly delivery scheduled. The group receives the statement on the 5th."
          : "Statement delivered.",
      filename,
      reportUrl,
      summary,
      delivered,
      link,
    });
  } catch (error) {
    console.error("[reports/deliver]", error);
    return NextResponse.json(
      { ok: false, message: "Could not deliver the report. Please try again." },
      { status: 500 },
    );
  }
}
