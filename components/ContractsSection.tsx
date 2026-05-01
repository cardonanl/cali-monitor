"use client";

import { useState, useMemo } from "react";
import { Contract, formatCOP } from "@/lib/contracts";
import { ContractCard } from "./ContractCard";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const ALL = "Todos";
type View = "grid" | "table";

function estadoBadgeStyle(estado: string): { bg: string; text: string } {
  const key = estado.toLowerCase();
  if (key.includes("activo") || key.includes("ejecuci"))
    return { bg: "var(--green-bg)", text: "var(--green-ink)" };
  if (key.includes("suspendido"))
    return { bg: "var(--red-bg)", text: "var(--red-ink)" };
  if (key.includes("terminado") || key.includes("cerrado") || key.includes("liquidado"))
    return { bg: "var(--amber-bg)", text: "var(--amber-ink)" };
  return { bg: "var(--paper-soft)", text: "var(--ink-muted)" };
}

export function ContractsSection({ contracts }: { contracts: Contract[] }) {
  const [activeEstado, setActiveEstado] = useState<string>(ALL);
  const [activeTipo,   setActiveTipo]   = useState<string>(ALL);
  const [view,         setView]         = useState<View>("grid");

  const estados = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of contracts) counts.set(c.estado, (counts.get(c.estado) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([e]) => e);
  }, [contracts]);

  const tipos = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of contracts) counts.set(c.tipo, (counts.get(c.tipo) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [contracts]);

  const filtered = useMemo(() =>
    contracts.filter((c) => {
      const okEstado = activeEstado === ALL || c.estado === activeEstado;
      const okTipo   = activeTipo   === ALL || c.tipo   === activeTipo;
      return okEstado && okTipo;
    }),
    [contracts, activeEstado, activeTipo]
  );

  const hasFilters = activeEstado !== ALL || activeTipo !== ALL;

  return (
    <section className="flex-1 w-full px-6 py-4">

      {/* Filter bar */}
      <div className="mb-4 p-5 panel">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
            Contratos{" "}
            <span style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
              — {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === "grid" ? "table" : "grid")}
              className="text-xs px-3 py-1.5 transition-colors"
              style={{
                color: "var(--indigo)",
                backgroundColor: "var(--indigo-bg)",
                border: "1px solid #3333FF40",
                borderRadius: 2,
                fontFamily: "var(--font-mono)",
              }}
            >
              {view === "grid" ? "Vista tabla" : "Vista módulos"}
            </button>
            {hasFilters && (
              <button
                onClick={() => { setActiveEstado(ALL); setActiveTipo(ALL); }}
                className="text-xs px-3 py-1.5"
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
        </div>

        {/* Estado pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Pill label="Todos" active={activeEstado === ALL} onClick={() => setActiveEstado(ALL)} />
          {estados.map((e) => (
            <Pill key={e} label={e} active={activeEstado === e}
              onClick={() => setActiveEstado(activeEstado === e ? ALL : e)} />
          ))}
        </div>

        {/* Tipo pills */}
        {tipos.length > 1 && (
          <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: "1px solid var(--rule)" }}>
            <span className="text-xs self-center mr-2 label-mono">Tipo:</span>
            <Pill label="Todos" active={activeTipo === ALL} onClick={() => setActiveTipo(ALL)} />
            {tipos.map((t) => (
              <Pill key={t} label={t} active={activeTipo === t}
                onClick={() => setActiveTipo(activeTipo === t ? ALL : t)} />
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-sm" style={{ color: "var(--ink-muted)" }}>
          Sin resultados para este filtro.
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => <ContractCard key={c.id} contract={c} />)}
        </div>
      ) : (
        <TableView contracts={filtered} />
      )}
    </section>
  );
}

function TableView({ contracts }: { contracts: Contract[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        fontSize: "0.82rem",
      }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--rule)" }}>
            {["Estado", "Entidad", "Objeto", "Tipo", "Valor", "Firma"].map((h) => (
              <th key={h} style={{
                textAlign: "left",
                padding: "6px 10px",
                color: "var(--ink-muted)",
                letterSpacing: "0.08em",
                fontFamily: "var(--font-mono), monospace",
                fontSize: "0.68rem",
                textTransform: "uppercase",
                fontWeight: "normal",
                whiteSpace: "nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contracts.map((c, i) => {
            const badge = estadoBadgeStyle(c.estado);
            const timeAgo = c.fechaFirma
              ? formatDistanceToNow(new Date(c.fechaFirma), { addSuffix: true, locale: es })
              : "—";
            return (
              <tr key={c.id}
                style={{ borderBottom: "1px solid var(--rule)", backgroundColor: i % 2 === 0 ? "transparent" : "var(--paper-soft)" }}>
                <td style={{ padding: "8px 10px", whiteSpace: "nowrap" }}>
                  <span style={{
                    backgroundColor: badge.bg,
                    color: badge.text,
                    padding: "2px 6px",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    borderRadius: 2,
                  }}>
                    {c.estado}
                  </span>
                </td>
                <td style={{ padding: "8px 10px", color: "var(--ink-soft)", maxWidth: 180 }}>
                  <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.entidad}
                  </span>
                </td>
                <td style={{ padding: "8px 10px", color: "var(--ink)", maxWidth: 260 }}>
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer"
                      style={{ color: "var(--ink)", textDecoration: "none" }}
                      className="hover:underline">
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.objeto}
                      </span>
                    </a>
                  ) : (
                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.objeto}
                    </span>
                  )}
                </td>
                <td style={{ padding: "8px 10px", color: "var(--ink-muted)", whiteSpace: "nowrap" }}>
                  {c.tipo}
                </td>
                <td style={{ padding: "8px 10px", color: "var(--ink)", whiteSpace: "nowrap", fontWeight: 500, fontFamily: "var(--font-mono)" }}>
                  {c.valor === 0 ? <em style={{ color: "var(--ink-muted)", fontWeight: 400 }}>—</em> : formatCOP(c.valor)}
                </td>
                <td style={{ padding: "8px 10px", color: "var(--ink-muted)", whiteSpace: "nowrap", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                  {timeAgo}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Pill({ label, active, onClick }: {
  label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="px-3 py-1 text-sm transition-all"
      style={{
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        borderRadius: 2,
        color: active ? "var(--indigo)" : "var(--ink-muted)",
        backgroundColor: active ? "var(--indigo-bg)" : "transparent",
        border: `1px solid ${active ? "#3333FF40" : "var(--rule)"}`,
      }}>
      {label}
    </button>
  );
}
