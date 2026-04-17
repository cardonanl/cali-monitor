import Parser from "rss-parser";
import { Article, NewsResponse, Topic } from "./types";
import { RSS_SOURCES } from "./sources";
import { normalizeArticle, deduplicateArticles } from "./normalize";
import { filterCaliRelevant } from "./filter";
import { supabase } from "./supabase";
import { supabaseAdmin } from "./supabaseAdmin";
import { scrapeAlcaldia } from "./scrapers/caliGov";

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; CaliMonitor/1.0)" },
});

async function fetchFeed(
  url: string,
  sourceName: string,
  filterRequired: boolean
): Promise<Article[]> {
  const feed = await parser.parseURL(url);
  const articles: Article[] = [];
  for (const item of feed.items || []) {
    const article = normalizeArticle({
      title: item.title,
      link: item.link,
      contentSnippet: item.contentSnippet,
      content: item.content,
      pubDate: item.pubDate,
      isoDate: item.isoDate,
      source: sourceName,
    });
    if (article) articles.push(article);
  }
  return filterRequired ? filterCaliRelevant(articles) : articles;
}

export async function fetchAllNews(): Promise<NewsResponse> {
  const [rssResults, alcaldiaArticles] = await Promise.all([
    Promise.allSettled(
      RSS_SOURCES.map((s) => fetchFeed(s.url, s.name, s.filterRequired))
    ),
    scrapeAlcaldia(3).catch((err) => {
      console.error("[caliGov] scraper failed:", err.message);
      return [] as Article[];
    }),
  ]);

  const allArticles: Article[] = [...alcaldiaArticles];
  for (const result of rssResults) {
    if (result.status === "fulfilled") allArticles.push(...result.value);
    else console.error("[fetchNews] feed failed:", result.reason);
  }

  const deduped = deduplicateArticles(allArticles);
  deduped.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const fetchedAt = new Date().toISOString();

  // Upsert immediately so stats queries always see current articles.
  // Alcaldía articles get topic pre-assigned ("Gobernanza") — they are excluded
  // from the daily classify cron. Other articles upsert without topic to preserve
  // any existing classifications.
  if (deduped.length > 0) {
    const alcaldia = deduped.filter((a) => a.source === "Alcaldía de Cali");
    const others   = deduped.filter((a) => a.source !== "Alcaldía de Cali");

    if (alcaldia.length > 0) {
      const { error } = await supabaseAdmin.from("articles").upsert(
        alcaldia.map((a) => ({
          id: a.id, title: a.title, source: a.source,
          published_at: new Date(a.publishedAt).toISOString(),
          summary: a.summary, url: a.url,
          topic: "Gobernanza",
          fetched_at: fetchedAt,
        })),
        { onConflict: "id" }
      );
      if (error) console.error("[supabase] alcaldía upsert failed:", error.message);
    }

    if (others.length > 0) {
      const { error } = await supabaseAdmin.from("articles").upsert(
        others.map((a) => ({
          id: a.id, title: a.title, source: a.source,
          published_at: new Date(a.publishedAt).toISOString(),
          summary: a.summary, url: a.url,
          fetched_at: fetchedAt,
        })),
        { onConflict: "id" }
      );
      if (error) console.error("[supabase] upsert failed:", error.message);
    }

    console.log(`[supabase] upserted ${deduped.length} articles`);
  }

  // Merge existing topics + neighborhoods from Supabase into the in-memory articles for display.
  // Alcaldía articles always get "Gobernanza"; others use whatever the daily cron stored.
  if (deduped.length > 0) {
    const { data: existing } = await supabase
      .from("articles")
      .select("id, topic, neighborhood")
      .in("id", deduped.map((a) => a.id));

    if (existing && existing.length > 0) {
      const metaMap = new Map(
        existing.map((r) => [r.id as string, { topic: r.topic as Topic | undefined, neighborhood: r.neighborhood as string | undefined }])
      );
      for (let i = 0; i < deduped.length; i++) {
        if (deduped[i].source === "Alcaldía de Cali") {
          deduped[i].topic = "Gobernanza";
          continue;
        }
        const meta = metaMap.get(deduped[i].id);
        if (meta?.topic) deduped[i].topic = meta.topic;
        if (meta?.neighborhood) deduped[i].neighborhood = meta.neighborhood;
      }
    }
  }

  return { articles: deduped, fetchedAt, total: deduped.length };
}
