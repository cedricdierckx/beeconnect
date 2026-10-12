"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { isUsernameAvailable, normalizeUsername } from "@/lib/supabase/auth";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "../../components/AuthProvider";
import { useToast } from "../../components/Toaster";
import Avatar from "../../components/Avatar";
import EmptyState from "../../components/EmptyState";

export default function EditProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ username: "", full_name: "", bio: "", location: "" });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setForm({
      username: profile.username ?? "",
      full_name: profile.full_name ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
    });
    setAvatarUrl(profile.avatar_url);
  }, [profile]);

  if (loading) return null;
  if (!user) {
    return (
      <EmptyState emoji="🔒" title="Connecte-toi pour modifier ton profil">
        <Link href="/login?next=/profile/edit" className="btn-primary">Me connecter</Link>
      </EmptyState>
    );
  }

  async function changeAvatar(file: File | undefined) {
    if (!file || !user) return;
    setBusy(true);
    try {
      setAvatarUrl(await uploadImage("avatars", user.id, file, 512));
    } catch {
      setError("L'envoi de la photo a échoué.");
    }
    setBusy(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const username = normalizeUsername(form.username);
    if (username.length < 3) return setError("Ton pseudo doit faire au moins 3 caractères.");
    setBusy(true);
    setError(null);
    if (!(await isUsernameAvailable(username, user.id))) {
      setBusy(false);
      return setError(`Le pseudo @${username} est déjà pris.`);
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        full_name: form.full_name.trim() || null,
        bio: form.bio.trim() || null,
        location: form.location.trim() || null,
        avatar_url: avatarUrl,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) return setError(error.message);
    await refreshProfile();
    toast("Profil mis à jour", "🌿");
    router.push(`/profile/${username}`);
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: k === "username" ? normalizeUsername(e.target.value) : e.target.value }));

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-5 text-center text-3xl font-bold">✏️ Mon profil</h1>
      <form onSubmit={save} className="card space-y-5 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3">
          <button type="button" onClick={() => fileInput.current?.click()} className="group relative">
            <Avatar url={avatarUrl} name={form.username || user.email} size={112} />
            <span className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-honey-400 text-lg shadow transition group-hover:scale-110">
              📷
            </span>
          </button>
          <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(e) => changeAvatar(e.target.files?.[0])} />
        </div>
        <div>
          <label className="label" htmlFor="username">Pseudo</label>
          <input id="username" className="input" value={form.username} onChange={set("username")} maxLength={24} required />
        </div>
        <div>
          <label className="label" htmlFor="full_name">Nom affiché</label>
          <input id="full_name" className="input" value={form.full_name} onChange={set("full_name")} placeholder="Toi, ton école, ton asso, ta commune…" />
        </div>
        <div>
          <label className="label" htmlFor="location">📍 Mon écosystème local</label>
          <input id="location" className="input" value={form.location} onChange={set("location")} placeholder="Commune ou quartier" />
        </div>
        <div>
          <label className="label" htmlFor="bio">Bio</label>
          <textarea id="bio" className="input min-h-[100px]" value={form.bio} onChange={set("bio")} placeholder="Ce qui te fait vibrer pour la planète…" maxLength={300} />
        </div>
        {error && <p className="rounded-2xl bg-petal-100 px-4 py-3 text-sm font-semibold text-petal-500">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-lg">
          {busy ? "Un instant…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
