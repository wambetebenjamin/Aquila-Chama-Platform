import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostContent, getPostMeta, relatedPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostMeta(slug);
  if (!post) return { title: "Article not found" };

  const url = `${site.url}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: post.image, width: 500, height: 333, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostMeta(slug);
  const Content = getPostContent(slug);

  if (!post || !Content) notFound();

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
    image: `${site.url}${post.image}`,
    articleSection: post.category,
    inLanguage: "en-KE",
  };

  return (
    <article style={{ paddingTop: 140 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      <div className="container">
        <nav aria-label="Breadcrumb" style={{ fontSize: "var(--text-meta)" }}>
          <Link href="/blog" className="text-primary">
            Blog
          </Link>
          <span className="mx-2" style={{ color: "var(--color-gray-500)" }}>
            /
          </span>
          <span style={{ color: "var(--color-gray-600)" }}>{post.category}</span>
        </nav>

        <header className="my-8 max-w-3xl">
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, lineHeight: 1.15 }}>
            {post.title}
          </h1>
          <p className="post-meta">
            {post.author} ({post.authorRole}) <span className="mx-2">&bull;</span>{" "}
            {formatDate(post.date)} <span className="mx-2">&bull;</span>{" "}
            {post.readingTime}
          </p>
        </header>

        <div className="mb-10 overflow-hidden rounded" style={{ maxWidth: 900 }}>
          <Image
            src={post.image}
            alt={post.title}
            width={500}
            height={333}
            className="img-fluid w-full"
            style={{ height: "auto", maxHeight: 420, objectFit: "cover" }}
            priority
          />
        </div>

        <div className="prose-article" style={{ maxWidth: 720 }}>
          <Content />

          <div
            className="mt-12 rounded p-6"
            style={{ background: "var(--color-light)", border: "1px solid var(--color-border)" }}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: 0 }}>
              Run your chama on Aquila
            </h2>
            <p>
              Contributions, loans, guarantor votes, minutes and monthly
              statements, delivered to every member on WhatsApp.
            </p>
            <Link href="/#register" className="btn btn-primary">
              Register Your Chama
            </Link>
          </div>
        </div>

        <section className="mt-16" aria-labelledby="related-heading">
          <h2 id="related-heading" className="section-title" style={{ fontSize: "1.75rem" }}>
            Keep reading
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {relatedPosts(post.slug).map((related) => (
              <article key={related.slug} className="h-entry">
                <Link href={`/blog/${related.slug}`}>
                  <Image
                    src={related.image}
                    alt={related.title}
                    width={500}
                    height={333}
                    className="img-fluid mb-4 w-full rounded"
                    style={{ height: "auto" }}
                  />
                </Link>
                <h3 style={{ fontSize: "1.125rem" }}>
                  <Link href={`/blog/${related.slug}`}>{related.title}</Link>
                </h3>
                <div className="meta mb-4">{related.category}</div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div style={{ height: "4rem" }} />
    </article>
  );
}
