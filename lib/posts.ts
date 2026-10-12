import { supabase } from "./supabase/client";

export type Author = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
};

export type PostStats = {
  views_count: number;
  pollinations_count: number;
  intentions_count: number;
  blooms_count: number;
  comments_count: number;
};

export type FeedPost = {
  id: string;
  author_id: string;
  title: string | null;
  content: string;
  image_url: string | null;
  category: string | null;
  kind: "seed" | "bloom";
  parent_id: string | null;
  location: string | null;
  created_at: string;
  author: Author | null;
  stats: PostStats | null;
  parent: { id: string; title: string | null; content: string; author: Pick<Author, "username"> | null } | null;
};

export const EMPTY_STATS: PostStats = {
  views_count: 0,
  pollinations_count: 0,
  intentions_count: 0,
  blooms_count: 0,
  comments_count: 0,
};

const AUTHOR = "id, username, full_name, avatar_url, location";

export const POST_SELECT = `id, author_id, title, content, image_url, category, kind, parent_id, location, created_at,
  author:profiles(${AUTHOR}),
  stats:post_stats(views_count, pollinations_count, intentions_count, blooms_count, comments_count),
  parent:posts!posts_parent_id_fkey(id, title, content, author:profiles(username))`;

export const PAGE_SIZE = 10;

export type ViewerState = { pollinated: Set<string>; launched: Map<string, string | null> };

/** Ce que l'utilisateur courant a déjà fait sur une liste de publications. */
export async function fetchViewerState(userId: string | undefined, postIds: string[]): Promise<ViewerState> {
  const state: ViewerState = { pollinated: new Set(), launched: new Map() };
  if (!userId || postIds.length === 0) return state;
  const [{ data: pols }, { data: ints }] = await Promise.all([
    supabase.from("pollinations").select("post_id").eq("user_id", userId).in("post_id", postIds),
    supabase.from("intentions").select("post_id, bloom_post_id").eq("user_id", userId).in("post_id", postIds),
  ]);
  pols?.forEach((p) => state.pollinated.add(p.post_id));
  ints?.forEach((i) => state.launched.set(i.post_id, i.bloom_post_id));
  return state;
}

/** Compte l'utilisateur parmi les « personnes touchées » (une seule fois par publication). */
export async function recordViews(userId: string | undefined, postIds: string[]) {
  if (!userId || postIds.length === 0) return;
  await supabase
    .from("post_views")
    .upsert(
      postIds.map((post_id) => ({ post_id, viewer_id: userId })),
      { onConflict: "post_id,viewer_id", ignoreDuplicates: true },
    );
}
