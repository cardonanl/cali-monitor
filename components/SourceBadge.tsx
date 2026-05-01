const SOURCE_COLORS_HEX: Record<string, string> = {
  "Google News - Cali":  "#3333FF",
  "Google News - Valle": "#1a4fd6",
  "90 Minutos":          "#8a3ffc",
  "Q'Hubo Cali":         "#198038",
  "Occidente":           "#1192e8",
  "Alcaldía de Cali":    "#b8530a",
  "El Tiempo - Cali":    "#b8530a",
  "RCN Radio":           "#da1e28",
};

const DEFAULT_HEX = "#6f6f6f";

export function SourceBadge({ source }: { source: string }) {
  const color = SOURCE_COLORS_HEX[source] ?? DEFAULT_HEX;
  return (
    <span
      className="inline-block px-1.5 py-0.5 text-xs"
      style={{
        color,
        border: `1px solid ${color}40`,
        backgroundColor: color + "0e",
        borderRadius: 2,
        letterSpacing: "0.02em",
      }}
    >
      {source}
    </span>
  );
}
