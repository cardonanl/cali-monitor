"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function ContractFilters() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [desde, setDesde] = useState(searchParams.get("desde") ?? "");
  const [hasta, setHasta] = useState(searchParams.get("hasta") ?? "");

  function apply() {
    const params = new URLSearchParams();
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    router.push(`/contratos${params.size ? "?" + params.toString() : ""}`);
  }

  function clear() {
    setDesde("");
    setHasta("");
    router.push("/contratos");
  }

  const hasFilters = desde || hasta;

  return (
    <div className="panel p-5 mx-6 mt-5">
      <div className="panel-title">FILTRAR POR FECHA DE FIRMA</div>
      <div className="flex flex-wrap items-end gap-4">

        <label className="flex flex-col gap-1">
          <span className="label-mono">Desde</span>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="text-sm px-3 py-1.5"
            style={{
              backgroundColor: "var(--paper)",
              border: "1px solid var(--rule)",
              color: "var(--ink)",
              fontFamily: "var(--font-mono), monospace",
              borderRadius: 2,
              colorScheme: "light",
            }}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="label-mono">Hasta</span>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="text-sm px-3 py-1.5"
            style={{
              backgroundColor: "var(--paper)",
              border: "1px solid var(--rule)",
              color: "var(--ink)",
              fontFamily: "var(--font-mono), monospace",
              borderRadius: 2,
              colorScheme: "light",
            }}
          />
        </label>

        <button
          onClick={apply}
          className="text-sm px-5 py-1.5"
          style={{
            backgroundColor: "var(--indigo)",
            color: "#ffffff",
            border: "none",
            borderRadius: 2,
            fontFamily: "var(--font-mono), monospace",
            letterSpacing: "0.04em",
          }}
        >
          Aplicar
        </button>

        {hasFilters && (
          <button
            onClick={clear}
            className="text-sm px-4 py-1.5"
            style={{
              backgroundColor: "var(--red-bg)",
              color: "var(--red-ink)",
              border: "1px solid #8B1A1A30",
              borderRadius: 2,
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            Limpiar ×
          </button>
        )}
      </div>
    </div>
  );
}
