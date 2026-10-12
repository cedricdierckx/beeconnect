/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import Avatar from "./Avatar";
import CategoryChip from "./CategoryChip";
import ImpactStats from "./ImpactStats";
import PollinateButton from "./PollinateButton";
import LaunchButton from "./LaunchButton";
import ReportButton from "./ReportButton";
import { useAuth } from "./AuthProvider";
import { EMPTY_STATS, type FeedPost } from "@/lib/posts";
import { timeAgo } from "@/lib/earth";

/**
 * Carte d'une graine ou d'une floraison dans le fil.
 * `pollinatedBy` : pseudo d'un membre suivi qui a pollinisé la graine (diffusion dans l'écosystème).
 */
export default function PostCard({
  post,
  pollinated,
  launched,
  pollinatedBy,
  showTip = false,
}: {
  post: FeedPost;
  pollinated: boolean;
  launched: string | null | undefined;
  pollinatedBy?: string | null;
  showTip?: boolean;
}) {
  const { user } = useAuth();
  const stats = post.stats ?? EMPTY_STATS;
  const isBloom = post.kind === "bloom";
  const name = post.author?.username ?? "pollinisateur";

  return (
    <article className="card overflow-hidden animate-popin">
      {pollinatedBy && (
        <div className="flex items-center gap-2 bg-honey-50 px-5 py-2 text-sm font-semibold text-honey-600">
          🐝 Pollinisé par @{pollinatedBy} — l&apos;idée voyage jusqu&apos;à toi
        </div>
      )}
      {isBloom && post.parent && (
        <Link
          href={`/seed/${post.parent.id}`}
          className="flex items-center gap-2 bg-petal-100 px-5 py-2 text-sm font-semibold text-petal-500 hover:underline"
        >
          🌸 L&apos;idée a fleuri ailleurs — inspirée de « {post.parent.title ?? post.parent.content.slice(0, 40)} »
          {post.parent.author?.username && <> de @{post.parent.author.username}</>}
        </Link>
      )}

      <div className="flex items-center gap-3 px-5 pt-4">
        <Link href={`/profile/${post.author?.username ?? ""}`}>
          <Avatar url={post.author?.avatar_url} name={name} size={44} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/profile/${post.author?.username ?? ""}`} className="font-display font-semibold hover:underline">
            {post.author?.full_name || `@${name}`}
          </Link>
          <p className="truncate text-xs text-leaf-900/50">
            {timeAgo(post.created_at)}
            {post.location && <> · 📍 {post.location}</>}
          </p>
        </div>
        <span
          className={`chip px-2.5 py-1 text-xs ${isBloom ? "bg-petal-100 text-petal-500" : "bg-leaf-100 text-leaf-700"}`}
        >
          {isBloom ? "🌸 Floraison" : "🌱 Graine"}
        </span>
        {user?.id !== post.author_id && <ReportButton target={{ postId: post.id }} />}
      </div>

      <Link href={`/seed/${post.id}`} className="block px-5 pt-3">
        {post.title && <h3 className="text-xl font-bold leading-tight text-leaf-900">{post.title}</h3>}
        <p className="mt-1 line-clamp-4 whitespace-pre-line text-leaf-900/80">{post.content}</p>
      </Link>

      {post.image_url && (
        <Link href={`/seed/${post.id}`} className="mt-3 block">
          <img
            src={post.image_url}
            alt={post.title ?? "Photo de l'action"}
            loading="lazy"
            className="aspect-[4/3] w-full bg-leaf-50 object-cover"
          />
        </Link>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-3">
        <CategoryChip id={post.category} />
        <ImpactStats stats={stats} compact />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-leaf-900/5 px-5 py-3">
        <PollinateButton postId={post.id} count={stats.pollinations_count} pollinated={pollinated} tip={showTip} />
        {!isBloom && <LaunchButton postId={post.id} authorId={post.author_id} launched={launched} />}
        <Link
          href={`/seed/${post.id}#commentaires`}
          className="ml-auto chip text-leaf-900/60 hover:bg-leaf-50"
          aria-label="Commentaires"
        >
          💬 {stats.comments_count}
        </Link>
      </div>
    </article>
  );
}
