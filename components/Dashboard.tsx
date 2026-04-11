import { DashboardStats, Topic } from "@/lib/types";
import { DayBucket, WordFreq, NeighborhoodArticle } from "@/lib/stats";
import { TOPIC_COLORS_HEX } from "./TopicBadge";
import { WeeklyChart } from "./charts/WeeklyChart";
import { WordCloud } from "./charts/WordCloud";
import { MapPanel } from "./MapPanel";

function asciBar(pct: number, total = 26): string {
  const filled = Math.round((pct / 100) * total);
  return "█".repeat(filled) + "░".repeat(total - filled);
}

function KpiBlock({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="terminal-panel p-4 flex flex-col gap-1">
      <span className="text-xs tracking-widest" style={{ color: "var(--text-muted)" }}>
        // {label}
      </span>
      <span className="text-3xl tabular-nums" style={{ color: accent ?? "var(--accent-bright)", lineHeight: 1.1 }}>
        {value}
      </span>
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
    <section className="w-full px-6 pt-5 pb-2 flex flex-col gap-4">

      {/* Site header */}
      <div className="flex flex-col gap-1 border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <h1 className="text-2xl tracking-widest uppercase" style={{ color: "var(--flag-white)" }}>
          ▶ Monitor de Situación
          <span className="hidden sm:inline" style={{ color: "var(--text-muted)" }}>
            {" "}— Municipio de Santiago de Cali
          </span>
        </h1>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          por Nicolas Cardona &nbsp;·&nbsp;{" "}
          <a href="https://github.com/cardonanl/cali-monitor" target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--accent-bright)" }} className="hover:underline">
            github.com/cardonanl/cali-monitor
          </a>
        </p>
      </div>

      {/* ── Row 1: KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiBlock label="TOTAL EN BD"      value={stats.total}           accent="var(--flag-white)" />
        <KpiBlock label="ÚLTIMAS 24H"      value={stats.last24h}         accent="var(--flag-green)" />
        <KpiBlock label="FUENTES"          value={stats.bySource.length} accent="var(--accent-bright)" />
        <KpiBlock label="TÓPICOS ACTIVOS"  value={stats.byTopic.length}  accent="var(--flag-red)" />
      </div>

      {/* ── Row 2: AI summary | Weekly activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="terminal-panel p-5">
          <div className="panel-title">▶ RESUMEN EJECUTIVO — IA</div>
          <div
            className="text-sm leading-relaxed whitespace-pre-line overflow-auto"
            style={{ color: "var(--text-primary)", maxHeight: 200 }}
          >
            {dailySummary}
          </div>
        </div>

        <div className="terminal-panel p-5">
          <div className="panel-title">▶ ACTIVIDAD SEMANAL — NOTICIAS POR DÍA</div>
          <WeeklyChart data={weekly} />
        </div>

      </div>

      {/* ── Row 3: Topic distribution (1/3) + Map (2/3) — both fill same height ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">

        {/* Topic distribution — justify-between to fill full panel height */}
        <div className="terminal-panel p-5 flex flex-col">
          <div className="panel-title">▶ DISTRIBUCIÓN POR TÓPICO — 24H</div>
          {stats.byTopic24h.length > 0 ? (
            <div className="flex-1 flex flex-col justify-between">
              {stats.byTopic24h.map(({ topic, count }) => {
                const color = TOPIC_COLORS_HEX[topic as Topic] ?? "var(--text-muted)";
                const pct = Math.round((count / maxCount24h) * 100);
                return (
                  <div key={topic} style={{ color }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm">{topic}</span>
                      <span className="text-sm tabular-nums" style={{ color: "var(--text-muted)" }}>{count}</span>
                    </div>
                    <span style={{ fontSize: "0.75rem", letterSpacing: "-0.02em", color: color + "bb" }}>
                      {asciBar(pct)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              &gt; SIN DATOS EN LAS ÚLTIMAS 24H_
            </p>
          )}
        </div>

        {/* Map — 2/3, flex col so map div fills remaining height */}
        <div className="terminal-panel p-5 lg:col-span-2 flex flex-col">
          <div className="panel-title">
            ▶ MAPA DE INCIDENCIAS POR BARRIO
            {neighborhoodArticles.length > 0 && (
              <span style={{ color: "var(--flag-green)" }}>
                [{neighborhoodArticles.length} UBICADOS]
              </span>
            )}
          </div>
          {neighborhoodArticles.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-sm"
              style={{ color: "var(--text-muted)", minHeight: "400px" }}>
              &gt; SIN ARTÍCULOS CON BARRIO DETECTADO. EJECUTAR{" "}
              <code className="mx-1 px-1" style={{ backgroundColor: "var(--border)", color: "var(--text-primary)" }}>
                POST /api/reclassify
              </code>
            </div>
          ) : (
            <div className="flex-1" style={{ minHeight: "450px" }}>
              <MapPanel articles={neighborhoodArticles} />
            </div>
          )}
        </div>

      </div>

      {/* ── Row 4: Word cloud — full width ── */}
      <div className="terminal-panel p-5">
        <div className="panel-title">▶ TÉRMINOS MÁS FRECUENTES — ÚLTIMAS 24H</div>
        <WordCloud data={words} />
      </div>

    </section>
  );
}
