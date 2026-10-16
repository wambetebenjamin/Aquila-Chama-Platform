import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/site/Reveal";

/**
 * `.cta-big-image` from the source: an image with an absolutely positioned
 * #e81050 panel (max 550px, padding 3rem) that stacks on mobile.
 */
export default function AboutSection() {
  return (
    <section className="site-section cta-big-image" id="about-section">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <figure className="circle-bg" style={{ margin: 0 }}>
              <Image
                src="/images/hero-chama-group.jpg"
                alt="Members of a community savings group gathered outdoors for a meeting in a rural East African village"
                width={500}
                height={750}
                className="img-fluid w-full rounded"
                style={{ height: "auto" }}
                priority={false}
              />
            </figure>
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <span className="section-sub-title">About us</span>
              <h2 className="section-title">Built for the way Kenyan groups save</h2>
              <p style={{ color: "var(--color-body)" }}>
                More than four thousand savings groups, table banking circles and
                investment clubs run their books on Aquila. We built the platform
                around the realities of a Kenyan chama: members pay by M-Pesa,
                meetings happen on Saturdays, loans carry two guarantors, and
                everyone expects a statement on WhatsApp.
              </p>
              <p style={{ color: "var(--color-body)" }}>
                Your records belong to your group. Financial data is encrypted,
                access is role-based for admins, treasurers and members, and every
                action is written to an audit trail your members can read.
              </p>

              <div className="img-box mt-8">
                <span className="sub-title">Every Saturday</span>
                <h2>Meeting day, on time</h2>
                <p>
                  Set your recurring meeting day once. Aquila schedules it,
                  records attendance, stores the minutes and shares them with the
                  whole group in one tap.
                </p>
                <Link href="/demo" className="btn">
                  See it in the demo
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
