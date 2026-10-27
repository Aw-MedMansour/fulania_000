import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, BookOpen, GraduationCap, Library, Bot, MessageCircle, PlayCircle, LayoutGrid,
  Languages, Users, Globe, Heart, Shield, Mail, Phone,
} from "lucide-react";

import { motion } from "framer-motion";
import portraitImg from "@/assets/culture-portrait.jpg";
import patternImg from "@/assets/pattern.jpg";
import issaPhoto from "@/assets/issa-mboh.jpeg.asset.json";
import aliPhoto from "@/assets/ali-diallo.jpeg.asset.json";
import meimounaPhoto from "@/assets/meimouna-sy.jpeg.asset.json";
import ousmanePhoto from "@/assets/ousmane-deh.jpeg.asset.json";
import awMansourPhoto from "@/assets/aw-mansour.jpeg.asset.json";
import { SiteHeader, SiteFooter } from "@/components/layout";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/reveal";
import { Eyebrow } from "@/components/eyebrow";
import { ContactSection } from "@/components/contact-section";
import { PressBand } from "@/components/press-band";
import { DiscoverVideos } from "@/components/discover-videos";
import { LOGO_URL } from "@/components/brand-logo";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const TOOLS = [
  { to: "/chat", icon: Bot, title: "Assistant IA", desc: "Posez vos questions et échangez en Pulaar, français, anglais ou arabe avec une IA dédiée au monde peul." },
  { to: "/translate", icon: Languages, title: "Traduction dialectale", desc: "Comparez un mot ou une phrase entre Fuuta Tooro, Fuuta Jaloo, Maasina et Aadamaawa, avec écoute audio." },
  { to: "/dictionary", icon: BookOpen, title: "Dictionnaire", desc: "Cherchez un mot Pulaar ↔ français ↔ anglais ↔ arabe, classé par domaine et dialecte." },
  { to: "/learn", icon: GraduationCap, title: "Apprentissage", desc: "Leçons, flashcards, quiz et tuteur IA pour progresser à votre rythme." },
  { to: "/culture", icon: Library, title: "Culture & bibliothèque", desc: "Proverbes, contes, traditions et livres autour de la culture peule." },
] as const;



export const Route = createFileRoute("/")({
  ssr: false,


  head: () => {
    const l = getCurrentLang();
    return {
      meta: [
        { title: tFor(l, "seo./.title") },
        { name: "description", content: tFor(l, "seo./.desc") },
        { property: "og:title", content: tFor(l, "seo./.title") },
        { property: "og:description", content: tFor(l, "seo./.desc") },
        { property: "og:url", content: "https://www.fulania.com/" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: "https://www.fulania.com/" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "FulanIA",
            url: "https://fulania.com/",
            inLanguage: ["fr", "ff", "en", "ar"],
            description: tFor(l, "seo./.desc"),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "FulanIA",
            url: "https://fulania.com/",
            logo: "https://fulania.com/icons/icon-512.png",
            description:
              "FulanIA — assistant intelligent dédié à la langue Pulaar/Fulfulde et à la culture Peule.",
            founder: { "@type": "Person", name: "Aw Mohamedou Mansour" },
            sameAs: [
              "https://fulania.com",
              "https://www.facebook.com/share/1D6ac9C3Qs/?mibextid=wwXIfr",
              "https://whatsapp.com/channel/0029VabnVHaDuMRcgOMKpM3s",
              "https://www.tiktok.com/@anssour",
              "https://www.youtube.com/@FulanIA-TV",
            ],
          }),
        },
      ],
    };
  },
  component: Index,
});

function Index() {
  const { t } = useLanguage();
  const [showDialects, setShowDialects] = useState(false);

  const dialects = [
    { name: "Nigeria", zone: "Fulfulde", speakers: "25 – 35 M", note: "" },
    { name: "Guinée", zone: "Pular (Fuuta Jaloo)", speakers: "8 – 10 M", note: "" },
    { name: "Sénégal", zone: "Pulaar (Fuuta Tooro)", speakers: "4 – 6 M", note: "" },
    { name: "Mali", zone: "Fulfulde (Maasina)", speakers: "3 – 5 M", note: "" },
    { name: "Cameroun", zone: "Fulfulde (Aadamaawa)", speakers: "3 – 4 M", note: "" },
    { name: "Niger", zone: "Fulfulde", speakers: "2 – 3 M", note: "" },
    { name: "Tchad", zone: "Fulfulde", speakers: "2 – 3 M", note: "" },
    { name: "Burkina Faso", zone: "Fulfulde", speakers: "1,8 – 2,4 M", note: "" },
    { name: "Bénin", zone: "Fulfulde", speakers: "0,9 – 1,2 M", note: "" },
    { name: "Mauritanie", zone: "Pulaar", speakers: "0,8 – 1,1 M", note: "" },
    { name: "Soudan", zone: "Fulfulde", speakers: "0,8 – 1,0 M", note: "" },
    { name: "Gambie", zone: "Pulaar", speakers: "0,54 – 0,72 M", note: "" },
    { name: "Côte d'Ivoire", zone: "Fulfulde", speakers: "~ 0,5 M", note: "" },
    { name: "Guinée-Bissau", zone: "Pular", speakers: "0,44 – 0,65 M", note: "" },
    { name: "Sierra Leone", zone: "Pular", speakers: "0,35 – 0,52 M", note: "" },
    { name: "RCA", zone: "Fulfulde", speakers: "0,36 – 0,42 M", note: "" },
    { name: "Ghana", zone: "Fulfulde", speakers: "1 – 2 M", note: "" },
    { name: "Togo", zone: "Fulfulde", speakers: "0,13 – 0,19 M", note: "" },
  ];




  const phases = [
    { id: 1, title: t("phase.1.t"), body: t("phase.1.b") },
    { id: 2, title: t("phase.2.t"), body: t("phase.2.b") },
    { id: 3, title: t("phase.3.t"), body: t("phase.3.b") },
    { id: 4, title: t("phase.4.t"), body: t("phase.4.b") },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-earth text-cream">
        <div className="absolute inset-0 bg-dot-gold opacity-[0.07]" aria-hidden />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-[var(--gold)]/15 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-primary/20 blur-3xl" aria-hidden />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-6 sm:pt-20 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pb-28 lg:pt-24">
          <motion.div
            className="min-w-0 lg:col-span-7"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.p
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold)]"
            >
              <span className="h-px w-8 bg-[var(--gold)]" aria-hidden />
              {t("hero.badge")}
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.025em] text-balance sm:text-6xl lg:text-[4.5rem]"
            >
              {t("hero.title1")}{" "}
              <span className="italic font-normal text-[var(--gold)]">{t("hero.title2")}</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base leading-relaxed text-cream/85 sm:text-lg">
              {t("hero.subtitle")}
            </motion.p>

            <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/chat"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--gold)] px-6 py-4 text-sm font-semibold text-earth shadow-[0_12px_40px_-12px_var(--gold)] transition hover:brightness-105"
              >
                {t("hero.cta1")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#decouvrir"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-cream/25 px-6 py-4 text-sm font-medium text-cream transition hover:border-cream/60 hover:bg-cream/5"
              >
                <PlayCircle className="h-4 w-4" />
                {t("hero.cta2")}
              </a>
            </motion.div>
          </motion.div>

          {/* Visuel : logo + langues, purement illustratif */}
          <motion.div
            className="relative mx-auto w-full max-w-[17rem] sm:max-w-sm lg:col-span-5 lg:max-w-none"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            aria-hidden
          >
            <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
              <div className="absolute inset-0 rounded-full border border-cream/10" />
              <div className="absolute inset-[12%] rounded-full border border-dashed border-[var(--gold)]/25" />
              <div className="absolute inset-[26%] overflow-hidden rounded-[2rem] bg-[oklch(1_0_0)] shadow-[0_30px_80px_-20px_oklch(0_0_0/0.6)] ring-1 ring-[var(--gold)]/40">
                <img src={LOGO_URL} alt="" className="h-full w-full scale-[1.2] object-contain" decoding="async" />
              </div>
              {[
                { label: "Pulaar", pos: "left-[2%] top-[18%]" },
                { label: "Français", pos: "right-[0%] top-[10%]" },
                { label: "English", pos: "right-[-2%] bottom-[22%]" },
                { label: "العربية", pos: "left-[4%] bottom-[12%]" },
              ].map((c) => (
                <span
                  key={c.label}
                  className={`absolute ${c.pos} inline-flex items-center gap-1.5 rounded-full border border-cream/15 bg-earth/80 px-3 py-1.5 text-xs font-medium text-cream shadow-lg backdrop-blur`}
                >
                  <MessageCircle className="h-3 w-3 text-[var(--gold)]" />
                  {c.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="piliers" className="scroll-mt-20 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow>La plateforme</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-balance sm:text-5xl">
              Ce que vous pouvez faire avec FulanIA
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Des outils disponibles dès maintenant, gratuitement et sans compte obligatoire.
            </p>
          </Reveal>

          <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map(({ to, icon: Icon, title, desc }) => (
              <StaggerItem key={to}>
                <Link
                  to={to}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-primary/50 hover:shadow-lg"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    Ouvrir <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
            <StaggerItem>
              <Link
                to="/hub"
                className="group flex h-full flex-col justify-between rounded-2xl bg-earth p-6 text-cream transition hover:shadow-lg"
              >
                <LayoutGrid className="h-7 w-7 text-[var(--gold)]" />
                <div className="mt-6">
                  <h3 className="font-display text-xl font-semibold">Tous les outils</h3>
                  <p className="mt-2 text-sm text-cream/75">Retrouvez l'ensemble des services et leur statut dans le Hub.</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--gold)]">
                    Accéder au Hub <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      {/* DÉCOUVREZ FULANIA — vidéos */}
      <DiscoverVideos />
      <PressBand />


      {/* PROBLEM */}
      <section className="bg-secondary/40 bg-grain py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow>{t("problem.tag")}</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">{t("problem.title")}</h2>
            <p className="mt-5 text-lg text-muted-foreground">{t("problem.body")}</p>
          </Reveal>

          <StaggerGroup className="mt-12 grid gap-4 lg:grid-cols-2">
            <StaggerItem className="rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:shadow-lg">
              <h3 className="font-display text-lg font-semibold text-foreground">{t("problem.other")}</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {[t("problem.other1"), t("problem.other2"), t("problem.other3"), t("problem.other4")].map((x) => (
                  <li key={x} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-foreground/40" aria-hidden />
                    <span className="text-foreground/80">{x}</span>
                  </li>
                ))}
              </ul>
            </StaggerItem>
            <StaggerItem className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-7 transition hover:-translate-y-1 hover:shadow-lg">
              <h3 className="font-display text-lg font-semibold text-primary">{t("problem.pulaar")}</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {[t("problem.pulaar1"), t("problem.pulaar2"), t("problem.pulaar3"), t("problem.pulaar4")].map((x, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary" aria-hidden />
                    <span className="text-foreground/80">{x}</span>
                  </li>
                ))}
              </ul>
            </StaggerItem>
          </StaggerGroup>


          <Reveal>
            <p className="mt-10 max-w-3xl border-l-2 border-primary pl-5 font-display text-xl italic text-foreground/90">
              {t("problem.quote")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* CULTURE */}
      <section id="culture" className="relative overflow-hidden bg-earth py-24 text-cream">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "400px" }} aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow tone="gold">{t("culture.tag")}</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">{t("culture.title")}</h2>
            <p className="mt-5 text-lg text-cream/75">{t("culture.body")}</p>
          </Reveal>

          <button
            type="button"
            onClick={() => setShowDialects((v) => !v)}
            className="mt-8 w-full rounded-xl border border-cream/15 bg-cream/[0.03] px-4 py-3 text-left font-display text-base font-semibold text-[var(--gold)] transition hover:border-[var(--gold)]/40 hover:bg-cream/[0.06]"
            aria-expanded={showDialects}
          >
            Pulaar {showDialects ? "▾" : "▸"}
            <span className="ml-2 text-xs font-normal text-cream/60">
              {showDialects ? "Masquer les variantes" : "Voir les variantes dialectales"}
            </span>
          </button>

          {showDialects && (
            <Reveal delay={0.1} className="mt-4 overflow-hidden rounded-2xl border border-cream/15">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream/5 text-[var(--gold)]">
                  <tr>
                    <th className="px-5 py-4 font-display text-xs uppercase tracking-wider">{t("culture.col.dialect")}</th>
                    <th className="px-5 py-4 font-display text-xs uppercase tracking-wider">{t("culture.col.zone")}</th>
                    <th className="px-5 py-4 font-display text-xs uppercase tracking-wider">{t("culture.col.speakers")}</th>
                    <th className="hidden px-5 py-4 font-display text-xs uppercase tracking-wider sm:table-cell">{t("culture.col.notes")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream/10">
                  {dialects.map((d, i) => (
                    <motion.tr
                      key={d.name}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.45, delay: Math.min(i * 0.03, 0.4), ease: [0.22, 1, 0.36, 1] }}
                      className="transition-colors hover:bg-cream/[0.04]"
                    >
                      <td className="px-5 py-4 font-display text-base font-semibold">{d.name}</td>
                      <td className="px-5 py-4 text-cream/80">{d.zone}</td>
                      <td className="px-5 py-4 text-[var(--gold)]">{d.speakers}</td>
                      <td className="hidden px-5 py-4 text-cream/70 sm:table-cell">{d.note}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          )}

        </div>
      </section>


      {/* VISION */}
      <section id="vision" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
            <Reveal>
              <Eyebrow>{t("vision.tag")}</Eyebrow>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance">{t("vision.title")}</h2>
              <p className="mt-5 text-muted-foreground">{t("vision.body")}</p>
              <StaggerGroup className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, label: t("vision.preserve") },
                  { icon: Heart, label: t("vision.transmit") },
                  { icon: GraduationCap, label: t("vision.educate") },
                  { icon: Globe, label: t("vision.value") },
                  { icon: Users, label: t("vision.gather") },
                  { icon: Languages, label: t("vision.include") },
                ].map(({ icon: Icon, label }) => (
                  <StaggerItem key={label} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm transition hover:border-primary/40 hover:bg-primary/5">
                    <Icon className="h-4 w-4 text-primary" />{label}
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </Reveal>

            <div>
              <Reveal>
                <h3 className="font-display text-2xl font-semibold">{t("vision.roadmap")}</h3>
              </Reveal>
              <StaggerGroup className="mt-6 space-y-5">
                {phases.map((p) => (
                  <StaggerItem key={p.id} className="relative rounded-2xl border border-border bg-card p-6 pl-20 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                    <div className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-base font-bold text-primary-foreground shadow-md">{p.id}</div>
                    <h4 className="font-display text-lg font-semibold">{t("vision.phase")} {p.id} — {p.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>
          </div>
        </div>
      </section>

      {/* COMITÉ EXÉCUTIF */}
      <section id="comite" className="border-t border-border/60 bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow align="center">Équipe</Eyebrow>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
                Comité Exécutif FulanIA
              </h2>
              <p className="mt-5 text-muted-foreground">
                Les femmes et hommes qui portent la mission FulanIA — préserver, transmettre et valoriser le Pulaagu à l'ère de l'IA.
              </p>
            </div>
          </Reveal>

          <StaggerGroup className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Aw Mohamedou Mansour",
                role: "Fondateur · Responsable du Développement Informatique",
                bio: "Étudiant en Master en biotechnologie végétale à l'Université M'Hamed Bougara Boumerdés (Algérie). Titulaire d'une licence professionnelle en agronomie à l'ISET Rosso.",
                photo: awMansourPhoto.url,
              },
              {
                name: "Meimouna Sy",
                role: "Vice-Présidente · Responsable Sensibilisation & Communication",
                bio: "Étudiante en master science des eaux à l'ISSTE GABES — Tunisie. Titulaire d'une licence professionnelle en Génie Rural à l'ISET Rosso. Originaire de Abbé Daande Maayo.",
                photo: meimounaPhoto.url,
              },
              {
                name: "Issa Mboh",
                role: "Trésorier · Conseiller Principal · Adjoint & Représentant Europe / International",
                bio: "Étudiant en master à l'Université Dunărea de Jos de Galați (Roumanie), titulaire d'une licence pro en agroalimentaire. Originaire du Guidimakha (Ould Yenge).",
                photo: issaPhoto.url,
              },
              {
                name: "Ali Hamadi Diallo",
                role: "Responsable des Partenariats & Gestion de Programme",
                bio: "Employé à l'AMAD CERAI — Mauritanie. Diplômé de l'ISET de Rosso. Originaire du village de Lougere Dadi (région du Gorgol, à côté de Koundel).",
                photo: aliPhoto.url,
              },
              {
                name: "Ousmane Deh",
                role: "Représentant Europe / International · Responsable Cybersécurité",
                bio: "Étudiant en master à l'Université de Galați (Roumanie). Originaire de Melga (Guidimakha).",
                photo: ousmanePhoto.url,
              },
            ].map((m) => {
              const initials = m.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
              return (
                <StaggerItem key={m.name} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-earth/90 to-earth">
                    {m.photo ? (
                      <img
                        src={m.photo}
                        alt={`Portrait de ${m.name}`}
                        loading="lazy"
                        className="h-full w-full object-cover object-top transition duration-700 [filter:grayscale(0.55)_sepia(0.18)_contrast(1.02)] group-hover:[filter:none] group-hover:scale-[1.03]"
                      />
                    ) : (

                      <div className="flex h-full w-full items-center justify-center">
                        <span className="font-display text-6xl font-semibold text-[var(--gold)]">{initials}</span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-earth/90 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold text-foreground">{m.name}</h3>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wider text-primary">{m.role}</p>
                    <p className="mt-3 text-sm text-muted-foreground">{m.bio}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* PORTEUR DU PROJET */}
      <section id="founder" className="relative overflow-hidden bg-earth py-20 text-cream sm:py-24">
        <div className="absolute inset-0 bg-dot-gold opacity-[0.06] mix-blend-screen" aria-hidden />
        <div className="pointer-events-none absolute -right-24 top-1/4 h-[24rem] w-[24rem] rounded-full bg-[var(--gold)]/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-primary/25 blur-3xl" aria-hidden />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <Eyebrow tone="gold">{t("contact.porter")}</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-balance sm:text-5xl lg:text-6xl">
              {t("author.name")}
            </h2>
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-cream/80 sm:text-lg">
              {t("contact.bio")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:awmedmansour@outlook.com"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-earth shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--gold)]/90"
              >
                <Mail className="h-4 w-4" />
                {t("contact.send")}
              </a>
              <a
                href="tel:+22232256718"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-cream/20 bg-cream/5 px-6 py-3 text-sm font-semibold text-cream transition hover:-translate-y-0.5 hover:border-[var(--gold)]/40 hover:bg-cream/10"
              >
                <Phone className="h-4 w-4" />
                +222 32 25 67 18
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CONTACT */}
      <ContactSection />

      <SiteFooter />
    </div>
  );
}
