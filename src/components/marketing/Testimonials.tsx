import Image from "next/image";
import { Quote } from "lucide-react";
import { testimonials } from "@/lib/site";
import Reveal from "@/components/site/Reveal";

/** Chama chairpersons and treasurers. Stagger reveal on scroll. */
export default function Testimonials() {
  return (
    <section className="site-section testimonial-wrap" id="testimonials-section">
      <div className="container">
        <Reveal>
          <div className="mb-14 text-center">
            <span className="section-sub-title">Testimonials</span>
            <h2 className="section-title">Trusted by groups across Kenya</h2>
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, index) => (
            <Reveal key={t.name} delay={(index % 3) * 0.1}>
              <figure
                className="card-surface"
                style={{ padding: "1.75rem", margin: 0, height: "100%" }}
              >
                <Quote size={22} className="text-primary" aria-hidden="true" />
                <blockquote
                  style={{
                    margin: "1rem 0 1.5rem",
                    fontSize: "15px",
                    lineHeight: 1.7,
                    color: "var(--color-gray-800)",
                  }}
                >
                  {t.quote}
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <Image
                    src={t.image}
                    alt={`${t.name}, ${t.role} of a ${t.groupType} in ${t.county}`}
                    width={56}
                    height={56}
                    className="rounded-full object-cover"
                    style={{ width: 56, height: 56 }}
                  />
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: "15px",
                        color: "var(--color-black)",
                      }}
                    >
                      {t.name}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "var(--text-meta)",
                        color: "var(--color-gray-600)",
                      }}
                    >
                      {t.role}, {t.groupType}
                      <br />
                      {t.county}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
