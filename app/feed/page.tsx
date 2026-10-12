"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/earth";
import { PAGE_SIZE, POST_SELECT, type FeedPost } from "@/lib/posts";
import { useAuth } from "../components/AuthProvider";
import Avatar from "../components/Avatar";
import PostList from "../components/PostList";
import PostSkeleton from "../components/PostSkeleton";
import EmptyState from "../components/EmptyState";

type Tab = "all" | "ecosystem";

export default function FeedPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("all");
  const [category, setCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [pollinatedBy, setPollinatedBy] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [noFollows, setNoFollows] = useState(false);

  const load = useCallback(
    async (before?: string) => {
      setLoading(true);
      let query = supabase.from("posts").select(POST_SELECT).order("created_at", { ascending: false }).limit(PAGE_SIZE);
      if (category) query = query.eq("category", category);
      if (before) query = query.lt("created_at", before);

      let byMap = new Map<string, string>();
      if (tab === "ecosystem" && user) {
        // L'écosystème : les graines des membres suivis… et celles qu'ils ont pollinisées.
        const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
        const followed = (follows ?? []).map((f) => f.following_id);
        setNoFollows(followed.length === 0);
        if (followed.length === 0) {
          setPosts([]);
          setHasMore(false);
          setLoading(false);
          return;
        }
        const [{ data: pols }, { data: people }] = await Promise.all([
          supabase
            .from("pollinations")
            .select("post_id, user_id")
            .in("user_id", followed)
            .order("created_at", { ascending: false })
            .limit(300),
          supabase.from("profiles").select("id, username").in("id", followed),
        ]);
        const names = new Map((people ?? []).map((p) => [p.id, p.username ?? "pollinisateur"]));
        (pols ?? []).forEach((p) => {
          if (!byMap.has(p.post_id)) byMap.set(p.post_id, names.get(p.user_id) ?? "pollinisateur");
        });
        const authors = [...followed, user.id].join(",");
        const pollinatedIds = [...byMap.keys()];
        query = query.or(
          pollinatedIds.length
            ? `author_id.in.(${authors}),id.in.(${pollinatedIds.join(",")})`
            : `author_id.in.(${authors})`,
        );
      } else {
        byMap = new Map();
      }

      const { data } = await query;
      const rows = (data ?? []) as unknown as FeedPost[];
      // N'affiche le bandeau « pollinisé par » que si l'auteur n'est pas lui-même suivi.
      const shown = new Map<string, string>();
      rows.forEach((r) => {
        const by = byMap.get(r.id);
        if (by && r.author?.username !== by) shown.set(r.id, by);
      });
      setPollinatedBy((prev) => (before ? new Map([...prev, ...shown]) : shown));
      setPosts((prev) => (before ? [...prev, ...rows] : rows));
      setHasMore(rows.length === PAGE_SIZE);
      setLoading(false);
    },
    [tab, category, user],
  );

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [load, authLoading]);

  return (
    <div className="mx-auto max-w-2xl">
      {!authLoading && !user && (
        <div className="card mb-5 flex flex-col items-center gap-3 bg-gradient-to-br from-leaf-500 to-leaf-700 p-6 text-center text-white sm:flex-row sm:text-left">
          <span className="text-5xl">🐝</span>
          <div className="flex-1">
            <p className="font-display text-xl font-bold">Les bonnes actions se pollinisent ici.</p>
            <p className="text-white/80">Rejoins EarthConnect pour polliniser, te lancer et faire fleurir des idées.</p>
          </div>
          <Link href="/signup" className="btn-honey">
            Je rejoins
          </Link>
        </div>
      )}

      {user && (
        <Link href="/new" className="card mb-5 flex items-center gap-3 p-4 transition hover:shadow-lg">
          <Avatar url={profile?.avatar_url} name={profile?.username ?? user.email} size={44} />
          <span className="flex-1 rounded-full bg-leaf-50 px-4 py-3 text-leaf-900/50">
            Qu&apos;as-tu fait de bon pour la planète&nbsp;?
          </span>
          <span className="hidden text-2xl sm:inline">📸</span>
        </Link>
      )}

      <div className="mb-3 flex gap-2 rounded-full bg-white p-1 shadow-soft ring-1 ring-leaf-900/5">
        {(
          [
            ["all", "🌍 Tout le jardin"],
            ["ecosystem", "🐝 Mon écosystème"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            disabled={id === "ecosystem" && !user}
            title={id === "ecosystem" && !user ? "Connecte-toi pour voir ton écosystème" : undefined}
            className={`flex-1 rounded-full px-4 py-2 font-display font-semibold transition disabled:opacity-40 ${
              tab === id ? "bg-leaf-500 text-white shadow" : "text-leaf-800 hover:bg-leaf-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
        <button
          onClick={() => setCategory(null)}
          className={`chip shrink-0 ${!category ? "bg-leaf-800 text-white" : "bg-white text-leaf-800 ring-1 ring-leaf-900/10"}`}
        >
          ✨ Toutes
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(category === c.id ? null : c.id)}
            className={`chip shrink-0 ${
              category === c.id ? "bg-leaf-800 text-white" : "bg-white text-leaf-800 ring-1 ring-leaf-900/10"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {posts.length > 0 && <PostList posts={posts} pollinatedBy={pollinatedBy} />}

      {loading && (
        <div className="mt-5 space-y-5">
          <PostSkeleton />
          {posts.length === 0 && <PostSkeleton />}
        </div>
      )}

      {!loading && posts.length === 0 &&
        (tab === "ecosystem" && noFollows ? (
          <EmptyState
            emoji="🐝"
            title="Ton écosystème est encore tout jeune"
            text="Suis des pollinisateurs : leurs graines, et celles qu'ils pollinisent, voyageront jusqu'ici."
          >
            <Link href="/impact" className="btn-primary">
              Découvrir des pollinisateurs
            </Link>
          </EmptyState>
        ) : (
          <EmptyState
            title={category ? "Pas encore de graine dans cette catégorie" : "Le jardin attend sa première graine"}
            text="Partage une action concrète que tu as réalisée — ou pioche une idée pour te lancer :"
            ideas
          />
        ))}

      {!loading && hasMore && (
        <div className="mt-6 text-center">
          <button onClick={() => load(posts[posts.length - 1]?.created_at)} className="btn-ghost">
            🌾 Voir plus de graines
          </button>
        </div>
      )}
    </div>
  );
}
