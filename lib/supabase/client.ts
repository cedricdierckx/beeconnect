import { createClient, type SupportedStorage } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Schéma Postgres des tables EarthConnect.
 * - non défini (ou "public") : projet Supabase d'origine « BeeConnect Project » ;
 * - "beeconnect" : projet partagé « CedApps Project », où EarthConnect a son schéma dédié
 *   (voir docs/DATABASE.md, section « Hébergement »).
 * Les tables sont identiques dans les deux cas : les types générés restent valables.
 */
const schema = (process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || "public") as "public";

/**
 * Clé de la session dans le navigateur, figée sur celle du projet d'origine : si le
 * projet Supabase change, les membres gardent leur session au lieu d'être déconnectés.
 * (C'est la clé que supabase-js calculait par défaut pour jcmcpkssjobqkmdopnhj.)
 */
const AUTH_STORAGE_KEY = "sb-jcmcpkssjobqkmdopnhj-auth-token";

function hostOf(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

const currentHost = hostOf(supabaseUrl);

/** Hôte de l'émetteur (`iss`) d'un jeton d'accès, ou null s'il est illisible. */
function issuerHost(accessToken: string): string | null {
  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload?.iss === "string" ? hostOf(payload.iss) : null;
  } catch {
    return null;
  }
}

/**
 * localStorage, avec une seule différence : une session dont le jeton d'accès a été émis
 * par un AUTRE projet Supabase est présentée comme expirée. supabase-js la renouvelle
 * alors avec son jeton de rafraîchissement auprès du projet actuel (copié lors de la
 * migration) avant toute requête — ou, à défaut, déconnecte proprement. Sans changement
 * de projet, l'émetteur correspond et rien ne change.
 */
const browserStorage: SupportedStorage = {
  getItem(key) {
    const raw = window.localStorage.getItem(key);
    if (!raw || !currentHost) return raw;
    try {
      const session = JSON.parse(raw);
      if (session && typeof session.access_token === "string") {
        const host = issuerHost(session.access_token);
        if (host && host !== currentHost) return JSON.stringify({ ...session, expires_at: 0 });
      }
    } catch {
      // Valeur non-JSON (ex. vérificateur PKCE) : rendue telle quelle.
    }
    return raw;
  },
  setItem: (key, value) => window.localStorage.setItem(key, value),
  removeItem: (key) => window.localStorage.removeItem(key),
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: { schema },
  auth: {
    storageKey: AUTH_STORAGE_KEY,
    storage: typeof window !== "undefined" ? browserStorage : undefined,
  },
});
