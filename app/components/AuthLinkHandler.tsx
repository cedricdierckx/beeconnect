"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toaster";

const MESSAGES: Record<string, string> = {
  otp_expired: "Ce lien a expiré ou a déjà servi. Si ton adresse est déjà confirmée, connecte-toi simplement.",
  access_denied: "Le lien de confirmation n'est plus valide. Connecte-toi ou demande un nouvel e-mail.",
};

/**
 * Interprète le fragment d'URL renvoyé par Supabase Auth après un clic sur un lien
 * d'e-mail (`#access_token=…` en cas de succès, `#error=…&error_code=…` sinon).
 * La session elle-même est récupérée automatiquement par supabase-js.
 */
export default function AuthLinkHandler() {
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const clean = () => window.history.replaceState(null, "", window.location.pathname + window.location.search);

    if (params.get("error")) {
      const code = params.get("error_code") ?? params.get("error") ?? "";
      clean();
      toast(MESSAGES[code] ?? "Le lien n'a pas fonctionné. Réessaie de te connecter.", "🥀");
      router.push("/login?lien=expire");
    } else if (params.get("access_token")) {
      const type = params.get("type");
      // Laisse supabase-js lire le jeton avant de nettoyer l'URL.
      setTimeout(clean, 500);
      if (type === "recovery" || type === "invite") {
        toast("Lien vérifié : choisis ton mot de passe", "🔑");
        router.push("/reset/update");
        return;
      }
      toast(type === "signup" ? "Adresse confirmée, bienvenue dans le jardin !" : "Te voilà connecté !", "🌸");
      if (window.location.pathname === "/") router.push("/feed");
    }
  }, [router, toast]);

  return null;
}
