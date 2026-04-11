import { Topic } from "@/lib/types";

export function TopicBadge({ topic }: { topic?: Topic }) {
  if (!topic) return null;
  const color = TOPIC_COLORS_HEX[topic] ?? "#aaaaaa";
  return (
    <span
      className="inline-block px-2 py-0 text-sm font-bold"
      style={{
        color: "#000000",
        backgroundColor: color,
        letterSpacing: "0.03em",
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
  "Desarrollo Económico":    "#f1c21b",  // Carbon Yellow 30
  "Gobernanza":              "#0f62fe",  // IBM Blue 60
  "Judicial":                "#ff832b",  // Carbon Orange 40
  "Cultura y Eventos":       "#be95ff",  // Carbon Purple 40
  "Emergencias":             "#fa4d56",  // Carbon Red 40
  "General":                 "#6f6f6f",  // Carbon Gray 50
};
