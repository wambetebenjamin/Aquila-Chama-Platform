"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import {
  ANNUAL_MONTHS_FREE,
  annualMonthlyEquivalent,
  faqs,
  pricingTiers,
} from "@/lib/site";
import { formatKES } from "@/lib/format";
import Reveal from "@/components/site/Reveal";

/** 3 tiers, row on desktop, stacked on mobile, annual toggle = 2 months free. */
export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="site-section" id="pricing">
      <div className="container">
        <Reveal>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="section-sub-title">Pricing</span>
            <h2 className="section-title">Pricing that fits your group</h2>
            <p className="lead mb-0" style={{ color: "var(--color-body)" }}>
              Start free. Upgrade when your chama grows past twenty members.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="mb-10 flex items-center justify-center gap-3">
            <span style={{ fontSize: "var(--text-meta)", fontWeight: 600, color: annual ? "var(--color-gray-600)" : "var(--color-black)" }}>
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              aria-label="Bill annually and get two months free"
              onClick={() => setAnnual((v) => !v)}
              className="relative rounded-full transition-colors"
              style={{
                width: 52,
                height: 28,
                minHeight: 28,
                background: annual ? "var(--color-primary)" : "var(--color-gray-300)",
              }}
            >
              <span
                className="absolute rounded-full bg-white transition-all"
                style={{
                  width: 22,
                  height: 22,
                  top: 3,
                  left: annual ? 27 : 3,
                  boxShadow: "0 1px 2px rgba(0,0,0,.25)",
                }}
              />
            </button>
            <span style={{ fontSize: "var(--text-meta)", fontWeight: 600, color: annual ? "var(--color-black)" : "var(--color-gray-600)" }}>
              Annually
              <span className="badge badge-success" style={{ marginLeft: "0.5rem" }}>
                {ANNUAL_MONTHS_FREE} months free
              </span>
            </span>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier, index) => (
            <Reveal key={tier.id} delay={index * 0.1}>
              <div className={tier.popular ? "pricing-popular" : ""}>
                <div className="pricing">
                  <div className="flex items-center justify-between">
                    <h3 className="text-center text-black" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                      {tier.name}
                    </h3>
                    {tier.popular && (
                      <span className="badge badge-info">Most popular</span>
                    )}
                  </div>

                  <div className="price text-center mb-4">
                    <span>
                      {tier.monthly === null ? (
                        <span>Free</span>
                      ) : (
                        <span>
                          {annual
                            ? formatKES(annualMonthlyEquivalent(tier.monthly))
                            : formatKES(tier.monthly)}
                        </span>
                      )}
                      {tier.monthly !== null && " / month"}
                    </span>
                    {annual && tier.monthly !== null && (
                      <div style={{ fontSize: "var(--text-meta)", color: "var(--color-gray-600)", marginTop: "0.25rem" }}>
                        billed annually, {ANNUAL_MONTHS_FREE} months free
                      </div>
                    )}
                  </div>

                  <p
                    className="text-center"
                    style={{ fontSize: "var(--text-meta)", color: "var(--color-gray-600)" }}
                  >
                    {tier.memberLimit}
                    <br />
                    {tier.support}
                  </p>

                  <ul className="list-none p-0" style={{ marginBottom: "2rem" }}>
                    {tier.inclusions.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-start gap-2"
                        style={{
                          marginBottom: "0.75rem",
                          fontSize: "15px",
                          color: item.included ? "var(--color-gray-800)" : "var(--color-gray-500)",
                          textDecoration: item.included ? "none" : "line-through",
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className="mt-1 inline-flex shrink-0 items-center justify-center rounded-full"
                          style={{
                            width: 18,
                            height: 18,
                            background: item.included
                              ? "rgba(113,188,66,.18)"
                              : "var(--color-gray-200)",
                            color: item.included ? "#4a7d2c" : "var(--color-gray-500)",
                          }}
                        >
                          {item.included ? <Check size={12} /> : null}
                        </span>
                        {item.label}
                      </li>
                    ))}
                  </ul>

                  <p className="text-center" style={{ marginBottom: 0 }}>
                    <Link
                      href="/#register"
                      className={tier.popular ? "btn btn-primary btn-block" : "btn btn-secondary btn-block"}
                    >
                      {tier.cta}
                    </Link>
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <FaqAccordion />
      </div>
    </section>
  );
}

function FaqAccordion() {
  return (
    <div className="mt-20" id="faq-section">
      <Reveal>
        <div className="mb-10 text-center">
          <h2 className="section-title">Frequently asked questions</h2>
        </div>
      </Reveal>
      <div className="grid gap-4 lg:grid-cols-2">
        {faqs.map((faq, index) => (
          <Reveal key={faq.question} delay={(index % 2) * 0.08}>
            <details
              className="card-surface"
              style={{ padding: "1.25rem 1.5rem" }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: "var(--color-black)",
                  listStyle: "none",
                }}
              >
                {faq.question}
              </summary>
              <p
                style={{
                  margin: "0.75rem 0 0",
                  fontSize: "15px",
                  color: "var(--color-gray-700)",
                }}
              >
                {faq.answer}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
