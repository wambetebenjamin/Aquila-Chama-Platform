import { NextResponse } from "next/server";
import { buildSeedChama } from "@/lib/seed";
import { metrics } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/demo
 * Public, no login. Deterministic dummy data for the Maendeleo Investment
 * Group so the live demo renders identically on server and client.
 */
export async function GET() {
  const chama = buildSeedChama();
  const m = metrics(chama);

  return NextResponse.json({
    ok: true,
    demo: true,
    notice: "This is a demo. Register your chama.",
    chama: {
      id: chama.id,
      name: chama.settings.name,
      county: chama.settings.county,
      contributionAmount: chama.settings.contributionAmount,
      meetingDay: chama.settings.meetingDay,
      interestRate: chama.settings.interestRate,
    },
    metrics: {
      totalSavings: m.totalSavings,
      monthlyTarget: m.monthlyTarget,
      loansOutstanding: m.loansOutstanding,
      nextMeetingDate: m.nextMeeting?.date ?? null,
      activeMembers: m.activeMembers,
      collectedPercent: m.rate.collectedPercent,
      paid: m.rate.paid,
      pending: m.rate.pending,
      overdue: m.rate.overdue,
    },
    growth: m.savingsGrowth,
    members: chama.members.map((member) => ({
      id: member.id,
      name: member.name,
      phone: member.phone,
      status: member.status,
      joinDate: member.joinDate,
    })),
    contributions: chama.contributions,
    loans: chama.loans,
    meetings: chama.meetings,
    activity: chama.activity,
  });
}
