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
    <article className="article-card p-4 flex flex-col gap-3 transition-colors cursor-default">
      {/* Meta row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <TopicBadge topic={article.topic} />
          <SourceBadge source={article.source} />
          {article.neighborhood && (
            <span className="inline-block px-1.5 py-0 text-sm"
              style={{ color: "var(--green)", border: "1px solid var(--green)55", backgroundColor: "#00dd4414" }}>
              [📍 {article.neighborhood}]
            </span>
          )}
        </div>
        <span className="text-sm" style={{ color: "var(--yellow)" }}>{timeAgo}</span>
      </div>

      {/* Title */}
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="group">
        <h2 className="text-lg leading-snug line-clamp-3" style={{ color: "var(--white)" }}>
          <span style={{ color: "var(--yellow)" }}>›</span>{" "}
          <span className="group-hover:underline">{article.title}</span>
        </h2>
      </a>

      {/* Summary */}
      {article.summary && (
        <p className="text-base leading-relaxed line-clamp-3" style={{ color: "var(--yellow)" }}>
          {article.summary}
        </p>
      )}
    </article>
  );
}
