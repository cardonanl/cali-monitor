import { Suspense } from "react";
import { fetchContracts, getContractStats } from "@/lib/contracts";
import { Header } from "@/components/Header";
import { NavTabs } from "@/components/NavTabs";
import { ContractsDashboard } from "@/components/ContractsDashboard";
import { ContractFilters } from "@/components/ContractFilters";
import { ContractsSection } from "@/components/ContractsSection";

export default async function ContratosPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const { desde, hasta } = await searchParams;

  const contracts = await fetchContracts({
    desde,
    hasta,
    limite: desde || hasta ? 200 : 6,
  });

  const stats = getContractStats(contracts);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--paper)" }}>
      <Header />

      <div className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--rule)" }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl" style={{
            color: "var(--ink)",
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontWeight: 600,
          }}>
            Contratos SECOP II
          </h1>
          <NavTabs active="contratos" />
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>
          Municipio de Santiago de Cali &nbsp;·&nbsp;{" "}
          <a href="https://www.datos.gov.co/resource/jbjy-vk9h.json"
            target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--indigo)" }} className="hover:underline">
            datos.gov.co
          </a>
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
          por Nicolás Cardona
        </p>
      </div>

      <Suspense fallback={
        <div className="mx-6 mt-5 panel p-5 text-sm label-mono">
          Cargando filtros…
        </div>
      }>
        <ContractFilters />
      </Suspense>

      {contracts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-base" style={{ color: "var(--ink-muted)" }}>
          Sin contratos disponibles. Verifica la conexión con datos.gov.co
        </div>
      ) : (
        <>
          <ContractsDashboard stats={stats} />
          <ContractsSection contracts={contracts} />
        </>
      )}

      <footer className="text-center text-xs py-4"
        style={{ color: "var(--ink-muted)", borderTop: "1px solid var(--rule)", fontFamily: "var(--font-mono)" }}>
        Cali Monitor · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
