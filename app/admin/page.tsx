"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { formatCount } from "@/lib/earth";
import type { Funnel } from "@/lib/growth";
import Avatar from "../components/Avatar";
import { ADMIN_SECTIONS } from "./AdminShell";

type AdminRow = {
  user_id: string;
  note: string | null;
  created_at: string;
  profile: { username: string | null; full_name: string | null; avatar_url: string | null } | null;
};

type Health = { healthy: boolean; results: Record<string, string> } | null;

const ADMIN_SQL = `insert into public.admins (user_id, note)
select id, 'éditeur' from auth.users where email = 'adresse@exemple.be';`;

export default function AdminHome() {
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [health, setHealth] = useState<Health>(null);
  const [healthError, setHealthError] = useState(false);

  useEffect(() => {
    supabase
      .from("growth_funnel")
      .select("*")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setDbError(error.message);
        setFunnel(data);
      });
    supabase
      .from("admins")
      .select("user_id, note, created_at, profile:profiles(username, full_name, avatar_url)")
      .order("created_at")
      .then(({ data }) => setAdmins((data ?? []) as AdminRow[]));
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealthError(true));
  }, []);

  const failing = health ? Object.entries(health.results).filter(([, v]) => v !== "ok") : [];

  return (
    <div className="space-y-6">
      <header className="card relative overflow-hidden bg-gradient-to-br from-leaf-700 to-leaf-900 p-6 text-white sm:p-8">
        <span className="absolute -right-4 -top-4 animate-float text-8xl opacity-20">🧭</span>
        <h1 className="text-3xl font-bold sm:text-4xl">Vue d&apos;ensemble</h1>
        <p className="mt-2 max-w-2xl text-white/80">
          L&apos;état du jardin en un coup d&apos;œil. Pour faire grandir le réseau et son impact, passe par{" "}
          <Link href="/admin/developpement" className="font-semibold text-honey-300 underline">
            Développement du réseau
          </Link>
          .
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Tile emoji="👥" label="membres" value={funnel?.members} />
          <Tile emoji="🆕" label="inscrits (7 j)" value={funnel?.new_7d} />
          <Tile emoji="⚡" label="actifs (7 j)" value={funnel?.active_7d} />
          <Tile emoji="🌱" label="graines" value={funnel?.seeds} />
          <Tile emoji="🌸" label="floraisons" value={funnel?.blooms} />
          <Tile emoji="🚩" label="signalements ouverts" value={funnel?.open_reports} alert={(funnel?.open_reports ?? 0) > 0} />
        </div>
      </header>

      {dbError && (
        <div className="card border-l-8 border-honey-400 p-5">
          <h2 className="text-lg font-bold">⚠️ Base de données à mettre à jour</h2>
          <p className="mt-1 text-sm text-leaf-900/70">
            La vue <code className="rounded bg-leaf-50 px-1">growth_funnel</code> est introuvable ou inaccessible (
            {dbError}). Applique la migration{" "}
            <code className="rounded bg-leaf-50 px-1">supabase/migrations/20261019100000_earthconnect_admin_space.sql</code>{" "}
            dans l&apos;éditeur SQL de la console Supabase, puis recharge cette page.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-2xl font-bold">🗂️ Sections</h2>
          <ul className="mt-4 space-y-3">
            {ADMIN_SECTIONS.filter((s) => !s.exact).map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="flex items-center gap-3 rounded-2xl bg-leaf-50 p-4 transition hover:bg-leaf-100">
                  <span className="text-3xl">{s.emoji}</span>
                  <div className="flex-1">
                    <p className="font-display font-semibold">{s.label}</p>
                    <p className="text-sm text-leaf-900/60">
                      Objectifs, pouls du réseau, parcours des membres, diagnostic et plan d&apos;actions.
                    </p>
                  </div>
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
            <li className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-leaf-900/5">
              <span className="text-3xl">🚩</span>
              <div className="flex-1">
                <p className="font-display font-semibold">Signalements</p>
                <p className="text-sm text-leaf-900/60">
                  {funnel?.open_reports ? `${funnel.open_reports} en attente. ` : "Aucun en attente. "}
                  Traitement dans la console Supabase (table <code>reports</code>, statut <code>open</code>).
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="text-2xl font-bold">🩺 Santé technique</h2>
          <p className="mb-3 text-sm text-leaf-900/60">
            Chaque forme de requête utilisée par l&apos;appli est testée (<code>/api/health</code>).
          </p>
          {healthError ? (
            <p className="rounded-2xl bg-petal-100 px-4 py-3 text-sm font-semibold text-petal-500">
              Le diagnostic n&apos;a pas répondu.
            </p>
          ) : !health ? (
            <p className="text-leaf-900/50">Diagnostic en cours…</p>
          ) : health.healthy ? (
            <p className="rounded-2xl bg-leaf-50 px-4 py-3 text-sm font-semibold text-leaf-700">
              ✅ Toutes les requêtes répondent ({Object.keys(health.results).length} vérifications).
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {failing.map(([name, msg]) => (
                <li key={name} className="rounded-2xl bg-petal-100 px-4 py-3 text-petal-500">
                  <b className="font-display">{name}</b> : {msg}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-leaf-900/50">
            Si une vue <code>growth_*</code> manque, la migration de l&apos;espace administrateurs n&apos;est pas encore
            appliquée.
          </p>
        </section>
      </div>

      <section className="card p-6">
        <h2 className="text-2xl font-bold">🛡️ Administrateurs</h2>
        <p className="mb-4 text-sm text-leaf-900/60">
          Les administrateurs sont désignés par l&apos;éditeur dans la console Supabase, jamais depuis l&apos;appli.
        </p>
        {admins.length === 0 ? (
          <p className="text-leaf-900/50">Liste indisponible.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {admins.map((a) => (
              <li key={a.user_id} className="flex items-center gap-3 rounded-2xl bg-leaf-50 p-3">
                <Avatar url={a.profile?.avatar_url} name={a.profile?.username} size={40} />
                <div className="min-w-0">
                  <p className="truncate font-display font-semibold">
                    {a.profile?.full_name || (a.profile?.username ? `@${a.profile.username}` : "Membre")}
                  </p>
                  <p className="text-xs text-leaf-900/60">{a.note ?? "administrateur"}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <details className="mt-4 rounded-2xl bg-honey-50 p-4 text-sm">
          <summary className="cursor-pointer font-display font-semibold text-leaf-800">Désigner un administrateur</summary>
          <p className="mt-2 text-leaf-900/70">
            Console Supabase → SQL Editor, en remplaçant l&apos;adresse par celle du compte EarthConnect concerné :
          </p>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-white p-3 text-xs">{ADMIN_SQL}</pre>
          <p className="mt-2 text-leaf-900/70">
            Pour retirer le rôle : <code>delete from public.admins where user_id = &apos;…&apos;;</code>
          </p>
        </details>
      </section>
    </div>
  );
}

function Tile({ emoji, label, value, alert = false }: { emoji: string; label: string; value: number | null | undefined; alert?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 text-center backdrop-blur ${alert ? "bg-petal-400/30 ring-2 ring-petal-300" : "bg-white/10"}`}>
      <div className="text-xl">{emoji}</div>
      <div className="font-display text-2xl font-bold">{value === undefined || value === null ? "…" : formatCount(value)}</div>
      <div className="text-[11px] font-semibold text-white/70">{label}</div>
    </div>
  );
}
