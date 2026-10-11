import { DEMO_CHAMA_ID, buildSeedChama, CURRENT_MONTH, MONTHS } from "./seed";
import { makeId, storeGet, storeSet } from "./store";
import type {
  ActivityEntry,
  Chama,
  Contribution,
  Loan,
  Meeting,
  Member,
} from "./types";

const chamaKey = (id: string) => `chama:${id}`;
const usersKey = "users";

/* -------------------------------------------------------------------------- */
/* Chama                                                                       */
/* -------------------------------------------------------------------------- */

export async function getChama(id: string = DEMO_CHAMA_ID): Promise<Chama> {
  const existing = await storeGet<Chama>(chamaKey(id));
  if (existing) return existing;
  const seeded = buildSeedChama();
  await storeSet(chamaKey(id), seeded);
  return seeded;
}

export async function saveChama(chama: Chama): Promise<void> {
  await storeSet(chamaKey(chama.id), chama);
}

export async function createChama(input: {
  name: string;
  registrationNumber?: string;
  county: string;
  contributionAmount: number;
  meetingDay: string;
  whatsappNumber: string;
  interestRate?: number;
  adminName: string;
  adminPhone: string;
  adminEmail: string;
}): Promise<Chama> {
  const id = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${makeId("grp").slice(-5)}`;
  const admin: Member = {
    id: makeId("mem"),
    name: input.adminName,
    phone: input.adminPhone,
    idNumber: "",
    joinDate: new Date().toISOString().slice(0, 10),
    status: "ACTIVE",
    role: "ADMIN",
    email: input.adminEmail,
  };
  const chama: Chama = {
    id,
    settings: {
      name: input.name,
      registrationNumber: input.registrationNumber ?? "",
      county: input.county,
      contributionAmount: input.contributionAmount,
      meetingDay: input.meetingDay,
      whatsappNumber: input.whatsappNumber,
      interestRate: input.interestRate ?? 10,
    },
    members: [admin],
    contributions: [],
    loans: [],
    meetings: [],
    activity: [
      {
        id: makeId("act"),
        at: new Date().toISOString().slice(0, 10),
        kind: "member",
        message: `${input.adminName} registered ${input.name} on Aquila Chama Platform.`,
      },
    ],
    createdAt: new Date().toISOString(),
  };
  await saveChama(chama);
  return chama;
}

export async function logActivity(
  chama: Chama,
  kind: ActivityEntry["kind"],
  message: string,
): Promise<void> {
  chama.activity.unshift({
    id: makeId("act"),
    at: new Date().toISOString().slice(0, 10),
    kind,
    message,
  });
  chama.activity = chama.activity.slice(0, 40);
}

/* -------------------------------------------------------------------------- */
/* Derived metrics                                                             */
/* -------------------------------------------------------------------------- */

export interface ContributionRate {
  paid: number;
  pending: number;
  overdue: number;
  collectedPercent: number;
  targetAmount: number;
  collectedAmount: number;
}

export interface SavingsPoint {
  month: string;
  monthTotal: number;
  cumulative: number;
}

export interface ChamaMetrics {
  totalSavings: number;
  monthlyTarget: number;
  loansOutstanding: number;
  nextMeeting: Meeting | null;
  activeMembers: number;
  rate: ContributionRate;
  savingsGrowth: SavingsPoint[];
}

export function monthlyContributionTotal(
  chama: Chama,
  month: string,
): number {
  return chama.contributions
    .filter((c) => c.month === month && c.status === "PAID")
    .reduce((sum, c) => sum + c.amount, 0);
}

export function contributionRate(
  chama: Chama,
  month: string = CURRENT_MONTH,
): ContributionRate {
  const active = chama.members.filter((m) => m.status === "ACTIVE");
  const target = active.length * chama.settings.contributionAmount;
  const paidRows = chama.contributions.filter(
    (c) => c.month === month && c.status === "PAID",
  );
  const collectedAmount = paidRows.reduce((sum, c) => sum + c.amount, 0);
  const paidMemberIds = new Set(paidRows.map((c) => c.memberId));
  const overdue = chama.contributions.filter(
    (c) => c.month === month && c.status === "OVERDUE",
  ).length;
  const pending = Math.max(0, active.length - paidMemberIds.size - overdue);
  return {
    paid: paidMemberIds.size,
    pending,
    overdue,
    collectedPercent: target === 0 ? 0 : Math.round((collectedAmount / target) * 100),
    targetAmount: target,
    collectedAmount,
  };
}

export function savingsGrowth(chama: Chama): SavingsPoint[] {
  let cumulative = 0;
  return MONTHS.map((month) => {
    const monthTotal = monthlyContributionTotal(chama, month);
    cumulative += monthTotal;
    return { month, monthTotal, cumulative };
  });
}

export function outstandingLoans(chama: Chama): Loan[] {
  return chama.loans.filter((l) =>
    ["AWAITING_GUARANTORS", "APPROVED", "DISBURSED", "REPAYING", "OVERDUE"].includes(
      l.status,
    ),
  );
}

export function loansOutstandingTotal(chama: Chama): number {
  return outstandingLoans(chama).reduce((sum, l) => sum + l.balance, 0);
}

export function nextMeeting(chama: Chama): Meeting | null {
  const upcoming = chama.meetings
    .filter((m) => m.date >= "2026-10-11")
    .sort((a, b) => a.date.localeCompare(b.date));
  return upcoming[0] ?? null;
}

export function metrics(chama: Chama): ChamaMetrics {
  const activeMembers = chama.members.filter((m) => m.status === "ACTIVE").length;
  return {
    totalSavings: chama.contributions
      .filter((c) => c.status === "PAID")
      .reduce((sum, c) => sum + c.amount, 0),
    monthlyTarget: activeMembers * chama.settings.contributionAmount,
    loansOutstanding: loansOutstandingTotal(chama),
    nextMeeting: nextMeeting(chama),
    activeMembers,
    rate: contributionRate(chama),
    savingsGrowth: savingsGrowth(chama),
  };
}

/* -------------------------------------------------------------------------- */
/* Lookups                                                                     */
/* -------------------------------------------------------------------------- */

export function memberById(chama: Chama, id: string): Member | undefined {
  return chama.members.find((m) => m.id === id);
}

export function memberName(chama: Chama, id: string): string {
  return memberById(chama, id)?.name ?? "Unassigned";
}

export function memberContributions(chama: Chama, memberId: string): Contribution[] {
  return chama.contributions
    .filter((c) => c.memberId === memberId)
    .sort((a, b) => b.month.localeCompare(a.month));
}

export function memberLoans(chama: Chama, memberId: string): Loan[] {
  return chama.loans
    .filter((l) => l.memberId === memberId)
    .sort((a, b) => b.appliedOn.localeCompare(a.appliedOn));
}

export function paidCount(chama: Chama, memberId: string): number {
  return chama.contributions.filter(
    (c) => c.memberId === memberId && c.status === "PAID",
  ).length;
}

export function loanBalance(chama: Chama, memberId: string): number {
  return chama.loans
    .filter((l) => l.memberId === memberId && !["CLEARED", "REJECTED"].includes(l.status))
    .reduce((sum, l) => sum + l.balance, 0);
}

/** Members that have not paid the current month and are not yet overdue. */
export function outstandingContributions(chama: Chama, month: string = CURRENT_MONTH) {
  const paid = new Set(
    chama.contributions.filter((c) => c.month === month).map((c) => c.memberId),
  );
  return chama.members
    .filter((m) => m.status === "ACTIVE" && !paid.has(m.id))
    .map((m) => ({
      member: m,
      amount: chama.settings.contributionAmount,
      status: "PENDING" as const,
    }));
}

export function toCsv(rows: Record<string, string | number>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => {
    const str = String(value);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h] ?? "")).join(",")),
  ].join("\n");
}
