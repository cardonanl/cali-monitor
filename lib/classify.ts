import OpenAI from "openai";
import { Article, Topic } from "./types";
import { BARRIOS_CALI } from "./barrios";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TOPICS: Topic[] = [
  "Seguridad Pública",
  "Salud",
  "Educación",
  "Infraestructura y Obras",
  "Movilidad y Transporte",
  "Medio Ambiente",
  "Desarrollo Social",
  "Desarrollo Económico",
  "Gobernanza",
  "Judicial",
  "Cultura y Eventos",
  "Emergencias",
  "General",
];

const BARRIOS_LIST = BARRIOS_CALI.join(", ");

const SYSTEM_PROMPT = `Eres un clasificador de noticias para la Alcaldía de Cali, Colombia.

Para cada titular numerado debes:
1. Asignar UNA categoría de esta lista: ${TOPICS.join(" | ")}
2. Identificar si el titular menciona un barrio de Cali de esta lista canónica: ${BARRIOS_LIST}

Criterios de categorización (prioriza la acción o decisión pública, no el evento deportivo/cultural en sí):
- "Seguridad Pública": crimen, violencia, policía, orden público, hurtos, homicidios
- "Salud": hospitales, enfermedades, salud pública, vacunación, EPS, centros médicos
- "Educación": colegios, universidades, política educativa, programas estudiantiles
- "Infraestructura y Obras": construcción, vías, acueducto, alcantarillado, obras públicas, valorización
- "Movilidad y Transporte": tráfico, MIO, accidentes de tránsito, ciclovías, transporte público
- "Medio Ambiente": contaminación, ríos, parques, DAGMA, árboles, residuos, calidad del aire
- "Desarrollo Social": vivienda, pobreza, programas sociales, género, comunidades, desplazados
- "Desarrollo Económico": empleo, comercio, inversión, industria, turismo, mercados
- "Gobernanza": alcaldía, concejo municipal, gobernación, decisiones administrativas, presupuesto, POT
- "Judicial": tribunales, fiscalía, corrupción, capturas, procesos judiciales, sentencias
- "Cultura y Eventos": festivales, conciertos, ferias, resultados de partidos deportivos, entretenimiento
- "Emergencias": inundaciones, deslizamientos, incendios, DAGRD, desastres naturales, accidentes graves
- "General": no encaja claramente en ninguna categoría anterior

IMPORTANTE: El resultado de un partido de fútbol va en "Cultura y Eventos", NO en otra categoría.
Un polideportivo nuevo va en "Infraestructura y Obras".

Para el barrio: devuelve el nombre EXACTO de la lista canónica si el titular menciona claramente ese barrio, o null si no.

CASOS ESPECIALES — devuelve null para el barrio si:
- El titular menciona "3 de Julio" o "20 de Julio" como fecha, no como referencia al barrio.
- El titular menciona "Alfonso Bonilla Aragón" refiriéndose al aeropuerto (vuelos, aerolíneas, pista, terminal, aeropuerto), NO al barrio.
- El titular menciona "Base Aérea" refiriéndose a instalaciones militares o aeronáuticas, no al barrio.
- El nombre que aparece es de una persona, institución o evento, no del barrio en sí.
Solo asigna barrio cuando el texto se refiere inequívocamente al sector residencial/urbano de ese nombre.

Responde SOLO con JSON: {"results": [{"index": 0, "topic": "Categoría", "neighborhood": "Nombre exacto o null"}, ...]}`;

export async function classifyArticles(
  articles: Article[]
): Promise<Article[]> {
  if (articles.length === 0) return articles;

  const items = articles
    .map((a, i) => `${i}: ${a.title}${a.summary ? " — " + a.summary.slice(0, 80) : ""}`)
    .join("\n");

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: items },
    ],
  });

  const raw = response.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(raw) as {
    results: { index: number; topic: string; neighborhood: string | null }[];
  };

  const resultMap = new Map<number, { topic: Topic; neighborhood: string | null }>();
  for (const r of parsed.results ?? []) {
    if (TOPICS.includes(r.topic as Topic)) {
      const nbh = r.neighborhood && BARRIOS_CALI.includes(r.neighborhood)
        ? r.neighborhood
        : null;
      resultMap.set(r.index, { topic: r.topic as Topic, neighborhood: nbh });
    }
  }

  return articles.map((a, i) => {
    const result = resultMap.get(i);
    return {
      ...a,
      topic: result?.topic ?? "General",
      neighborhood: result?.neighborhood ?? undefined,
    };
  });
}
