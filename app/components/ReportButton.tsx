"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { useToast } from "./Toaster";

export const REPORT_REASONS = [
  { id: "spam", label: "Spam ou publicité", emoji: "📢" },
  { id: "harcelement", label: "Harcèlement ou intimidation", emoji: "😠" },
  { id: "haine", label: "Propos haineux ou discriminatoires", emoji: "🚫" },
  { id: "violence", label: "Violence ou menace", emoji: "⚠️" },
  { id: "sexuel", label: "Contenu sexuel ou choquant", emoji: "🔞" },
  { id: "vie_privee", label: "Atteinte à la vie privée (photo, infos perso)", emoji: "🙈" },
  { id: "desinformation", label: "Information fausse et dangereuse", emoji: "🧪" },
  { id: "illegal", label: "Contenu illégal", emoji: "⚖️" },
  { id: "autre", label: "Autre raison", emoji: "✏️" },
] as const;

type Target = { postId: string } | { commentId: string } | { profileId: string };

/**
 * Bouton « Signaler » (DSA art. 16, exigence Google Play) : ouvre une fenêtre de choix du
 * motif et enregistre un signalement dans `reports`. Props : une cible (`postId`,
 * `commentId` ou `profileId`), `label` pour afficher un texte à côté du drapeau.
 */
export default function ReportButton({ target, label, className = "" }: { target: Target; label?: string; className?: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  function start() {
    if (!user) return router.push(`/login?next=${encodeURIComponent(pathname)}`);
    setOpen(true);
  }

  async function submit() {
    if (!user || !reason) return;
    setBusy(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reason,
      details: details.trim() || null,
      post_id: "postId" in target ? target.postId : null,
      comment_id: "commentId" in target ? target.commentId : null,
      profile_id: "profileId" in target ? target.profileId : null,
    });
    setBusy(false);
    if (error) return toast("Le signalement n'a pas pu être envoyé. Réessaie.", "🥀");
    setOpen(false);
    setReason(null);
    setDetails("");
    toast("Merci ! Notre équipe va examiner ce signalement", "🛡️");
  }

  return (
    <>
      <button
        type="button"
        onClick={start}
        title="Signaler"
        aria-label="Signaler"
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm text-leaf-900/40 transition hover:bg-petal-100 hover:text-petal-500 ${className}`}
      >
        🚩{label && <span className="font-semibold">{label}</span>}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-leaf-900/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Signaler"
        >
          <div className="w-full max-w-md animate-popin rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold">🚩 Signaler</h2>
            <p className="mb-4 text-sm text-leaf-900/60">
              Ton signalement est confidentiel : la personne concernée ne saura pas qui l&apos;a envoyé.
            </p>
            <div className="max-h-[45vh] space-y-2 overflow-y-auto">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReason(r.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-semibold transition ${
                    reason === r.id ? "bg-petal-400 text-white" : "bg-leaf-50 text-leaf-800 hover:bg-leaf-100"
                  }`}
                >
                  <span className="text-xl">{r.emoji}</span>
                  {r.label}
                </button>
              ))}
            </div>
            <textarea
              className="input mt-3 min-h-[80px]"
              placeholder="Précisions (facultatif)"
              maxLength={1000}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost flex-1">
                Annuler
              </button>
              <button type="button" onClick={submit} disabled={!reason || busy} className="btn-primary flex-1">
                {busy ? "Envoi…" : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
