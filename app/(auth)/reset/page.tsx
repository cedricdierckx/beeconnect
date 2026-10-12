"use client";

import { useState } from "react";
import Link from "next/link";
import { authErrorMessage, requestPasswordReset } from "@/lib/supabase/auth";
import AuthCard from "../AuthCard";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await requestPasswordReset(email.trim());
    setBusy(false);
    if (error) return setError(authErrorMessage(error.message));
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title="Regarde ta boîte mail 📬" subtitle="Le lien est en route.">
        <p className="text-leaf-900/80">
          Si un compte existe pour <b>{email}</b>, tu vas recevoir un lien pour choisir un nouveau mot de passe. Pense à
          vérifier tes indésirables.
        </p>
        <Link href="/login" className="btn-ghost mt-6 w-full">Retour à la connexion</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Mot de passe oublié ? 🔑" subtitle="Ça arrive même aux meilleures abeilles.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">E-mail de ton compte</label>
          <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {error && <p className="rounded-2xl bg-petal-100 px-4 py-3 text-sm font-semibold text-petal-500">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-lg">
          {busy ? "Envoi…" : "M'envoyer un lien"}
        </button>
      </form>
      <p className="mt-6 text-center text-leaf-900/60">
        <Link href="/login" className="font-semibold text-leaf-700 underline">Retour à la connexion</Link>
      </p>
    </AuthCard>
  );
}
