import { supabase } from "./supabase/client";

const BUCKETS = ["avatars", "post-images"] as const;

/** Rassemble toutes les données de l'utilisateur (droit d'accès et de portabilité, RGPD art. 15 et 20). */
export async function exportMyData(userId: string) {
  const [{ data: auth }, profile, posts, comments, pollinations, intentions, following, followers, blocks, reports] =
    await Promise.all([
      supabase.auth.getUser(),
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("posts").select("*").eq("author_id", userId),
      supabase.from("comments").select("*").eq("author_id", userId),
      supabase.from("pollinations").select("*").eq("user_id", userId),
      supabase.from("intentions").select("*").eq("user_id", userId),
      supabase.from("follows").select("*").eq("follower_id", userId),
      supabase.from("follows").select("*").eq("following_id", userId),
      supabase.from("blocks").select("*").eq("blocker_id", userId),
      supabase.from("reports").select("*").eq("reporter_id", userId),
    ]);
  return {
    exported_at: new Date().toISOString(),
    account: {
      id: auth.user?.id,
      email: auth.user?.email,
      created_at: auth.user?.created_at,
      email_confirmed_at: auth.user?.email_confirmed_at,
      metadata: auth.user?.user_metadata,
    },
    profile: profile.data,
    posts: posts.data ?? [],
    comments: comments.data ?? [],
    pollinations: pollinations.data ?? [],
    intentions: intentions.data ?? [],
    following: following.data ?? [],
    followers: followers.data ?? [],
    blocks: blocks.data ?? [],
    reports: reports.data ?? [],
  };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Supprime toutes les photos de l'utilisateur (dossier `{userId}/` de chaque bucket). */
async function deleteMyFiles(userId: string) {
  for (const bucket of BUCKETS) {
    for (;;) {
      const { data, error } = await supabase.storage.from(bucket).list(userId, { limit: 100 });
      if (error) throw error;
      if (!data || data.length === 0) break;
      const { error: removeError } = await supabase.storage.from(bucket).remove(data.map((f) => `${userId}/${f.name}`));
      if (removeError) throw removeError;
      if (data.length < 100) break;
    }
  }
}

/**
 * Suppression définitive du compte (RGPD art. 17, exigence Google Play) : photos via
 * l'API Storage, puis compte et données via la fonction `delete_my_account`.
 */
export async function deleteMyAccount(userId: string) {
  await deleteMyFiles(userId);
  const { error } = await supabase.rpc("delete_my_account");
  if (error) throw error;
  await supabase.auth.signOut();
}
