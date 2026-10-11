import {
  Banknote,
  Calculator,
  Coins,
  FileText,
  MessageCircle,
  PieChart,
  Users,
  Vote,
  UserPlus,
  ClipboardList,
  Share2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const site = {
  name: "Aquila Chama Platform",
  shortName: "Aquila",
  tagline: "Your Chama. Managed Properly. Finally.",
  description:
    "Contributions, loans, votes, and reports for every savings group in Kenya. Built for chamas, table banking groups, investment clubs and sacco sub-groups.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://aquilachama.co.ke",
  address: "Aquila House, 3rd Floor, Ngong Road, Nairobi, Kenya",
  phone: "+254 112 272 061",
  phoneHref: "tel:+254112272061",
  email: "hello@aquilachama.co.ke",
  whatsappNumber: "254112272061",
  whatsappRegisterUrl:
    "https://wa.me/254112272061?text=Hello!%20I%20would%20like%20to%20register%20my%20chama%20on%20Aquila%20Platform.",
  mapsEmbed:
    "https://www.google.com/maps?q=Ngong%20Road%2C%20Nairobi%2C%20Kenya&output=embed",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact-section" },
];

export const legalLinks = [
  { label: "Privacy Policy", href: "/legal/privacy-policy" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Cookie Policy", href: "/legal/cookie-policy" },
];

export const trustBadges = [
  { value: "4,200", label: "chamas registered" },
  { value: "KES 2.1B", label: "tracked" },
  { value: "SASRA", label: "compliant partners" },
];

export interface Step {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const steps: Step[] = [
  {
    number: "01",
    title: "Register your chama group",
    description:
      "Add your group name, county, monthly contribution amount and meeting day. Your chama is live in under five minutes.",
    icon: UserPlus,
  },
  {
    number: "02",
    title: "Add all members with their phone numbers",
    description:
      "Import or type in every member. Phone numbers unlock contribution reminders and loan voting on WhatsApp.",
    icon: Users,
  },
  {
    number: "03",
    title: "Record monthly contributions and loans",
    description:
      "Log M-Pesa payments against the right month, apply for loans with two guarantors, and track every repayment.",
    icon: ClipboardList,
  },
  {
    number: "04",
    title: "Generate reports and share on WhatsApp",
    description:
      "One tap produces a full statement with savings, loans, minutes and dividends, delivered straight to the group.",
    icon: Share2,
  },
];

export interface Feature {
  name: string;
  description: string;
  icon: LucideIcon;
}

export const features: Feature[] = [
  {
    name: "Contribution Tracking",
    description:
      "Record every monthly contribution with its M-Pesa reference. See instantly who has paid, who is pending and who is overdue.",
    icon: Banknote,
  },
  {
    name: "Loan Management",
    description:
      "Applications, guarantors, disbursement and repayment schedules in one place, with overdue balances flagged automatically.",
    icon: Coins,
  },
  {
    name: "Member Voting System",
    description:
      "Guarantors approve or reject loan applications from their phone. A simple majority carries the decision and is logged.",
    icon: Vote,
  },
  {
    name: "Automatic Report Generation",
    description:
      "Monthly statements are generated for you: savings balance, contributions, loans, meeting log and dividend split.",
    icon: FileText,
  },
  {
    name: "WhatsApp Report Delivery",
    description:
      "Statements, reminders and meeting minutes reach every member on the app they already open every morning.",
    icon: MessageCircle,
  },
  {
    name: "Multi-Group Management",
    description:
      "Run your chama, your table banking circle and your church investment club from a single login with separate books.",
    icon: Users,
  },
  {
    name: "Interest Calculator",
    description:
      "Set your own rate. Repayment amounts, running balances and interest earned are calculated on every transaction.",
    icon: Calculator,
  },
  {
    name: "Dividend Distribution",
    description:
      "At year end the platform works out the distributable amount and each member's share from contributions and interest.",
    icon: PieChart,
  },
];

export interface PricingTier {
  id: string;
  name: string;
  monthly: number | null;
  memberLimit: string;
  support: string;
  cta: string;
  popular: boolean;
  inclusions: { label: string; included: boolean }[];
}

export const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: null,
    memberLimit: "Up to 20 members",
    support: "Email support within 48 hours",
    cta: "Start for free",
    popular: false,
    inclusions: [
      { label: "Contribution tracking", included: true },
      { label: "Member register", included: true },
      { label: "Loan management", included: true },
      { label: "WhatsApp reminders", included: true },
      { label: "PDF monthly statements", included: false },
      { label: "Multi-group management", included: false },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    monthly: 999,
    memberLimit: "Up to 100 members",
    support: "WhatsApp support within 4 hours",
    cta: "Choose Growth",
    popular: true,
    inclusions: [
      { label: "Contribution tracking", included: true },
      { label: "Member register", included: true },
      { label: "Loan management", included: true },
      { label: "WhatsApp reminders", included: true },
      { label: "PDF monthly statements", included: true },
      { label: "Multi-group management", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: 2999,
    memberLimit: "Unlimited members",
    support: "Dedicated account manager",
    cta: "Choose Enterprise",
    popular: false,
    inclusions: [
      { label: "Contribution tracking", included: true },
      { label: "Member register", included: true },
      { label: "Loan management", included: true },
      { label: "WhatsApp reminders", included: true },
      { label: "PDF monthly statements", included: true },
      { label: "Multi-group management", included: true },
    ],
  },
];

export const ANNUAL_MONTHS_FREE = 2;

export function annualMonthlyEquivalent(monthly: number): number {
  return Math.round((monthly * (12 - ANNUAL_MONTHS_FREE)) / 12);
}

export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: "How long does it take to register a chama?",
    answer:
      "About five minutes. You need the group name, county, monthly contribution amount, meeting day and the phone numbers of your members.",
  },
  {
    question: "Do members need smartphones or data bundles?",
    answer:
      "No. Members receive contribution reminders, loan votes, meeting minutes and monthly statements as ordinary WhatsApp messages.",
  },
  {
    question: "How are contributions recorded?",
    answer:
      "The treasurer records each payment with the member, month, method and M-Pesa reference. The platform works out who is paid, pending or overdue.",
  },
  {
    question: "What happens when a member misses a payment?",
    answer:
      "Their row turns amber for pending and red once overdue, and the treasurer can send a WhatsApp reminder from the contributions tab with one tap.",
  },
  {
    question: "How does loan approval work?",
    answer:
      "A member applies with an amount, a purpose and two guarantors. Both guarantors are notified on WhatsApp and vote on the platform. A majority approves the loan, then the admin records the disbursement.",
  },
  {
    question: "Is our financial data safe?",
    answer:
      "Member financial data is encrypted in transit and at rest, access is role-based, and every action is written to the group audit trail. See our Privacy Policy for the full detail.",
  },
  {
    question: "Can we switch plans later?",
    answer:
      "Yes. Move between Starter, Growth and Enterprise at any time. Annual billing gives you two months free.",
  },
];

export interface Testimonial {
  name: string;
  role: string;
  county: string;
  groupType: string;
  quote: string;
  image: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Amina Wanjiku",
    role: "Chairperson",
    county: "Nairobi County",
    groupType: "Women investment group",
    quote:
      "We used to argue about who had paid. Now every member can see the same numbers, and our monthly statement arrives on WhatsApp before the meeting starts.",
    image: "/images/portrait-woman-traditional.jpg",
  },
  {
    name: "Beatrice Chepkoech",
    role: "Treasurer",
    county: "Uasin Gishu County",
    groupType: "Table banking group",
    quote:
      "Recording forty contributions used to take my whole Sunday afternoon. It now takes me fifteen minutes, and the M-Pesa references are all in one place.",
    image: "/images/portrait-woman-outdoors.jpg",
  },
  {
    name: "John Mwangi",
    role: "Secretary",
    county: "Kiambu County",
    groupType: "Youth savings circle",
    quote:
      "The guarantor voting changed everything for us. Two people approve from their phones and the loan moves. No more waiting for the next meeting.",
    image: "/images/portrait-man-smiling-nairobi.jpg",
  },
  {
    name: "Halima Yusuf",
    role: "Chairperson",
    county: "Mombasa County",
    groupType: "Church investment club",
    quote:
      "Our dividends used to be guesswork. Aquila calculates the distributable amount and each member's share, and everyone trusts the number.",
    image: "/images/portrait-woman-afro.jpg",
  },
  {
    name: "Peter Ochieng",
    role: "Treasurer",
    county: "Kisumu County",
    groupType: "Sacco sub-group",
    quote:
      "The overdue loans list is the first thing I open. It shows the balance, the next due date and lets me remind the member immediately.",
    image: "/images/portrait-man-nairobi.jpg",
  },
  {
    name: "Grace Wanjiru",
    role: "Chairperson",
    county: "Nakuru County",
    groupType: "Women investment group",
    quote:
      "We run three groups from one login. Separate books, one dashboard, and the year-end report takes seconds instead of a weekend.",
    image: "/images/portrait-woman-smiling.jpg",
  },
];
