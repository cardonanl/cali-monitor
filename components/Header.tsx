import { RefreshController } from "./RefreshController";

export function Header({
  total,
  fetchedAt,
}: {
  total?: number;
  fetchedAt?: string;
}) {
  return (
    <header className="sticky top-0 z-10 px-6 py-2"
      style={{ backgroundColor: "var(--paper)", borderBottom: "1px solid var(--rule)" }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-sm tracking-widest uppercase"
            style={{ color: "var(--ink)", fontFamily: "var(--font-mono)" }}>
            MONITOR CALI
            <span className="hidden sm:inline" style={{ color: "var(--ink-muted)" }}>
              {" "}·{" "}SISTEMA DE MONITOREO MUNICIPAL
            </span>
          </h1>
          <span className="hidden sm:flex items-center gap-1.5 text-xs"
            style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
            <span style={{ color: "var(--indigo)" }}>●</span>
            {" "}EN LÍNEA
          </span>
          {total !== undefined && (
            <span className="text-xs"
              style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
              [{total} REG]
            </span>
          )}
        </div>
        {fetchedAt && <RefreshController fetchedAt={fetchedAt} />}
      </div>
    </header>
  );
}
