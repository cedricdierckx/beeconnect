import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Les règles du jardin EarthConnect : ce que tu peux y faire, ce qui est interdit, et comment nous modérons.",
};

export default function TermsPage() {
  const p = LEGAL.publisher;
  return (
    <>
      <h1 className="text-3xl font-bold">📜 Conditions d&apos;utilisation</h1>
      <p className="mt-2">
        Bienvenue dans le jardin ! Ces conditions forment le contrat entre toi et {p.name} (« nous »), éditeur de{" "}
        {LEGAL.appName}. En créant un compte, tu les acceptes, ainsi que notre{" "}
        <Link href="/legal/confidentialite">politique de confidentialité</Link>.
      </p>

      <h2>1. Le service</h2>
      <p>
        {LEGAL.appName} permet de partager des actions environnementales concrètes (« graines »), de les aider à voyager
        (« polliniser »), d&apos;annoncer qu&apos;on va les reproduire (« Je me lance ») et de publier ses réalisations
        (« floraisons »). Le service est gratuit et sans publicité. Nous pouvons le faire évoluer, ajouter ou retirer des
        fonctionnalités.
      </p>

      <h2>2. Qui peut s&apos;inscrire&nbsp;?</h2>
      <ul>
        <li>Toute personne d&apos;au moins {LEGAL.minAge} ans. Avant 18 ans, parles-en avec tes parents.</li>
        <li>
          Une école, association, entreprise ou commune peut ouvrir un compte par l&apos;intermédiaire d&apos;une personne
          majeure habilitée à la représenter.
        </li>
        <li>
          Tu fournis des informations exactes, tu gardes ton mot de passe secret et tu es responsable de ce qui est publié
          depuis ton compte. Un compte est personnel : pas de revente, pas d&apos;usurpation d&apos;identité.
        </li>
      </ul>

      <h2>3. Les règles de la communauté</h2>
      <p>
        {LEGAL.appName} repose sur un principe positif : <strong>montrer, inspirer et donner envie d&apos;agir</strong>, sans
        moraliser ni culpabiliser. Il est interdit de publier ou de faire, via le service :
      </p>
      <ul>
        <li>des contenus illégaux, ou faisant l&apos;apologie d&apos;activités illégales ou dangereuses ;</li>
        <li>des propos haineux, discriminatoires, racistes, sexistes, homophobes ou incitant à la violence ;</li>
        <li>du harcèlement, des menaces, des insultes, de l&apos;intimidation ;</li>
        <li>des contenus à caractère sexuel ou violent, et a fortiori tout contenu mettant en danger des mineurs ;</li>
        <li>
          des informations personnelles d&apos;autrui (adresse, téléphone…) ou des photos de personnes reconnaissables sans
          leur accord — pour un enfant, celui de ses parents ;
        </li>
        <li>des contenus dont tu ne détiens pas les droits (photos, textes, musiques d&apos;autrui) ;</li>
        <li>
          de la publicité non sollicitée, du spam, des chaînes, ou de fausses informations susceptibles de nuire (par
          exemple des « astuces écologiques » dangereuses pour la santé ou l&apos;environnement) ;
        </li>
        <li>
          toute tentative de perturber le service, d&apos;accéder aux données d&apos;autrui, de créer des comptes en masse
          ou de collecter automatiquement des contenus.
        </li>
      </ul>

      <h2>4. Tes contenus</h2>
      <p>
        Tu restes propriétaire de ce que tu publies. Tu nous accordes, gratuitement et pour le monde entier, le droit non
        exclusif d&apos;héberger, de reproduire, d&apos;adapter (par exemple redimensionner une photo) et d&apos;afficher
        tes contenus dans le service (fil, profil, pages d&apos;impact, partage de liens), aussi longtemps qu&apos;ils sont
        en ligne. Ce droit prend fin lorsque tu supprimes le contenu ou ton compte. Tu garantis disposer des droits
        nécessaires sur ce que tu publies.
      </p>

      <h2>5. Signalement et modération</h2>
      <p>
        Chaque graine, commentaire et profil comporte un bouton <strong>« Signaler »</strong> 🚩. Tu peux aussi bloquer un
        membre : ses contenus ne s&apos;affichent plus pour toi. Toute personne, même sans compte, peut nous signaler un
        contenu illicite en écrivant à <strong>{p.email}</strong>, en indiquant le lien du contenu et la raison du
        signalement.
      </p>
      <p>
        Nous examinons les signalements avec diligence, de façon objective et non arbitraire ; la modération est humaine,
        sans décision entièrement automatisée. Selon la gravité, nous pouvons retirer un contenu, en limiter la visibilité,
        avertir, suspendre ou supprimer un compte. La personne concernée est informée de la décision et de ses motifs, sauf
        si la loi ou la sécurité s&apos;y opposent. Elle peut la contester en répondant à ce message ou en écrivant à{" "}
        {p.email} : nous réexaminons alors la décision. Les contenus manifestement illicites peuvent être transmis aux
        autorités compétentes.
      </p>
      <p>
        <strong>Point de contact</strong> (règlement européen sur les services numériques, art. 11 et 12) : {p.email}, en
        français ou en anglais.
      </p>

      <h2>6. Statuts, pollen et chiffres d&apos;impact</h2>
      <p>
        Les statuts (Explorateur, Pollinisateur… Gardien de l&apos;écosystème) et le « pollen » récompensent ta
        participation ; ils n&apos;ont aucune valeur monétaire et ne peuvent pas être échangés. Les chiffres d&apos;impact
        (personnes touchées, floraisons, etc.) sont indicatifs : ils reflètent l&apos;activité déclarée sur la plateforme et
        ne constituent pas une mesure certifiée de l&apos;impact environnemental.
      </p>

      <h2>7. Responsabilité</h2>
      <p>
        Nous faisons notre possible pour que le service soit disponible et sûr, sans pouvoir garantir l&apos;absence
        d&apos;interruption ou d&apos;erreur. Les contenus sont publiés sous la responsabilité de leurs auteurs : avant de
        reproduire une action, vérifie qu&apos;elle est adaptée à ta situation et respecte les règles applicables (par
        exemple les autorisations nécessaires pour aménager un espace public). Dans les limites permises par la loi, notre
        responsabilité ne peut être engagée que pour une faute qui nous est imputable ; rien dans ces conditions ne limite
        nos obligations en cas de dol, de faute lourde ou d&apos;atteinte à l&apos;intégrité physique, ni tes droits de
        consommateur.
      </p>

      <h2>8. Suspension et fin du contrat</h2>
      <p>
        Tu peux arrêter à tout moment en supprimant ton compte depuis{" "}
        <Link href="/settings">⚙️ Paramètres</Link>. Nous pouvons suspendre ou supprimer un compte qui enfreint gravement ou
        de manière répétée ces conditions, en principe après un avertissement, sauf urgence ou obligation légale.
      </p>

      <h2>9. Modification des conditions</h2>
      <p>
        Nous pouvons adapter ces conditions, par exemple pour tenir compte d&apos;une nouvelle fonctionnalité ou d&apos;une
        évolution légale. En cas de changement important, nous te prévenons au moins 30 jours à l&apos;avance ; si tu
        n&apos;es pas d&apos;accord, tu peux supprimer ton compte avant l&apos;entrée en vigueur.
      </p>

      <h2>10. Droit applicable et litiges</h2>
      <p>
        Ces conditions sont régies par le droit belge. En cas de difficulté, écris-nous d&apos;abord : nous chercherons une
        solution à l&apos;amiable. Si tu agis en tant que consommateur, tu peux aussi t&apos;adresser gratuitement au Service
        de médiation pour le consommateur (
        <a href="https://mediationconsommateur.be" target="_blank" rel="noreferrer">
          mediationconsommateur.be
        </a>
        ) et tu conserves la protection des règles impératives de ton pays de résidence ainsi que la possibilité de saisir
        les juridictions de ton domicile.
      </p>
    </>
  );
}
