export type Topic =
  | "Seguridad Pública"
  | "Salud"
  | "Educación"
  | "Infraestructura y Obras"
  | "Movilidad y Transporte"
  | "Medio Ambiente"
  | "Desarrollo Social"
  | "Desarrollo Económico"
  | "Gobernanza"
  | "Judicial"
  | "Cultura y Eventos"
  | "Emergencias"
  | "General";

export interface Article {
  id: string;
  title: string;
  source: string;
  publishedAt: Date;
  summary: string;
  url: string;
  topic?: Topic;
  neighborhood?: string;
}

export interface NewsResponse {
  articles: Article[];
  fetchedAt: string;
  total: number;
}

export interface TopicStat {
  topic: Topic;
  count: number;
}

export interface DashboardStats {
  total: number;
  last24h: number;
  byTopic: TopicStat[];
  byTopic24h: TopicStat[];
  bySource: { source: string; count: number }[];
}
