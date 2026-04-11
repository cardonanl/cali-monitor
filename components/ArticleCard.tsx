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
    <article className="article-card p-3 flex flex-col gap-2 transition-colors cursor-default">
      {/* Meta row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <TopicBadge topic={article.topic} />
          <SourceBadge source={article.source} />
          {article.neighborhood && (
            <span
              className="inline-block px-1.5 py-0 text-xs"
              style={{
                color: "var(--accent)",
                border: "1px solid var(--amber-dim)",
                backgroundColor: "#3d280018",
              }}
            >
              [📍 {article.neighborhood}]
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {timeAgo}
        </span>
      </div>

      {/* Title */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group"
      >
        <h2
          className="text-sm leading-snug line-clamp-3 transition-colors"
          style={{ color: "var(--text-primary)" }}
        >
          <span style={{ color: "var(--text-muted)" }}>›</span>{" "}
          <span className="group-hover:underline" style={{ textDecorationColor: "var(--accent)" }}>
            {article.title}
          </span>
        </h2>
      </a>

      {/* Summary */}
      {article.summary && (
        <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--text-muted)" }}>
          {article.summary}
        </p>
      )}
    </article>
  );
}
