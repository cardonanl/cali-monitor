import Link from "next/link";

type ActivePage = "noticias" | "contratos";

export function NavTabs({ active }: { active: ActivePage }) {
  return (
    <div className="flex items-center gap-2">
      <Tab href="/"          label="Noticias"  active={active === "noticias"}  />
      <Tab href="/contratos" label="Contratos" active={active === "contratos"} />
    </div>
  );
}

function Tab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        fontSize: "0.82rem",
        fontWeight: active ? 500 : 400,
        padding: "4px 14px",
        textDecoration: "none",
        borderRadius: 2,
        color:           active ? "#ffffff"           : "var(--ink-muted)",
        backgroundColor: active ? "var(--indigo)"     : "transparent",
        border:          active ? "1px solid var(--indigo)" : "1px solid var(--rule)",
      }}
    >
      {label}
    </Link>
  );
}
