"use client";

import { WordFreq } from "@/lib/stats";
import { TOPIC_COLORS_HEX } from "@/components/TopicBadge";

const PALETTE = Object.values(TOPIC_COLORS_HEX) as string[];

export function WordCloud({ data }: { data: WordFreq[] }) {
  if (!data.length) return (
    <p className="text-sm py-8 text-center" style={{ color: "var(--ink-muted)" }}>
      Sin datos — las palabras aparecerán tras el primer ciclo de fetch.
    </p>
  );

  const max = data[0]?.value ?? 1;
  const min = data[data.length - 1]?.value ?? 1;
  const range = max - min || 1;

  return (
    <div className="flex flex-wrap gap-3 items-center justify-center py-4 leading-loose">
      {data.map(({ text, value }, i) => {
        const t = (value - min) / range;        // 0..1
        const size = Math.round(13 + t * 32);   // 13px..45px
        const color = PALETTE[i % PALETTE.length];
        const opacity = 0.45 + t * 0.55;
        return (
          <span
            key={text}
            style={{ fontSize: size, color, opacity, lineHeight: 1.2 }}
            className="cursor-default select-none transition-opacity hover:opacity-100"
            title={`${value} menciones`}
          >
            {text}
          </span>
        );
      })}
    </div>
  );
}
