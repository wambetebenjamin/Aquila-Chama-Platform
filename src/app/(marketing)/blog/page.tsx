import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { posts } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import Reveal from "@/components/site/Reveal";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Chama management blog",
  description:
    "Chama management tips, table banking guides and investment strategies for Kenyan savings groups.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <section className="site-section" style={{ paddingTop: 160 }}>
      <div className="container">
        <Reveal>
          <div className="mb-12 max-w-2xl">
            <span className="section-sub-title">Our blog</span>
            <h1 className="section-title">Guides for Kenyan savings groups</h1>
            <p className="lead" style={{ color: "var(--color-body)" }}>
              Practical, unglamorous advice: how to run a table banking meeting,
              how to guarantee a loan, how to work out a dividend.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Reveal key={post.slug} delay={(index % 3) * 0.1}>
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
                <span className="chip mb-3 inline-flex">{post.category}</span>
                <h2 className="font-size-regular">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <div className="meta mb-4">
                  {post.author} <span className="mx-2">&bull;</span>{" "}
                  {formatDate(post.date)} <span className="mx-2">&bull;</span>{" "}
                  {post.readingTime}
                </div>
                <p>{post.excerpt}</p>
                <p>
                  <Link href={`/blog/${post.slug}`}>Continue Reading...</Link>
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
