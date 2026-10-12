import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Supprimer mon compte",
  description: "Comment supprimer ton compte EarthConnect et les données associées.",
};

export default function AccountDeletionPage() {
  return (
    <>
      <h1 className="text-3xl font-bold">🗑️ Supprimer ton compte {LEGAL.appName}</h1>
      <p className="mt-2">
        Tu peux supprimer ton compte et toutes les données associées à tout moment, gratuitement, depuis l&apos;application
        ou le site.
      </p>

      <h2>Depuis l&apos;application (immédiat)</h2>
      <ol className="mb-3 list-decimal space-y-1 pl-6">
        <li>Connecte-toi à {LEGAL.appName}.</li>
        <li>
          Ouvre <strong>⚙️ Paramètres</strong> (depuis ton profil, ou directement :{" "}
          <Link href="/settings">{LEGAL.siteUrl.replace("https://", "")}/settings</Link>).
        </li>
        <li>
          Dans la zone « Supprimer mon compte », tape ton pseudo pour confirmer, puis appuie sur{" "}
          <strong>« Supprimer définitivement »</strong>.
        </li>
      </ol>
      <p>
        Tu peux d&apos;abord <strong>télécharger une copie de tes données</strong> depuis la même page.
      </p>

      <h2>Sans accès à ton compte</h2>
      <p>
        Écris à <strong>{LEGAL.publisher.email}</strong> depuis l&apos;adresse e-mail de ton compte, avec pour objet
        « Suppression de compte » et ton pseudo. Nous supprimons le compte dans un délai maximal de 30 jours et te le
        confirmons.
      </p>

      <h2>Ce qui est supprimé</h2>
      <ul>
        <li>ton compte (adresse e-mail, mot de passe) et ton profil (pseudo, nom, photo, bio, commune) ;</li>
        <li>toutes tes graines, floraisons, photos et commentaires ;</li>
        <li>tes pollinisations, « Je me lance », abonnements, vues, blocages et signalements émis.</li>
      </ul>
      <p>
        La suppression est <strong>définitive</strong> et immédiate dans notre base de données. Les copies de sauvegarde
        techniques de nos hébergeurs s&apos;effacent au fil de leur rotation automatique (en principe sous 30 jours). Les
        floraisons publiées par d&apos;autres membres à partir de tes graines restent en ligne, mais ne mentionnent plus ta
        graine d&apos;origine. Les statistiques globales anonymes (par exemple le nombre total de graines) ne permettent pas
        de t&apos;identifier.
      </p>

      <p className="mt-6">
        <Link href="/settings" className="btn-primary no-underline">
          ⚙️ Ouvrir mes paramètres
        </Link>
      </p>
    </>
  );
}
