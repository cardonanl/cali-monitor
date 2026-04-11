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
        className="mb-4 p-4"
        style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-card)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-base tracking-wider font-medium" style={{ color: "var(--text-primary)" }}>
            ▶ FILTROS{" "}
            <span style={{ color: "var(--text-muted)" }}>
              — {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          </p>
          {hasFilters && (
            <button
              onClick={() => { setActiveTopic(ALL); setActiveNeighborhood(ALL); }}
              className="text-sm px-3 py-1 transition-colors"
              style={{
                color: "var(--flag-red)",
                border: "1px solid var(--flag-red)88",
                backgroundColor: "var(--flag-red)15",
              }}
            >
              [LIMPIAR ×]
            </button>
          )}
        </div>

        {/* Topic filter */}
        <div className="flex flex-wrap gap-2 mb-3">
          <FilterPill
            label="TODOS"
            active={activeTopic === ALL}
            color="var(--accent-bright)"
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
            className="flex flex-wrap gap-2 pt-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span className="text-sm self-center mr-1" style={{ color: "var(--text-muted)" }}>
              BARRIO:
            </span>
            <FilterPill
              label="TODOS"
              active={activeNeighborhood === ALL}
              color="var(--text-muted)"
              onClick={() => setActiveNeighborhood(ALL)}
            />
            {neighborhoods.map((nbh) => (
              <FilterPill
                key={nbh}
                label={nbh}
                active={activeNeighborhood === nbh}
                color="var(--flag-green)"
                onClick={() => setActiveNeighborhood(activeNeighborhood === nbh ? ALL : nbh)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-base" style={{ color: "var(--text-muted)" }}>
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
  const isVar = color.startsWith("var(");
  const bg = active ? (isVar ? color : color + "28") : "transparent";
  const border = active ? (isVar ? color : color + "99") : "var(--border)";
  const textColor = active ? (isVar ? "#ffffff" : color) : "var(--text-muted)";

  return (
    <button
      onClick={onClick}
      className="px-3 py-1 text-sm transition-all"
      style={{
        backgroundColor: bg,
        color: textColor,
        border: `1px solid ${border}`,
        letterSpacing: "0.03em",
      }}
    >
      {label}
    </button>
  );
}
