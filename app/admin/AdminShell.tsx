"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../components/AuthProvider";
import EmptyState from "../components/EmptyState";

export const ADMIN_SECTIONS = [
  { href: "/admin", label: "Vue d'ensemble", emoji: "🧭", exact: true },
  { href: "/admin/developpement", label: "Développement du réseau", emoji: "🚀", exact: false },
];

/**
 * Coquille de l'espace administrateurs : vérifie le rôle (la protection réelle des données
 * est assurée par les politiques RLS, ceci n'est que l'expérience utilisateur) et affiche
 * les onglets de l'espace.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="card h-28 animate-pulse bg-leaf-50" />
        <div className="card h-64 animate-pulse bg-white" />
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState emoji="🛠️" title="Espace administrateurs" text="Connecte-toi avec un compte administrateur pour continuer.">
        <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="btn-primary">
          Me connecter
        </Link>
      </EmptyState>
    );
  }

  if (!isAdmin) {
    return (
      <EmptyState
        emoji="🔒"
        title="Cet espace est réservé aux administrateurs"
        text="Ton compte n'a pas le rôle administrateur. Un administrateur se désigne dans la console Supabase (table admins) : voir docs/DATABASE.md."
      >
        <Link href="/feed" className="btn-ghost">
          Retour au fil
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-leaf-800 text-2xl text-white shadow-soft">🛠️</span>
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-leaf-700">Espace administrateurs</p>
            <p className="text-xs text-leaf-900/60">Visible uniquement par les membres de la table admins.</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-1" aria-label="Sections de l'espace administrateurs">
          {ADMIN_SECTIONS.map((s) => {
            const active = s.exact ? pathname === s.href : pathname.startsWith(s.href);
            return (
              <Link
                key={s.href}
                href={s.href}
                aria-current={active ? "page" : undefined}
                className={`chip px-4 py-2 font-display ${active ? "bg-leaf-800 text-white" : "bg-white text-leaf-800/80 ring-1 ring-leaf-900/10 hover:bg-leaf-50"}`}
              >
                <span>{s.emoji}</span> {s.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
