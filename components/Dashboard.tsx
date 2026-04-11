import { DashboardStats, Topic } from "@/lib/types";
import { DayBucket, WordFreq, NeighborhoodArticle } from "@/lib/stats";
import { TOPIC_COLORS_HEX } from "./TopicBadge";
import { WeeklyChart } from "./charts/WeeklyChart";
import { WordCloud } from "./charts/WordCloud";
import { MapPanel } from "./MapPanel";

/** Fill a string of n chars using █ and ░ */
function asciBar(pct: number, total = 18): string {
  const filled = Math.round((pct / 100) * total);
  return "█".repeat(filled) + "░".repeat(total - filled);
}

function TerminalPanel({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`terminal-panel p-4 ${className ?? ""}`}>
      <div className="terminal-panel-header">▶ {label}</div>
      {children}
    </div>
  );
}

function KpiBlock({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="terminal-panel p-4 flex flex-col gap-1">
      <span className="text-xs tracking-widest" style={{ color: "var(--text-muted)" }}>
        // {label}
      </span>
      <span
        className="text-3xl tabular-nums"
        style={{ color: accent ?? "var(--text-primary)", lineHeight: 1.1 }}
      >
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
    <section className="max-w-7xl mx-auto w-full px-4 pt-5 pb-2 flex flex-col gap-4">

      {/* Site header block */}
      <div className="flex flex-col gap-0.5 border-b pb-3" style={{ borderColor: "var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          // MONITOR DE SITUACIÓN — MUNICIPIO DE SANTIAGO DE CALI
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          // por Nicolas Cardona &nbsp;·&nbsp;{" "}
          <a
            href="https://github.com/cardonanl/cali-monitor"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--amber-dim)" }}
            className="hover:underline"
          >
            github.com/cardonanl/cali-monitor
          </a>
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiBlock label="TOTAL EN BD"     value={stats.total}           accent="#ffb000" />
        <KpiBlock label="ÚLTIMAS 24H"     value={stats.last24h}         accent="#ffd700" />
        <KpiBlock label="FUENTES"         value={stats.bySource.length} accent="#ff8800" />
        <KpiBlock label="TÓPICOS ACTIVOS" value={stats.byTopic.length}  accent="#ffcc44" />
      </div>

      {/* Charts row — 2 cols: topic dist | summary+weekly stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Topic distribution — ASCII bars, full height */}
        <TerminalPanel label="DISTRIBUCIÓN POR TÓPICO — 24H" className="flex flex-col">
          {stats.byTopic24h.length > 0 ? (
            <div className="flex flex-col gap-3">
              {stats.byTopic24h.map(({ topic, count }) => {
                const color = TOPIC_COLORS_HEX[topic as Topic] ?? "#7a5200";
                const pct = Math.round((count / maxCount24h) * 100);
                return (
                  <div key={topic} style={{ color }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm truncate" style={{ maxWidth: "70%" }}>{topic}</span>
                      <span className="text-sm tabular-nums" style={{ color: "var(--text-muted)" }}>{count}</span>
                    </div>
                    <span className="text-xs tracking-tight" style={{ color: color + "bb" }}>
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
        </TerminalPanel>

        {/* Right column: AI summary on top, weekly chart below */}
        <div className="flex flex-col gap-4">

          <TerminalPanel label="RESUMEN IA — HOY">
            <div
              className="text-sm leading-relaxed whitespace-pre-line overflow-auto"
              style={{ color: "var(--text-primary)", maxHeight: 240 }}
            >
              {dailySummary}
            </div>
          </TerminalPanel>

          <TerminalPanel label="ACTIVIDAD SEMANAL">
            <WeeklyChart data={weekly} />
          </TerminalPanel>

        </div>

      </div>

      {/* Word cloud */}
      <TerminalPanel label="TÉRMINOS FRECUENTES — 24H">
        <WordCloud data={words} />
      </TerminalPanel>

      {/* Barrios map */}
      <div className="terminal-panel p-4">
        <div className="terminal-panel-header">
          ▶ MAPA DE INCIDENCIAS POR BARRIO
          {neighborhoodArticles.length > 0 && (
            <span style={{ color: "var(--bg-base)" }}>
              &nbsp;[{neighborhoodArticles.length} UBICADOS]
            </span>
          )}
        </div>
        {neighborhoodArticles.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-sm"
            style={{ color: "var(--text-muted)" }}>
            &gt; SIN ARTÍCULOS CON BARRIO DETECTADO. EJECUTAR{" "}
            <code className="mx-1 px-1" style={{ backgroundColor: "var(--border)", color: "var(--text-primary)" }}>
              POST /api/reclassify
            </code>
          </div>
        ) : (
          <MapPanel articles={neighborhoodArticles} />
        )}
      </div>
    </section>
  );
}
