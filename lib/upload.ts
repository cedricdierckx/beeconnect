import { supabase } from "./supabase/client";

/**
 * Redimensionne et réencode une image côté navigateur (JPEG, 1600 px max) avant l'envoi.
 * Le réencodage supprime les métadonnées EXIF (dont la position GPS) : promesse faite
 * dans la politique de confidentialité, donc aucun envoi du fichier original.
 */
async function shrink(file: File, maxSize: number): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("Ce fichier n'est pas une image.");
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) throw new Error("encodage impossible");
    return blob;
  } catch {
    throw new Error("Ce format de photo n'est pas pris en charge : essaie une image JPEG ou PNG.");
  }
}

/** Envoie une image dans `{userId}/…` du bucket donné et renvoie son URL publique. */
export async function uploadImage(bucket: "avatars" | "post-images", userId: string, file: File, maxSize = 1600) {
  const blob = await shrink(file, maxSize);
  const ext = "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
