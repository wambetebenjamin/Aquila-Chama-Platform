import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Aquila Chama Platform collects, encrypts and uses member financial data, contribution records and group data under the Kenya Data Protection Act 2019.",
  alternates: { canonical: "/legal/privacy-policy" },
  robots: { index: true, follow: true },
};

const sections = [
  { id: "member-financial-data", label: "Member Financial Data" },
  { id: "contribution-records", label: "Contribution Records" },
  { id: "group-data", label: "Group Data" },
  { id: "analytics", label: "Analytics" },
  { id: "your-rights", label: "Your Rights" },
  { id: "contact", label: "Contact" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="What we collect, why we collect it, and the control your chama keeps over it."
      updated="11 October 2026"
      sections={sections}
    >
      <p>
        Aquila Chama Platform (&quot;we&quot;, &quot;us&quot;) is operated from{" "}
        {site.address}. This policy explains how we handle personal data for
        chama administrators, treasurers and members. We process personal data in
        accordance with the Kenya Data Protection Act 2019 and, where relevant,
        the guidelines of the Office of the Data Protection Commissioner.
      </p>

      <h2 id="member-financial-data">Member Financial Data</h2>
      <p>
        Member financial data includes the contribution amounts a member has
        paid, outstanding balances, loan principal, repayment schedules,
        guarantor relationships, M-Pesa reference codes and dividend
        allocations.
      </p>
      <p>
        <strong>This data is encrypted.</strong> It is encrypted in transit using
        TLS 1.2 or higher and encrypted at rest on our storage infrastructure.
        Access is role-based: an administrator can see the full books, a
        treasurer can record and report, and an ordinary member can see their own
        record and the group totals. Members of the same chama can see each
        other&apos;s contribution status, which is the point of a chama, but
        never the books of another group.
      </p>
      <p>
        We do not sell member financial data. We do not share it with lenders,
        credit reference bureaus or advertisers. We do not use it to make lending
        decisions, because we are not a lender.
      </p>

      <h2 id="contribution-records">Contribution Records</h2>
      <p>
        Every contribution is stored with the member, the month it applies to,
        the payment method, the reference code supplied by the treasurer, the
        date it was recorded and its status (paid, pending or overdue). This
        record is the group&apos;s shared source of truth.
      </p>
      <p>
        We keep contribution records for seven years after the end of the
        financial year they belong to, which is long enough for a group to settle
        a dispute or satisfy an audit. You can export the whole register to CSV
        at any time from the contributions tab.
      </p>
      <p>
        M-Pesa reference codes are stored to help your treasurer reconcile
        payments. We never receive your M-Pesa PIN, and we never ask for it.
      </p>

      <h2 id="group-data">Group Data</h2>
      <p>
        Group data is your chama&apos;s name, registration number, county,
        monthly contribution amount, meeting day, meeting minutes, WhatsApp
        delivery number and interest rate. Minutes may incidentally contain
        personal information discussed at a meeting, so we treat minutes with
        the same protection as contribution records and only expose them to
        members of that group.
      </p>
      <p>
        Meeting minutes and monthly statements are shared only with the phone
        numbers and email addresses your group has registered. Delivery happens
        through the WhatsApp Cloud API where configured, or through wa.me links
        that your treasurer opens deliberately.
      </p>
      <p>
        If your group closes, the administrator can request deletion of the group
        workspace. We retain the audit trail for the statutory period and delete
        the remainder.
      </p>

      <h2 id="analytics">Analytics</h2>
      <p>
        With your consent, we collect aggregated analytics: which pages
        treasurers open most, where forms are abandoned, and how many groups
        register each month. This data is aggregated, it is not used to profile
        individual members, and it is never sold.
      </p>
      <p>
        Analytics cookies only load once you have accepted them in the cookie
        banner. You can withdraw consent at any time, and the cookies stop
        loading immediately. See the{" "}
        <a href="/legal/cookie-policy">Cookie Policy</a> for the full list.
      </p>

      <h2 id="your-rights">Your Rights</h2>
      <p>Under the Kenya Data Protection Act 2019 you have the right to:</p>
      <ul>
        <li>be informed how your data is used, which is what this policy does;</li>
        <li>access the personal data we hold about you;</li>
        <li>rectify data that is wrong or out of date;</li>
        <li>erase data where we have no continuing legal basis to keep it;</li>
        <li>restrict or object to processing;</li>
        <li>data portability, including a CSV export of your records;</li>
        <li>withdraw consent, including cookie consent, at any time;</li>
        <li>lodge a complaint with the Office of the Data Protection Commissioner.</li>
      </ul>
      <p>
        To exercise any of these rights, contact us using the details below. We
        respond within 30 days.
      </p>

      <h2 id="contact">Contact</h2>
      <p>
        Aquila Chama Platform
        <br />
        {site.address}
        <br />
        Email: <a href={`mailto:${site.email}`}>{site.email}</a>
        <br />
        Phone: <a href={site.phoneHref}>{site.phone}</a>
        <br />
        WhatsApp: <a href={site.whatsappRegisterUrl} target="_blank" rel="noopener noreferrer">{site.phone}</a>
      </p>
      <p>
        If you are not satisfied with our response, you may complain to the
        Office of the Data Protection Commissioner of Kenya.
      </p>
    </LegalLayout>
  );
}
