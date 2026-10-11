"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  Wallet,
  X,
  Coins,
} from "lucide-react";
import type { Role } from "@/lib/types";

const NAV = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/members", label: "Members", icon: Users },
  { href: "/app/contributions", label: "Contributions", icon: Wallet },
  { href: "/app/loans", label: "Loans", icon: Coins },
  { href: "/app/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/app/reports", label: "Reports", icon: FileText },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrator",
  TREASURER: "Treasurer",
  MEMBER: "Member",
};

/**
 * Sidebar shell.
 * >=1280px: full sidebar with labels.
 * 1024px to 1279px: icon strip.
 * Below 1024px: off-canvas drawer opened from the top bar.
 */
export default function DashboardShell({
  user,
  chamaName,
  county,
  children,
}: {
  user: { name?: string | null; email?: string | null; role: Role };
  chamaName: string;
  county: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  const navList = (
    <nav aria-label="Dashboard" className="flex flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded px-3 py-3 xl:px-4"
            style={{
              minHeight: 48,
              fontSize: "13px",
              fontWeight: 600,
              color: active ? "var(--color-primary)" : "var(--color-gray-700)",
              background: active ? "rgba(0,123,255,.08)" : "transparent",
              borderRight: active ? "3px solid var(--color-primary)" : "3px solid transparent",
              justifyContent: "center",
            }}
            title={item.label}
          >
            <Icon size={20} aria-hidden="true" className="shrink-0" />
            <span className="hidden xl:inline">{item.label}</span>
            <span className="sr-only xl:hidden">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--color-light)" }}>
      {/* Icon strip / full sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-[1200] hidden border-r bg-white lg:block"
        style={{
          width: "var(--dash-sidebar-w, 240px)",
          borderColor: "var(--color-border)",
        }}
      >
        <div
          className="flex items-center gap-2 border-b px-4"
          style={{ height: 72, borderColor: "var(--color-border)", justifyContent: "center" }}
        >
          <span
            className="grid shrink-0 place-items-center rounded-full text-white"
            style={{ width: 32, height: 32, background: "var(--color-primary)", fontSize: 14 }}
            aria-hidden="true"
          >
            A
          </span>
          <span className="hidden xl:block" style={{ fontWeight: 700, fontSize: "15px" }}>
            Aquila Chama
          </span>
        </div>

        <div className="p-2 xl:p-3">{navList}</div>

        <div
          className="absolute inset-x-0 bottom-0 hidden border-t p-4 xl:block"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p style={{ margin: 0, fontSize: "var(--text-meta)", color: "var(--color-gray-600)" }}>
            Signed in as
          </p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "var(--color-black)" }}>
            {user.name ?? user.email}
          </p>
          <p style={{ margin: 0, fontSize: "var(--text-meta)", color: "var(--color-primary)" }}>
            {ROLE_LABEL[user.role]}
          </p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-3 inline-flex items-center gap-2"
            style={{
              fontSize: "var(--text-meta)",
              color: "var(--color-gray-700)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <LogOut size={14} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[1300] lg:hidden">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,.4)" }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="absolute inset-y-0 left-0 w-[280px] bg-white"
            style={{ boxShadow: "var(--shadow-drawer)" }}
          >
            <div
              className="flex items-center justify-between border-b px-4"
              style={{ height: 72, borderColor: "var(--color-border)" }}
            >
              <span style={{ fontWeight: 700 }}>Aquila Chama</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close dashboard menu"
                className="grid place-items-center"
                style={{ width: 48, height: 48 }}
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-3">
              {NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded px-3 py-3"
                    style={{
                      minHeight: 48,
                      fontSize: "15px",
                      fontWeight: 600,
                      color: isActive(item.href)
                        ? "var(--color-primary)"
                        : "var(--color-gray-700)",
                      background: isActive(item.href)
                        ? "rgba(0,123,255,.08)"
                        : "transparent",
                    }}
                  >
                    <Icon size={20} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="mt-4 flex w-full items-center gap-3 px-3 py-3"
                style={{
                  minHeight: 48,
                  fontSize: "15px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-gray-700)",
                }}
              >
                <LogOut size={20} aria-hidden="true" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Content */}
      <div className="dash-content" style={{ minHeight: "100vh" }}>
        <header
          className="sticky top-0 z-[1100] border-b bg-white"
          style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-card-sm)" }}
        >
          <div
            className="flex items-center justify-between gap-3 px-4"
            style={{ height: 72 }}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open dashboard menu"
                className="grid place-items-center lg:hidden"
                style={{ width: 48, height: 48 }}
              >
                <Menu size={24} />
              </button>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: "15px",
                    color: "var(--color-black)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {chamaName}
                </p>
                <p style={{ margin: 0, fontSize: "var(--text-meta)", color: "var(--color-gray-600)" }}>
                  {county} County
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="chip hidden sm:inline-flex">
                {ROLE_LABEL[user.role]}
              </span>
              <span
                className="grid place-items-center rounded-full text-white"
                style={{
                  width: 36,
                  height: 36,
                  background: "var(--color-primary)",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
                aria-hidden="true"
              >
                {(user.name ?? user.email ?? "A").slice(0, 1).toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden lg:inline-flex"
                style={{
                  fontSize: "var(--text-meta)",
                  color: "var(--color-gray-700)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main
          className="p-4 lg:p-6"
          style={{
            paddingBottom: "6rem",
          }}
        >
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .dash-content { padding-left: var(--dash-sidebar-w, 240px); }
        }
        @media (min-width: 1024px) and (max-width: 1279px) {
          :root { --dash-sidebar-w: 76px; }
        }
      `}</style>
    </div>
  );
}
