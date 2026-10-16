import { steps } from "@/lib/site";
import Reveal from "@/components/site/Reveal";

/**
 * 4 steps, horizontal timeline on desktop (lg+), vertical stack on mobile.
 * Each step animates in one at a time on scroll.
 */
export default function HowItWorks() {
  return (
    <section className="site-section" id="how-it-works">
      <div className="container">
        <Reveal>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="section-sub-title">How it works</span>
            <h2 className="section-title">Four steps and your chama is running</h2>
            <p className="lead mb-0" style={{ color: "var(--color-body)" }}>
              No spreadsheets, no paper register, no arguments about who paid
              what. Set the group up once and the platform keeps the books.
            </p>
          </div>
        </Reveal>

        {/* Connector line, desktop only */}
        <div className="relative hidden lg:block">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0"
            style={{
              top: 28,
              height: 2,
              background:
                "repeating-linear-gradient(to right, var(--color-primary) 0 8px, transparent 8px 16px)",
              opacity: 0.35,
            }}
          />
        </div>

        <ol
          className="grid list-none gap-10 p-0 lg:grid-cols-4 lg:gap-6"
          style={{ position: "relative" }}
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.number} className="relative">
                <Reveal delay={index * 0.12}>
                  <div className="flex items-center gap-4 lg:flex-col lg:items-start">
                    <span
                      className="grid shrink-0 place-items-center rounded-full text-white"
                      style={{
                        width: 56,
                        height: 56,
                        background: "var(--color-primary)",
                        boxShadow: "var(--shadow-card-sm)",
                      }}
                      aria-hidden="true"
                    >
                      <Icon size={24} />
                    </span>
                    <div>
                      <span
                        style={{
                          fontSize: "var(--text-meta)",
                          letterSpacing: "0.2em",
                          fontWeight: 700,
                          color: "var(--color-primary)",
                        }}
                      >
                        STEP {step.number}
                      </span>
                      <h3
                        className="mt-1"
                        style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}
                      >
                        {step.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: "15px", color: "var(--color-gray-700)" }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
