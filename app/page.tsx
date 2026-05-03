import { after } from "next/server";
import { fetchAllNews } from "@/lib/fetchNews";
import { getDashboardStats, getWeeklyActivity, getWordFrequencies, getNeighborhoodArticles, getDailySummary } from "@/lib/stats";
import { classifyArticles } from "@/lib/classify";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ArticleSection } from "@/components/ArticleSection";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";

export const revalidate = 1800;

export default async function Home() {
  // fetchAllNews first — it upserts articles to Supabase synchronously.
  // Stats queries run after so they always see the current batch.
  const { articles, fetchedAt, total } = await fetchAllNews();

  // Fire-and-forget: classify articles that arrived since the last daily cron run.
  // Runs after the response is sent so it doesn't add latency to the render.
  const toClassify = articles.filter((a) => a.source !== "Alcaldía de Cali" && !a.topic);
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

  const [stats, weekly, words, neighborhoodArticles, dailySummary] = await Promise.all([
    getDashboardStats(),
    getWeeklyActivity(),
    getWordFrequencies(),
    getNeighborhoodArticles(),
    getDailySummary(),
  ]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--paper)" }}>
      <Header total={total} fetchedAt={fetchedAt} />
      <Dashboard stats={stats} weekly={weekly} words={words} neighborhoodArticles={neighborhoodArticles} dailySummary={dailySummary} />

      <ArticleSection articles={articles} />

      <footer className="text-center text-xs py-4"
        style={{ color: "var(--ink-muted)", borderTop: "1px solid var(--rule)", fontFamily: "var(--font-mono)" }}>
        Cali Monitor · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
