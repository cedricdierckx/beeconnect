import type { Metadata } from "next";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur et hébergeurs d'EarthConnect.",
};

export default function LegalNoticePage() {
  const p = LEGAL.publisher;
  return (
    <>
      <h1 className="text-3xl font-bold">🏛️ Mentions légales</h1>
      <p className="mt-2">
        Informations fournies en application du Code de droit économique (livre XII, art. XII.6) et du règlement européen
        sur les services numériques.
      </p>

      <h2>Éditeur</h2>
      <table>
        <tbody>
          <tr>
            <th>Nom / dénomination</th>
            <td>{p.name}</td>
          </tr>
          <tr>
            <th>Forme juridique</th>
            <td>{p.legalForm}</td>
          </tr>
          <tr>
            <th>Adresse</th>
            <td>{p.address}</td>
          </tr>
          <tr>
            <th>Numéro d&apos;entreprise (BCE)</th>
            <td>{p.companyNumber}</td>
          </tr>
          <tr>
            <th>TVA</th>
            <td>{p.vatNumber}</td>
          </tr>
          <tr>
            <th>Contact (y compris point de contact DSA et vie privée)</th>
            <td>{p.email}</td>
          </tr>
        </tbody>
      </table>

      <h2>Hébergement et prestataires techniques</h2>
      <ul>
        {LEGAL.processors.map((s) => (
          <li key={s.name}>
            <strong>{s.name}</strong> (
            <a href={s.website} target="_blank" rel="noreferrer">
              {s.website.replace("https://", "")}
            </a>
            ) — {s.role}. {s.location}.
          </li>
        ))}
      </ul>

      <h2>Propriété intellectuelle</h2>
      <p>
        Le nom {LEGAL.appName}, l&apos;identité visuelle et le code de l&apos;application appartiennent à leur éditeur. Les
        contenus publiés par les membres restent la propriété de leurs auteurs (voir les conditions d&apos;utilisation).
        Les émojis affichés dépendent de la police de ton appareil.
      </p>
    </>
  );
}
