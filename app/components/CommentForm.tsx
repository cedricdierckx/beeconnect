"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import Avatar from "./Avatar";

/** Ajoute un commentaire. Props : `postId`, `onAdded` (rappel après insertion). */
export default function CommentForm({ postId, onAdded }: { postId: string; onAdded?: () => void }) {
  const { user, profile } = useAuth();
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <p className="rounded-2xl bg-leaf-50 p-4 text-center text-leaf-900/70">
        <Link href={`/login?next=/seed/${postId}`} className="font-semibold text-leaf-700 underline">
          Connecte-toi
        </Link>{" "}
        pour encourager l&apos;auteur ou poser une question.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !content.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("comments").insert({ post_id: postId, author_id: user.id, content: content.trim() });
    setBusy(false);
    if (!error) {
      setContent("");
      onAdded?.();
    }
  }

  return (
    <form onSubmit={submit} className="flex items-start gap-3">
      <Avatar url={profile?.avatar_url} name={profile?.username ?? user.email} size={38} />
      <div className="flex flex-1 gap-2">
        <input
          className="input py-2.5"
          placeholder="Un encouragement, une question, une astuce…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
        />
        <button type="submit" disabled={busy || !content.trim()} className="btn-primary px-4" aria-label="Envoyer">
          ➤
        </button>
      </div>
    </form>
  );
}
