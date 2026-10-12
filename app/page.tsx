import Link from "next/link";
import { LEVELS } from "@/lib/earth";
import { LEGAL_PAGES } from "@/lib/legal";

const STEPS = [
  { emoji: "🌱", title: "Une graine est plantée", text: "Une école partage la photo de son nouvel hôtel à insectes, construit avec les élèves." },
  { emoji: "🐝", title: "La communauté pollinise", text: "Ceux qui trouvent l'idée utile la pollinisent : elle circule dans leurs quartiers et leurs réseaux." },
  { emoji: "🧑‍🌾", title: "« Je me lance »", text: "Certains décident de l'adapter chez eux, dans leur école ou leur commune." },
  { emoji: "🌸", title: "L'idée fleurit ailleurs", text: "Quelques semaines plus tard, la réalisation est confirmée en photo." },
  { emoji: "🔁", title: "Et ça recommence", text: "La nouvelle floraison inspire à son tour : une chaîne d'impact positif se forme." },
];

const COMPARE = [
  ["J'aime ce contenu", "Je pollinise cette idée"],
  ["Je récompense sa popularité", "Je contribue à sa diffusion"],
  ["L'interaction reste numérique", "L'interaction prépare une action réelle"],
  ["Le contenu devient viral", "La bonne pratique devient reproductible"],
];

const WORDS = [
  ["🌱", "Graines", "les publications"],
  ["🐝", "Pollinisations", "les partages"],
  ["🧑‍🌾", "Pollinisateurs", "les membres"],
  ["🌸", "Floraisons", "les actions réalisées"],
  ["🏡", "Écosystèmes", "les communautés locales"],
  ["🌼", "Prairies d'impact", "les idées très reproduites"],
];

export default function Home() {
  return (
    <div className="space-y-20 pb-10">
      {/* Accroche */}
      <section className="grid items-center gap-10 pt-6 md:grid-cols-2 md:pt-12">
        <div>
          <span className="chip bg-honey-100 text-honey-600">🐝 Ici, pas de « J&apos;aime »</span>
          <h1 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Le réseau social où les bonnes actions se{" "}
            <span className="relative whitespace-nowrap text-leaf-500">
              pollinisent
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden>
                <path d="M2 9 C 50 2, 150 2, 198 8" stroke="#FFC93C" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-6 text-lg text-leaf-900/70">
            Citoyens, écoles, associations, entreprises et communes y montrent ce qu&apos;ils ont <b>concrètement</b> réalisé.
            Tu pollinises les idées utiles, tu te lances, et l&apos;action fleurit ailleurs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-honey px-7 py-3.5 text-lg">
              🌱 Je deviens pollinisateur
            </Link>
            <Link href="/feed" className="btn-ghost px-7 py-3.5 text-lg">
              Explorer le jardin →
            </Link>
          </div>
        </div>

        {/* Carte de démonstration */}
        <div className="relative mx-auto w-full max-w-md">
          <div className="card rotate-1 overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-honey-300 font-display font-bold">É</span>
              <div>
                <p className="font-display font-semibold">École des Coquelicots</p>
                <p className="text-xs text-leaf-900/50">il y a 3 sem. · 📍 Namur</p>
              </div>
              <span className="chip ml-auto bg-leaf-100 px-2.5 py-1 text-xs text-leaf-700">🌱 Graine</span>
            </div>
            <div className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-honey-100 via-leaf-50 to-leaf-200 text-8xl">
              🐞🏠
            </div>
            <div className="p-4">
              <p className="font-display text-lg font-bold">Notre hôtel à insectes, construit avec les élèves</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <span className="rounded-xl bg-sky-100 px-3 py-2">👀 <b>5 200</b> touchés</span>
                <span className="rounded-xl bg-honey-100 px-3 py-2">🐝 <b>430</b> pollinisations</span>
                <span className="rounded-xl bg-leaf-100 px-3 py-2">🧑‍🌾 <b>76</b> se sont lancés</span>
                <span className="rounded-xl bg-petal-100 px-3 py-2">🌸 <b>24</b> floraisons</span>
              </div>
              <div className="mt-4 flex gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-honey-400 px-4 py-2 font-display text-sm font-semibold shadow-[0_3px_0_0_#D48F00]">
                  🐝 Pollinisé
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-leaf-50 px-4 py-2 font-display text-sm font-semibold text-leaf-700 ring-2 ring-leaf-200">
                  🌱 Je me lance
                </span>
              </div>
            </div>
          </div>
          {/* Décors : posés par-dessus la carte (z-10), sinon la carte inclinée les recouvre */}
          <span aria-hidden className="pointer-events-none absolute -left-4 -top-8 z-10 animate-float text-5xl drop-shadow-md">🐝</span>
          <span aria-hidden className="pointer-events-none absolute -bottom-5 -right-2 z-10 animate-float text-5xl drop-shadow-md [animation-delay:1.2s]">🌼</span>
          <span aria-hidden className="pointer-events-none absolute -bottom-6 left-24 z-10 animate-float text-4xl drop-shadow-md [animation-delay:2s]">🌿</span>
        </div>
      </section>

      {/* Polliniser vs liker */}
      <section className="card p-6 sm:p-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">🐝 Polliniser, ce n&apos;est pas liker</h2>
          <p className="mx-auto mt-2 max-w-2xl text-leaf-900/70">
            « Cette idée est utile. Elle mérite de voyager, d&apos;inspirer d&apos;autres personnes et de prendre racine ailleurs. »
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl bg-leaf-900/5 p-5">
            <p className="mb-3 font-display font-semibold text-leaf-900/50">Réseau social traditionnel</p>
            {COMPARE.map(([a]) => (
              <p key={a} className="py-2 text-leaf-900/50 line-through decoration-petal-300 decoration-2">{a}</p>
            ))}
          </div>
          <div className="rounded-3xl bg-honey-100 p-5">
            <p className="mb-3 font-display font-semibold text-honey-600">EarthConnect</p>
            {COMPARE.map(([, b]) => (
              <p key={b} className="py-2 font-semibold">✓ {b}</p>
            ))}
          </div>
        </div>
      </section>

      {/* De la graine à la floraison */}
      <section>
        <h2 className="text-center text-3xl font-bold sm:text-4xl">De la graine à la floraison</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-leaf-900/70">
          Comme une abeille transporte le pollen d&apos;une fleur à l&apos;autre, tu transportes une bonne idée d&apos;un lieu à un autre.
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card relative p-5">
              <span className="absolute right-4 top-4 font-display text-4xl font-bold text-leaf-900/5">{i + 1}</span>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-leaf-50 text-3xl">{s.emoji}</span>
              <h3 className="mt-3 font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-leaf-900/70">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Vocabulaire */}
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">Un univers qui donne envie d&apos;agir</h2>
          <p className="mt-3 text-leaf-900/70">
            Ni followers, ni likes, ni influenceurs. On ne vient pas expliquer aux autres ce qu&apos;ils devraient faire : on
            montre ce qu&apos;on a réalisé et on offre des idées à s&apos;approprier.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {WORDS.map(([emoji, word, meaning]) => (
            <div key={word} className="card p-4 text-center transition hover:-translate-y-1">
              <div className="text-3xl">{emoji}</div>
              <p className="mt-1 font-display font-bold">{word}</p>
              <p className="text-xs text-leaf-900/50">{meaning}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Statuts */}
      <section className="card p-6 sm:p-10">
        <h2 className="text-center text-3xl font-bold">Ta reconnaissance : faire circuler les bonnes pratiques</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-5">
          {LEVELS.map((l) => (
            <div key={l.name} className="rounded-3xl bg-gradient-to-b from-honey-50 to-leaf-50 p-4 text-center">
              <div className="text-4xl">{l.emoji}</div>
              <p className="mt-2 font-display font-bold leading-tight">{l.name}</p>
              <p className="mt-1 text-xs text-leaf-900/60">{l.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Communes et organisations */}
      <section className="card overflow-hidden bg-gradient-to-br from-leaf-600 to-leaf-800 p-8 text-white sm:p-12">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <span className="chip bg-white/15 text-white">🏛️ Communes · écoles · associations</span>
            <h2 className="mt-3 text-3xl font-bold">Voyez comment vos initiatives se diffusent</h2>
            <p className="mt-3 text-white/80">
              Actions lancées localement, personnes touchées, pollinisations, actions reproduites, quartiers mobilisés,
              catégories les plus dynamiques : une lecture bien plus parlante que le nombre de vues.
            </p>
            <Link href="/impact" className="btn-honey mt-6">
              Voir le tableau d&apos;impact 🌻
            </Link>
          </div>
          <blockquote className="rounded-3xl bg-white/10 p-6 font-display text-xl leading-snug backdrop-blur">
            « Les initiatives de notre territoire ont été pollinisées dans six quartiers et ont donné naissance à 85 nouvelles
            actions citoyennes. »
          </blockquote>
        </div>
      </section>

      {/* Appel final */}
      <section className="text-center">
        <p className="text-5xl">🌍🐝🌸</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">
          Une action commence quelque part. EarthConnect l&apos;aide à fleurir partout.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/signup" className="btn-primary px-8 py-4 text-lg">
            Rejoindre EarthConnect
          </Link>
          <Link href="/new" className="btn-honey px-8 py-4 text-lg">
            🌱 Planter ma première graine
          </Link>
        </div>
      </section>

      <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-leaf-800/60 sm:hidden">
        {LEGAL_PAGES.map((p) => (
          <Link key={p.href} href={p.href} className="underline">
            {p.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
