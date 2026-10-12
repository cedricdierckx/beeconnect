import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { POST_SELECT } from "@/lib/posts";

export const dynamic = "force-dynamic";

/**
 * Diagnostic : exécute (limit 1) chaque forme de requête utilisée par l'application et
 * renvoie uniquement « ok » ou le message d'erreur — jamais de données.
 */
export async function GET() {
  const checks = {
    posts_feed: supabase.from("posts").select(POST_SELECT).limit(1),
    intentions_people: supabase.from("intentions").select("user:profiles(username, avatar_url)").limit(1),
    pollinations_people: supabase.from("pollinations").select("user:profiles(username, avatar_url)").limit(1),
    meadows: supabase
      .from("post_stats")
      .select("blooms_count, pollinations_count, post:posts!inner(id, title, content, image_url, category, kind)")
      .eq("post.kind", "seed")
      .limit(1),
    comments: supabase.from("comments").select("id, author:profiles(username, full_name, avatar_url)").limit(1),
    profile_stats: supabase.from("profile_stats").select("*").limit(1),
    ecosystem_stats: supabase.from("ecosystem_stats").select("*").limit(1),
    category_stats: supabase.from("category_stats").select("*").limit(1),
    global_stats: supabase.from("global_stats").select("*").limit(1),
    follows: supabase.from("follows").select("following_id").limit(1),
    blooms: supabase
      .from("posts")
      .select("id, author:profiles!posts_author_id_fkey(username, avatar_url)")
      .eq("kind", "bloom")
      .limit(1),
  };

  const results: Record<string, string> = {};
  await Promise.all(
    Object.entries(checks).map(async ([name, query]) => {
      const { error } = await query;
      results[name] = error ? `erreur : ${error.message}` : "ok";
    }),
  );
  const healthy = Object.values(results).every((r) => r === "ok");
  return NextResponse.json({ healthy, results }, { status: healthy ? 200 : 500 });
}
