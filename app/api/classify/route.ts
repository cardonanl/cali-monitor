import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { classifyArticles } from "@/lib/classify";
import { Article } from "@/lib/types";

export const maxDuration = 300;

const ALCALDIA_SOURCE = "Alcaldía de Cali";
const BATCH_SIZE = 50;

// GET /api/classify — invoked daily by Vercel Cron (Authorization: Bearer CRON_SECRET)
// Also callable manually with the same header for testing.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("id, title, source, published_at, summary, url")
    .is("topic", null)
    .neq("source", ALCALDIA_SOURCE)
    .order("published_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return NextResponse.json({ classified: 0 });

  const articles: Article[] = data.map((r) => ({
    id: r.id as string,
    title: r.title as string,
    source: r.source as string,
    publishedAt: new Date(r.published_at as string),
    summary: (r.summary as string) ?? "",
    url: r.url as string,
  }));

  let classified = 0;
  let errors = 0;

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    try {
      const result = await classifyArticles(batch);
      const { error: upsertError } = await supabaseAdmin.from("articles").upsert(
        result.map((a) => ({
          id: a.id,
          title: a.title,
          source: a.source,
          published_at: new Date(a.publishedAt).toISOString(),
          summary: a.summary,
          url: a.url,
          topic: a.topic ?? null,
          neighborhood: a.neighborhood ?? null,
        })),
        { onConflict: "id" }
      );
      if (upsertError) {
        console.error(`[classify cron] batch ${i} failed:`, upsertError.message);
        errors += batch.length;
      } else {
        classified += batch.length;
      }
    } catch (err) {
      console.error(`[classify cron] batch ${i} error:`, err);
      errors += batch.length;
    }
  }

  console.log(`[classify cron] classified ${classified}, errors ${errors}`);
  return NextResponse.json({ classified, errors, total: articles.length });
}
