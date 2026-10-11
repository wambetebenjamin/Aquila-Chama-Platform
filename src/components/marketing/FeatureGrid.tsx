import { features } from "@/lib/site";
import Reveal from "@/components/site/Reveal";

/** 8 feature cards, 4 columns on desktop, 2 on tablet, 1 on mobile. */
export default function FeatureGrid() {
  return (
    <section className="site-section bg-light" id="features">
      <div className="container">
        <Reveal>
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="section-sub-title">Features</span>
            <h2 className="section-title">Everything a treasurer needs</h2>
            <p className="lead mb-0" style={{ color: "var(--color-body)" }}>
              Built around how Kenyan chamas actually work: monthly
              contributions, guarantor-backed loans, group votes and WhatsApp
              delivery.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.name} delay={(index % 4) * 0.08}>
                <article className="feature-card">
                  <span className="feature-icon" aria-hidden="true">
                    <Icon size={24} />
                  </span>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    {feature.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: "15px", color: "var(--color-gray-700)" }}>
                    {feature.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
