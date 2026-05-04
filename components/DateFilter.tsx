"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  desde: string;
  hasta: string;
  isDefault: boolean;
}

export function DateFilter({ desde, hasta, isDefault }: Props) {
  const router = useRouter();
  const [d, setD] = useState(desde);
  const [h, setH] = useState(hasta);
  const today = new Date().toISOString().slice(0, 10);

  function apply() {
    router.push(`/?desde=${d}&hasta=${h}`);
  }

  function reset() {
    router.push("/");
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.78rem",
    padding: "4px 8px",
    backgroundColor: "var(--paper-soft)",
    border: "1px solid var(--rule)",
    borderRadius: 2,
    color: "var(--ink)",
    outline: "none",
  };

  const btnPrimary: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.72rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "4px 14px",
    backgroundColor: "var(--indigo)",
    color: "#ffffff",
    border: "none",
    borderRadius: 2,
    cursor: "pointer",
  };

  const btnSecondary: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.72rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "4px 14px",
    backgroundColor: "transparent",
    color: "var(--ink-muted)",
    border: "1px solid var(--rule)",
    borderRadius: 2,
    cursor: "pointer",
  };

  return (
    <div className="px-6 py-3" style={{
      borderBottom: "1px solid var(--rule)",
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    }}>
      <span className="label-mono" style={{ color: "var(--ink-muted)" }}>PERÍODO</span>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="date"
          value={d}
          max={today}
          onChange={(e) => setD(e.target.value)}
          style={inputStyle}
        />
        <span style={{ color: "var(--ink-muted)", fontSize: "0.85rem" }}>→</span>
        <input
          type="date"
          value={h}
          max={today}
          onChange={(e) => setH(e.target.value)}
          style={inputStyle}
        />
      </div>

      <button onClick={apply} style={btnPrimary}>Aplicar</button>

      {!isDefault && (
        <button onClick={reset} style={btnSecondary}>
          Últimos 7 días ×
        </button>
      )}
    </div>
  );
}
