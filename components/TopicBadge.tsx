import { Topic } from "@/lib/types";

export function TopicBadge({ topic }: { topic?: Topic }) {
  if (!topic) return null;
  const color = TOPIC_COLORS_HEX[topic] ?? "#8C857C";
  return (
    <span
      className="inline-block px-2 py-0.5 text-xs font-medium"
      style={{
        color,
        backgroundColor: color + "18",
        border: `1px solid ${color}50`,
        borderRadius: 2,
        letterSpacing: "0.02em",
      }}
    >
      {topic}
    </span>
  );
}

export const TOPIC_COLORS_HEX: Record<Topic, string> = {
  "Seguridad Pública":       "#da1e28",  // Carbon Red 60
  "Salud":                   "#009d9a",  // Carbon Teal 60
  "Educación":               "#8a3ffc",  // Carbon Purple 60
  "Infraestructura y Obras": "#1192e8",  // Carbon Cyan 50
  "Movilidad y Transporte":  "#4589ff",  // IBM Blue 40
  "Medio Ambiente":          "#198038",  // Carbon Green 60
  "Desarrollo Social":       "#ee5396",  // Carbon Magenta 50
  "Desarrollo Económico":    "#c28000",  // Darker yellow for light bg
  "Gobernanza":              "#0f62fe",  // IBM Blue 60
  "Judicial":                "#b8530a",  // Darker orange for light bg
  "Cultura y Eventos":       "#6929c4",  // Darker purple for light bg
  "Emergencias":             "#fa4d56",  // Carbon Red 40
  "General":                 "#6f6f6f",  // Carbon Gray 50
};
