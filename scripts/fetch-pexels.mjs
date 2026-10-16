#!/usr/bin/env node
/**
 * Build-time Pexels image fetcher.
 *
 *   PEXELS_API_KEY=your_key npm run fetch:images
 *
 * Queries the official Pexels API with the eight search strings from the brief,
 * scores results for East-African relevance, downloads the best large variant
 * and writes each file to public/images/ under the filename recorded in
 * image-credits.md.
 *
 * The Pexels License allows commercial use with no attribution and no watermark.
 * https://www.pexels.com/license/
 */

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const API_KEY = process.env.PEXELS_API_KEY;
const OUT_DIR = path.resolve(process.cwd(), "public/images");

/** filename -> { query, slug } */
const TARGETS = [
  { file: "hero-chama-group.jpg", query: "African women savings group Kenya meeting" },
  { file: "community-meeting-circle.jpg", query: "African community meeting savings" },
  { file: "about-community-village.jpg", query: "East African cooperative group" },
  { file: "savings-group-samburu.jpg", query: "East African chama women finance" },
  { file: "cooperative-group-men.jpg", query: "East African cooperative group" },
  { file: "woman-counting-money.jpg", query: "East African women holding money" },
  { file: "women-business-meeting.jpg", query: "Kenyan women investment group smiling" },
  { file: "office-team-lagos.jpg", query: "East African chama women finance" },
  { file: "women-laptop-collaboration.jpg", query: "Kenyan women investment group smiling" },
  { file: "hands-counting-coins.jpg", query: "East African women holding money" },
  { file: "loans-money-bills.jpg", query: "East African women holding money" },
  { file: "financial-planning-calculator.jpg", query: "African family financial planning" },
  { file: "portrait-woman-afro.jpg", query: "Kenyan women investment group smiling" },
  { file: "portrait-woman-traditional.jpg", query: "East African chama women finance" },
  { file: "portrait-woman-smiling.jpg", query: "Kenyan women investment group smiling" },
  { file: "portrait-woman-outdoors.jpg", query: "Kenyan women investment group smiling" },
  { file: "kenyan-businessman-suit.jpg", query: "Kenyan businessman savings account" },
  { file: "portrait-man-smiling-nairobi.jpg", query: "Kenyan businessman savings account" },
  { file: "portrait-man-nairobi.jpg", query: "Kenyan businessman savings account" },
];

const EAST_AFRICAN = [
  "kenya", "kenyan", "nairobi", "east africa", "east african", "tanzania",
  "uganda", "kisumu", "mombasa", "nakuru", "kikuyu", "maasai", "masai",
  "samburu", "luo", "kalenjin", "african woman", "african man", "african",
];

function score(photo) {
  const haystack = `${photo.alt ?? ""} ${photo.photographer ?? ""} ${photo.url ?? ""}`.toLowerCase();
  let value = 0;
  for (const term of EAST_AFRICAN) {
    if (haystack.includes(term)) value += 2;
  }
  if (photo.width >= 1200) value += 1;
  if (photo.width >= photo.height) value += 1; // prefer landscape for cards
  return value;
}

async function search(query, perPage = 30) {
  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("orientation", "all");

  const res = await fetch(url, {
    headers: { Authorization: API_KEY },
  });
  if (!res.ok) {
    throw new Error(`Pexels search failed (${res.status}) for "${query}"`);
  }
  return res.json();
}

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status}) for ${file}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(path.join(OUT_DIR, file), buffer);
  return buffer.length;
}

async function main() {
  if (!API_KEY) {
    console.error("PEXELS_API_KEY is not set.\n  Usage: PEXELS_API_KEY=xxx npm run fetch:images");
    process.exit(1);
  }

  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

  const cache = new Map();
  let written = 0;

  for (const target of TARGETS) {
    if (!cache.has(target.query)) {
      const data = await search(target.query);
      cache.set(target.query, data.photos ?? []);
      // Be polite to the API.
      await new Promise((r) => setTimeout(r, 250));
    }

    const photos = cache.get(target.query);
    if (photos.length === 0) {
      console.warn(`  ! no results for "${target.query}" — keeping the existing ${target.file}`);
      continue;
    }

    const best = photos
      .slice()
      .sort((a, b) => score(b) - score(a))[0];

    const size = await download(best.src.large2x ?? best.src.large ?? best.src.original, target.file);
    written += 1;
    console.log(
      `  ✓ ${target.file}  (${(size / 1024).toFixed(0)} KB)  ` +
        `photo ${best.id} by ${best.photographer} — ${best.url}`,
    );
  }

  console.log(`\nDone. ${written} of ${TARGETS.length} images written to public/images.`);
  console.log("Remember to add each photographer to image-credits.md.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
