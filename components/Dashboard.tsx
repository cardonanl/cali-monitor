import { DashboardStats, Topic } from "@/lib/types";
import { DayBucket, WordFreq, NeighborhoodArticle } from "@/lib/stats";
import { TOPIC_COLORS_HEX } from "./TopicBadge";
import { WeeklyChart } from "./charts/WeeklyChart";
import { WordCloud } from "./charts/WordCloud";
import { MapPanel } from "./MapPanel";
import { NavTabs } from "./NavTabs";

function KpiBlock({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="panel p-4 flex flex-col gap-1">
      <span className="label-mono">{label}</span>
      <span className="text-3xl tabular-nums" style={{ color, lineHeight: 1.1, fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
  );
}

const ROW3_HEIGHT = 560;

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
      <div className="pb-4" style={{ borderBottom: "1px solid var(--rule)" }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl" style={{
            color: "var(--ink)",
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontWeight: 600,
          }}>
            Monitor de Situación
          </h1>
          <NavTabs active="noticias" />
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          Municipio de Santiago de Cali &nbsp;·&nbsp;{" "}
          <a href="https://github.com/cardonanl/cali-monitor" target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--indigo)" }} className="hover:underline">
            github.com/cardonanl/cali-monitor
          </a>
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
          por Nicolás Cardona
        </p>
      </div>

      {/* ── Row 1: KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiBlock label="TOTAL EN BD"     value={stats.total}           color="var(--ink)"      />
        <KpiBlock label="ÚLTIMAS 24H"     value={stats.last24h}         color="var(--indigo)"   />
        <KpiBlock label="FUENTES"         value={stats.bySource.length} color="var(--ink-soft)" />
        <KpiBlock label="TÓPICOS ACTIVOS" value={stats.byTopic.length}  color="var(--ink-soft)" />
      </div>

      {/* ── Row 2: AI summary | Weekly activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel p-5">
          <div className="panel-title">RESUMEN EJECUTIVO — IA</div>
          <div className="text-sm leading-relaxed whitespace-pre-line overflow-auto"
            style={{ color: "var(--ink-soft)", maxHeight: 200 }}>
            {dailySummary}
          </div>
        </div>
        <div className="panel p-5">
          <div className="panel-title">ACTIVIDAD SEMANAL — NOTICIAS POR DÍA</div>
          <WeeklyChart data={weekly} />
        </div>
      </div>

      {/* ── Row 3: Topic bars (1/3) + Map (2/3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="panel p-5"
          style={{ height: ROW3_HEIGHT, display: "flex", flexDirection: "column" }}>
          <div className="panel-title">DISTRIBUCIÓN POR TÓPICO — 24H</div>
          {topicCount > 0 ? (
            <div style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}>
              {stats.byTopic24h.map(({ topic, count }) => {
                const color = TOPIC_COLORS_HEX[topic as Topic] ?? "#6f6f6f";
                const pct = Math.round((count / maxCount24h) * 100);
                return (
                  <div key={topic}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontSize: "0.78rem", color,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                      }}>{topic}</span>
                      <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>{count}</span>
                    </div>
                    <div style={{ height: 3, backgroundColor: "var(--rule)" }}>
                      <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color, opacity: 0.7 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Sin datos en las últimas 24h</p>
          )}
        </div>

        {/* Map — 2 cols */}
        <div className="panel p-5 lg:col-span-2"
          style={{ height: ROW3_HEIGHT, display: "flex", flexDirection: "column" }}>
          <div className="panel-title">
            MAPA DE INCIDENCIAS POR BARRIO
            {neighborhoodArticles.length > 0 && (
              <span style={{ color: "var(--indigo)" }}>
                &nbsp;[{neighborhoodArticles.length} ubicados]
              </span>
            )}
          </div>
          {neighborhoodArticles.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                Sin artículos con barrio detectado.
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
      <div className="panel p-5">
        <div className="panel-title">TÉRMINOS MÁS FRECUENTES — ÚLTIMAS 24H</div>
        <WordCloud data={words} />
      </div>

    </section>
  );
}
