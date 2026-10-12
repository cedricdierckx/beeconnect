"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/auth";
import { formatCount, type ProfileCounts } from "@/lib/earth";
import { POST_SELECT, type FeedPost } from "@/lib/posts";
import type { Tables } from "@/lib/supabase/database.types";
import { useAuth } from "../../components/AuthProvider";
import Avatar from "../../components/Avatar";
import FollowButton from "../../components/FollowButton";
import BlockButton from "../../components/BlockButton";
import ReportButton from "../../components/ReportButton";
import LevelBadge from "../../components/LevelBadge";
import PostList from "../../components/PostList";
import EmptyState from "../../components/EmptyState";

type Tab = "seeds" | "blooms" | "sprouting" | "pollinated";

const ZERO: ProfileCounts & { followers_count: number; following_count: number } = {
  seeds_count: 0,
  blooms_count: 0,
  pollinations_given: 0,
  intentions_count: 0,
  blooms_inspired: 0,
  followers_count: 0,
  following_count: 0,
};

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null | undefined>(undefined);
  const [counts, setCounts] = useState(ZERO);
  const [tab, setTab] = useState<Tab>("seeds");
  const [posts, setPosts] = useState<FeedPost[] | null>(null);

  const loadCounts = useCallback(async (id: string) => {
    const { data } = await supabase.from("profile_stats").select("*").eq("profile_id", id).maybeSingle();
    if (data) {
      setCounts({
        seeds_count: data.seeds_count ?? 0,
        blooms_count: data.blooms_count ?? 0,
        pollinations_given: data.pollinations_given ?? 0,
        intentions_count: data.intentions_count ?? 0,
        blooms_inspired: data.blooms_inspired ?? 0,
        followers_count: data.followers_count ?? 0,
        following_count: data.following_count ?? 0,
      });
    }
  }, []);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .eq("username", decodeURIComponent(username))
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data);
        if (data) loadCounts(data.id);
      });
  }, [username, loadCounts]);

  useEffect(() => {
    if (!profile) return;
    setPosts(null);
    (async () => {
      let ids: string[] | null = null;
      if (tab === "sprouting" || tab === "pollinated") {
        const { data } =
          tab === "sprouting"
            ? await supabase.from("intentions").select("post_id").eq("user_id", profile.id).is("bloom_post_id", null)
            : await supabase.from("pollinations").select("post_id").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(50);
        ids = (data ?? []).map((r) => r.post_id);
        if (ids.length === 0) return setPosts([]);
      }
      let q = supabase.from("posts").select(POST_SELECT).order("created_at", { ascending: false }).limit(50);
      q = ids ? q.in("id", ids) : q.eq("author_id", profile.id).eq("kind", tab === "blooms" ? "bloom" : "seed");
      const { data } = await q;
      setPosts((data ?? []) as unknown as FeedPost[]);
    })();
  }, [profile, tab]);

  if (profile === undefined) return <div className="mx-auto h-72 max-w-3xl animate-pulse rounded-3xl bg-white/60" />;
  if (profile === null) {
    return (
      <EmptyState emoji="🔎" title="Pollinisateur introuvable" text={`Aucun membre ne s'appelle @${decodeURIComponent(username)}.`}>
        <Link href="/feed" className="btn-primary">Retour au fil</Link>
      </EmptyState>
    );
  }

  const isMe = user?.id === profile.id;
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "seeds", label: "🌱 Graines", count: counts.seeds_count },
    { id: "blooms", label: "🌸 Floraisons", count: counts.blooms_count },
    { id: "sprouting", label: "🧑‍🌾 En germination" },
    { id: "pollinated", label: "🐝 Pollinisées", count: counts.pollinations_given },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="card overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-leaf-400 via-leaf-300 to-honey-300 sm:h-40">
          <span className="absolute right-6 top-4 animate-float text-4xl">🐝</span>
          <span className="absolute bottom-2 left-1/3 text-3xl">🌼</span>
          <span className="absolute right-1/4 top-10 text-2xl">🌿</span>
        </div>
        <div className="px-6 pb-6">
          <div className="relative z-10 -mt-12 flex flex-wrap items-end justify-between gap-3">
            <Avatar url={profile.avatar_url} name={profile.username} size={104} className="ring-4" />
            <div className="flex flex-wrap justify-end gap-2">
              {isMe ? (
                <>
                  <Link href="/profile/edit" className="btn-ghost">✏️ Modifier</Link>
                  <Link href="/settings" className="btn-ghost" aria-label="Paramètres">
                    ⚙️<span className="hidden sm:inline">Paramètres</span>
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      router.push("/");
                    }}
                    className="btn-ghost hidden sm:inline-flex"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <FollowButton profileId={profile.id} onChange={() => loadCounts(profile.id)} />
                  <BlockButton profileId={profile.id} username={profile.username} />
                  <ReportButton target={{ profileId: profile.id }} />
                </>
              )}
            </div>
          </div>
          <h1 className="mt-3 text-3xl font-bold">{profile.full_name || `@${profile.username}`}</h1>
          <p className="text-leaf-900/50">
            @{profile.username}
            {profile.location && <> · 📍 {profile.location}</>}
          </p>
          {profile.bio && <p className="mt-3 whitespace-pre-line text-leaf-900/80">{profile.bio}</p>}
          <p className="mt-3 text-sm text-leaf-900/60">
            <b className="text-leaf-900">{formatCount(counts.followers_count)}</b> dans son écosystème ·{" "}
            <b className="text-leaf-900">{formatCount(counts.following_count)}</b> suivis
          </p>
        </div>
      </section>

      <section className="card p-6">
        <LevelBadge counts={counts} ladder />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat emoji="🌱" value={counts.seeds_count} label="graines plantées" tone="bg-leaf-100" />
          <Stat emoji="🌸" value={counts.blooms_count} label="floraisons" tone="bg-petal-100" />
          <Stat emoji="🐝" value={counts.pollinations_given} label="pollinisations" tone="bg-honey-100" />
          <Stat emoji="✨" value={counts.blooms_inspired} label="réalisations inspirées" tone="bg-sky-100" />
        </div>
      </section>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`chip shrink-0 px-4 py-2 font-display ${
              tab === t.id ? "bg-leaf-500 text-white shadow" : "bg-white text-leaf-800 ring-1 ring-leaf-900/10"
            }`}
          >
            {t.label}
            {t.count !== undefined && <span className="rounded-full bg-white/30 px-1.5 text-xs">{t.count}</span>}
          </button>
        ))}
      </div>

      {posts === null ? (
        <div className="h-40 animate-pulse rounded-3xl bg-white/60" />
      ) : posts.length === 0 ? (
        <EmptyState
          emoji={{ seeds: "🌱", blooms: "🌸", sprouting: "🧑‍🌾", pollinated: "🐝" }[tab]}
          title={
            {
              seeds: "Aucune graine pour l'instant",
              blooms: "Aucune floraison pour l'instant",
              sprouting: "Rien en germination",
              pollinated: "Aucune pollinisation pour l'instant",
            }[tab]
          }
          text={isMe ? (tab === "sprouting" ? "Clique sur « Je me lance » sur une graine qui t'inspire." : undefined) : undefined}
          ideas={isMe && tab === "seeds"}
        />
      ) : (
        <PostList posts={posts} />
      )}
    </div>
  );
}

function Stat({ emoji, value, label, tone }: { emoji: string; value: number; label: string; tone: string }) {
  return (
    <div className={`rounded-2xl p-4 text-center ${tone}`}>
      <div className="text-2xl">{emoji}</div>
      <div className="font-display text-2xl font-bold">{formatCount(value)}</div>
      <div className="text-xs font-semibold text-leaf-900/60">{label}</div>
    </div>
  );
}
