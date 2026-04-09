import { load } from "cheerio";
import { createHash } from "crypto";
import { Article } from "../types";

const BASE_URL = "https://www.cali.gov.co";
const NEWS_URL = `${BASE_URL}/boletines/`;
const SOURCE = "Alcaldía de Cali";

const MONTH_MAP: Record<string, number> = {
  // Spanish
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
  // English (page uses "Apr 08 de 2026" format)
  jan: 0, apr: 3, aug: 7, dec: 11,
};

function parseDate(raw: string): Date {
  const s = raw.trim();

  // Format: "Apr 08 de 2026" or "Feb 11 de 2026"
  const m1 = s.match(/([A-Za-z]{3})\s+(\d{1,2})\s+de\s+(\d{4})/i);
  if (m1) {
    const month = MONTH_MAP[m1[1].toLowerCase()] ?? 0;
    return new Date(parseInt(m1[3]), month, parseInt(m1[2]));
  }

  // Legacy format: "02 Abr.-26"
  const m2 = s.match(/(\d{1,2})\s+([A-Za-záéíóú]{3})\.?-?(\d{2,4})/i);
  if (m2) {
    const day = parseInt(m2[1]);
    const month = MONTH_MAP[m2[2].toLowerCase().slice(0, 3)] ?? 0;
    const year = parseInt(m2[3]) < 100 ? 2000 + parseInt(m2[3]) : parseInt(m2[3]);
    return new Date(year, month, day);
  }

  return new Date();
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

      // Each article card: <a class="... content-box ..."> with a boletines URL.
      // We skip "new-tools-box" links (they contain only date/category text).
      $("a[href*='/boletines/publicaciones/']").each((_, el) => {
        const href = $(el).attr("href") ?? "";

        // Must match /boletines/publicaciones/<numeric-id>/
        if (!href.match(/\/boletines\/publicaciones\/\d+\//)) return;

        // Skip the date-only companion link
        const classes = $(el).attr("class") ?? "";
        if (classes.includes("new-tools-box")) return;

        const articleUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        if (!articleUrl.includes("/boletines/")) return;

        // Title: prefer the .rollover-box .title element, fall back to <strong>
        const titleFromRollover = $(el).find(".rollover-box .title").first().text().trim();
        const titleFromStrong = $(el).find("strong").first().text().trim();
        const title = titleFromRollover || titleFromStrong;
        if (!title || title.length < 10) return;

        // Summary: data-description attribute on .rollover-box
        const summary = $(el).find(".rollover-box").attr("data-description")?.trim().slice(0, 220) ?? "";

        // Date: look for sibling new-tools-box .date within the same container
        const container = $(el).parent();
        const dateRaw = container.find(".new-tools-box .date").first().text().trim()
          || container.find(".date").first().text().trim();
        const publishedAt = parseDate(dateRaw);

        // Skip articles older than 45 days
        const cutoff = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
        if (publishedAt < cutoff) return;

        const id = createHash("md5")
          .update(title.slice(0, 60) + SOURCE)
          .digest("hex");

        articles.push({ id, title, source: SOURCE, publishedAt, summary, url: articleUrl });
      });

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
