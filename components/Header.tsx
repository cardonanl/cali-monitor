import { RefreshController } from "./RefreshController";

export function Header({ total, fetchedAt }: { total: number; fetchedAt: string }) {
  return (
    <header className="sticky top-0 z-10 px-6 py-2"
      style={{ backgroundColor: "#080808", borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span style={{ color: "var(--yellow)" }}>▶</span>
          <h1 className="text-sm tracking-widest uppercase" style={{ color: "var(--white)" }}>
            MONITOR CALI
            <span className="hidden sm:inline" style={{ color: "var(--yellow)" }}>
              {" "}::{" "}SISTEMA DE MONITOREO MUNICIPAL
            </span>
          </h1>
          <span className="hidden sm:flex items-center gap-1.5 text-xs" style={{ color: "var(--yellow)" }}>
            <span className="cursor-blink" style={{ color: "var(--green)" }}>●</span>
            {" "}EN LÍNEA
          </span>
          <span className="text-xs" style={{ color: "var(--yellow)" }}>
            [{total} REG]
          </span>
        </div>
        <RefreshController fetchedAt={fetchedAt} />
      </div>
    </header>
  );
}
