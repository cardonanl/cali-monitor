import OpenAI from "openai";
import { supabase } from "./supabase";
import { DashboardStats } from "./types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface HourlyBucket {
  hour: string;   // "HH:00"
  count: number;
}

export interface WordFreq {
  text: string;
  value: number;
}

// Spanish stopwords
const STOPWORDS = new Set([
  "de","la","el","en","y","a","los","las","un","una","su","que","por","con",
  "se","del","al","lo","le","es","no","si","pero","más","o","como","para",
  "sus","mi","ha","te","ya","fue","son","hay","hasta","desde","sobre","entre",
  "también","ser","esto","esta","este","era","han","qué","cómo","dónde",
  "cuando","muy","bien","sin","vez","años","año","dos","tres","después",
  "puede","colombia","cali","nuevo","nueva","gran","parte","tienen","hacer",
  "así","durante","donde","quien","cada","hoy","ayer","san","santa",
]);

export async function getDashboardStats(): Promise<DashboardStats> {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [totalRes, last24hRes, byTopicRes, byTopic24hRes, bySourceRes] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }).gte("fetched_at", yesterday),
    supabase.from("articles").select("topic").not("topic", "is", null),
    supabase.from("articles").select("topic").not("topic", "is", null).gte("fetched_at", yesterday),
    supabase.from("articles").select("source"),
  ]);

  const topicCounts = new Map<string, number>();
  for (const row of byTopicRes.data ?? []) {
    const t = row.topic as string;
    topicCounts.set(t, (topicCounts.get(t) ?? 0) + 1);
  }
  const byTopic = [...topicCounts.entries()]
    .map(([topic, count]) => ({ topic, count }) as { topic: never; count: number })
    .sort((a, b) => b.count - a.count);

  const topicCounts24h = new Map<string, number>();
  for (const row of byTopic24hRes.data ?? []) {
    const t = row.topic as string;
    topicCounts24h.set(t, (topicCounts24h.get(t) ?? 0) + 1);
  }
  const byTopic24h = [...topicCounts24h.entries()]
    .map(([topic, count]) => ({ topic, count }) as { topic: never; count: number })
    .sort((a, b) => b.count - a.count);

  const sourceCounts = new Map<string, number>();
  for (const row of bySourceRes.data ?? []) {
    const s = row.source as string;
    sourceCounts.set(s, (sourceCounts.get(s) ?? 0) + 1);
  }
  const bySource = [...sourceCounts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total: totalRes.count ?? 0,
    last24h: last24hRes.count ?? 0,
    byTopic,
    byTopic24h,
    bySource,
  };
}

export async function getHourlyActivity(): Promise<HourlyBucket[]> {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("articles")
    .select("fetched_at")
    .gte("fetched_at", yesterday);

  const counts = new Map<number, number>();
  for (const row of data ?? []) {
    const h = new Date(row.fetched_at as string).getHours();
    counts.set(h, (counts.get(h) ?? 0) + 1);
  }

  // Fill all 24 hours
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const h = (now.getHours() - 23 + i + 24) % 24;
    return { hour: `${String(h).padStart(2, "0")}:00`, count: counts.get(h) ?? 0 };
  });
}

export interface NeighborhoodArticle {
  id: string;
  title: string;
  url: string;
  topic: string | null;
  neighborhood: string;
  published_at: string;
}

export async function getNeighborhoodArticles(): Promise<NeighborhoodArticle[]> {
  const { data } = await supabase
    .from("articles")
    .select("id, title, url, topic, neighborhood, published_at")
    .not("neighborhood", "is", null)
    .order("published_at", { ascending: false })
    .limit(500);
  return (data ?? []) as NeighborhoodArticle[];
}

export interface DayBucket {
  date: string; // "DD/MM"
  count: number;
}

export async function getWeeklyActivity(): Promise<DayBucket[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const { data } = await supabase
    .from("articles")
    .select("published_at")
    .gte("published_at", sevenDaysAgo.toISOString());

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const d = new Date(row.published_at as string);
    const key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  // Build ordered array: today-6 … today
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { date: key, count: counts.get(key) ?? 0 };
  });
}

export async function getDailySummary(): Promise<string> {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("articles")
    .select("title, topic, source")
    .gte("fetched_at", yesterday)
    .order("published_at", { ascending: false })
    .limit(80);

  if (!data || data.length === 0) return "No hay noticias recientes para resumir.";

  const headlines = data
    .map((r, i) => `${i + 1}. [${r.topic ?? "General"}] ${r.title}`)
    .join("\n");

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 350,
      messages: [
        {
          role: "system",
          content:
            "Eres un analista de noticias municipales para la Alcaldía de Cali. Redacta un resumen ejecutivo breve (máximo 3 párrafos cortos) de los titulares del día que se te proporcionan. Prioriza los temas de mayor impacto ciudadano: seguridad, salud, obras públicas y emergencias. Escribe en español formal, sin listar los titulares, sino sintetizando los temas principales.",
        },
        { role: "user", content: `Titulares de las últimas 24 horas:\n\n${headlines}` },
      ],
    });
    return res.choices[0].message.content ?? "No se pudo generar el resumen.";
  } catch {
    return "No se pudo generar el resumen en este momento.";
  }
}

export async function getWordFrequencies(): Promise<WordFreq[]> {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("articles")
    .select("title, summary")
    .gte("fetched_at", yesterday);

  const freq = new Map<string, number>();
  for (const row of data ?? []) {
    const text = `${row.title ?? ""} ${row.summary ?? ""}`;
    const words = text
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w));
    for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  }

  return [...freq.entries()]
    .map(([text, value]) => ({ text, value }))
    .filter(({ value }) => value > 1)
    .sort((a, b) => b.value - a.value)
    .slice(0, 60);
}
