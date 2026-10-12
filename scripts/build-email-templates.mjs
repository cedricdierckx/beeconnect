// Génère les modèles d'e-mails Supabase Auth d'EarthConnect dans supabase/templates/.
// Usage : node scripts/build-email-templates.mjs
// Les liens passent par /auth/confirm (bouton à cliquer) plutôt que par
// {{ .ConfirmationURL }} : les antivirus de messagerie qui pré-ouvrent les liens
// ne consomment plus le jeton (cause des erreurs « otp_expired »).

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "supabase", "templates");

const C = {
  cream: "#FFF9EC",
  leaf: "#2F9E5B",
  leafDark: "#1B5E37",
  ink: "#0D2A1A",
  muted: "#5B6B61",
  honey: "#FFC93C",
  honeyDark: "#D48F00",
  honeyLight: "#FFF8E1",
  petal: "#FFE3EC",
  leafLight: "#EAF8EF",
};

const FONT = "'Fredoka','Nunito','Segoe UI',Helvetica,Arial,sans-serif";
const BODY_FONT = "'Nunito','Segoe UI',Helvetica,Arial,sans-serif";

const confirmLink = (type, next) =>
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=${type}${next ? `&next=${encodeURIComponent(next)}` : ""}`;

function button(href, label) {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto 8px;">
  <tr>
    <td align="center" bgcolor="${C.honey}" style="border-radius:999px;border-bottom:4px solid ${C.honeyDark};">
      <a href="${href}" target="_blank"
         style="display:inline-block;padding:16px 34px;font-family:${FONT};font-size:18px;font-weight:700;color:${C.ink};text-decoration:none;border-radius:999px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

function fallback(href) {
  return `
<p style="margin:18px 0 0;font-family:${BODY_FONT};font-size:13px;line-height:20px;color:${C.muted};text-align:center;">
  Le bouton ne fonctionne pas&nbsp;? Copie ce lien dans ton navigateur&nbsp;:<br>
  <a href="${href}" style="color:${C.leaf};word-break:break-all;">${href}</a>
</p>`;
}

function steps() {
  const cell = (emoji, title, text, bg) => `
    <td width="33%" valign="top" style="padding:6px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td bgcolor="${bg}" style="border-radius:18px;padding:14px 8px;text-align:center;">
          <div style="font-size:28px;line-height:34px;">${emoji}</div>
          <div style="font-family:${FONT};font-weight:700;font-size:14px;color:${C.ink};">${title}</div>
          <div style="font-family:${BODY_FONT};font-size:12px;line-height:16px;color:${C.muted};">${text}</div>
        </td></tr>
      </table>
    </td>`;
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">
  <tr>
    ${cell("🌱", "Plante", "Partage une action concrète", C.leafLight)}
    ${cell("🐝", "Pollinise", "Fais voyager les bonnes idées", C.honeyLight)}
    ${cell("🌸", "Fais fleurir", "Reproduis-les chez toi", C.petal)}
  </tr>
</table>`;
}

function layout({ preheader, emoji, title, body, extra = "" }) {
  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:wght@400;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${C.cream};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.cream}" style="background:${C.cream};">
    <tr>
      <td align="center" style="padding:32px 14px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:18px;font-family:${FONT};font-size:26px;font-weight:700;color:${C.leafDark};">
              <span style="font-size:30px;">🌍</span> Earth<span style="color:${C.honeyDark};">Connect</span> <span style="font-size:22px;">🐝</span>
            </td>
          </tr>
          <!-- Carte -->
          <tr>
            <td bgcolor="#FFFFFF" style="background:#FFFFFF;border-radius:28px;overflow:hidden;box-shadow:0 6px 24px rgba(20,63,39,0.12);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="${C.leaf}"
                      style="background:${C.leaf};background-image:linear-gradient(120deg,#3FB46C 0%,#6CCB8F 55%,#FFD45A 100%);border-radius:28px 28px 0 0;padding:34px 20px 30px;">
                    <div style="font-size:56px;line-height:64px;">${emoji}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px 30px 34px;">
                    <h1 style="margin:0 0 12px;font-family:${FONT};font-size:28px;line-height:34px;font-weight:700;color:${C.ink};text-align:center;">${title}</h1>
                    ${body}
                    ${extra}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Pied -->
          <tr>
            <td align="center" style="padding:22px 20px 0;font-family:${BODY_FONT};font-size:13px;line-height:20px;color:${C.muted};">
              <strong style="font-family:${FONT};color:${C.leafDark};">Une action commence quelque part. EarthConnect l'aide à fleurir partout.</strong> 🌸<br>
              Tu reçois cet e-mail suite à une action sur <a href="{{ .SiteURL }}" style="color:${C.leaf};">EarthConnect</a>.
              Si tu n'es pas à l'origine de cette demande, ignore simplement ce message.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

const p = (html) =>
  `<p style="margin:0 0 12px;font-family:${BODY_FONT};font-size:16px;line-height:25px;color:${C.ink};text-align:center;">${html}</p>`;

const TEMPLATES = {
  confirmation: {
    subject: "🌱 Confirme ton adresse et rejoins le jardin EarthConnect",
    html: (() => {
      const href = confirmLink("email", "/feed");
      return layout({
        preheader: "Plus qu'un clic pour devenir pollinisateur 🐝",
        emoji: "🌱🐝🌸",
        title: "Bienvenue dans le jardin{{ if .Data.username }}, @{{ .Data.username }}{{ end }}&nbsp;!",
        body:
          p("Plus qu'un clic pour devenir <strong>pollinisateur</strong>&nbsp;: confirme ton adresse e-mail et commence à faire voyager les bonnes idées pour la planète.") +
          button(href, "Confirmer mon adresse 🌸"),
        extra: steps() + fallback(href),
      });
    })(),
  },
  recovery: {
    subject: "🔑 Choisis un nouveau mot de passe EarthConnect",
    html: (() => {
      const href = confirmLink("recovery", "/reset/update");
      return layout({
        preheader: "Ton lien pour réinitialiser ton mot de passe",
        emoji: "🔑🌿",
        title: "Un petit oubli&nbsp;? Pas de souci&nbsp;!",
        body:
          p("Tu as demandé à réinitialiser le mot de passe du compte <strong>{{ .Email }}</strong>. Clique ci-dessous pour en choisir un nouveau.") +
          button(href, "Choisir un nouveau mot de passe"),
        extra:
          p('<span style="font-size:14px;color:' + C.muted + ';">Ce lien n\'est valable qu\'une fois et pour une durée limitée.</span>') + fallback(href),
      });
    })(),
  },
  magic_link: {
    subject: "✨ Ton lien de connexion EarthConnect",
    html: (() => {
      const href = confirmLink("email", "/feed");
      return layout({
        preheader: "Connecte-toi en un clic",
        emoji: "✨🐝",
        title: "Ton lien magique est prêt",
        body: p("Clique ci-dessous pour te connecter à EarthConnect, sans mot de passe.") + button(href, "Me connecter 🐝"),
        extra: fallback(href),
      });
    })(),
  },
  email_change: {
    subject: "📬 Confirme ta nouvelle adresse e-mail EarthConnect",
    html: (() => {
      const href = confirmLink("email_change", "/profile/edit");
      return layout({
        preheader: "Confirme le changement d'adresse de ton compte",
        emoji: "📬🌿",
        title: "Nouvelle adresse, même abeille&nbsp;!",
        body:
          p("Tu souhaites remplacer <strong>{{ .Email }}</strong> par <strong>{{ .NewEmail }}</strong>. Confirme ce changement pour continuer à recevoir les nouvelles de ton écosystème.") +
          button(href, "Confirmer ma nouvelle adresse"),
        extra: fallback(href),
      });
    })(),
  },
  invite: {
    subject: "🐝 Tu es invité·e à rejoindre EarthConnect",
    html: (() => {
      const href = confirmLink("invite", "/reset/update");
      return layout({
        preheader: "Le réseau social où les bonnes actions se pollinisent",
        emoji: "💌🐝",
        title: "On t'attend dans le jardin&nbsp;!",
        body:
          p("Tu as été invité·e à rejoindre <strong>EarthConnect</strong>, le réseau social où les bonnes actions environnementales se <strong>pollinisent</strong>&nbsp;: on y montre ce qu'on a réalisé, et les idées fleurissent ailleurs.") +
          button(href, "Accepter l'invitation 🌱"),
        extra: steps() + fallback(href),
      });
    })(),
  },
  reauthentication: {
    subject: "🔐 Ton code de vérification EarthConnect",
    html: layout({
      preheader: "Ton code de vérification",
      emoji: "🔐",
      title: "Ton code de vérification",
      body:
        p("Saisis ce code pour confirmer qu'il s'agit bien de toi&nbsp;:") +
        `<div style="margin:22px auto;max-width:280px;border-radius:20px;background:${C.honeyLight};border:2px dashed ${C.honey};padding:18px;text-align:center;font-family:${FONT};font-size:36px;letter-spacing:8px;font-weight:700;color:${C.ink};">{{ .Token }}</div>` +
        p(`<span style="font-size:14px;color:${C.muted};">Ne communique jamais ce code à personne.</span>`),
    }),
  },
};

mkdirSync(OUT, { recursive: true });
const subjects = {};
for (const [name, t] of Object.entries(TEMPLATES)) {
  writeFileSync(join(OUT, `${name}.html`), t.html);
  subjects[name] = t.subject;
}
writeFileSync(join(OUT, "subjects.json"), JSON.stringify(subjects, null, 2) + "\n");
console.log(`Modèles écrits dans ${OUT} : ${Object.keys(TEMPLATES).join(", ")}`);
