"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { signOut } from "@/lib/supabase/auth";
import { deleteMyAccount, downloadJson, exportMyData } from "@/lib/account";
import { LEGAL, LEGAL_PAGES, contactEmail } from "@/lib/legal";
import { useAuth } from "../components/AuthProvider";
import { useToast } from "../components/Toaster";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";

type BlockedProfile = { id: string; username: string | null; avatar_url: string | null };

export default function SettingsPage() {
  const { user, profile, loading, blocked, refreshBlocks } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [blockedProfiles, setBlockedProfiles] = useState<BlockedProfile[]>([]);
  const [exporting, setExporting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const blockedKey = [...blocked].join(",");

  useEffect(() => {
    const ids = blockedKey ? blockedKey.split(",") : [];
    if (ids.length === 0) return setBlockedProfiles([]);
    supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", ids)
      .then(({ data }) => setBlockedProfiles(data ?? []));
  }, [blockedKey]);

  if (loading) return null;
  if (!user) {
    return (
      <EmptyState emoji="⚙️" title="Connecte-toi pour accéder à tes paramètres">
        <Link href="/login?next=/settings" className="btn-primary">
          Me connecter
        </Link>
      </EmptyState>
    );
  }

  const handle = profile?.username ?? "";
  const confirmWord = handle || "supprimer";
  const email = contactEmail();

  async function exportData() {
    if (!user) return;
    setExporting(true);
    try {
      downloadJson(`earthconnect-${handle || user.id}.json`, await exportMyData(user.id));
      toast("Tes données sont téléchargées", "📦");
    } catch {
      toast("L'export a échoué, réessaie.", "🥀");
    }
    setExporting(false);
  }

  async function unblock(id: string) {
    if (!user) return;
    await supabase.from("blocks").delete().eq("blocker_id", user.id).eq("blocked_id", id);
    await refreshBlocks();
  }

  async function removeAccount() {
    if (!user) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMyAccount(user.id);
      toast("Ton compte a été supprimé. Merci d'avoir butiné avec nous !", "🍂");
      router.push("/");
    } catch {
      setDeleteError(
        email
          ? `La suppression n'a pas pu aboutir. Écris-nous à ${email} : nous supprimerons ton compte sous 30 jours.`
          : "La suppression n'a pas pu aboutir. Réessaie plus tard ou contacte-nous.",
      );
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-center text-3xl font-bold">⚙️ Paramètres</h1>

      <section className="card p-6">
        <div className="flex items-center gap-4">
          <Avatar url={profile?.avatar_url} name={handle || user.email} size={56} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold">@{handle}</p>
            <p className="truncate text-sm text-leaf-900/60">{user.email}</p>
          </div>
          <Link href="/profile/edit" className="btn-ghost text-sm">
            ✏️ Profil
          </Link>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-bold">📦 Mes données</h2>
        <p className="mb-4 mt-1 text-sm text-leaf-900/60">
          Télécharge une copie de tout ce que {LEGAL.appName} conserve sur toi (profil, publications, commentaires,
          interactions), au format JSON.
        </p>
        <button onClick={exportData} disabled={exporting} className="btn-ghost">
          {exporting ? "Préparation…" : "⬇️ Télécharger mes données"}
        </button>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-bold">🚫 Membres bloqués</h2>
        {blockedProfiles.length === 0 ? (
          <p className="mt-1 text-sm text-leaf-900/60">Tu n&apos;as bloqué personne.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {blockedProfiles.map((b) => (
              <li key={b.id} className="flex items-center gap-3 rounded-2xl bg-leaf-50 p-3">
                <Avatar url={b.avatar_url} name={b.username} size={36} />
                <span className="flex-1 font-semibold">@{b.username}</span>
                <button onClick={() => unblock(b.id)} className="btn-ghost py-1.5 text-sm">
                  Débloquer
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-bold">⚖️ Informations légales</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {LEGAL_PAGES.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="flex items-center gap-2 rounded-2xl bg-leaf-50 px-4 py-3 font-semibold text-leaf-800 hover:bg-leaf-100">
                {p.emoji} {p.label}
              </Link>
            </li>
          ))}
        </ul>
        {email && (
          <p className="mt-3 text-sm text-leaf-900/60">
            Une question ? <a href={`mailto:${email}`} className="font-semibold text-leaf-700 underline">{email}</a>
          </p>
        )}
      </section>

      <button
        onClick={async () => {
          await signOut();
          router.push("/");
        }}
        className="btn-ghost w-full"
      >
        👋 Me déconnecter
      </button>

      <section className="card border-2 border-petal-300 p-6">
        <h2 className="text-xl font-bold text-petal-500">🗑️ Supprimer mon compte</h2>
        <p className="mt-1 text-sm text-leaf-900/70">
          Ton compte, ton profil, tes graines, floraisons, photos, commentaires et interactions seront{" "}
          <strong>définitivement effacés</strong>. Cette action est irréversible.{" "}
          <Link href="/legal/suppression-compte" className="font-semibold underline">
            En savoir plus
          </Link>
        </p>
        <label className="label mt-4" htmlFor="confirm-delete">
          Pour confirmer, tape {handle ? "ton pseudo" : "le mot"} : <span className="font-mono">{confirmWord}</span>
        </label>
        <input
          id="confirm-delete"
          className="input"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
        />
        {deleteError && <p className="mt-3 rounded-2xl bg-petal-100 px-4 py-3 text-sm font-semibold text-petal-500">{deleteError}</p>}
        <button
          onClick={removeAccount}
          disabled={deleting || confirmText.trim().toLowerCase() !== confirmWord}
          className="btn mt-4 w-full bg-petal-500 text-white shadow-[0_4px_0_0_#A3204F] hover:bg-petal-400"
        >
          {deleting ? "Suppression…" : "Supprimer définitivement"}
        </button>
      </section>
    </div>
  );
}
