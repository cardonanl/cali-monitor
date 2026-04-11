import { DashboardStats, Topic } from "@/lib/types";
import { DayBucket, WordFreq, NeighborhoodArticle } from "@/lib/stats";
import { TOPIC_COLORS_HEX } from "./TopicBadge";
import { WeeklyChart } from "./charts/WeeklyChart";
import { WordCloud } from "./charts/WordCloud";
import { MapPanel } from "./MapPanel";

const BAR_TOTAL = 24;
function asciBar(pct: number): string {
  const filled = Math.round((pct / 100) * BAR_TOTAL);
  return "█".repeat(filled) + "░".repeat(BAR_TOTAL - filled);
}

function KpiBlock({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="terminal-panel p-4 flex flex-col gap-1">
      <span className="text-xs tracking-widest" style={{ color: "var(--yellow)" }}>// {label}</span>
      <span className="text-3xl tabular-nums" style={{ color, lineHeight: 1.1 }}>{value}</span>
    </div>
  );
}

const ROW3_HEIGHT = 560; // px — both panels in row 3 share this height

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
  const topicCount = stats.byTopic24h.length;

  return (
    <section className="w-full px-6 pt-5 pb-2 flex flex-col gap-4">

      {/* ── Site header ── */}
      <div className="flex flex-col gap-1 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <h1 className="text-3xl tracking-wider uppercase" style={{ color: "var(--white)" }}>
          ▶ Monitor de Situación
        </h1>
        <p className="text-base" style={{ color: "var(--yellow)" }}>
          Municipio de Santiago de Cali &nbsp;·&nbsp;{" "}
          <a href="https://github.com/cardonanl/cali-monitor" target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--green)" }} className="hover:underline">
            github.com/cardonanl/cali-monitor
          </a>
        </p>
      </div>

      {/* ── Row 1: KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiBlock label="TOTAL EN BD"     value={stats.total}           color="var(--white)"  />
        <KpiBlock label="ÚLTIMAS 24H"     value={stats.last24h}         color="var(--green)"  />
        <KpiBlock label="FUENTES"         value={stats.bySource.length} color="var(--yellow)" />
        <KpiBlock label="TÓPICOS ACTIVOS" value={stats.byTopic.length}  color="var(--orange)" />
      </div>

      {/* ── Row 2: AI summary | Weekly activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="terminal-panel p-5">
          <div className="panel-title">▶ RESUMEN EJECUTIVO — IA</div>
          <div className="text-base leading-relaxed whitespace-pre-line overflow-auto"
            style={{ color: "var(--white)", maxHeight: 200 }}>
            {dailySummary}
          </div>
        </div>
        <div className="terminal-panel p-5">
          <div className="panel-title">▶ ACTIVIDAD SEMANAL — NOTICIAS POR DÍA</div>
          <WeeklyChart data={weekly} />
        </div>
      </div>

      {/* ── Row 3: Topic bars (1/3) + Map (2/3) — fixed shared height ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Topic distribution — fixed height, bars spread with justify-between */}
        <div className="terminal-panel p-5"
          style={{ height: ROW3_HEIGHT, display: "flex", flexDirection: "column" }}>
          <div className="panel-title">▶ DISTRIBUCIÓN POR TÓPICO — 24H</div>
          {topicCount > 0 ? (
            <div style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}>
              {stats.byTopic24h.map(({ topic, count }) => {
                const color = TOPIC_COLORS_HEX[topic as Topic] ?? "#fff";
                const pct = Math.round((count / maxCount24h) * 100);
                return (
                  <div key={topic} style={{ color }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: "0.88rem" }}>{topic}</span>
                      <span style={{ fontSize: "0.88rem", color: "var(--yellow)" }}>{count}</span>
                    </div>
                    <span style={{ fontSize: "0.72rem", letterSpacing: "-0.02em", color: color + "cc" }}>
                      {asciBar(pct)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-base" style={{ color: "var(--yellow)" }}>&gt; SIN DATOS EN LAS ÚLTIMAS 24H_</p>
          )}
        </div>

        {/* Map — 2 cols, same fixed height */}
        <div className="terminal-panel p-5 lg:col-span-2"
          style={{ height: ROW3_HEIGHT, display: "flex", flexDirection: "column" }}>
          <div className="panel-title">
            ▶ MAPA DE INCIDENCIAS POR BARRIO
            {neighborhoodArticles.length > 0 && (
              <span style={{ color: "var(--green)" }}>
                &nbsp;[{neighborhoodArticles.length} UBICADOS]
              </span>
            )}
          </div>
          {neighborhoodArticles.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p className="text-base" style={{ color: "var(--yellow)" }}>
                &gt; SIN ARTÍCULOS CON BARRIO DETECTADO.
              </p>
            </div>
          ) : (
            <div style={{ flex: 1, minHeight: 0 }}>
              <MapPanel articles={neighborhoodArticles} />
            </div>
          )}
        </div>

      </div>

      {/* ── Row 4: Word cloud ── */}
      <div className="terminal-panel p-5">
        <div className="panel-title">▶ TÉRMINOS MÁS FRECUENTES — ÚLTIMAS 24H</div>
        <WordCloud data={words} />
      </div>

    </section>
  );
}
