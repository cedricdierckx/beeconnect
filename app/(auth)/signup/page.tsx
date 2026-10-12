"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authErrorMessage, isUsernameAvailable, normalizeUsername, signUp } from "@/lib/supabase/auth";
import AuthCard from "../AuthCard";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const handle = normalizeUsername(username);
    if (handle.length < 3 || handle.length > 24)
      return setError("Ton pseudo doit faire entre 3 et 24 caractères (lettres, chiffres, « _ » ou « . »).");
    setBusy(true);
    setError(null);
    if (!(await isUsernameAvailable(handle))) {
      setBusy(false);
      return setError(`Le pseudo @${handle} est déjà pris par un autre pollinisateur.`);
    }
    const { data, error } = await signUp({ email: email.trim(), password, username: handle, fullName: fullName.trim() });
    setBusy(false);
    if (error) return setError(authErrorMessage(error.message));
    if (data.session) router.push("/feed");
    else setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title="Vérifie ta boîte mail 📬" subtitle="Plus qu'une étape avant de butiner.">
        <p className="text-leaf-900/80">
          Nous avons envoyé un lien de confirmation à <b>{email}</b>. Clique dessus pour activer ton compte, puis connecte-toi.
        </p>
        <Link href="/login" className="btn-primary mt-6 w-full">
          J&apos;ai confirmé, me connecter
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Deviens pollinisateur 🌱" subtitle="Partage tes actions, pollinise les bonnes idées, fais-les fleurir.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="username">Pseudo</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-leaf-900/40">@</span>
            <input
              id="username"
              required
              className="input pl-9"
              placeholder="abeille_joyeuse"
              value={username}
              onChange={(e) => setUsername(normalizeUsername(e.target.value))}
              maxLength={24}
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="fullName">
            Nom affiché <span className="font-normal text-leaf-900/50">(personne, école, asso, commune…)</span>
          </label>
          <input id="fullName" className="input" placeholder="École des Coquelicots" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="input"
            placeholder="6 caractères minimum"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="rounded-2xl bg-petal-100 px-4 py-3 text-sm font-semibold text-petal-500">{error}</p>}
        <button type="submit" disabled={busy} className="btn-honey w-full py-3.5 text-lg">
          {busy ? "Germination…" : "🐝 Créer mon compte"}
        </button>
      </form>
      <p className="mt-6 text-center text-leaf-900/60">
        Déjà membre ?{" "}
        <Link href="/login" className="font-semibold text-leaf-700 underline">
          Me connecter
        </Link>
      </p>
    </AuthCard>
  );
}
