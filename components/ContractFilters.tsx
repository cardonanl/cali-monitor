"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const MODALIDADES = [
  "Licitación Pública",
  "Selección Abreviada de Menor Cuantía",
  "Selección Abreviada Subasta Inversa",
  "Concurso de Méritos",
  "Concurso de Méritos con Lista Corta",
  "Contratación Directa",
  "Mínima Cuantía",
  "Régimen Especial",
];

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--paper)",
  border: "1px solid var(--rule)",
  color: "var(--ink)",
  fontFamily: "var(--font-mono), monospace",
  fontSize: "0.875rem",
  borderRadius: 2,
};

export function ContractFilters() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [desde,      setDesde]      = useState(searchParams.get("desde")      ?? "");
  const [hasta,      setHasta]      = useState(searchParams.get("hasta")      ?? "");
  const [entidad,    setEntidad]    = useState(searchParams.get("entidad")    ?? "");
  const [modalidad,  setModalidad]  = useState(searchParams.get("modalidad")  ?? "");
  const [valorMin,   setValorMin]   = useState(searchParams.get("valorMin")   ?? "");
  const [valorMax,   setValorMax]   = useState(searchParams.get("valorMax")   ?? "");
  const [esPyme,     setEsPyme]     = useState(searchParams.get("esPyme")     === "true");
  const [busqueda,   setBusqueda]   = useState(searchParams.get("busqueda")   ?? "");
  const [contratista,setContratista]= useState(searchParams.get("contratista")?? "");

  function apply() {
    const params = new URLSearchParams();
    if (desde)       params.set("desde",       desde);
    if (hasta)       params.set("hasta",       hasta);
    if (entidad)     params.set("entidad",     entidad);
    if (modalidad)   params.set("modalidad",   modalidad);
    if (valorMin)    params.set("valorMin",    valorMin);
    if (valorMax)    params.set("valorMax",    valorMax);
    if (esPyme)      params.set("esPyme",      "true");
    if (busqueda)    params.set("busqueda",    busqueda);
    if (contratista) params.set("contratista", contratista);
    router.push(`/contratos${params.size ? "?" + params.toString() : ""}`);
  }

  function clear() {
    setDesde(""); setHasta(""); setEntidad(""); setModalidad("");
    setValorMin(""); setValorMax(""); setEsPyme(false); setBusqueda(""); setContratista("");
    router.push("/contratos");
  }

  const hasFilters = desde || hasta || entidad || modalidad || valorMin || valorMax || esPyme || busqueda || contratista;

  return (
    <div className="panel p-5 mx-6 mt-5">
      <div className="panel-title">FILTRAR CONTRATOS</div>
      <div className="flex flex-wrap items-end gap-4">

        <label className="flex flex-col gap-1">
          <span className="label-mono">Desde</span>
          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)}
            className="px-3 py-1.5" style={{ ...inputStyle, colorScheme: "light" }} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="label-mono">Hasta</span>
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)}
            className="px-3 py-1.5" style={{ ...inputStyle, colorScheme: "light" }} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="label-mono">Entidad contratante</span>
          <input type="text" placeholder="Ej: Secretaría de Salud" value={entidad}
            onChange={(e) => setEntidad(e.target.value)}
            className="px-3 py-1.5 w-52" style={inputStyle} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="label-mono">Modalidad</span>
          <select value={modalidad} onChange={(e) => setModalidad(e.target.value)}
            className="px-3 py-1.5 w-56" style={inputStyle}>
            <option value="">Cualquiera</option>
            {MODALIDADES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="label-mono">Contratista</span>
          <input type="text" placeholder="Nombre o NIT (número = exacto)" value={contratista}
            onChange={(e) => setContratista(e.target.value)}
            className="px-3 py-1.5 w-52" style={inputStyle} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="label-mono">Valor mín. (COP)</span>
          <input type="number" placeholder="0" value={valorMin}
            onChange={(e) => setValorMin(e.target.value)}
            className="px-3 py-1.5 w-36" style={inputStyle} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="label-mono">Valor máx. (COP)</span>
          <input type="number" placeholder="∞" value={valorMax}
            onChange={(e) => setValorMax(e.target.value)}
            className="px-3 py-1.5 w-36" style={inputStyle} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="label-mono">Búsqueda libre</span>
          <input type="text" placeholder="Palabras en el objeto del contrato…" value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="px-3 py-1.5 w-64" style={inputStyle} />
        </label>

        <label className="flex items-center gap-2 cursor-pointer pb-1.5">
          <input type="checkbox" checked={esPyme} onChange={(e) => setEsPyme(e.target.checked)}
            className="w-4 h-4" style={{ accentColor: "var(--indigo)" }} />
          <span className="label-mono">Solo PyME</span>
        </label>

        <button onClick={apply} className="text-sm px-5 py-1.5" style={{
          backgroundColor: "var(--indigo)", color: "#ffffff",
          border: "none", borderRadius: 2,
          fontFamily: "var(--font-mono), monospace", letterSpacing: "0.04em",
        }}>
          Aplicar
        </button>

        {hasFilters && (
          <button onClick={clear} className="text-sm px-4 py-1.5" style={{
            backgroundColor: "var(--red-bg)", color: "var(--red-ink)",
            border: "1px solid #8B1A1A30", borderRadius: 2,
            fontFamily: "var(--font-mono), monospace",
          }}>
            Limpiar ×
          </button>
        )}
      </div>
    </div>
  );
}
