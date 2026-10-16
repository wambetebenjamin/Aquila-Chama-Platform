/**
 * Formatting helpers.
 *
 * Deliberately hand-rolled instead of Intl: these run on both the server and
 * the client, and locale data differences between Node and the browser are a
 * classic source of hydration mismatches. Manual formatting is deterministic.
 */

export function formatKES(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded).toString();
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += ",";
    out += digits[i];
  }
  return `${sign}KES ${out}`;
}

export function formatKESCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `KES ${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `KES ${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `KES ${(amount / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return formatKES(amount);
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-10" -> "Oct 2026" */
export function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const idx = Number.parseInt(m ?? "1", 10) - 1;
  const name = MONTH_NAMES[idx] ?? m;
  return `${name.slice(0, 3)} ${year}`;
}

/** "2026-10-11" -> "11 Oct 2026" */
export function formatDate(iso: string): string {
  const [year, m, d] = iso.split("-");
  const idx = Number.parseInt(m ?? "1", 10) - 1;
  const name = MONTH_NAMES[idx] ?? m;
  return `${Number.parseInt(d ?? "1", 10)} ${name.slice(0, 3)} ${year}`;
}

/** "2026-10-11" + "14:30" -> "11 Oct 2026, 14:30" */
export function formatDateTime(iso: string, time?: string): string {
  return time ? `${formatDate(iso)}, ${time}` : formatDate(iso);
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
