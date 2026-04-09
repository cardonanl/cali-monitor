import { load } from "cheerio";
import { createHash } from "crypto";
import { Article } from "../types";

const BASE_URL = "https://www.cali.gov.co";
const NEWS_URL = `${BASE_URL}/boletines/`;
const SOURCE = "Alcaldía de Cali";

const MONTH_MAP: Record<string, number> = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
};

function parseDate(raw: string): Date {
  // Format: "02 Abr.-26"  → April 2, 2026
  const m = raw.trim().match(/(\d{1,2})\s+([A-Za-záéíóú]{3})\.?-?(\d{2,4})/i);
  if (!m) return new Date();
  const day = parseInt(m[1]);
  const month = MONTH_MAP[m[2].toLowerCase().slice(0, 3)] ?? 0;
  const year = parseInt(m[3]) < 100 ? 2000 + parseInt(m[3]) : parseInt(m[3]);
  return new Date(year, month, day);
}

export async function scrapeAlcaldia(pages = 3): Promise<Article[]> {
  const articles: Article[] = [];

  for (let page = 1; page <= pages; page++) {
    const url = `${NEWS_URL}?genPag=${page}`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; CaliMonitor/1.0)",
          "Accept": "text/html",
        },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        console.warn(`[caliGov] page ${page} → HTTP ${res.status}`);
        break;
      }

      const html = await res.text();
      const $ = load(html);

      // Boletines listing: links follow /boletines/publicaciones/XXXXX/ pattern
      $("a[href*='/boletines/']").each((_, el) => {
        const href = $(el).attr("href") ?? "";
        if (!href.match(/\/boletines\/publicaciones\/\d+\//)) return;

        const title = $(el).text().trim();
        if (!title || title.length < 10) return;

        const articleUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        // Only accept URLs from the boletines section
        if (!articleUrl.includes("/boletines/")) return;

        // Summary: sibling or parent <p>
        const parent = $(el).closest("div, li, article");
        const summary = parent.find("p").first().text().trim().slice(0, 220);

        // Date: last <span> in the parent
        const spans = parent.find("span");
        const dateRaw = spans.last().text().trim();
        const publishedAt = parseDate(dateRaw);

        // Skip articles older than 45 days
        const cutoff = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
        if (publishedAt < cutoff) return;

        const id = createHash("md5")
          .update(title.slice(0, 60) + SOURCE)
          .digest("hex");

        articles.push({ id, title, source: SOURCE, publishedAt, summary, url: articleUrl });
      });

      // Stop if no articles found on this page
      if (articles.length === 0 && page === 1) break;

    } catch (err) {
      console.error(`[caliGov] page ${page} failed:`, (err as Error).message);
      break;
    }
  }

  // Deduplicate by id
  const seen = new Set<string>();
  return articles.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}
