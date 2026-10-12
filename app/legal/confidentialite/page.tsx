import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Comment EarthConnect collecte, utilise et protège tes données personnelles.",
};

export default function PrivacyPage() {
  const p = LEGAL.publisher;
  return (
    <>
      <h1 className="text-3xl font-bold">🔒 Politique de confidentialité</h1>
      <p className="mt-2">
        {LEGAL.appName} est un réseau social consacré aux actions environnementales positives. Cette politique explique,
        simplement, quelles données nous traitons, pourquoi, avec qui, combien de temps, et comment exercer tes droits.
        Elle s&apos;applique au site {LEGAL.siteUrl} et à l&apos;application Android {LEGAL.appName}.
      </p>
      <p>
        <strong>En résumé :</strong> nous ne collectons que ce qui est nécessaire pour faire fonctionner le réseau. Pas de
        publicité, pas de revente de données, pas de traceurs publicitaires, pas de géolocalisation de ton appareil.
      </p>

      <h2>1. Qui est responsable de tes données&nbsp;?</h2>
      <p>
        Le responsable du traitement est <strong>{p.name}</strong> ({p.legalForm}), {p.address}, numéro d&apos;entreprise{" "}
        {p.companyNumber}. Pour toute question sur tes données : <strong>{p.email}</strong>.
      </p>

      <h2>2. Quelles données traitons-nous&nbsp;?</h2>
      <table>
        <thead>
          <tr>
            <th>Catégorie</th>
            <th>Données</th>
            <th>Origine</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Compte</td>
            <td>Adresse e-mail, mot de passe (stocké uniquement sous forme chiffrée irréversible), pseudo, date d&apos;acceptation des conditions</td>
            <td>Toi, à l&apos;inscription</td>
          </tr>
          <tr>
            <td>Profil</td>
            <td>Nom affiché, photo de profil, bio, commune ou quartier (facultatifs)</td>
            <td>Toi</td>
          </tr>
          <tr>
            <td>Contenus</td>
            <td>Graines et floraisons (textes, photos, catégorie, lieu indiqué), commentaires</td>
            <td>Toi</td>
          </tr>
          <tr>
            <td>Interactions</td>
            <td>Pollinisations, « Je me lance », abonnements, publications vues, blocages, signalements</td>
            <td>Ton utilisation du service</td>
          </tr>
          <tr>
            <td>Données techniques</td>
            <td>Jeton de session (sur ton appareil), adresse IP et journaux techniques conservés brièvement par nos hébergeurs</td>
            <td>Automatique</td>
          </tr>
        </tbody>
      </table>
      <p>
        Nous <strong>ne collectons pas</strong> : ta position GPS, tes contacts, tes données de paiement, ton identifiant
        publicitaire. Les photos sont réencodées sur ton appareil avant l&apos;envoi, ce qui supprime leurs métadonnées
        (notamment la position GPS éventuellement enregistrée par l&apos;appareil photo).
      </p>

      <h2>3. Pourquoi et sur quelle base légale&nbsp;?</h2>
      <table>
        <thead>
          <tr>
            <th>Finalité</th>
            <th>Base légale (RGPD, art. 6)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Créer et gérer ton compte, publier et afficher tes contenus, faire fonctionner les pollinisations, abonnements et floraisons</td>
            <td>Exécution du contrat (conditions d&apos;utilisation) — art. 6.1.b</td>
          </tr>
          <tr>
            <td>T&apos;envoyer les e-mails indispensables (confirmation d&apos;adresse, mot de passe oublié)</td>
            <td>Exécution du contrat — art. 6.1.b</td>
          </tr>
          <tr>
            <td>Traiter les signalements, modérer les contenus illicites, prévenir les abus et assurer la sécurité</td>
            <td>Obligation légale (règlement européen sur les services numériques) et intérêt légitime — art. 6.1.c et 6.1.f</td>
          </tr>
          <tr>
            <td>Calculer les statistiques d&apos;impact (personnes touchées, floraisons, écosystèmes locaux), affichées de façon agrégée</td>
            <td>Intérêt légitime à mesurer la diffusion des bonnes pratiques — art. 6.1.f</td>
          </tr>
        </tbody>
      </table>
      <p>Nous ne faisons ni publicité, ni profilage commercial, ni décision automatisée produisant des effets juridiques.</p>

      <h2>4. Ce qui est visible par les autres</h2>
      <ul>
        <li>
          <strong>Public</strong> (y compris pour les visiteurs non connectés) : ton profil (pseudo, nom affiché, photo, bio,
          commune), tes graines, floraisons et commentaires, la liste des membres qui ont pollinisé une graine ou s&apos;y
          sont lancés, tes abonnements (sous forme de compteurs) et ton statut de pollinisateur.
        </li>
        <li>
          <strong>Privé</strong> : ton adresse e-mail, les publications que tu as vues, les membres que tu as bloqués, tes
          signalements.
        </li>
      </ul>
      <p>Réfléchis avant de publier : un contenu public peut être vu, copié ou partagé par d&apos;autres personnes.</p>

      <h2>5. Avec qui partageons-nous tes données&nbsp;?</h2>
      <p>
        Nous ne vendons ni ne louons tes données. Elles sont uniquement traitées par nos sous-traitants techniques, liés par
        contrat et tenus de les protéger :
      </p>
      <table>
        <thead>
          <tr>
            <th>Prestataire</th>
            <th>Rôle</th>
            <th>Localisation</th>
          </tr>
        </thead>
        <tbody>
          {LEGAL.processors.map((s) => (
            <tr key={s.name}>
              <td>
                <a href={s.website} target="_blank" rel="noreferrer">
                  {s.name}
                </a>
              </td>
              <td>{s.role}</td>
              <td>{s.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Lorsque des données peuvent être traitées hors de l&apos;Espace économique européen, ces transferts sont encadrés
        par les clauses contractuelles types de la Commission européenne et/ou par le cadre de protection des données
        UE–États-Unis (Data Privacy Framework). Nous pouvons aussi communiquer des données aux autorités lorsque la loi
        l&apos;impose. Si tu installes l&apos;application via Google Play, Google traite certaines données selon sa propre
        politique de confidentialité.
      </p>

      <h2>6. Combien de temps les conservons-nous&nbsp;?</h2>
      <ul>
        <li>Données de compte, de profil, contenus et interactions : tant que ton compte existe.</li>
        <li>
          Suppression de compte : toutes ces données sont effacées immédiatement de notre base ; les copies de sauvegarde
          techniques de nos hébergeurs disparaissent au fil de leur rotation automatique (en principe sous 30 jours).
        </li>
        <li>
          Comptes inactifs pendant 3 ans : nous pouvons les supprimer, après t&apos;avoir prévenu par e-mail au moins 30
          jours à l&apos;avance.
        </li>
        <li>
          Signalements : le temps de leur traitement, puis au maximum 12 mois afin de pouvoir répondre à une contestation.
        </li>
        <li>Journaux techniques des hébergeurs : durée courte, fixée par eux pour des raisons de sécurité.</li>
      </ul>

      <h2>7. Tes droits</h2>
      <p>Tu peux à tout moment :</p>
      <ul>
        <li>
          <strong>accéder</strong> à tes données et les <strong>emporter</strong> (portabilité) : bouton « Télécharger mes
          données » dans <Link href="/settings">⚙️ Paramètres</Link> ;
        </li>
        <li>
          les <strong>rectifier</strong> : <Link href="/profile/edit">modifier ton profil</Link> ou tes publications ;
        </li>
        <li>
          les <strong>effacer</strong> : bouton « Supprimer mon compte » dans les paramètres (voir{" "}
          <Link href="/legal/suppression-compte">la marche à suivre</Link>) ;
        </li>
        <li>
          t&apos;<strong>opposer</strong> à un traitement fondé sur l&apos;intérêt légitime ou en demander la{" "}
          <strong>limitation</strong>, en écrivant à {p.email}.
        </li>
      </ul>
      <p>
        Nous répondons dans un délai d&apos;un mois. Si tu estimes que tes droits ne sont pas respectés, tu peux introduire
        une réclamation auprès de l&apos;{LEGAL.authority.name}, {LEGAL.authority.address} (
        <a href={LEGAL.authority.website} target="_blank" rel="noreferrer">
          {LEGAL.authority.website.replace("https://", "")}
        </a>
        ).
      </p>

      <h2>8. Mineurs</h2>
      <p>
        {LEGAL.appName} est accessible à partir de {LEGAL.minAge} ans. Si tu as moins de 18 ans, parles-en avec tes parents
        avant de t&apos;inscrire. Les écoles, mouvements de jeunesse et associations qui publient des activités avec des
        enfants le font sous la responsabilité d&apos;un adulte, et ne publient pas de photo où un enfant est reconnaissable
        sans l&apos;accord de ses parents.
      </p>

      <h2>9. Sécurité</h2>
      <p>
        Les échanges sont chiffrés (HTTPS). L&apos;accès aux données est contrôlé ligne par ligne dans la base : chacun ne
        peut modifier que ses propres données. Les mots de passe ne sont jamais stockés en clair. Aucun système n&apos;étant
        infaillible, nous t&apos;informerons ainsi que l&apos;autorité compétente en cas de violation de données
        susceptible de présenter un risque pour toi.
      </p>

      <h2>10. Cookies et stockage local</h2>
      <p>
        Nous n&apos;utilisons <strong>aucun cookie publicitaire ni outil de mesure d&apos;audience</strong>. L&apos;application
        enregistre uniquement sur ton appareil (stockage local du navigateur) : ton jeton de connexion, strictement
        nécessaire pour rester connecté, et de petites préférences d&apos;affichage (par exemple, le fait d&apos;avoir déjà
        vu l&apos;explication du bouton « Polliniser »). Ces éléments, indispensables au service demandé, ne nécessitent pas
        de consentement préalable. Tu peux les effacer à tout moment en te déconnectant ou en vidant les données du site.
      </p>

      <h2>11. Modifications</h2>
      <p>
        Nous pouvons faire évoluer cette politique. En cas de changement important, nous te prévenons dans
        l&apos;application ou par e-mail avant son entrée en vigueur. La date de dernière mise à jour figure en bas de page.
      </p>
    </>
  );
}
