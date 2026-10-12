"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authErrorMessage, resendConfirmation, signIn } from "@/lib/supabase/auth";
import AuthCard from "../AuthCard";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/feed";
  const expiredLink = params.get("lien") === "expire";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resent, setResent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) {
      setUnconfirmed(error.message.toLowerCase().includes("email not confirmed"));
      return setError(authErrorMessage(error.message));
    }
    router.push(next.startsWith("/") ? next : "/feed");
  }

  async function resend() {
    if (!email.trim()) return setError("Indique ton e-mail ci-dessus pour recevoir un nouveau lien.");
    setBusy(true);
    const { error } = await resendConfirmation(email.trim());
    setBusy(false);
    if (error) return setError(authErrorMessage(error.message));
    setError(null);
    setResent(true);
  }

  return (
    <AuthCard title="Bon retour ! 🐝" subtitle="Les graines de ton écosystème t'attendent.">
      {expiredLink && !resent && (
        <p className="mb-4 rounded-2xl bg-honey-50 px-4 py-3 text-sm text-leaf-800 ring-1 ring-honey-200">
          🕰️ Ce lien de confirmation a expiré ou a déjà été utilisé. Ton adresse est peut-être déjà confirmée :
          essaie de te connecter. Sinon, demande un nouveau lien ci-dessous.
        </p>
      )}
      {resent && (
        <p className="mb-4 rounded-2xl bg-leaf-50 px-4 py-3 text-sm font-semibold text-leaf-700">
          📬 Nouveau lien envoyé à {email}. Pense à vérifier tes indésirables.
        </p>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="password">Mot de passe</label>
          <input id="password" type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="rounded-2xl bg-petal-100 px-4 py-3 text-sm font-semibold text-petal-500">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-lg">
          {busy ? "Connexion…" : "Me connecter"}
        </button>
        {(unconfirmed || expiredLink) && !resent && (
          <button type="button" onClick={resend} disabled={busy} className="btn-ghost w-full">
            📨 Renvoyer l&apos;e-mail de confirmation
          </button>
        )}
      </form>
      <p className="mt-6 text-center text-leaf-900/60">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-semibold text-leaf-700 underline">
          Rejoindre EarthConnect
        </Link>
      </p>
    </AuthCard>
  );
}
