import { Contract, formatCOP } from "@/lib/contracts";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const ACRONYMS = new Set([
  "DANE", "SENA", "ICBF", "DNP", "DIAN", "INVIAS",
  "ANI", "DAGMA", "DAGRD", "IDESC", "SDS", "EMCALI",
  "EMSIRVA", "METROCALI", "IMCC", "RDA",
]);

function toTitleCase(str: string): string {
  if (!str || str === "—") return str;
  return str.toLowerCase().replace(/\b\w+/g, (word) => {
    const upper = word.toUpperCase();
    return ACRONYMS.has(upper) ? upper : word.charAt(0).toUpperCase() + word.slice(1);
  });
}

function formatDuracion(dur: string): string {
  if (!dur || dur === "—") return dur;
  return dur
    .replace(/(\d+)\s*Dia\(s\)/i, "$1 días")
    .replace(/(\d+)\s*Mes\(es\)/i, "$1 meses")
    .replace(/(\d+)\s*A[ñn]o\(s\)/i, "$1 años");
}

function estadoBadge(estado: string): { bg: string; text: string } {
  const key = estado.toLowerCase();
  if (key.includes("activo") || key.includes("ejecuci"))
    return { bg: "var(--green-bg)", text: "var(--green-ink)" };
  if (key.includes("suspendido"))
    return { bg: "var(--red-bg)", text: "var(--red-ink)" };
  if (key.includes("terminado") || key.includes("cerrado") || key.includes("liquidado"))
    return { bg: "var(--amber-bg)", text: "var(--amber-ink)" };
  return { bg: "var(--paper-soft)", text: "var(--ink-muted)" };
}

export function ContractCard({ contract: c }: { contract: Contract }) {
  const badge = estadoBadge(c.estado);
  const timeAgo = c.fechaFirma
    ? formatDistanceToNow(new Date(c.fechaFirma), { addSuffix: true, locale: es })
    : "";
  const durStr = formatDuracion(c.duracion);
  const hasObjeto = c.objeto && c.objeto !== "—";
  const hasEntidad = c.entidad && c.entidad !== "—";
  const hasProveedor = c.proveedor && c.proveedor !== "—";

  return (
    <article className="article-card p-4 flex flex-col gap-3">

      {/* Row 1: badges + valor */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-block px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: badge.bg, color: badge.text, borderRadius: 2 }}>
            {c.estado}
          </span>
          <span className="inline-block px-2 py-0.5 text-xs"
            style={{ color: "var(--ink-muted)", border: "1px solid var(--rule)", borderRadius: 2 }}>
            {c.tipo}
          </span>
          {c.esPyme && (
            <span className="inline-block px-2 py-0.5 text-xs"
              style={{ backgroundColor: "var(--green-bg)", color: "var(--green-ink)", borderRadius: 2 }}>
              PyME
            </span>
          )}
        </div>
        {c.valor === 0 ? (
          <em className="text-xs" style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
            Sin valor publicado
          </em>
        ) : (
          <span className="text-sm font-semibold tabular-nums"
            style={{ color: "var(--ink)", fontFamily: "var(--font-mono)" }}>
            {formatCOP(c.valor)}
          </span>
        )}
      </div>

      {/* Row 2: objeto */}
      {hasObjeto ? (
        <h2 className="text-base leading-snug line-clamp-2" style={{ fontWeight: 500, color: "var(--ink)" }}>
          {toTitleCase(c.objeto)}
        </h2>
      ) : (
        <em className="text-base" style={{ color: "var(--ink-muted)", fontWeight: 400 }}>
          Objeto no definido
        </em>
      )}

      {/* Row 3: entidad + contratista */}
      <div className="flex flex-col gap-0.5">
        {hasEntidad && (
          <p className="text-sm line-clamp-1" style={{ color: "var(--ink-soft)" }}>
            {toTitleCase(c.entidad)}
          </p>
        )}
        {hasProveedor && (
          <p className="text-sm line-clamp-1" style={{ color: "var(--ink-muted)" }}>
            {toTitleCase(c.proveedor)}
          </p>
        )}
      </div>

      {/* Row 4: duración + link */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs" style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
          {durStr !== "—" ? durStr : timeAgo}
        </span>
        {c.url && (
          <a href={c.url} target="_blank" rel="noopener noreferrer"
            className="text-xs hover:underline"
            style={{ color: "var(--indigo)" }}>
            Ver en SECOP ↗
          </a>
        )}
      </div>

    </article>
  );
}
