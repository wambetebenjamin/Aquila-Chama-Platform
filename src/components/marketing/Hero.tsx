"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, PlayCircle, ShieldCheck, Volume2 } from "lucide-react";
import { trustBadges } from "@/lib/site";
import DashboardPreview from "./DashboardPreview";

const HEADLINE = ["Your", "Chama.", "Managed", "Properly.", "Finally."];

export default function Hero() {
  const reduceMotion = useReducedMotion();

  const playVoice = () => {
    window.dispatchEvent(new CustomEvent("aquila:voice:play"));
  };

  return (
    <section className="site-blocks-cover" id="home-section" style={{ paddingTop: 120 }}>
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left */}
          <div>
            <button
              type="button"
              onClick={playVoice}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-primary shadow-card-sm"
              style={{
                border: "1px solid var(--color-border)",
                fontSize: "var(--text-meta)",
                fontWeight: 600,
                minHeight: 44,
              }}
            >
              <Volume2 size={16} aria-hidden="true" />
              Hear what this site is about
            </button>

            <h1
              className="display-3 text-black"
              style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)", lineHeight: 1.1, fontWeight: 900 }}
            >
              {HEADLINE.map((word, i) => (
                <motion.span
                  key={word + i}
                  className="inline-block"
                  style={{ marginRight: "0.35em" }}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <p className="lead" style={{ color: "var(--color-body)", maxWidth: 560 }}>
              Contributions, loans, votes, and reports for every savings group in
              Kenya.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/#register" className="btn btn-primary">
                Register Your Chama
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/demo" className="btn btn-outline-primary">
                <PlayCircle size={18} aria-hidden="true" />
                Watch a Demo
              </Link>
            </div>

            <ul
              className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 p-0"
              style={{ listStyle: "none" }}
            >
              {trustBadges.map((badge) => (
                <li key={badge.label} className="flex items-center gap-2">
                  {badge.label === "compliant partners" && (
                    <ShieldCheck size={18} className="text-primary" aria-hidden="true" />
                  )}
                  <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-black)" }}>
                    {badge.value}
                  </span>
                  <span style={{ fontSize: "var(--text-meta)", color: "var(--color-gray-600)" }}>
                    {badge.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right */}
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
