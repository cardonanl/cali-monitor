import { RefreshController } from "./RefreshController";

export function Header({
  total,
  fetchedAt,
}: {
  total: number;
  fetchedAt: string;
}) {
  return (
    <header
      className="sticky top-0 z-10 px-4 py-2"
      style={{
        backgroundColor: "#0a0700",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs tracking-widest" style={{ color: "var(--amber-dim)" }}>
            ▶
          </span>
          <div>
            <h1 className="text-xs font-normal tracking-widest uppercase" style={{ color: "var(--text-primary)" }}>
              SISTEMA DE MONITOREO MUNICIPAL
              <span className="hidden sm:inline" style={{ color: "var(--text-muted)" }}>
                {" "}::{" "}CALI, COL.
              </span>
            </h1>
          </div>
          <span
            className="hidden sm:flex items-center gap-1.5 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <span
              className="cursor-blink"
              style={{ color: "#22ff55" }}
            >
              ●
            </span>
            {" "}EN LÍNEA
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            [{total} REG]
          </span>
        </div>
        <RefreshController fetchedAt={fetchedAt} />
      </div>
    </header>
  );
}
