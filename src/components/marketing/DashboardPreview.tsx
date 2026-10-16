import { ArrowUpRight, Banknote, CalendarDays, TrendingUp, Users } from "lucide-react";
import { formatKES } from "@/lib/format";

/**
 * Static dashboard preview used in the hero. Deliberately markup rather than a
 * screenshot: it stays crisp at every breakpoint and never ships a watermark.
 * Values mirror the public demo dataset.
 */
export default function DashboardPreview({ compact = false }: { compact?: boolean }) {
  const bars = [38, 52, 44, 61, 58, 72, 66, 79, 88, 94, 86, 100];

  return (
    <div
      className="card-surface overflow-hidden"
      style={{ borderRadius: "var(--radius)", boxShadow: "var(--shadow-popular)" }}
    >
      <div
        className="flex items-center justify-between gap-3 border-b px-4 py-3"
        style={{ borderColor: "var(--color-border)", background: "var(--color-gray-100)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="grid place-items-center rounded-full text-white"
            style={{ width: 26, height: 26, background: "var(--color-primary)", fontSize: 12 }}
            aria-hidden="true"
          >
            A
          </span>
          <span style={{ fontSize: "var(--text-meta)", fontWeight: 700, color: "var(--color-black)" }}>
            Maendeleo Investment Group
          </span>
        </div>
        <span className="chip" style={{ fontSize: "11px" }}>
          Nairobi County
        </span>
      </div>

      <div style={{ padding: "1rem" }}>
        <div className="grid grid-cols-2 gap-3">
          <MiniKpi
            icon={<Banknote size={16} aria-hidden="true" />}
            label="Total savings"
            value={formatKES(700000)}
          />
          <MiniKpi
            icon={<TrendingUp size={16} aria-hidden="true" />}
            label="This month"
            value="67%"
          />
          <MiniKpi
            icon={<Users size={16} aria-hidden="true" />}
            label="Members"
            value="12"
          />
          <MiniKpi
            icon={<CalendarDays size={16} aria-hidden="true" />}
            label="Next meeting"
            value="17 Oct"
          />
        </div>

        {!compact && (
          <>
            <div
              className="mt-4 rounded p-3"
              style={{ background: "var(--color-gray-100)" }}
            >
              <p
                style={{
                  margin: 0,
                  marginBottom: "0.5rem",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-gray-600)",
                }}
              >
                Savings growth, 12 months
              </p>
              <div className="flex items-end gap-1" style={{ height: 84 }}>
                {bars.map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${h}%`,
                      background:
                        i === bars.length - 1
                          ? "var(--color-primary)"
                          : "rgba(0,123,255,.28)",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p
                style={{
                  margin: 0,
                  marginBottom: "0.5rem",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-gray-600)",
                }}
              >
                Contribution status, October
              </p>
              <div className="flex flex-col gap-2">
                <MiniRow name="Amina Wanjiku" amount="5,000" tone="success" />
                <MiniRow name="Grace Njeri" amount="5,000" tone="success" />
                <MiniRow name="Susan Nafula" amount="pending" tone="warning" />
                <MiniRow name="Mercy Muthoni" amount="overdue" tone="danger" />
              </div>
            </div>
          </>
        )}
      </div>

      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderTop: "1px solid var(--color-border)", fontSize: "var(--text-meta)" }}
      >
        <span style={{ color: "var(--color-gray-600)" }}>
          Loans outstanding {formatKES(188425)}
        </span>
        <span className="inline-flex items-center gap-1 text-primary">
          View reports
          <ArrowUpRight size={14} aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

function MiniKpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded p-3"
      style={{ border: "1px solid var(--color-border)", background: "var(--color-white)" }}
    >
      <span className="inline-flex items-center gap-1.5 text-primary" aria-hidden="true">
        {icon}
      </span>
      <p style={{ margin: "0.25rem 0 0", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-gray-600)" }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--color-black)" }}>
        {value}
      </p>
    </div>
  );
}

function MiniRow({
  name,
  amount,
  tone,
}: {
  name: string;
  amount: string;
  tone: "success" | "warning" | "danger";
}) {
  const map = {
    success: ["var(--color-success)", "Paid"],
    warning: ["var(--color-warning)", "Pending"],
    danger: ["var(--color-danger)", "Overdue"],
  } as const;
  const [color, label] = map[tone];
  return (
    <div className="flex items-center justify-between gap-3">
      <span style={{ fontSize: "13px", color: "var(--color-gray-800)" }}>{name}</span>
      <span className="inline-flex items-center gap-2" style={{ fontSize: "13px" }}>
        <span style={{ color: "var(--color-gray-700)" }}>
          {label === "Paid" ? `KES ${amount}` : label}
        </span>
        <span
          aria-hidden="true"
          className="rounded-full"
          style={{ width: 8, height: 8, background: color }}
        />
      </span>
    </div>
  );
}
