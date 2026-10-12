/* eslint-disable @next/next/no-img-element */
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CATEGORIES, getCategory } from "@/lib/earth";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "../components/AuthProvider";
import { useToast } from "../components/Toaster";
import EmptyState from "../components/EmptyState";

type ParentSeed = { id: string; title: string | null; content: string; category: string | null; image_url: string | null; author: { username: string | null } | null };

export default function NewPostPage() {
  return (
    <Suspense fallback={null}>
      <NewPostForm />
    </Suspense>
  );
}

function NewPostForm() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const bloomOf = params.get("bloom");
  const idea = params.get("idea");

  const [parent, setParent] = useState<ParentSeed | null>(null);
  const [title, setTitle] = useState(idea ?? "");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile?.location) setLocation((l) => l || profile.location || "");
  }, [profile?.location]);

  useEffect(() => {
    if (!bloomOf) return;
    supabase
      .from("posts")
      .select("id, title, content, category, image_url, author:profiles!posts_author_id_fkey(username)")
      .eq("id", bloomOf)
      .maybeSingle()
      .then(({ data }) => {
        const seed = data as unknown as ParentSeed | null;
        setParent(seed);
        if (seed) {
          setCategory(seed.category);
          setTitle((t) => t || (seed.title ? `${seed.title} — chez moi aussi !` : ""));
        }
      });
  }, [bloomOf]);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (loading) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState emoji="🌱" title="Connecte-toi pour planter une graine" text="Il faut un compte pour partager tes actions.">
          <Link href={`/login?next=${encodeURIComponent("/new")}`} className="btn-primary">
            Me connecter
          </Link>
        </EmptyState>
      </div>
    );
  }

  const isBloom = Boolean(bloomOf && parent);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!content.trim()) return setError("Raconte en quelques mots ce que tu as réalisé.");
    if (!category) return setError("Choisis une catégorie pour ta graine.");
    setError(null);
    setSaving(true);
    try {
      const image_url = file ? await uploadImage("post-images", user.id, file) : null;
      const { data, error: insertError } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          title: title.trim() || null,
          content: content.trim(),
          category,
          location: location.trim() || null,
          image_url,
          kind: isBloom ? "bloom" : "seed",
          parent_id: isBloom ? parent!.id : null,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;
      toast(isBloom ? "L'idée a fleuri chez toi !" : "Graine plantée !", isBloom ? "🌸" : "🌱");
      router.push(`/seed/${data.id}?new=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue, réessaie.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 text-center">
        <div className="text-5xl">{isBloom ? "🌸" : "🌱"}</div>
        <h1 className="mt-2 text-3xl font-bold">{isBloom ? "Ta floraison" : "Planter une graine"}</h1>
        <p className="text-leaf-900/60">
          {isBloom
            ? "Tu as reproduit l'action ? Montre le résultat : l'idée fleurit ailleurs !"
            : "Montre une action concrète que tu as réalisée. Pas de leçon, juste de l'inspiration."}
        </p>
      </div>

      {isBloom && parent && (
        <Link href={`/seed/${parent.id}`} className="card mb-5 flex items-center gap-3 bg-petal-100/60 p-3">
          {parent.image_url ? (
            <img src={parent.image_url} alt="" className="h-14 w-14 rounded-2xl object-cover" />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl">
              {getCategory(parent.category).emoji}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-petal-500">Graine d&apos;origine</p>
            <p className="truncate font-display font-semibold">{parent.title ?? parent.content}</p>
            {parent.author?.username && <p className="text-xs text-leaf-900/50">par @{parent.author.username}</p>}
          </div>
        </Link>
      )}

      <form onSubmit={submit} className="card space-y-5 p-5 sm:p-7">
        <div>
          <span className="label">📸 Photo de ton action</span>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="group relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-3xl border-2 border-dashed border-leaf-300 bg-leaf-50 transition hover:border-leaf-500 hover:bg-leaf-100"
          >
            {preview ? (
              <img src={preview} alt="Aperçu" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="text-center">
                <span className="block text-5xl transition group-hover:scale-110">📷</span>
                <span className="mt-2 block font-display font-semibold text-leaf-700">Ajouter une photo</span>
                <span className="text-sm text-leaf-900/50">Une image vaut mille graines</span>
              </span>
            )}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file && (
            <button type="button" onClick={() => setFile(null)} className="mt-2 text-sm font-semibold text-petal-500 hover:underline">
              Retirer la photo
            </button>
          )}
        </div>

        <div>
          <label className="label" htmlFor="title">
            Titre
          </label>
          <input
            id="title"
            className="input text-lg font-display"
            placeholder="Ex. : Notre hôtel à insectes construit avec les élèves"
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="content">
            Ce que tu as fait
          </label>
          <textarea
            id="content"
            className="input min-h-[140px] resize-y"
            placeholder="Comment tu t'y es pris, avec qui, combien de temps, ce qu'il faut pour le refaire…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div>
          <span className="label">Catégorie</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-sm font-semibold transition ${
                  category === c.id
                    ? "scale-105 bg-leaf-500 text-white shadow-[0_3px_0_0_#1B5E37]"
                    : "bg-leaf-50 text-leaf-800 hover:bg-leaf-100"
                }`}
              >
                <span className="text-2xl">{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="location">
            📍 Où ? <span className="font-normal text-leaf-900/50">(commune ou quartier — ton écosystème local)</span>
          </label>
          <input
            id="location"
            className="input"
            placeholder="Ex. : Namur, Ixelles, Liège…"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {error && <p className="rounded-2xl bg-petal-100 px-4 py-3 font-semibold text-petal-500">{error}</p>}

        <button type="submit" disabled={saving} className={`${isBloom ? "btn-honey" : "btn-primary"} w-full py-4 text-lg`}>
          {saving ? "Plantation en cours…" : isBloom ? "🌸 Faire fleurir" : "🌱 Planter ma graine"}
        </button>
      </form>
    </div>
  );
}
