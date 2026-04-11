"use client";

import { useState, useMemo } from "react";
import { Article, Topic } from "@/lib/types";
import { TOPIC_COLORS_HEX } from "./TopicBadge";
import { ArticleCard } from "./ArticleCard";

const ALL = "Todas";

export function ArticleSection({ articles }: { articles: Article[] }) {
  const [activeTopic, setActiveTopic] = useState<Topic | typeof ALL>(ALL);
  const [activeNeighborhood, setActiveNeighborhood] = useState<string | typeof ALL>(ALL);

  const topics = useMemo(() => {
    const counts = new Map<Topic, number>();
    for (const a of articles) {
      if (a.topic) counts.set(a.topic, (counts.get(a.topic) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [articles]);

  const neighborhoods = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of articles) {
      if (a.neighborhood) counts.set(a.neighborhood, (counts.get(a.neighborhood) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n);
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const topicOk = activeTopic === ALL || a.topic === activeTopic;
      const nbhOk = activeNeighborhood === ALL || a.neighborhood === activeNeighborhood;
      return topicOk && nbhOk;
    });
  }, [articles, activeTopic, activeNeighborhood]);

  const hasFilters = activeTopic !== ALL || activeNeighborhood !== ALL;

  return (
    <section className="flex-1 w-full px-6 py-4">

      {/* Filter bar */}
      <div className="mb-4 p-5 terminal-panel">
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg tracking-wider" style={{ color: "var(--white)" }}>
            ▶ FILTROS{" "}
            <span style={{ color: "var(--yellow)" }}>
              — {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          </p>
          {hasFilters && (
            <button
              onClick={() => { setActiveTopic(ALL); setActiveNeighborhood(ALL); }}
              className="text-base px-4 py-1.5 font-bold transition-colors"
              style={{ color: "#000", backgroundColor: "var(--red)", border: "none", fontFamily: "inherit" }}
            >
              [LIMPIAR ×]
            </button>
          )}
        </div>

        {/* Topic pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Pill label="TODOS" active={activeTopic === ALL} color="#ffffff"
            onClick={() => setActiveTopic(ALL)} />
          {topics.map((t) => (
            <Pill key={t} label={t} active={activeTopic === t} color={TOPIC_COLORS_HEX[t]}
              onClick={() => setActiveTopic(activeTopic === t ? ALL : t)} />
          ))}
        </div>

        {/* Neighborhood pills */}
        {neighborhoods.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
            <span className="text-base self-center mr-2" style={{ color: "var(--yellow)" }}>BARRIO:</span>
            <Pill label="TODOS" active={activeNeighborhood === ALL} color="#aaaaaa"
              onClick={() => setActiveNeighborhood(ALL)} />
            {neighborhoods.map((n) => (
              <Pill key={n} label={n} active={activeNeighborhood === n} color="var(--green)"
                onClick={() => setActiveNeighborhood(activeNeighborhood === n ? ALL : n)} />
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-lg" style={{ color: "var(--yellow)" }}>
          &gt; SIN RESULTADOS PARA ESTE FILTRO_
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}
    </section>
  );
}

function Pill({ label, active, color, onClick }: {
  label: string; active: boolean; color: string; onClick: () => void;
}) {
  const isVar = color.startsWith("var(");
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-base transition-all"
      style={{
        color: active ? "#000000" : (isVar ? color : color),
        backgroundColor: active ? color : "transparent",
        border: `2px solid ${color}`,
        fontFamily: "inherit",
        letterSpacing: "0.03em",
        fontWeight: active ? "bold" : "normal",
        opacity: active ? 1 : 0.75,
      }}
    >
      {label}
    </button>
  );
}
