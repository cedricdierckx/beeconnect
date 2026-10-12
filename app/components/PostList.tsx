"use client";

import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import { useAuth } from "./AuthProvider";
import { fetchViewerState, recordViews, type FeedPost, type ViewerState } from "@/lib/posts";

/**
 * Affiche une liste de publications et charge, pour l'utilisateur courant, l'état
 * pollinisé / lancé de chacune ; enregistre aussi les vues (« personnes touchées »).
 */
export default function PostList({
  posts,
  pollinatedBy,
}: {
  posts: FeedPost[];
  pollinatedBy?: Map<string, string>;
}) {
  const { user } = useAuth();
  const [viewer, setViewer] = useState<ViewerState>({ pollinated: new Set(), launched: new Map() });
  const ids = posts.map((p) => p.id).join(",");

  useEffect(() => {
    const postIds = ids ? ids.split(",") : [];
    fetchViewerState(user?.id, postIds).then(setViewer);
    recordViews(user?.id, postIds);
  }, [user?.id, ids]);

  return (
    <div className="space-y-5">
      {posts.map((p, i) => (
        <PostCard
          key={p.id}
          post={p}
          pollinated={viewer.pollinated.has(p.id)}
          launched={viewer.launched.has(p.id) ? viewer.launched.get(p.id) ?? null : undefined}
          pollinatedBy={pollinatedBy?.get(p.id)}
          showTip={i === 0}
        />
      ))}
    </div>
  );
}
