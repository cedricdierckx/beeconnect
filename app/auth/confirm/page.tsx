"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "../../components/AuthProvider";
import { useToast } from "../../components/Toaster";
import AuthCard from "../../(auth)/AuthCard";

const TYPES: EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

const COPY: Record<string, { title: string; text: string; button: string; done: string }> = {
  email: {
    title: "Une dernière pollinisation 🐝",
    text: "Confirme ton adresse e-mail pour entrer dans le jardin EarthConnect.",
    button: "🌸 Confirmer mon adresse",
    done: "Adresse confirmée, bienvenue dans le jardin !",
  },
  recovery: {
    title: "Nouveau mot de passe 🔑",
    text: "Clique pour vérifier ton lien, puis choisis ton nouveau mot de passe.",
    button: "🔑 Continuer",
    done: "Lien vérifié : choisis ton nouveau mot de passe",
  },
  invite: {
    title: "Bienvenue parmi nous 💌",
    text: "Accepte l'invitation, puis choisis ton mot de passe.",
    button: "🌱 Accepter l'invitation",
    done: "Invitation acceptée !",
  },
  email_change: {
    title: "Nouvelle adresse 📬",
    text: "Confirme le changement d'adresse e-mail de ton compte.",
    button: "📬 Confirmer ma nouvelle adresse",
    done: "Nouvelle adresse confirmée",
  },
};

/**
 * Atterrissage des liens d'e-mails (voir supabase/templates/). La vérification n'a lieu
 * qu'au clic : un antivirus qui pré-ouvre le lien ne consomme donc pas le jeton.
 */
export default function ConfirmPage() {
  return (
    <Suspense fallback={null}>
      <Confirm />
    </Suspense>
  );
}

function Confirm() {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { refreshProfile } = useAuth();
  const tokenHash = params.get("token_hash");
  const rawType = params.get("type") as EmailOtpType | null;
  const type = rawType && TYPES.includes(rawType) ? rawType : null;
  const next = params.get("next");
  const copy = COPY[type === "signup" || type === "magiclink" ? "email" : type ?? "email"] ?? COPY.email;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!tokenHash || !type) {
    return (
      <AuthCard title="Lien incomplet 🥀" subtitle="Ce lien de confirmation semble abîmé.">
        <Link href="/login" className="btn-primary w-full">Aller à la connexion</Link>
      </AuthCard>
    );
  }

  async function confirm() {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type! });
    setBusy(false);
    if (error) {
      setError(
        "Ce lien a expiré ou a déjà été utilisé. Si ton adresse est déjà confirmée, connecte-toi simplement ; sinon, demande un nouveau lien.",
      );
      return;
    }
    await refreshProfile();
    toast(copy.done, "🌸");
    const fallback = type === "recovery" || type === "invite" ? "/reset/update" : "/feed";
    router.push(next && next.startsWith("/") ? next : fallback);
  }

  return (
    <AuthCard title={copy.title} subtitle={copy.text}>
      {error ? (
        <>
          <p className="rounded-2xl bg-petal-100 px-4 py-3 text-sm font-semibold text-petal-500">{error}</p>
          <Link href="/login?lien=expire" className="btn-primary mt-5 w-full">
            Me connecter ou renvoyer un lien
          </Link>
        </>
      ) : (
        <button onClick={confirm} disabled={busy} className="btn-honey w-full py-4 text-lg">
          {busy ? "Vérification…" : copy.button}
        </button>
      )}
    </AuthCard>
  );
}
