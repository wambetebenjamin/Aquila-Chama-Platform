"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Bird } from "lucide-react";
import { navLinks, site } from "@/lib/site";

/**
 * Sticky navbar.
 * Brief: background solidifies with the source's sticky shadow
 * (4px 0 20px -5px rgba(0,0,0,.1)) past 80px of scroll.
 * The source itself used 100px (js/main.js `st > 100`); the brief's 80px wins.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <>
      <header
        className="fixed inset-x-0 top-0"
        style={{
          zIndex: "var(--z-navbar)",
          background: solid ? "var(--color-white)" : "transparent",
          borderBottom: solid
            ? "1px solid transparent"
            : "1px solid rgba(0,0,0,.06)",
          boxShadow: solid ? "var(--shadow-nav)" : "none",
          transition: "var(--dur-nav) all ease",
        }}
      >
        <div className="container">
          <div
            className="flex items-center justify-between gap-4"
            style={{ height: 76 }}
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-black hover:text-primary"
              style={{ fontSize: "1.25rem", fontWeight: 700 }}
            >
              <span
                className="grid place-items-center rounded-full text-white"
                style={{
                  width: 36,
                  height: 36,
                  background: "var(--color-primary)",
                }}
                aria-hidden="true"
              >
                <Bird size={20} />
              </span>
              Aquila Chama
            </Link>

            {/* Desktop navigation */}
            <nav
              aria-label="Primary"
              className="hidden items-center gap-1 lg:flex"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link"
                  style={{
                    padding: "20px 16px",
                    fontSize: "var(--text-meta)",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    color: "var(--color-black)",
                    display: "inline-block",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right cluster */}
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/signin"
                className="nav-link"
                style={{
                  padding: "20px 16px",
                  fontSize: "var(--text-meta)",
                  fontWeight: 600,
                  color: "var(--color-black)",
                  display: "inline-block",
                }}
              >
                Sign In
              </Link>
              <Link href="/#register" className="btn btn-primary">
                Register Your Chama
              </Link>
            </div>

            {/* Mobile trigger */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-drawer"
              className="grid place-items-center lg:hidden"
              style={{ width: 48, height: 48, color: "var(--color-black)" }}
            >
              {open ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen overlay drawer */}
      {open && (
        <div
          id="mobile-drawer"
          className="fixed inset-0 lg:hidden"
          style={{
            zIndex: "var(--z-drawer)",
            background: "var(--color-white)",
            overflowY: "auto",
          }}
        >
          <div className="container" style={{ paddingTop: "1.25rem" }}>
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-black"
                style={{ fontSize: "1.25rem", fontWeight: 700 }}
              >
                <span
                  className="grid place-items-center rounded-full text-white"
                  style={{
                    width: 36,
                    height: 36,
                    background: "var(--color-primary)",
                  }}
                  aria-hidden="true"
                >
                  <Bird size={20} />
                </span>
                Aquila Chama
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid place-items-center"
                style={{ width: 48, height: 48, color: "var(--color-black)" }}
              >
                <X size={28} />
              </button>
            </div>

            <nav aria-label="Mobile" className="mt-8 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="border-b"
                  style={{
                    padding: "18px 0",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "var(--color-black)",
                    borderColor: "var(--color-gray-200)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/signin"
                onClick={() => setOpen(false)}
                className="border-b"
                style={{
                  padding: "18px 0",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "var(--color-black)",
                  borderColor: "var(--color-gray-200)",
                }}
              >
                Sign In
              </Link>
            </nav>

            <div className="mt-8 flex flex-col gap-3 pb-16">
              <Link
                href="/#register"
                onClick={() => setOpen(false)}
                className="btn btn-primary btn-block"
              >
                Register Your Chama
              </Link>
              <Link href="/demo" onClick={() => setOpen(false)} className="btn btn-outline-primary btn-block">
                View live demo
              </Link>
              <a
                href={site.whatsappRegisterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-block"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
