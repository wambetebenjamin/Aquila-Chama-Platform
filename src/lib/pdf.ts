import "server-only";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate, formatKES, formatMonth } from "./format";
import { memberName, metrics, paidCount } from "./data";
import type { Chama } from "./types";

/**
 * Monthly statement generator (jsPDF).
 * Contents per the brief: savings balance, contributions table, loans table,
 * meeting log, dividend calculations.
 */

export interface ReportSummary {
  period: string;
  totalSavings: number;
  contributionsInPeriod: number;
  loansOutstanding: number;
  interestEarned: number;
  distributable: number;
  dividendPerMember: number;
  activeMembers: number;
}

export function summarise(chama: Chama, from: string, to: string): ReportSummary {
  const m = metrics(chama);
  const inPeriod = chama.contributions
    .filter((c) => c.month >= from && c.month <= to && c.status === "PAID")
    .reduce((sum, c) => sum + c.amount, 0);

  const interestEarned = chama.loans.reduce((sum, loan) => {
    const repaid = loan.repayments.reduce((s, r) => s + r.amount, 0);
    const principalShare = Math.min(repaid, loan.amount);
    return sum + (repaid - principalShare);
  }, 0);

  const distributable = m.totalSavings + interestEarned - m.loansOutstanding;
  const activeMembers = Math.max(1, m.activeMembers);

  return {
    period: `${formatMonth(from)} to ${formatMonth(to)}`,
    totalSavings: m.totalSavings,
    contributionsInPeriod: inPeriod,
    loansOutstanding: m.loansOutstanding,
    interestEarned,
    distributable,
    dividendPerMember: Math.round(distributable / activeMembers),
    activeMembers: m.activeMembers,
  };
}

export function buildMonthlyReport(
  chama: Chama,
  from: string,
  to: string,
): { bytes: Uint8Array; filename: string; summary: ReportSummary } {
  const summary = summarise(chama, from, to);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  /* --- Header band (primary #007bff) ---------------------------------- */
  doc.setFillColor(0, 123, 255);
  doc.rect(0, 0, pageWidth, 96, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Aquila Chama Platform", margin, 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Monthly statement generated for " + chama.settings.name, margin, 64);
  doc.text(`Period: ${summary.period}`, margin, 80);

  let y = 130;

  /* --- Group profile --------------------------------------------------- */
  doc.setTextColor(33, 37, 41);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Group profile", margin, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(73, 80, 87);
  const profile = [
    ["Group name", chama.settings.name],
    ["Registration number", chama.settings.registrationNumber || "Not provided"],
    ["County", chama.settings.county],
    ["Monthly contribution", formatKES(chama.settings.contributionAmount)],
    ["Meeting day", chama.settings.meetingDay],
    ["WhatsApp delivery number", chama.settings.whatsappNumber],
    ["Interest rate on loans", `${chama.settings.interestRate}%`],
  ];
  for (const [label, value] of profile) {
    doc.text(label, margin, y);
    doc.text(String(value), margin + 200, y);
    y += 15;
  }

  /* --- Summary --------------------------------------------------------- */
  y += 16;
  doc.setTextColor(33, 37, 41);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Summary", margin, y);
  y += 18;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Measure", "Amount"]],
    body: [
      ["Total savings balance", formatKES(summary.totalSavings)],
      ["Contributions in period", formatKES(summary.contributionsInPeriod)],
      ["Loans outstanding", formatKES(summary.loansOutstanding)],
      ["Interest earned on loans", formatKES(summary.interestEarned)],
      ["Distributable after loans", formatKES(summary.distributable)],
      ["Dividend per member", formatKES(summary.dividendPerMember)],
    ],
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [0, 123, 255], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
  });

  /* --- Contributions --------------------------------------------------- */
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 37, 41);
  doc.text("Contributions in period", margin, y);

  const inPeriodRows = chama.contributions
    .filter((c) => c.month >= from && c.month <= to)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((c) => [
      formatMonth(c.month),
      memberName(chama, c.memberId),
      formatKES(c.amount),
      c.method,
      c.reference,
      c.status,
    ]);

  autoTable(doc, {
    startY: y + 12,
    margin: { left: margin, right: margin },
    head: [["Month", "Member", "Amount", "Method", "Reference", "Status"]],
    body: inPeriodRows.length
      ? inPeriodRows
      : [["-", "No contributions recorded in this period", "-", "-", "-", "-"]],
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [0, 123, 255], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
  });

  /* --- Loans ------------------------------------------------------------ */
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 37, 41);
  doc.text("Loans", margin, y);

  autoTable(doc, {
    startY: y + 12,
    margin: { left: margin, right: margin },
    head: [["Member", "Principal", "Balance", "Monthly", "Next due", "Status"]],
    body: chama.loans.length
      ? chama.loans.map((l) => [
          memberName(chama, l.memberId),
          formatKES(l.amount),
          formatKES(l.balance),
          formatKES(l.monthlyRepayment),
          l.nextDueDate ? formatDate(l.nextDueDate) : "-",
          l.status.replace(/_/g, " "),
        ])
      : [["-", "-", "-", "-", "-", "No loans on record"]],
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [0, 123, 255], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
  });

  /* --- Meeting log ------------------------------------------------------ */
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 37, 41);
  doc.text("Meeting log", margin, y);

  autoTable(doc, {
    startY: y + 12,
    margin: { left: margin, right: margin },
    head: [["Date", "Attendance", "Agenda"]],
    body: chama.meetings.length
      ? chama.meetings.map((m) => [
          formatDate(m.date),
          `${m.presentMemberIds.length} of ${chama.members.length}`,
          m.agenda,
        ])
      : [["-", "-", "No meetings recorded"]],
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [0, 123, 255], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    columnStyles: { 2: { cellWidth: 260 } },
  });

  /* --- Dividend calculation --------------------------------------------- */
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 37, 41);
  doc.text("Dividend calculation", margin, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(73, 80, 87);
  const calc = [
    ["Total contributions to date", formatKES(summary.totalSavings)],
    ["Plus interest earned on loans", formatKES(summary.interestEarned)],
    ["Less loans outstanding", `(${formatKES(summary.loansOutstanding)})`],
    ["Equals distributable amount", formatKES(summary.distributable)],
    ["Active members", String(summary.activeMembers)],
    ["Dividend per member", formatKES(summary.dividendPerMember)],
  ];
  for (const [label, value] of calc) {
    doc.text(label, margin, y);
    doc.text(value, margin + 260, y);
    y += 15;
  }

  /* --- Member contribution counts --------------------------------------- */
  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(33, 37, 41);
  doc.text("Member contribution record", margin, y);

  autoTable(doc, {
    startY: y + 12,
    margin: { left: margin, right: margin },
    head: [["Member", "Phone", "Months paid", "Status"]],
    body: chama.members.map((m) => [
      m.name,
      m.phone,
      String(paidCount(chama, m.id)),
      m.status,
    ]),
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [0, 123, 255], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
  });

  /* --- Footer ------------------------------------------------------------ */
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    const height = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(108, 117, 125);
    doc.text(
      "Aquila Chama Platform - confidential to group members. Generated " +
        new Date().toISOString().slice(0, 10) +
        ".",
      margin,
      height - 24,
    );
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin - 60, height - 24);
  }

  const arrayBuffer = doc.output("arraybuffer");
  return {
    bytes: new Uint8Array(arrayBuffer),
    filename: `${chama.settings.name.replace(/\s+/g, "-").toLowerCase()}-statement-${from}-to-${to}.pdf`,
    summary,
  };
}
