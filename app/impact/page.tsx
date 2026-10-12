/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { formatCount, getCategory, levelFor, pollenPoints } from "@/lib/earth";
import type { Tables } from "@/lib/supabase/database.types";
import Avatar from "../components/Avatar";
import FollowButton from "../components/FollowButton";

type Meadow = {
  id: string;
  title: string | null;
  content: string;
  image_url: string | null;
  category: string | null;
  stats: { blooms_count: number; pollinations_count: number } | null;
};
type Pollinator = Tables<"profile_stats"> & { profile: { username: string | null; full_name: string | null; avatar_url: string | null; location: string | null } | null };

export default function ImpactPage() {
  const [global, setGlobal] = useState<Tables<"global_stats"> | null>(null);
  const [ecosystems, setEcosystems] = useState<Tables<"ecosystem_stats">[]>([]);
  const [categories, setCategories] = useState<Tables<"category_stats">[]>([]);
  const [meadows, setMeadows] = useState<Meadow[]>([]);
  const [pollinators, setPollinators] = useState<Pollinator[]>([]);

  useEffect(() => {
    supabase.from("global_stats").select("*").maybeSingle().then(({ data }) => setGlobal(data));
    supabase
      .from("ecosystem_stats")
      .select("*")
      .order("blooms_count", { ascending: false })
      .order("seeds_count", { ascending: false })
      .limit(8)
      .then(({ data }) => setEcosystems(data ?? []));
    supabase
      .from("category_stats")
      .select("*")
      .order("seeds_count", { ascending: false })
      .then(({ data }) => setCategories(data ?? []));
    supabase
      .from("post_stats")
      .select("blooms_count, pollinations_count, post:posts!inner(id, title, content, image_url, category, kind)")
      .eq("post.kind", "seed")
      .order("blooms_count", { ascending: false })
      .order("pollinations_count", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        const rows = (data ?? []) as unknown as { blooms_count: number; pollinations_count: number; post: Omit<Meadow, "stats"> }[];
        setMeadows(rows.map((r) => ({ ...r.post, stats: { blooms_count: r.blooms_count, pollinations_count: r.pollinations_count } })));
      });
    (async () => {
      const { data } = await supabase
        .from("profile_stats")
        .select("*")
        .order("blooms_inspired", { ascending: false })
        .order("pollinations_given", { ascending: false })
        .limit(30);
      const score = (r: Tables<"profile_stats">) =>
        pollenPoints({
          seeds_count: r.seeds_count ?? 0,
          blooms_count: r.blooms_count ?? 0,
          pollinations_given: r.pollinations_given ?? 0,
          intentions_count: r.intentions_count ?? 0,
          blooms_inspired: r.blooms_inspired ?? 0,
        });
      const top = (data ?? []).filter((r) => score(r) > 0).sort((a, b) => score(b) - score(a)).slice(0, 6);
      const ids = top.map((r) => r.profile_id).filter((id): id is string => Boolean(id));
      if (ids.length === 0) return setPollinators([]);
      const { data: people } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, location")
        .in("id", ids);
      const byId = new Map((people ?? []).map((p) => [p.id, p]));
      setPollinators(top.map((r) => ({ ...r, profile: byId.get(r.profile_id ?? "") ?? null })));
    })();
  }, []);

  const maxCat = Math.max(1, ...categories.map((c) => (c.seeds_count ?? 0) + (c.blooms_count ?? 0)));

  return (
    <div className="space-y-8">
      <header className="card relative overflow-hidden bg-gradient-to-br from-leaf-600 to-leaf-800 p-8 text-white">
        <span className="absolute -right-6 -top-6 animate-float text-8xl opacity-30">🌻</span>
        <h1 className="text-4xl font-bold">Jusqu&apos;où voyagent les bonnes idées 🌍</h1>
        <p className="mt-2 max-w-2xl text-white/80">
          Ne mesurez plus seulement combien de personnes aiment une idée. Mesurez jusqu&apos;où elle voyage et combien
          d&apos;actions elle fait naître.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Big emoji="🌱" value={global?.seeds_count} label="graines plantées" />
          <Big emoji="👀" value={global?.views_count} label="personnes touchées" />
          <Big emoji="🐝" value={global?.pollinations_count} label="pollinisations" />
          <Big emoji="🧑‍🌾" value={global?.intentions_count} label="se sont lancés" />
          <Big emoji="🌸" value={global?.blooms_count} label="floraisons" />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-2xl font-bold">🏡 Écosystèmes locaux</h2>
          <p className="mb-4 text-sm text-leaf-900/60">Communes et quartiers où les initiatives prennent racine.</p>
          {ecosystems.length === 0 ? (
            <p className="text-leaf-900/50">Indique un lieu sur tes graines pour faire apparaître ton écosystème ici.</p>
          ) : (
            <ol className="space-y-3">
              {ecosystems.map((e, i) => (
                <li key={e.location} className="flex items-center gap-3 rounded-2xl bg-leaf-50 p-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white font-display font-bold">
                    {["🥇", "🥈", "🥉"][i] ?? i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-display font-semibold">📍 {e.location}</p>
                    <p className="text-xs text-leaf-900/60">
                      {e.members_count} membre{(e.members_count ?? 0) > 1 ? "s" : ""} · 🌱 {e.seeds_count} · 🐝 {e.pollinations_count} · 🌸{" "}
                      {e.blooms_count}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
          {ecosystems[0] && (ecosystems[0].blooms_count ?? 0) > 0 && (
            <p className="mt-4 rounded-2xl bg-honey-50 p-4 text-sm italic text-leaf-800">
              « Les initiatives de {ecosystems[0].location} ont été pollinisées {ecosystems[0].pollinations_count} fois et ont
              donné naissance à {ecosystems[0].blooms_count} nouvelle{(ecosystems[0].blooms_count ?? 0) > 1 ? "s" : ""} action
              {(ecosystems[0].blooms_count ?? 0) > 1 ? "s" : ""} citoyenne{(ecosystems[0].blooms_count ?? 0) > 1 ? "s" : ""}. »
            </p>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-2xl font-bold">📊 Catégories les plus dynamiques</h2>
          <p className="mb-4 text-sm text-leaf-900/60">Graines et floraisons par type d&apos;action.</p>
          {categories.length === 0 ? (
            <p className="text-leaf-900/50">Les premières graines dessineront ce graphique.</p>
          ) : (
            <ul className="space-y-3">
              {categories.map((c) => {
                const cat = getCategory(c.category);
                const seeds = c.seeds_count ?? 0;
                const blooms = c.blooms_count ?? 0;
                return (
                  <li key={c.category}>
                    <div className="mb-1 flex justify-between text-sm font-semibold">
                      <span>
                        {cat.emoji} {cat.label}
                      </span>
                      <span className="text-leaf-900/50">
                        🌱 {seeds} · 🌸 {blooms}
                      </span>
                    </div>
                    <div className="flex h-3 overflow-hidden rounded-full bg-leaf-50">
                      <div className="bg-leaf-400" style={{ width: `${(seeds / maxCat) * 100}%` }} />
                      <div className="bg-petal-300" style={{ width: `${(blooms / maxCat) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section>
        <h2 className="text-2xl font-bold">🌼 Prairies d&apos;impact</h2>
        <p className="mb-4 text-sm text-leaf-900/60">Les graines qui ont fait naître le plus de réalisations.</p>
        {meadows.length === 0 ? (
          <p className="card p-6 text-leaf-900/50">Aucune graine encore : <Link href="/new" className="font-semibold text-leaf-700 underline">plante la première</Link> !</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {meadows.map((m) => {
              const cat = getCategory(m.category);
              return (
                <Link key={m.id} href={`/seed/${m.id}`} className="card overflow-hidden transition hover:-translate-y-1">
                  {m.image_url ? (
                    <img src={m.image_url} alt="" className="aspect-video w-full object-cover" />
                  ) : (
                    <div className={`grid aspect-video place-items-center text-6xl ${cat.tone}`}>{cat.emoji}</div>
                  )}
                  <div className="p-4">
                    <p className="line-clamp-2 font-display font-semibold">{m.title ?? m.content}</p>
                    <p className="mt-1 text-sm text-leaf-900/60">
                      🌸 {m.stats?.blooms_count ?? 0} floraisons · 🐝 {m.stats?.pollinations_count ?? 0}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold">🐝 Grands pollinisateurs</h2>
        <p className="mb-4 text-sm text-leaf-900/60">Ceux qui transforment l&apos;inspiration en mobilisation collective.</p>
        {pollinators.length === 0 ? (
          <p className="card p-6 text-leaf-900/50">Le podium attend ses premiers pollinisateurs.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pollinators.map((p) => {
              const { current } = levelFor(
                pollenPoints({
                  seeds_count: p.seeds_count ?? 0,
                  blooms_count: p.blooms_count ?? 0,
                  pollinations_given: p.pollinations_given ?? 0,
                  intentions_count: p.intentions_count ?? 0,
                  blooms_inspired: p.blooms_inspired ?? 0,
                }),
              );
              return (
                <div key={p.profile_id} className="card flex items-center gap-3 p-4">
                  <Link href={`/profile/${p.profile?.username ?? ""}`}>
                    <Avatar url={p.profile?.avatar_url} name={p.profile?.username} size={52} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/profile/${p.profile?.username ?? ""}`} className="block truncate font-display font-semibold hover:underline">
                      {p.profile?.full_name || `@${p.profile?.username}`}
                    </Link>
                    <p className="text-xs text-leaf-900/60">
                      {current.emoji} {current.name} · ✨ {p.blooms_inspired} inspirées
                    </p>
                  </div>
                  {p.profile_id && <FollowButton profileId={p.profile_id} />}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Big({ emoji, value, label }: { emoji: string; value: number | null | undefined; label: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur">
      <div className="text-2xl">{emoji}</div>
      <div className="font-display text-3xl font-bold">{value === undefined ? "…" : formatCount(value ?? 0)}</div>
      <div className="text-xs font-semibold text-white/70">{label}</div>
    </div>
  );
}
