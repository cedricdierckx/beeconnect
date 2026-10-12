"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authErrorMessage, signIn } from "@/lib/supabase/auth";
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
  const next = useSearchParams().get("next") || "/feed";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) return setError(authErrorMessage(error.message));
    router.push(next.startsWith("/") ? next : "/feed");
  }

  return (
    <AuthCard title="Bon retour ! 🐝" subtitle="Les graines de ton écosystème t'attendent.">
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
