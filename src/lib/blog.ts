import type { ComponentType } from "react";
import * as chamaRules from "@/content/blog/chama-rules-that-prevent-arguments.mdx";
import * as tableBanking from "@/content/blog/table-banking-basics.mdx";
import * as guarantor from "@/content/blog/guarantor-system-that-works.mdx";
import * as investing from "@/content/blog/investment-strategies-for-groups.mdx";
import * as dividends from "@/content/blog/year-end-dividends-made-simple.mdx";

export interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  authorRole: string;
  category: string;
  readingTime: string;
  image: string;
}

interface PostModule {
  default: ComponentType;
  meta: PostMeta;
}

const modules = [
  chamaRules,
  tableBanking,
  guarantor,
  investing,
  dividends,
] as unknown as PostModule[];

export const posts: PostMeta[] = modules
  .map((m) => m.meta)
  .sort((a, b) => b.date.localeCompare(a.date));

export function getAllSlugs(): string[] {
  return posts.map((p) => p.slug);
}

export function getPostMeta(slug: string): PostMeta | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getPostContent(slug: string): ComponentType | undefined {
  return modules.find((m) => m.meta.slug === slug)?.default;
}

export function relatedPosts(slug: string, limit = 3): PostMeta[] {
  return posts.filter((p) => p.slug !== slug).slice(0, limit);
}
