import type {
  ActivityEntry,
  Chama,
  Contribution,
  Loan,
  Meeting,
  Member,
  PaymentMethod,
  Role,
} from "./types";

export const DEMO_CHAMA_ID = "maendeleo";

/**
 * Fixed reference window so server and client always render identical numbers.
 * The dataset is deliberately static: no `new Date()` at render time.
 */
export const MONTHS = [
  "2025-11",
  "2025-12",
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
  "2026-09",
  "2026-10",
] as const;

export const CURRENT_MONTH = "2026-10";
export const NEXT_MEETING_DATE = "2026-10-17";

const METHODS: PaymentMethod[] = ["MPESA", "BANK", "CASH"];

interface SeedMember {
  name: string;
  phone: string;
  idNumber: string;
  role: Role;
  joinDate: string;
  status?: Member["status"];
}

const SEED_MEMBERS: SeedMember[] = [
  { name: "Amina Wanjiku", phone: "254712340001", idNumber: "29874561", role: "ADMIN", joinDate: "2024-01-13" },
  { name: "Grace Njeri", phone: "254712340002", idNumber: "30124587", role: "TREASURER", joinDate: "2024-01-13" },
  { name: "Joseph Otieno", phone: "254712340003", idNumber: "27654902", role: "MEMBER", joinDate: "2024-02-10" },
  { name: "Mary Achieng", phone: "254712340004", idNumber: "31204578", role: "MEMBER", joinDate: "2024-02-10" },
  { name: "Peter Kimani", phone: "254712340005", idNumber: "28934512", role: "MEMBER", joinDate: "2024-03-09" },
  { name: "Faith Wambui", phone: "254712340006", idNumber: "33451209", role: "MEMBER", joinDate: "2024-03-09" },
  { name: "David Omondi", phone: "254712340007", idNumber: "25678934", role: "MEMBER", joinDate: "2024-05-11" },
  { name: "Esther Chebet", phone: "254712340008", idNumber: "34012987", role: "MEMBER", joinDate: "2024-06-08" },
  { name: "John Kiprop", phone: "254712340009", idNumber: "29874513", role: "MEMBER", joinDate: "2024-07-13" },
  { name: "Susan Nafula", phone: "254712340010", idNumber: "31567890", role: "MEMBER", joinDate: "2024-09-14" },
  { name: "Ibrahim Hassan", phone: "254712340011", idNumber: "28745123", role: "MEMBER", joinDate: "2025-01-11" },
  { name: "Mercy Muthoni", phone: "254712340012", idNumber: "33098765", role: "MEMBER", joinDate: "2025-04-12", status: "INACTIVE" },
];

export function buildSeedChama(): Chama {
  const members: Member[] = SEED_MEMBERS.map((m, i) => ({
    id: `mem_${String(i + 1).padStart(2, "0")}`,
    name: m.name,
    phone: m.phone,
    idNumber: m.idNumber,
    joinDate: m.joinDate,
    status: m.status ?? "ACTIVE",
    role: m.role,
    email: undefined,
  }));

  // Every month before the current one is fully collected; the current month
  // is mid-flight: 8 paid, 3 pending, 1 overdue.
  const contributions: Contribution[] = [];
  let n = 0;
  MONTHS.forEach((month, monthIndex) => {
    const isCurrent = month === CURRENT_MONTH;
    members.forEach((member, memberIndex) => {
      if (member.status === "INACTIVE" && monthIndex > 6) return;
      let status: Contribution["status"] = "PAID";
      if (isCurrent) {
        if (memberIndex >= 8 && memberIndex <= 10) status = "PENDING";
        if (memberIndex === 11) status = "OVERDUE";
      }
      if (status === "PENDING") return; // pending rows are not recorded yet
      n += 1;
      contributions.push({
        id: `con_${String(n).padStart(4, "0")}`,
        memberId: member.id,
        amount: 5000,
        month,
        method: METHODS[(monthIndex + memberIndex) % METHODS.length],
        reference: `QGH${(100000 + n * 37).toString(36).toUpperCase()}`,
        paidOn: `${month}-0${((memberIndex % 9) + 1)}`,
        status,
      });
    });
  });

  const loans: Loan[] = [
    {
      id: "loan_001",
      memberId: "mem_02",
      amount: 150000,
      purpose: "Restock the wholesale grocery shop before December",
      guarantorIds: ["mem_01", "mem_05"],
      votes: [
        { guarantorId: "mem_01", decision: "APPROVE", votedAt: "2026-02-11" },
        { guarantorId: "mem_05", decision: "APPROVE", votedAt: "2026-02-11" },
      ],
      status: "DISBURSED",
      interestRate: 10,
      appliedOn: "2026-02-09",
      disbursedOn: "2026-02-12",
      termMonths: 12,
      monthlyRepayment: 13750,
      balance: 96250,
      nextDueDate: "2026-11-05",
      repayments: [
        { id: "rep_001", amount: 13750, paidOn: "2026-03-05", reference: "QGH2A1" },
        { id: "rep_002", amount: 13750, paidOn: "2026-04-05", reference: "QGH2B2" },
        { id: "rep_003", amount: 13750, paidOn: "2026-05-05", reference: "QGH2C3" },
        { id: "rep_004", amount: 13750, paidOn: "2026-06-05", reference: "QGH2D4" },
        { id: "rep_005", amount: 13750, paidOn: "2026-07-05", reference: "QGH2E5" },
        { id: "rep_006", amount: 13750, paidOn: "2026-08-05", reference: "QGH2F6" },
        { id: "rep_007", amount: 13750, paidOn: "2026-09-05", reference: "QGH2G7" },
        { id: "rep_008", amount: 13750, paidOn: "2026-10-05", reference: "QGH2H8" },
      ],
    },
    {
      id: "loan_002",
      memberId: "mem_03",
      amount: 80000,
      purpose: "School fees for two children, Term 3",
      guarantorIds: ["mem_01", "mem_06"],
      votes: [
        { guarantorId: "mem_01", decision: "APPROVE", votedAt: "2026-05-14" },
        { guarantorId: "mem_06", decision: "APPROVE", votedAt: "2026-05-14" },
      ],
      status: "REPAYING",
      interestRate: 10,
      appliedOn: "2026-05-12",
      disbursedOn: "2026-05-15",
      termMonths: 10,
      monthlyRepayment: 8800,
      balance: 52800,
      nextDueDate: "2026-11-15",
      repayments: [
        { id: "rep_011", amount: 8800, paidOn: "2026-06-15", reference: "QGH3A1" },
        { id: "rep_012", amount: 8800, paidOn: "2026-07-15", reference: "QGH3B2" },
        { id: "rep_013", amount: 8800, paidOn: "2026-08-15", reference: "QGH3C3" },
        { id: "rep_014", amount: 8800, paidOn: "2026-09-15", reference: "QGH3D4" },
      ],
    },
    {
      id: "loan_003",
      memberId: "mem_04",
      amount: 45000,
      purpose: "Motorcycle spare parts for the boda boda business",
      guarantorIds: ["mem_02", "mem_07"],
      votes: [
        { guarantorId: "mem_02", decision: "APPROVE", votedAt: "2026-06-08" },
        { guarantorId: "mem_07", decision: "APPROVE", votedAt: "2026-06-08" },
      ],
      status: "OVERDUE",
      interestRate: 10,
      appliedOn: "2026-06-06",
      disbursedOn: "2026-06-09",
      termMonths: 6,
      monthlyRepayment: 7875,
      balance: 39375,
      nextDueDate: "2026-09-09",
      repayments: [
        { id: "rep_021", amount: 7875, paidOn: "2026-07-09", reference: "QGH4A1" },
        { id: "rep_022", amount: 7875, paidOn: "2026-08-09", reference: "QGH4B2" },
      ],
    },
    {
      id: "loan_004",
      memberId: "mem_06",
      amount: 60000,
      purpose: "Deposit for a market stall in Nakuru",
      guarantorIds: ["mem_03", "mem_08"],
      votes: [
        { guarantorId: "mem_03", decision: "APPROVE", votedAt: "2026-10-09" },
      ],
      status: "AWAITING_GUARANTORS",
      interestRate: 10,
      appliedOn: "2026-10-08",
      termMonths: 12,
      monthlyRepayment: 5500,
      balance: 66000,
      repayments: [],
    },
  ];

  const meetings: Meeting[] = [
    {
      id: "mtg_001",
      date: "2026-08-15",
      time: "14:00",
      agenda: "Quarterly dividend review, loan recovery, new member onboarding",
      minutes:
        "Amina opened the meeting at 2:05pm with 10 members present. Grace presented the dividend calculation of KES 128,400 for the period ending July 2026. Members agreed to maintain the monthly contribution at KES 5,000. Loan recovery for the boda boda facility was deferred to September after discussion.",
      presentMemberIds: ["mem_01", "mem_02", "mem_03", "mem_05", "mem_06", "mem_07", "mem_08", "mem_09", "mem_10", "mem_11"],
    },
    {
      id: "mtg_002",
      date: "2026-09-19",
      time: "14:00",
      agenda: "October contribution target, guarantor policy, WhatsApp report delivery",
      minutes:
        "Grace reported KES 55,000 collected in September. Members resolved that every loan must carry two guarantors and that guarantors receive a WhatsApp notification the same day. It was agreed that monthly statements would be delivered on WhatsApp on the 5th of every month.",
      presentMemberIds: ["mem_01", "mem_02", "mem_03", "mem_04", "mem_05", "mem_06", "mem_07", "mem_08", "mem_09", "mem_11"],
    },
    {
      id: "mtg_003",
      date: NEXT_MEETING_DATE,
      time: "14:00",
      agenda: "October contributions, loan application from Faith Wambui, year-end payout plan",
      minutes: "",
      presentMemberIds: [],
    },
  ];

  const activity: ActivityEntry[] = [
    { id: "act_01", at: "2026-10-09", kind: "loan", message: "Peter Kimani approved Faith Wambui's loan application for KES 60,000." },
    { id: "act_02", at: "2026-10-08", kind: "loan", message: "Faith Wambui applied for a loan of KES 60,000. Awaiting guarantor votes." },
    { id: "act_03", at: "2026-10-05", kind: "contribution", message: "Grace Njeri repaid KES 13,750 towards loan 001." },
    { id: "act_04", at: "2026-10-03", kind: "contribution", message: "October contributions opened. 8 of 12 members paid." },
    { id: "act_05", at: "2026-09-19", kind: "meeting", message: "September meeting minutes shared on WhatsApp to 12 members." },
    { id: "act_06", at: "2026-09-15", kind: "contribution", message: "Joseph Otieno repaid KES 8,800 towards loan 002." },
    { id: "act_07", at: "2026-09-05", kind: "report", message: "August monthly statement generated and delivered." },
    { id: "act_08", at: "2026-09-01", kind: "member", message: "Mercy Muthoni marked inactive after three missed meetings." },
  ];

  return {
    id: DEMO_CHAMA_ID,
    settings: {
      name: "Maendeleo Investment Group",
      registrationNumber: "SOC/2024/KE/88412",
      county: "Nairobi",
      contributionAmount: 5000,
      meetingDay: "Saturday",
      whatsappNumber: "254112272061",
      interestRate: 10,
    },
    members,
    contributions,
    loans,
    meetings,
    activity,
    createdAt: "2024-01-13",
  };
}
