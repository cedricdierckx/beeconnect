"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/supabase/auth";
import { useAuth } from "../../../components/AuthProvider";
import { useToast } from "../../../components/Toaster";
import AuthCard from "../../AuthCard";

export default function UpdatePasswordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return null;
  if (!user) {
    return (
      <AuthCard title="Lien nécessaire 🔑" subtitle="Ouvre d'abord le lien reçu par e-mail.">
        <Link href="/reset" className="btn-primary w-full">Recevoir un lien</Link>
      </AuthCard>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return setError("Le mot de passe doit contenir au moins 6 caractères.");
    if (password !== confirm) return setError("Les deux mots de passe ne correspondent pas.");
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(authErrorMessage(error.message));
    toast("Mot de passe enregistré", "🔑");
    router.push("/feed");
  }

  return (
    <AuthCard title="Ton nouveau mot de passe 🌿" subtitle={`Pour le compte ${user.email}`}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="password">Nouveau mot de passe</label>
          <input id="password" type="password" required minLength={6} autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Confirme-le</label>
          <input id="confirm" type="password" required minLength={6} autoComplete="new-password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error && <p className="rounded-2xl bg-petal-100 px-4 py-3 text-sm font-semibold text-petal-500">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-lg">
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </AuthCard>
  );
}
