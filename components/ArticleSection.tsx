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
      <div
        className="mb-4 p-3"
        style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-card)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm tracking-widest" style={{ color: "var(--text-muted)" }}>
            ▶ FILTROS — {filtered.length} RESULTADO{filtered.length !== 1 ? "S" : ""}
          </p>
          {hasFilters && (
            <button
              onClick={() => { setActiveTopic(ALL); setActiveNeighborhood(ALL); }}
              className="text-sm px-2 py-0.5 transition-colors"
              style={{
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              [LIMPIAR ×]
            </button>
          )}
        </div>

        {/* Topic filter */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <FilterPill
            label="TODO"
            active={activeTopic === ALL}
            color="#ffb000"
            onClick={() => setActiveTopic(ALL)}
          />
          {topics.map((topic) => (
            <FilterPill
              key={topic}
              label={topic}
              active={activeTopic === topic}
              color={TOPIC_COLORS_HEX[topic]}
              onClick={() => setActiveTopic(activeTopic === topic ? ALL : topic)}
            />
          ))}
        </div>

        {/* Neighborhood filter */}
        {neighborhoods.length > 0 && (
          <div
            className="flex flex-wrap gap-1.5 pt-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span className="text-xs self-center mr-1" style={{ color: "var(--text-muted)" }}>
              BARRIO:
            </span>
            <FilterPill
              label="TODOS"
              active={activeNeighborhood === ALL}
              color="#7a5200"
              onClick={() => setActiveNeighborhood(ALL)}
            />
            {neighborhoods.map((nbh) => (
              <FilterPill
                key={nbh}
                label={nbh}
                active={activeNeighborhood === nbh}
                color="#ffb000"
                onClick={() => setActiveNeighborhood(activeNeighborhood === nbh ? ALL : nbh)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-xs" style={{ color: "var(--text-muted)" }}>
          &gt; SIN RESULTADOS PARA ESTE FILTRO_
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}

function FilterPill({
  label, active, color, onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-0.5 text-xs transition-all"
      style={{
        backgroundColor: active ? color + "28" : "transparent",
        color: active ? color : "var(--text-muted)",
        border: `1px solid ${active ? color + "88" : "var(--border)"}`,
        letterSpacing: "0.04em",
      }}
    >
      {label}
    </button>
  );
}
