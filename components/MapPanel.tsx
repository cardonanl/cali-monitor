"use client";

import dynamic from "next/dynamic";
import type { NeighborhoodArticle } from "@/lib/stats";

const BarriosMap = dynamic(
  () => import("./BarriosMap").then((m) => m.BarriosMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center text-base"
        style={{ color: "var(--yellow)", height: "100%", minHeight: "450px" }}>
        Cargando mapa…
      </div>
    ),
  }
);

export function MapPanel({ articles }: { articles: NeighborhoodArticle[] }) {
  return <BarriosMap articles={articles} />;
}
