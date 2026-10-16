export type Role = "ADMIN" | "TREASURER" | "MEMBER";

export type MemberStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type ContributionStatus = "PAID" | "PENDING" | "OVERDUE";

export type PaymentMethod = "MPESA" | "BANK" | "CASH";

export type LoanStatus =
  | "AWAITING_GUARANTORS"
  | "APPROVED"
  | "DISBURSED"
  | "REPAYING"
  | "OVERDUE"
  | "CLEARED"
  | "REJECTED";

export type Vote = "APPROVE" | "REJECT";

export interface GuarantorVote {
  guarantorId: string;
  decision: Vote;
  votedAt: string;
}

export interface Repayment {
  id: string;
  amount: number;
  paidOn: string;
  reference: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  idNumber: string;
  joinDate: string;
  status: MemberStatus;
  role: Role;
  email?: string;
}

export interface Contribution {
  id: string;
  memberId: string;
  amount: number;
  month: string; // YYYY-MM
  method: PaymentMethod;
  reference: string;
  paidOn: string;
  status: ContributionStatus;
}

export interface Loan {
  id: string;
  memberId: string;
  amount: number;
  purpose: string;
  guarantorIds: string[];
  votes: GuarantorVote[];
  status: LoanStatus;
  interestRate: number;
  appliedOn: string;
  disbursedOn?: string;
  termMonths: number;
  monthlyRepayment: number;
  balance: number;
  nextDueDate?: string;
  repayments: Repayment[];
}

export interface Meeting {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  agenda: string;
  minutes: string;
  presentMemberIds: string[];
}

export interface ActivityEntry {
  id: string;
  at: string;
  message: string;
  kind: "contribution" | "loan" | "meeting" | "member" | "report";
}

export interface ChamaSettings {
  name: string;
  registrationNumber: string;
  county: string;
  contributionAmount: number;
  meetingDay: string;
  whatsappNumber: string;
  interestRate: number;
}

export interface Chama {
  id: string;
  settings: ChamaSettings;
  members: Member[];
  contributions: Contribution[];
  loans: Loan[];
  meetings: Meeting[];
  activity: ActivityEntry[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  chamaId: string;
  memberId?: string;
}
