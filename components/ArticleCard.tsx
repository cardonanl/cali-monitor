import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Article } from "@/lib/types";
import { SourceBadge } from "./SourceBadge";
import { TopicBadge } from "./TopicBadge";

export function ArticleCard({ article }: { article: Article }) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <article className="article-card p-4 flex flex-col gap-3 cursor-default">
      {/* Meta row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <TopicBadge topic={article.topic} />
          <SourceBadge source={article.source} />
          {article.neighborhood && (
            <span className="inline-block px-1.5 py-0.5 text-xs"
              style={{
                color: "var(--green-ink)",
                border: "1px solid var(--green-bg)",
                backgroundColor: "var(--green-bg)",
                borderRadius: 2,
              }}>
              📍 {article.neighborhood}
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>{timeAgo}</span>
      </div>

      {/* Title */}
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="group">
        <h2 className="text-base leading-snug line-clamp-3"
          style={{ color: "var(--ink)", fontWeight: 500 }}>
          <span className="group-hover:underline">{article.title}</span>
        </h2>
      </a>

      {/* Summary */}
      {article.summary && (
        <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "var(--ink-soft)" }}>
          {article.summary}
        </p>
      )}
    </article>
  );
}
