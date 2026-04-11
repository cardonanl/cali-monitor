const SOURCE_COLORS_HEX: Record<string, string> = {
  "Google News - Cali":  "#5588ff",
  "Google News - Valle": "#1a4fd6",
  "90 Minutos":          "#aa66ff",
  "Q'Hubo Cali":         "#00a000",
  "Occidente":           "#4499dd",
  "Alcaldía de Cali":    "#cc1111",
  "El Tiempo - Cali":    "#ff8833",
  "RCN Radio":           "#dd2222",
};

const DEFAULT_HEX = "#5a7a9a";

export function SourceBadge({ source }: { source: string }) {
  const color = SOURCE_COLORS_HEX[source] ?? DEFAULT_HEX;
  return (
    <span
      className="inline-block px-1.5 py-0 text-sm"
      style={{
        color,
        border: `1px solid ${color}88`,
        backgroundColor: "transparent",
        letterSpacing: "0.03em",
      }}
    >
      {source}
    </span>
  );
}
