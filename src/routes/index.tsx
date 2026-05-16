import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  GraduationCap,
  Mic,
  Library,
  Bot,
  XCircle,
  CheckCircle2,
  Languages,
  Users,
  Globe,
  Heart,
  Lightbulb,
  Shield,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import heroImg from "@/assets/hero-sahel.jpg";
import portraitImg from "@/assets/culture-portrait.jpg";
import patternImg from "@/assets/pattern.jpg";
import { SiteHeader, SiteFooter } from "@/components/layout";

export const Route = createFileRoute("/")({
  component: Index,
});

const dialects = [
  { name: "Pulaar", zone: "Sénégal, Mauritanie", speakers: "~5 M", note: "Fouta Toro, Halpulaar" },
  { name: "Pular", zone: "Guinée", speakers: "~8 M", note: "Fouta Djallon" },
  { name: "Fulfulde", zone: "Cameroun, Mali, Niger", speakers: "~15 M", note: "Sahel & Afrique centrale" },
  { name: "Fula", zone: "Gambie, Sierra Leone, Nigeria", speakers: "~20 M", note: "Afrique de l'Ouest" },
];

const pulaaku = [
  { word: "Semteende", meaning: "Pudeur, retenue et dignité", icon: Shield },
  { word: "Munyal", meaning: "Patience, endurance et stoïcisme", icon: Heart },
  { word: "Hakkiilo", meaning: "Sagesse, intelligence et réflexion", icon: Lightbulb },
  { word: "Neddaaku", meaning: "Humanité, générosité et communauté", icon: Users },
];

const piliers = [
  {
    icon: Bot,
    title: "Assistant IA",
    desc: "Réponses 24h/24 en Pulaar, Pular, Fulfulde, Fula, français et arabe. Mémoire conversationnelle, réponses sourcées.",
  },
  {
    icon: BookOpen,
    title: "Dictionnaire interactif",
    desc: "Multilingue Pulaar ↔ Français ↔ Arabe ↔ Anglais. Prononciation audio, proverbes, expressions idiomatiques.",
  },
  {
    icon: GraduationCap,
    title: "Système d'apprentissage",
    desc: "Évaluation initiale, parcours personnalisé du débutant à l'avancé, exercices interactifs et suivi de progression.",
  },
  {
    icon: Mic,
    title: "Voix & Audio",
    desc: "Reconnaissance vocale adaptée aux phonèmes spéciaux (ɓ, ɗ, ƴ, ŋ). Synthèse vocale et correction temps réel.",
  },
  {
    icon: Library,
    title: "Bibliothèque culturelle",
    desc: "Histoire du Fouta Toro, biographies (El Hadj Oumar Tall, Thierno Souleymane Baal), arts, rites, organisation sociale.",
  },
];

const publics = [
  { tag: "Locuteurs natifs", desc: "Approfondir, retrouver des mots oubliés, transmettre aux enfants." },
  { tag: "Diaspora Peule", desc: "Reconnecter avec leurs racines, apprendre ou retrouver la langue." },
  { tag: "Enfants & jeunes", desc: "Apprendre la langue de leurs parents dans un format moderne et ludique." },
  { tag: "Chercheurs & linguistes", desc: "Accéder à une base de données culturelle et linguistique fiable." },
  { tag: "Curieux & apprenants", desc: "Découvrir une langue et une culture fascinantes." },
  { tag: "ONG & institutions", desc: "Outils pour des programmes éducatifs et culturels." },
];

const phases = [
  { id: 1, title: "Lancement", body: "Assistant IA conversationnel, dictionnaire de base, site web vitrine." },
  { id: 2, title: "Développement", body: "Système d'apprentissage par niveaux, reconnaissance vocale, contenu enrichi." },
  { id: 3, title: "Expansion", body: "Application mobile iOS & Android, partenariats institutionnels, version multilingue complète." },
  { id: 4, title: "Croissance", body: "Modèle IA entraîné spécifiquement sur le Pulaar, communauté de contributeurs." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Bergers Peuls dans le Sahel au coucher du soleil"
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-earth/95 via-earth/80 to-earth/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-earth/80 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-2xl text-cream">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-earth/40 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--gold)] backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Premier assistant IA dédié à la culture Peule
            </div>

            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              L'intelligence artificielle au service du{" "}
              <span className="italic text-[var(--gold)]">Pulaagu</span>.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-cream/85">
              FulanIA préserve, transmet et valorise la langue Pulaar et la culture Halpulaar
              grâce à l'IA. Un griot du XXI<sup>e</sup> siècle, accessible à tous, partout.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-earth shadow-lg transition hover:bg-[var(--gold)]/90"
              >
                Discuter avec FulanIA
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#solution"
                className="inline-flex items-center gap-2 rounded-md border border-cream/30 px-6 py-3 text-sm font-medium text-cream backdrop-blur transition hover:bg-cream/10"
              >
                Découvrir le projet
              </a>
            </div>

            <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-cream/20 pt-6">
              <div>
                <dt className="text-xs uppercase tracking-widest text-cream/60">Locuteurs</dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-[var(--gold)]">50–60 M</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-cream/60">Pays</dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-[var(--gold)]">20+</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-cream/60">Dialectes</dt>
                <dd className="mt-1 font-display text-2xl font-semibold text-[var(--gold)]">4</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="bg-secondary/40 bg-grain py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.2em] text-primary">Le constat</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
              Une langue de millions de personnes, invisible en ligne.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              En 2026, tapez « apprendre le Pulaar » sur Google — vous ne trouverez presque rien.
              Pourtant, des outils existent pour le Klingon, langue d'une série télévisée. Le
              Pulaar, parlé par des dizaines de millions de personnes, est ignoré par les grands
              modèles d'IA.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-7">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Pour d'autres langues
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  "Duolingo — 40+ langues disponibles",
                  "Google Translate — 130+ langues",
                  "Wikipedia en 300+ langues",
                  "Assistants IA multilingues",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-700" />
                    <span className="text-foreground/80">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-7">
              <h3 className="font-display text-lg font-semibold text-primary">Pour le Pulaar</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  "Aucune application d'apprentissage sérieuse",
                  "Support très limité, souvent inexact",
                  "Contenu quasi inexistant",
                  "Ignoré par tous les grands modèles",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 flex-none text-primary" />
                    <span className="text-foreground/80">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-10 max-w-3xl border-l-2 border-primary pl-5 font-display text-xl italic text-foreground/90">
            Des enfants de la diaspora qui ne peuvent plus parler à leurs grands-parents. Une
            culture immense, silencieuse sur internet. Un savoir ancestral en danger.
          </p>
        </div>
      </section>

      {/* SOLUTION */}
      <section id="solution" className="py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-primary">Notre réponse</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
              FulanIA — un pont entre tradition et technologie.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              <strong className="text-foreground">FulanIA = Fulani (Peul) + IA</strong>. Le premier
              assistant intelligent entièrement dédié à la langue et à la culture Peule, pour les
              locuteurs natifs comme pour les curieux du monde entier.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm uppercase tracking-wider text-muted-foreground">FulanIA n'est pas</p>
                <p className="mt-1.5 text-foreground/80">
                  Un simple dictionnaire, ni un outil réservé aux Peuls.
                </p>
              </div>
              <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5">
                <p className="text-sm uppercase tracking-wider text-primary">FulanIA est</p>
                <p className="mt-1.5 text-foreground">
                  Un compagnon intelligent 24h/24, un espace de préservation culturelle, un outil
                  ouvert à tous — <em className="font-display">le griot du XXI<sup>e</sup> siècle</em>.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-[var(--gold)]/20 blur-2xl" aria-hidden />
            <img
              src={portraitImg}
              alt="Portrait Peul"
              loading="lazy"
              width={1024}
              height={1024}
              className="relative aspect-square w-full rounded-2xl object-cover shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 max-w-[240px] rounded-xl border border-border bg-card p-4 shadow-xl">
              <p className="font-display text-sm italic text-primary">« Pulaagu ko ngallu mawngu »</p>
              <p className="mt-1 text-xs text-muted-foreground">
                La culture Peule est une grande richesse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CULTURE */}
      <section id="culture" className="relative overflow-hidden bg-earth py-24 text-cream">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "400px" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
              Langue & Culture
            </span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
              Un peuple immense, une civilisation millénaire.
            </h2>
            <p className="mt-5 text-lg text-cream/75">
              Des Halpulaar du fleuve Sénégal aux Fulɓe du Sahel, une famille linguistique répartie
              sur plus de 20 pays et quatre grandes variantes dialectales.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-cream/15">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream/5 text-[var(--gold)]">
                <tr>
                  <th className="px-5 py-4 font-display text-xs uppercase tracking-wider">Dialecte</th>
                  <th className="px-5 py-4 font-display text-xs uppercase tracking-wider">Zone</th>
                  <th className="px-5 py-4 font-display text-xs uppercase tracking-wider">Locuteurs</th>
                  <th className="hidden px-5 py-4 font-display text-xs uppercase tracking-wider sm:table-cell">
                    Particularités
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream/10">
                {dialects.map((d) => (
                  <tr key={d.name}>
                    <td className="px-5 py-4 font-display text-base font-semibold">{d.name}</td>
                    <td className="px-5 py-4 text-cream/80">{d.zone}</td>
                    <td className="px-5 py-4 text-[var(--gold)]">{d.speakers}</td>
                    <td className="hidden px-5 py-4 text-cream/70 sm:table-cell">{d.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pulaaku */}
          <div className="mt-20">
            <h3 className="font-display text-3xl font-semibold sm:text-4xl">
              Le <span className="italic text-[var(--gold)]">Pulaaku</span> — le code moral Peul
            </h3>
            <p className="mt-3 max-w-2xl text-cream/75">
              Le fondement identitaire du peuple Peul. Quatre valeurs cardinales que FulanIA
              cherche à préserver et transmettre.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pulaaku.map(({ word, meaning, icon: Icon }) => (
                <div
                  key={word}
                  className="group rounded-2xl border border-cream/15 bg-cream/[0.03] p-6 transition hover:border-[var(--gold)]/50 hover:bg-cream/[0.06]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gold)]/15 text-[var(--gold)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 font-display text-2xl font-semibold text-[var(--gold)]">{word}</p>
                  <p className="mt-2 text-sm text-cream/75">{meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PILIERS */}
      <section id="piliers" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.2em] text-primary">La plateforme</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
              Cinq piliers, un écosystème complet.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              FulanIA est pensée comme une plateforme intégrée, accessible sur mobile et sur
              ordinateur.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {piliers.map(({ icon: Icon, title, desc }, idx) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
              >
                <div className="absolute right-5 top-5 font-display text-5xl font-bold text-primary/10">
                  0{idx + 1}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
            <Link
              to="/chat"
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-primary bg-primary p-7 text-primary-foreground transition hover:-translate-y-1 hover:bg-primary/90"
            >
              <Sparkles className="h-8 w-8" />
              <div>
                <h3 className="font-display text-xl font-semibold">Essayer maintenant</h3>
                <p className="mt-2 text-sm text-primary-foreground/85">
                  L'assistant IA est en ligne. Posez votre première question.
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                  Ouvrir le chat <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* PUBLIC */}
      <section className="bg-secondary/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.2em] text-primary">Pour qui ?</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
              FulanIA s'adresse à tous.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publics.map(({ tag, desc }) => (
              <div
                key={tag}
                className="rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
                  <Users className="h-3 w-3" />
                  {tag}
                </div>
                <p className="mt-4 text-sm text-foreground/80">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION */}
      <section id="vision" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-primary">Vision</span>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance">
                Une place pour chaque peuple dans l'espace numérique.
              </h2>
              <p className="mt-5 text-muted-foreground">
                FulanIA aspire à devenir la référence mondiale pour la langue et la culture Peule.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, label: "Préserver" },
                  { icon: Heart, label: "Transmettre" },
                  { icon: GraduationCap, label: "Éduquer" },
                  { icon: Globe, label: "Valoriser" },
                  { icon: Users, label: "Rassembler" },
                  { icon: Languages, label: "Inclure" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display text-2xl font-semibold">Feuille de route</h3>
              <ol className="mt-6 space-y-5">
                {phases.map((p) => (
                  <li
                    key={p.id}
                    className="relative rounded-2xl border border-border bg-card p-6 pl-20"
                  >
                    <div className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-base font-bold text-primary-foreground">
                      {p.id}
                    </div>
                    <h4 className="font-display text-lg font-semibold">Phase {p.id} — {p.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER + CONTACT */}
      <section id="contact" className="relative overflow-hidden bg-earth py-24 text-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
                Le porteur du projet
              </span>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight">
                Aw Mohamedou Mansour
              </h2>
              <p className="mt-5 text-cream/80">
                22 ans, originaire de Lekseiba dans la région du Gorgol, étudiant en Master
                Biotechnologie en Algérie. Malgré sa formation scientifique, il porte une
                conviction profonde : <em>la technologie doit servir toutes les cultures</em>, y
                compris les plus marginalisées dans le monde numérique.
              </p>
              <dl className="mt-8 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {[
                  ["Origine", "Lekseiba, Gorgol"],
                  ["Formation", "Master Biotechnologie — Algérie"],
                  ["Rôle", "Fondateur & Porteur du projet"],
                  ["Localisation", "Boumerdes, Algérie"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-cream/15 p-3">
                    <dt className="text-[10px] uppercase tracking-widest text-[var(--gold)]">{k}</dt>
                    <dd className="mt-1 text-cream">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
                Appel à collaboration
              </span>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight">
                Rejoignez l'aventure FulanIA.
              </h2>
              <p className="mt-5 text-cream/80">
                Nous cherchons développeurs, linguistes, collecteurs de données, partenaires
                institutionnels, ambassadeurs culturels et soutiens financiers.
              </p>

              <div className="mt-8 space-y-3">
                <a
                  href="mailto:awmedmansour@outlook.com"
                  className="flex items-center gap-4 rounded-xl border border-cream/15 bg-cream/[0.03] p-4 transition hover:border-[var(--gold)]/50 hover:bg-cream/[0.08]"
                >
                  <Mail className="h-5 w-5 text-[var(--gold)]" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-cream/60">Email</p>
                    <p className="text-cream">awmedmansour@outlook.com</p>
                  </div>
                </a>
                <a
                  href="tel:+213780306486"
                  className="flex items-center gap-4 rounded-xl border border-cream/15 bg-cream/[0.03] p-4 transition hover:border-[var(--gold)]/50 hover:bg-cream/[0.08]"
                >
                  <Phone className="h-5 w-5 text-[var(--gold)]" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-cream/60">Téléphone / WhatsApp</p>
                    <p className="text-cream">+213 780 30 64 86</p>
                  </div>
                </a>
                <div className="flex items-center gap-4 rounded-xl border border-cream/15 bg-cream/[0.03] p-4">
                  <MapPin className="h-5 w-5 text-[var(--gold)]" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-cream/60">Adresse</p>
                    <p className="text-cream">Boumerdes, Algérie — 29/04/2026</p>
                  </div>
                </div>
              </div>

              <Link
                to="/chat"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-earth transition hover:bg-[var(--gold)]/90"
              >
                Essayer l'assistant IA
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
