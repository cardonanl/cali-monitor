import { fetchAllNews } from "@/lib/fetchNews";
import { getDashboardStats, getWeeklyActivity, getWordFrequencies, getNeighborhoodArticles, getDailySummary } from "@/lib/stats";
import { ArticleSection } from "@/components/ArticleSection";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";

export const revalidate = 1800;

export default async function Home() {
  // fetchAllNews first — it upserts articles to Supabase synchronously.
  // Stats queries run after so they always see the current batch.
  const { articles, fetchedAt, total } = await fetchAllNews();

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
