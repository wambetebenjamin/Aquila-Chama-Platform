"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartColors } from "@/lib/tokens";
import { formatKES, formatMonth } from "@/lib/format";

const AXIS_STYLE = { fontSize: 12, fill: chartColors.axis } as const;

const tooltipStyle: React.CSSProperties = {
  borderRadius: "var(--radius)",
  border: "1px solid var(--color-border)",
  fontSize: 13,
  fontFamily: "var(--font-sans)",
};

export function SavingsLineChart({
  data,
}: {
  data: { month: string; cumulative: number }[];
}) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            tick={AXIS_STYLE}
            tickLine={false}
            axisLine={{ stroke: chartColors.grid }}
            minTickGap={12}
          />
          <YAxis
            tick={AXIS_STYLE}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
            width={56}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number) => [formatKES(value), "Cumulative savings"]}
            labelFormatter={(label: string) => formatMonth(label)}
          />
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke={chartColors.primary}
            strokeWidth={2.5}
            dot={{ r: 3, fill: chartColors.primary }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ContributionBarChart({
  data,
}: {
  data: { month: string; monthTotal: number }[];
}) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            tick={AXIS_STYLE}
            tickLine={false}
            axisLine={{ stroke: chartColors.grid }}
            minTickGap={12}
          />
          <YAxis
            tick={AXIS_STYLE}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
            width={56}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "rgba(0,123,255,.06)" }}
            formatter={(value: number) => [formatKES(value), "Collected"]}
            labelFormatter={(label: string) => formatMonth(label)}
          />
          <Bar dataKey="monthTotal" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ContributionDonutChart({
  paid,
  pending,
  overdue,
}: {
  paid: number;
  pending: number;
  overdue: number;
}) {
  const data = [
    { name: "Paid", value: paid, color: chartColors.paid },
    { name: "Pending", value: pending, color: chartColors.pending },
    { name: "Overdue", value: overdue, color: chartColors.overdue },
  ].filter((d) => d.value > 0);

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="58%"
            outerRadius="82%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number, name: string) => [`${value} members`, name]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span style={{ fontSize: 13, color: "var(--color-gray-700)" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
