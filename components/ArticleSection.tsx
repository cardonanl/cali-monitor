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
      <div className="mb-4 p-5 panel">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
            Filtros{" "}
            <span style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
              — {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          </p>
          {hasFilters && (
            <button
              onClick={() => { setActiveTopic(ALL); setActiveNeighborhood(ALL); }}
              className="text-xs px-3 py-1.5 transition-colors"
              style={{
                color: "var(--red-ink)",
                backgroundColor: "var(--red-bg)",
                border: "1px solid #8B1A1A30",
                borderRadius: 2,
                fontFamily: "var(--font-mono)",
              }}
            >
              Limpiar ×
            </button>
          )}
        </div>

        {/* Topic pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Pill label="Todos" active={activeTopic === ALL} color="default"
            onClick={() => setActiveTopic(ALL)} />
          {topics.map((t) => (
            <Pill key={t} label={t} active={activeTopic === t} color={TOPIC_COLORS_HEX[t]}
              onClick={() => setActiveTopic(activeTopic === t ? ALL : t)} />
          ))}
        </div>

        {/* Neighborhood pills */}
        {neighborhoods.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: "1px solid var(--rule)" }}>
            <span className="text-xs self-center mr-2 label-mono">Barrio:</span>
            <Pill label="Todos" active={activeNeighborhood === ALL} color="default"
              onClick={() => setActiveNeighborhood(ALL)} />
            {neighborhoods.map((n) => (
              <Pill key={n} label={n} active={activeNeighborhood === n} color="green"
                onClick={() => setActiveNeighborhood(activeNeighborhood === n ? ALL : n)} />
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-sm" style={{ color: "var(--ink-muted)" }}>
          Sin resultados para este filtro.
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
  const isDefault = color === "default";
  const isGreen = color === "green";
  const activeColor = isDefault || isGreen ? "var(--indigo)" : color;
  const activeBg = isDefault || isGreen ? "var(--indigo-bg)" : color + "18";
  const activeBorder = isDefault || isGreen ? "var(--indigo)" : color + "60";

  return (
    <button
      onClick={onClick}
      className="px-3 py-1 text-sm transition-all"
      style={{
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        borderRadius: 2,
        color: active ? activeColor : "var(--ink-muted)",
        backgroundColor: active ? activeBg : "transparent",
        border: `1px solid ${active ? activeBorder : "var(--rule)"}`,
      }}
    >
      {label}
    </button>
  );
}
