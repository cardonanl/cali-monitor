import { ContractStats, formatCOP } from "@/lib/contracts";

function KpiBlock({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="panel p-4 flex flex-col gap-1">
      <span className="label-mono">{label}</span>
      <span className="text-3xl tabular-nums" style={{ color, lineHeight: 1.1, fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
  );
}

function DistribPanel({ title, rows, color }: {
  title: string;
  rows: { label: string; count: number }[];
  color: string;
}) {
  const max = rows[0]?.count ?? 1;
  return (
    <div className="panel p-5">
      <div className="panel-title">{title}</div>
      <div className="flex flex-col gap-3">
        {rows.map(({ label, count }) => {
          const pct = Math.round((count / max) * 100);
          return (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: "0.8rem", color: "var(--ink-soft)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                }}>{label}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>{count}</span>
              </div>
              <div style={{ height: 3, backgroundColor: "var(--rule)" }}>
                <div style={{ height: "100%", width: `${pct}%`, backgroundColor: color, opacity: 0.6 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ContractsDashboard({ stats }: { stats: ContractStats }) {
  return (
    <section className="w-full px-6 pt-5 pb-2 flex flex-col gap-4">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiBlock label="CONTRATOS"   value={stats.total}                color="var(--ink)"       />
        <KpiBlock label="VALOR TOTAL" value={formatCOP(stats.valorTotal)} color="var(--indigo)"    />
        <KpiBlock label="ACTIVOS"     value={stats.activos}              color="var(--green-ink)" />
        <KpiBlock label="PyME"        value={stats.pymes}                color="var(--ink-soft)"  />
      </div>

      {stats.porTipo.length > 0 && (
        <DistribPanel
          title="DISTRIBUCIÓN POR TIPO DE CONTRATO"
          rows={stats.porTipo.map(({ tipo, count }) => ({ label: tipo, count }))}
          color="var(--indigo)"
        />
      )}

      {stats.porEntidad.length > 0 && (
        <DistribPanel
          title="DISTRIBUCIÓN POR DEPENDENCIA"
          rows={stats.porEntidad.map(({ entidad, count }) => ({ label: entidad, count }))}
          color="var(--green-ink)"
        />
      )}

    </section>
  );
}
