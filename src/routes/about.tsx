import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, BookOpen, GraduationCap, Languages, Library, Mail, Target, Telescope, Volume2 } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/layout";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/reveal";
import { Eyebrow } from "@/components/eyebrow";
import { LOGO_URL } from "@/components/brand-logo";

const TITLE = "À propos de FulanIA — IA dédiée au Pulaar et au Fulfulde";
const DESC =
  "FulanIA développe des outils d'intelligence artificielle pour le Pulaar et le Fulfulde : assistant, traduction, dictionnaire, apprentissage et ressources culturelles.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.fulania.com/about" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://www.fulania.com/about" }],
  }),
  component: AboutPage,
});

const ECOSYSTEM = [
  { to: "/chat", icon: Bot, title: "Assistant IA", desc: "Une interface conversationnelle pour poser vos questions en Pulaar, français, anglais ou arabe." },
  { to: "/translate", icon: Languages, title: "Traduction", desc: "Comparer mots et phrases entre les grandes variantes dialectales du Pulaar / Fulfulde." },
  { to: "/learn", icon: GraduationCap, title: "Apprentissage", desc: "Leçons, flashcards, quiz et tuteur IA pour découvrir et apprendre la langue." },
  { to: "/dictionary", icon: Volume2, title: "Voix et audio", desc: "Écoute de la prononciation dans le dictionnaire et la traduction (synthèse vocale)." },
  { to: "/dictionary", icon: BookOpen, title: "Dictionnaire", desc: "Des milliers d'entrées Pulaar ↔ français ↔ anglais ↔ arabe, classées par domaine." },
  { to: "/culture", icon: Library, title: "Ressources culturelles", desc: "Proverbes, contes, traditions et bibliothèque autour du monde peul." },
] as const;

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Présentation */}
      <section className="relative overflow-hidden bg-earth text-cream">
        <div className="absolute inset-0 bg-dot-gold opacity-[0.07]" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-6 sm:py-24 lg:grid-cols-12 lg:px-8">
          <div className="min-w-0 lg:col-span-8">
            <Eyebrow tone="gold">Qui sommes-nous</Eyebrow>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-balance sm:text-6xl">
              À propos de FulanIA
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream/85 sm:text-lg">
              FulanIA est une plateforme d'intelligence artificielle dédiée au Pulaar et au Fulfulde. Elle développe des
              outils numériques destinés à faciliter les échanges, la traduction, l'apprentissage et l'accès aux
              connaissances linguistiques et culturelles.
            </p>
            <Link
              to="/hub"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--gold)] px-6 py-4 text-sm font-semibold text-earth transition hover:brightness-105"
            >
              Découvrir la plateforme <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="hidden lg:col-span-4 lg:block" aria-hidden>
            <div className="mx-auto aspect-square w-64 overflow-hidden rounded-[2rem] bg-[oklch(1_0_0)] ring-1 ring-[var(--gold)]/40 shadow-2xl">
              <img src={LOGO_URL} alt="" className="h-full w-full scale-[1.2] object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <Reveal className="rounded-2xl border border-border bg-card p-8">
            <Target className="h-7 w-7 text-primary" aria-hidden />
            <h2 className="mt-5 font-display text-3xl font-semibold">Notre mission</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Contribuer à la préservation, à la transmission et à la valorisation de la langue et de la culture peules
              grâce à l'intelligence artificielle et aux technologies numériques.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="rounded-2xl border border-border bg-card p-8">
            <Telescope className="h-7 w-7 text-primary" aria-hidden />
            <h2 className="mt-5 font-display text-3xl font-semibold">Notre vision</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Faire de FulanIA une référence dans le développement d'outils d'intelligence artificielle adaptés au Pulaar
              et au Fulfulde, en proposant des solutions numériques accessibles, interactives et utiles aux locuteurs
              comme aux personnes qui souhaitent apprendre ces langues.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Écosystème */}
      <section className="bg-secondary/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow>Écosystème</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-5xl">L'écosystème FulanIA</h2>
            <p className="mt-4 text-muted-foreground">Les outils actuellement disponibles sur la plateforme.</p>
          </Reveal>
          <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ECOSYSTEM.map(({ to, icon: Icon, title, desc }) => (
              <StaggerItem key={title}>
                <Link to={to} className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-primary/50 hover:shadow-lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Ouvrir <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Collaboration */}
      <section className="py-20 sm:py-24">
        <Reveal className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Eyebrow align="center">Collaboration</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold text-balance sm:text-4xl">
            Utilisateurs, développeurs, linguistes, partenaires : construisons ensemble
          </h2>
          <p className="mt-5 font-display text-xl italic text-primary">
            « Notre culture, notre force. L'intelligence, notre avenir. »
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
              <Mail className="h-4 w-4" /> Nous contacter
            </Link>
            <Link to="/support" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3.5 text-sm font-medium transition hover:border-primary/50">
              Soutenir le projet
            </Link>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
