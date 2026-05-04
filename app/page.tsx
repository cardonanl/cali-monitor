import { after } from "next/server";
import { fetchAllNews } from "@/lib/fetchNews";
import { getDashboardStats, getWeeklyActivity, getWordFrequencies, getArticlesInRange, getNeighborhoodArticlesInRange, getDailySummary } from "@/lib/stats";
import { classifyArticles } from "@/lib/classify";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ArticleSection } from "@/components/ArticleSection";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { DateFilter } from "@/components/DateFilter";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const sp = await searchParams;

  const today = new Date().toISOString().slice(0, 10);
  const defaultDesde = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const hasta = sp.hasta ?? today;
  const desde = sp.desde ?? defaultDesde;
  const isDefault = !sp.desde && !sp.hasta;

  // Fetch + upsert fresh articles to keep DB current.
  const { articles: freshArticles, fetchedAt, total } = await fetchAllNews();

  // Fire-and-forget classification after response is sent.
  const toClassify = freshArticles.filter((a) => a.source !== "Alcaldía de Cali" && !a.topic);
  if (toClassify.length > 0) {
    after(async () => {
      for (let i = 0; i < toClassify.length; i += 50) {
        const batch = toClassify.slice(i, i + 50);
        try {
          const classified = await classifyArticles(batch);
          await supabaseAdmin.from("articles").upsert(
            classified.map((a) => ({
              id: a.id, title: a.title, source: a.source,
              published_at: new Date(a.publishedAt).toISOString(),
              summary: a.summary, url: a.url,
              topic: a.topic ?? null,
              neighborhood: a.neighborhood ?? null,
            })),
            { onConflict: "id" }
          );
        } catch (err) {
          console.error("[classify after] batch failed:", err);
        }
      }
    });
  }

  const [filteredArticles, neighborhoodArticles, stats, weekly, words, dailySummary] = await Promise.all([
    getArticlesInRange(desde, hasta),
    getNeighborhoodArticlesInRange(desde, hasta),
    getDashboardStats(),
    getWeeklyActivity(),
    getWordFrequencies(),
    getDailySummary(),
  ]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--paper)" }}>
      <Header total={total} fetchedAt={fetchedAt} />
      <Dashboard
        stats={stats}
        weekly={weekly}
        words={words}
        neighborhoodArticles={neighborhoodArticles}
        dailySummary={dailySummary}
      />

      <DateFilter key={`${desde}-${hasta}`} desde={desde} hasta={hasta} isDefault={isDefault} />
      <ArticleSection articles={filteredArticles} />

      <footer className="text-center text-xs py-4"
        style={{ color: "var(--ink-muted)", borderTop: "1px solid var(--rule)", fontFamily: "var(--font-mono)" }}>
        Cali Monitor · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
