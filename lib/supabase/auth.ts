import { supabase } from "./client";
import { LEGAL } from "../legal";

/** Traduit les erreurs Supabase Auth les plus courantes en messages lisibles. */
export function authErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou mot de passe incorrect.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Un compte existe déjà avec cet e-mail.";
  if (m.includes("email not confirmed"))
    return "Confirme d'abord ton adresse e-mail grâce au lien reçu par mail.";
  if (m.includes("password should be at least"))
    return "Le mot de passe doit contenir au moins 6 caractères.";
  if (m.includes("rate limit")) return "Trop de tentatives : réessaie dans quelques minutes.";
  if (m.includes("database error saving new user"))
    return "Ce pseudo est peut-être déjà pris : essaie-en un autre.";
  return message;
}

export async function signUp(params: {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}) {
  return supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        username: params.username,
        full_name: params.fullName || null,
        // Preuve de l'acceptation des conditions et de l'âge minimum (RGPD art. 7.1).
        terms_version: LEGAL.termsVersion,
        terms_accepted_at: new Date().toISOString(),
      },
      emailRedirectTo:
        typeof window !== "undefined" ? `${window.location.origin}/feed` : undefined,
    },
  });
}

/** Renvoie l'e-mail de confirmation d'inscription. */
export async function resendConfirmation(email: string) {
  return supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/feed` : undefined,
    },
  });
}

/** Envoie l'e-mail « mot de passe oublié » (modèle supabase/templates/recovery.html). */
export async function requestPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset/update` : undefined,
  });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Un pseudo valide : 3 à 24 caractères, lettres minuscules, chiffres, « _ » ou « . ». */
export function normalizeUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9_.]/g, "");
}

export async function isUsernameAvailable(username: string, exceptId?: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  return !data || data.id === exceptId;
}
