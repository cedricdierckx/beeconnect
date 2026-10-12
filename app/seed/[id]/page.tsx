/* eslint-disable @next/next/no-img-element */
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { getCategory, timeAgo } from "@/lib/earth";
import { EMPTY_STATS, POST_SELECT, fetchViewerState, recordViews, type FeedPost } from "@/lib/posts";
import { useAuth } from "../../components/AuthProvider";
import { useToast } from "../../components/Toaster";
import Avatar from "../../components/Avatar";
import CategoryChip from "../../components/CategoryChip";
import ImpactStats from "../../components/ImpactStats";
import PollinateButton from "../../components/PollinateButton";
import LaunchButton from "../../components/LaunchButton";
import CommentList from "../../components/CommentList";
import Celebration from "../../components/Celebration";
import EmptyState from "../../components/EmptyState";

type MiniProfile = { username: string | null; avatar_url: string | null };
type Bloom = { id: string; title: string | null; content: string; image_url: string | null; location: string | null; created_at: string; author: MiniProfile | null };

export default function SeedPage() {
  return (
    <Suspense fallback={null}>
      <SeedDetail />
    </Suspense>
  );
}

function SeedDetail() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { user, loading: authLoading } = useAuth();

  const [post, setPost] = useState<FeedPost | null | undefined>(undefined);
  const [blooms, setBlooms] = useState<Bloom[]>([]);
  const [sprouting, setSprouting] = useState<MiniProfile[]>([]);
  const [pollinators, setPollinators] = useState<MiniProfile[]>([]);
  const [pollinated, setPollinated] = useState(false);
  const [launched, setLaunched] = useState<string | null | undefined>(undefined);

  const load = useCallback(async () => {
    const { data } = await supabase.from("posts").select(POST_SELECT).eq("id", id).maybeSingle();
    setPost((data as unknown as FeedPost) ?? null);
    const [{ data: b }, { data: ints }, { data: pols }] = await Promise.all([
      supabase
        .from("posts")
        .select("id, title, content, image_url, location, created_at, author:profiles!posts_author_id_fkey(username, avatar_url)")
        .eq("parent_id", id)
        .eq("kind", "bloom")
        .order("created_at", { ascending: false }),
      supabase
        .from("intentions")
        .select("user:profiles(username, avatar_url)")
        .eq("post_id", id)
        .is("bloom_post_id", null)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("pollinations")
        .select("user:profiles(username, avatar_url)")
        .eq("post_id", id)
        .order("created_at", { ascending: false })
        .limit(12),
    ]);
    setBlooms((b ?? []) as unknown as Bloom[]);
    setSprouting(((ints ?? []) as unknown as { user: MiniProfile }[]).map((i) => i.user).filter(Boolean));
    setPollinators(((pols ?? []) as unknown as { user: MiniProfile }[]).map((p) => p.user).filter(Boolean));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (authLoading || !user) return;
    recordViews(user.id, [id]);
    fetchViewerState(user.id, [id]).then((v) => {
      setPollinated(v.pollinated.has(id));
      setLaunched(v.launched.has(id) ? v.launched.get(id) ?? null : undefined);
    });
  }, [authLoading, user, id]);

  async function share() {
    const url = window.location.href.split("?")[0];
    const title = post?.title ?? "Une action à polliniser sur EarthConnect";
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Lien copié : fais voyager l'idée !", "🔗");
      }
    } catch {
      /* partage annulé */
    }
  }

  async function remove() {
    if (!post || !confirm("Supprimer définitivement cette publication ?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (!error) {
      toast("Publication supprimée", "🍂");
      router.push("/feed");
    }
  }

  if (post === undefined) {
    return <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-3xl bg-white/60" />;
  }
  if (post === null) {
    return (
      <EmptyState emoji="🍂" title="Cette graine s'est envolée" text="La publication n'existe pas ou a été supprimée.">
        <Link href="/feed" className="btn-primary">
          Retour au fil
        </Link>
      </EmptyState>
    );
  }

  const stats = post.stats ?? EMPTY_STATS;
  const isBloom = post.kind === "bloom";
  const cat = getCategory(post.category);
  const isMine = user?.id === post.author_id;
  const justCreated = params.get("new") === "1";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {justCreated && (
        <Celebration
          title={isBloom ? "L'idée a fleuri !" : "Graine plantée !"}
          text={
            isBloom
              ? "Ta réalisation inspire à son tour : la chaîne d'impact continue."
              : "La communauté peut maintenant la polliniser et la faire voyager."
          }
        />
      )}

      <article className="card overflow-hidden">
        {isBloom && post.parent && (
          <Link
            href={`/seed/${post.parent.id}`}
            className="flex items-center gap-2 bg-petal-100 px-6 py-3 font-semibold text-petal-500 hover:underline"
          >
            🌸 Floraison de la graine « {post.parent.title ?? post.parent.content.slice(0, 50)} »
            {post.parent.author?.username && <> de @{post.parent.author.username}</>}
          </Link>
        )}
        {post.image_url ? (
          <img src={post.image_url} alt={post.title ?? "Photo de l'action"} className="max-h-[520px] w-full bg-leaf-50 object-cover" />
        ) : (
          <div className={`grid h-48 place-items-center text-8xl ${cat.tone}`}>{cat.emoji}</div>
        )}

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`chip px-2.5 py-1 text-xs ${isBloom ? "bg-petal-100 text-petal-500" : "bg-leaf-100 text-leaf-700"}`}>
              {isBloom ? "🌸 Floraison" : "🌱 Graine"}
            </span>
            <CategoryChip id={post.category} />
            {post.location && <span className="chip bg-sky-100 px-2.5 py-1 text-xs text-sky-500">📍 {post.location}</span>}
          </div>
          {post.title && <h1 className="mt-3 text-3xl font-bold leading-tight">{post.title}</h1>}
          <p className="mt-3 whitespace-pre-line text-lg text-leaf-900/80">{post.content}</p>

          <Link href={`/profile/${post.author?.username ?? ""}`} className="mt-5 flex items-center gap-3">
            <Avatar url={post.author?.avatar_url} name={post.author?.username} size={44} />
            <div>
              <p className="font-display font-semibold">{post.author?.full_name || `@${post.author?.username ?? "pollinisateur"}`}</p>
              <p className="text-xs text-leaf-900/50">
                @{post.author?.username} · {timeAgo(post.created_at)}
              </p>
            </div>
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <PollinateButton postId={post.id} count={stats.pollinations_count} pollinated={pollinated} big tip onChange={() => load()} />
            {!isBloom && (
              <LaunchButton postId={post.id} authorId={post.author_id} launched={launched} big onChange={(v) => { setLaunched(v); load(); }} />
            )}
            <button onClick={share} className="btn-ghost">
              🔗 Partager
            </button>
            {isMine && (
              <button onClick={remove} className="ml-auto text-sm font-semibold text-leaf-900/40 hover:text-petal-500">
                Supprimer
              </button>
            )}
          </div>
        </div>
      </article>

      <section className="card p-6">
        <h2 className="text-2xl font-bold">🌍 Jusqu&apos;où cette idée a voyagé</h2>
        <p className="mb-4 text-leaf-900/60">Ici, on ne mesure pas la popularité : on mesure les actions que l&apos;idée fait naître.</p>
        <ImpactStats stats={stats} />
        <ImpactChain stats={stats} />
        {pollinators.length > 0 && <PeopleRow title="🐝 Pollinisée par" people={pollinators} />}
        {sprouting.length > 0 && <PeopleRow title="🌱 En train de germer chez" people={sprouting} />}
      </section>

      {!isBloom && (
        <section className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-bold">🌸 L&apos;idée a fleuri ailleurs</h2>
            {!isMine && launched === null && (
              <Link href={`/new?bloom=${post.id}`} className="btn-honey py-2 text-sm">
                Ajouter ma floraison
              </Link>
            )}
          </div>
          {blooms.length === 0 ? (
            <p className="mt-3 text-leaf-900/60">
              Pas encore de floraison. Sois le premier à reproduire cette action : clique sur « Je me lance » ! 🌱
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {blooms.map((b) => (
                <Link key={b.id} href={`/seed/${b.id}`} className="group overflow-hidden rounded-2xl bg-petal-100/50 ring-1 ring-petal-300/40 transition hover:-translate-y-0.5">
                  {b.image_url ? (
                    <img src={b.image_url} alt="" className="aspect-video w-full object-cover" />
                  ) : (
                    <div className="grid aspect-video place-items-center text-5xl">🌸</div>
                  )}
                  <div className="p-3">
                    <p className="line-clamp-1 font-display font-semibold">{b.title ?? b.content}</p>
                    <p className="text-xs text-leaf-900/50">
                      @{b.author?.username} {b.location && <>· 📍 {b.location}</>} · {timeAgo(b.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <section id="commentaires" className="card p-6">
        <h2 className="mb-4 text-2xl font-bold">💬 Conversation</h2>
        <CommentList postId={post.id} />
      </section>
    </div>
  );
}

function ImpactChain({ stats }: { stats: typeof EMPTY_STATS }) {
  const steps = [
    { emoji: "🌱", label: "Graine plantée", done: true },
    { emoji: "🐝", label: "Pollinisée", done: stats.pollinations_count > 0 },
    { emoji: "🧑‍🌾", label: "Quelqu'un se lance", done: stats.intentions_count > 0 },
    { emoji: "🌸", label: "Fleurit ailleurs", done: stats.blooms_count > 0 },
  ];
  const reached = steps.filter((s) => s.done).length;
  return (
    <div className="mt-6">
      <div className="relative flex justify-between">
        <div className="absolute left-6 right-6 top-6 h-1.5 rounded-full bg-leaf-100" />
        <div
          className="absolute left-6 top-6 h-1.5 rounded-full bg-gradient-to-r from-leaf-400 to-petal-400 transition-all duration-700"
          style={{ width: `calc((100% - 3rem) * ${(reached - 1) / (steps.length - 1)})` }}
        />
        {steps.map((s) => (
          <div key={s.label} className="relative z-10 flex w-20 flex-col items-center text-center">
            <span
              className={`grid h-12 w-12 place-items-center rounded-full text-2xl ring-4 ring-white transition ${
                s.done ? "bg-honey-300 animate-popin" : "bg-leaf-50 grayscale"
              }`}
            >
              {s.emoji}
            </span>
            <span className={`mt-1 text-xs font-semibold ${s.done ? "text-leaf-800" : "text-leaf-900/40"}`}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PeopleRow({ title, people }: { title: string; people: MiniProfile[] }) {
  return (
    <div className="mt-5">
      <p className="mb-2 font-display font-semibold text-leaf-800">{title}</p>
      <div className="flex flex-wrap gap-2">
        {people.map((p, i) => (
          <Link key={`${p.username}-${i}`} href={`/profile/${p.username ?? ""}`} className="chip bg-leaf-50 py-1 pl-1 hover:bg-leaf-100">
            <Avatar url={p.avatar_url} name={p.username} size={26} />@{p.username}
          </Link>
        ))}
      </div>
    </div>
  );
}
