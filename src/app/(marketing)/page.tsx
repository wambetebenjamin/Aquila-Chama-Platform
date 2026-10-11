import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import AboutSection from "@/components/marketing/AboutSection";
import ContactSection from "@/components/marketing/ContactSection";
import FeatureGrid from "@/components/marketing/FeatureGrid";
import Hero from "@/components/marketing/Hero";
import HowItWorks from "@/components/marketing/HowItWorks";
import PricingSection from "@/components/marketing/PricingSection";
import RegisterSection from "@/components/marketing/RegisterSection";
import Testimonials from "@/components/marketing/Testimonials";
import NewsletterForm from "@/components/site/NewsletterForm";
import Reveal from "@/components/site/Reveal";
import { posts } from "@/lib/blog";
import { formatDate } from "@/lib/format";

/** Marketing pages use ISR with a one hour revalidate (brief: revalidate 3600). */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Aquila Chama Platform | Manage your chama contributions, loans and reports",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const latest = posts.slice(0, 3);

  return (
    <>
      <Hero />
      <AboutSection />
      <HowItWorks />
      <FeatureGrid />
      <PricingSection />
      <Testimonials />

      {/* Blog teaser */}
      <section className="site-section" id="blog-section">
        <div className="container">
          <Reveal>
            <div className="mb-12 text-center">
              <span className="section-sub-title">Our blog</span>
              <h2 className="section-title">Chama guides that actually help</h2>
            </div>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-3">
            {latest.map((post, index) => (
              <Reveal key={post.slug} delay={index * 0.1}>
                <article className="h-entry">
                  <Link href={`/blog/${post.slug}`}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={500}
                      height={333}
                      className="img-fluid mb-4 w-full rounded"
                      style={{ height: "auto" }}
                    />
                  </Link>
                  <h2 className="font-size-regular">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <div className="meta mb-4">
                    {post.author} <span className="mx-2">&bull;</span>{" "}
                    {formatDate(post.date)} <span className="mx-2">&bull;</span>{" "}
                    {post.category}
                  </div>
                  <p>{post.excerpt}</p>
                  <p>
                    <Link href={`/blog/${post.slug}`}>Continue Reading...</Link>
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/blog" className="btn btn-outline-primary">
              Read all articles
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <RegisterSection />

      {/* Newsletter */}
      <section className="site-section bg-light" id="newsletter-section">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <span className="section-sub-title">Newsletter</span>
              <h2 className="section-title">Monthly chama management tips</h2>
              <p className="lead" style={{ color: "var(--color-body)" }}>
                One email a month: a template, a calculation or a rule that
                solves a problem your chama is about to have.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mx-auto mt-6 max-w-xl">
                <NewsletterForm />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <ContactSection />
    </>
  );
}
