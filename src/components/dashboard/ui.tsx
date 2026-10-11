import type { ReactNode } from "react";
import type { ContributionStatus, LoanStatus, MemberStatus } from "@/lib/types";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, margin: 0 }}>{title}</h1>
        {subtitle && (
          <p style={{ margin: "0.25rem 0 0", fontSize: "15px", color: "var(--color-gray-600)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card-surface ${className ?? ""}`} style={{ padding: "1.5rem" }}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0 }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Kpi({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warning" | "danger" | "success";
}) {
  const accent = {
    default: "var(--color-primary)",
    warning: "var(--color-warning)",
    danger: "var(--color-danger)",
    success: "var(--color-success)",
  }[tone];

  return (
    <div className="kpi-card" style={{ borderTop: `3px solid ${accent}` }}>
      <p className="kpi-label" style={{ margin: 0 }}>
        {label}
      </p>
      <p className="kpi-value" style={{ margin: "0.5rem 0 0" }}>
        {value}
      </p>
      {hint && (
        <p
          style={{
            margin: "0.25rem 0 0",
            fontSize: "var(--text-meta)",
            color: "var(--color-gray-600)",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const key = status.toUpperCase();
  const map: Record<string, string> = {
    PAID: "badge badge-success",
    ACTIVE: "badge badge-info",
    PENDING: "badge badge-warning",
    OVERDUE: "badge badge-danger",
    INACTIVE: "badge badge-muted",
    SUSPENDED: "badge badge-muted",
    DISBURSED: "badge badge-info",
    REPAYING: "badge badge-info",
    APPROVED: "badge badge-success",
    CLEARED: "badge badge-success",
    REJECTED: "badge badge-danger",
    AWAITING_GUARANTORS: "badge badge-warning",
  };
  return <span className={map[key] ?? "badge badge-muted"}>{status.replace(/_/g, " ")}</span>;
}

export const contributionStatusLabel: Record<ContributionStatus, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  OVERDUE: "Overdue",
};

export const memberStatusLabel: Record<MemberStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SUSPENDED: "Suspended",
};

export const loanStatusLabel: Record<LoanStatus, string> = {
  AWAITING_GUARANTORS: "Awaiting guarantors",
  APPROVED: "Approved",
  DISBURSED: "Disbursed",
  REPAYING: "Repaying",
  OVERDUE: "Overdue",
  CLEARED: "Cleared",
  REJECTED: "Rejected",
};
