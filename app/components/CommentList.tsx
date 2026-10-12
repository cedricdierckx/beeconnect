"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/earth";
import Avatar from "./Avatar";
import CommentForm from "./CommentForm";
import { useAuth } from "./AuthProvider";
import ReportButton from "./ReportButton";

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author: { username: string | null; full_name: string | null; avatar_url: string | null } | null;
};

/** Liste les commentaires d'une publication (avec formulaire d'ajout). Props : `postId`. */
export default function CommentList({ postId }: { postId: string }) {
  const { user, blocked } = useAuth();
  const [comments, setComments] = useState<CommentRow[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("comments")
      .select("id, content, created_at, author_id, author:profiles(username, full_name, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setComments((data ?? []) as unknown as CommentRow[]);
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: string) {
    await supabase.from("comments").delete().eq("id", id);
    load();
  }

  return (
    <div className="space-y-4">
      {comments.length === 0 && <p className="text-center text-leaf-900/50">Pas encore de commentaire. Lance la conversation ! 💬</p>}
      {comments.filter((c) => !blocked.has(c.author_id)).map((c) => (
        <div key={c.id} className="flex gap-3">
          <Link href={`/profile/${c.author?.username ?? ""}`}>
            <Avatar url={c.author?.avatar_url} name={c.author?.username} size={38} />
          </Link>
          <div className="flex-1 rounded-2xl rounded-tl-sm bg-leaf-50 px-4 py-2.5">
            <div className="flex items-baseline gap-2">
              <Link href={`/profile/${c.author?.username ?? ""}`} className="font-display text-sm font-semibold hover:underline">
                @{c.author?.username ?? "pollinisateur"}
              </Link>
              <span className="text-xs text-leaf-900/40">{timeAgo(c.created_at)}</span>
              {user?.id === c.author_id ? (
                <button onClick={() => remove(c.id)} className="ml-auto text-xs text-leaf-900/40 hover:text-petal-500">
                  Supprimer
                </button>
              ) : (
                <ReportButton target={{ commentId: c.id }} className="ml-auto -my-1" />
              )}
            </div>
            <p className="whitespace-pre-line text-leaf-900/80">{c.content}</p>
          </div>
        </div>
      ))}
      <CommentForm postId={postId} onAdded={load} />
    </div>
  );
}
