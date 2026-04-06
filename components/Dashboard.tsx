import { DashboardStats, Topic } from "@/lib/types";
import { DayBucket, WordFreq, NeighborhoodArticle } from "@/lib/stats";
import { TOPIC_COLORS_HEX } from "./TopicBadge";
import { WeeklyChart } from "./charts/WeeklyChart";
import { WordCloud } from "./charts/WordCloud";
import { MapPanel } from "./MapPanel";
import { Newspaper, Clock, TrendingUp, Radio, MapPin } from "lucide-react";

function StatCard({
  label, value, icon, accent,
}: {
  label: string; value: number | string; icon: React.ReactNode; accent?: string;
}) {
  return (
    <div className="rounded-lg p-4 flex flex-col gap-2"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
        <span style={{ color: accent ?? "var(--text-muted)" }}>{icon}</span>
      </div>
      <span className="text-3xl font-bold tabular-nums"
        style={{ color: accent ?? "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-4"
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

export function Dashboard({
  stats, weekly, words, neighborhoodArticles, dailySummary,
}: {
  stats: DashboardStats;
  weekly: DayBucket[];
  words: WordFreq[];
  neighborhoodArticles: NeighborhoodArticle[];
  dailySummary: string;
}) {
  const maxCount24h = stats.byTopic24h[0]?.count ?? 1;

  return (
    <section className="max-w-7xl mx-auto w-full px-4 pt-5 pb-2 flex flex-col gap-4">

      {/* Site header */}
      <div className="flex flex-col gap-1 pt-2 pb-1">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Monitor de Situación para Cali
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Creado por Nicolas Cardona &mdash;{" "}
          <a
            href="https://github.com/cardonanl/cali-monitor"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent)" }}
            className="hover:underline"
          >
            github.com/cardonanl/cali-monitor
          </a>
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total en BD" value={stats.total}
          icon={<Newspaper className="w-4 h-4" />} accent="#38bdf8" />
        <StatCard label="Últimas 24h" value={stats.last24h}
          icon={<Clock className="w-4 h-4" />} accent="#4ade80" />
        <StatCard label="Fuentes" value={stats.bySource.length}
          icon={<Radio className="w-4 h-4" />} accent="#c084fc" />
        <StatCard label="Tópicos" value={stats.byTopic.length}
          icon={<TrendingUp className="w-4 h-4" />} accent="#fbbf24" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Topic distribution — últimas 24h (horizontal bars) */}
        <ChartPanel title="Distribución por tópico — últimas 24h">
          {stats.byTopic24h.length > 0 ? (
            <div className="flex flex-col gap-2">
              {stats.byTopic24h.map(({ topic, count }) => {
                const color = TOPIC_COLORS_HEX[topic as Topic] ?? "#64748b";
                const pct = Math.round((count / maxCount24h) * 100);
                return (
                  <div key={topic} className="flex items-center gap-3">
                    <span className="text-xs w-28 shrink-0 truncate" style={{ color }}>{topic}</span>
                    <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "var(--border)" }}>
                      <div className="h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                    <span className="text-xs w-6 text-right tabular-nums"
                      style={{ color: "var(--text-muted)" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>
              Sin datos en las últimas 24h
            </p>
          )}
        </ChartPanel>

        {/* AI daily summary */}
        <ChartPanel title="Resumen del día — generado por IA">
          <div
            className="text-sm leading-relaxed whitespace-pre-line overflow-auto"
            style={{ color: "var(--text-primary)", maxHeight: 220 }}
          >
            {dailySummary}
          </div>
        </ChartPanel>

        {/* Weekly activity line chart */}
        <ChartPanel title="Noticias por día — última semana">
          <WeeklyChart data={weekly} />
        </ChartPanel>

      </div>

      {/* Word cloud */}
      <ChartPanel title="Nube de palabras — últimas 24h">
        <WordCloud data={words} />
      </ChartPanel>

      {/* Barrios map */}
      <div className="rounded-lg p-4"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
          <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Mapa de noticias por barrio
            {neighborhoodArticles.length > 0 && (
              <span className="ml-2 normal-case" style={{ color: "var(--accent)" }}>
                — {neighborhoodArticles.length} artículos ubicados
              </span>
            )}
          </p>
        </div>
        {neighborhoodArticles.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm"
            style={{ color: "var(--text-muted)" }}>
            Aún no hay artículos con barrio detectado. Ejecuta{" "}
            <code className="mx-1 px-1 rounded" style={{ backgroundColor: "var(--border)" }}>
              POST /api/reclassify
            </code>{" "}
            para clasificar los artículos existentes.
          </div>
        ) : (
          <MapPanel articles={neighborhoodArticles} />
        )}
      </div>
    </section>
  );
}
