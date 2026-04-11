"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL = 30 * 60;

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function RefreshController({ fetchedAt }: { fetchedAt: string }) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(REFRESH_INTERVAL);
  const [isPending, startTransition] = useTransition();

  const doRefresh = useCallback(() => {
    startTransition(() => { router.refresh(); });
    setRemaining(REFRESH_INTERVAL);
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { doRefresh(); return REFRESH_INTERVAL; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [doRefresh]);

  const timeStr = new Date(fetchedAt).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
      <span className="hidden sm:inline">ULT. ACT. {timeStr}</span>
      <span style={{ color: isPending ? "var(--flag-green)" : "var(--text-muted)" }}>
        {isPending ? "ACTUALIZANDO..." : `T-${formatCountdown(remaining)}`}
      </span>
      <button
        onClick={doRefresh}
        disabled={isPending}
        className="text-sm px-3 py-1 disabled:opacity-40 transition-all"
        style={{
          color: "#ffffff",
          backgroundColor: "var(--flag-blue)",
          border: "1px solid var(--accent-bright)",
          fontFamily: "inherit",
          letterSpacing: "0.05em",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-bright)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--flag-blue)")}
      >
        {isPending ? "..." : "[ACTUALIZAR]"}
      </button>
    </div>
  );
}
