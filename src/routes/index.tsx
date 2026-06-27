import { createFileRoute, Link } from "@tanstack/react-router";
import { SocialLinks } from "@/components/social-links";
import { useState } from "react";
import {
  ArrowRight, Sparkles, BookOpen, GraduationCap, Mic, Library, Bot,
  XCircle, CheckCircle2, Languages, Users, Globe, Heart, Lightbulb, Shield,
  Mail, Phone, MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-sahel.jpg";
import portraitImg from "@/assets/culture-portrait.jpg";
import patternImg from "@/assets/pattern.jpg";
import issaPhoto from "@/assets/issa-mboh.jpeg.asset.json";
import aliPhoto from "@/assets/ali-diallo.jpeg.asset.json";
import meimounaPhoto from "@/assets/meimouna-sy.jpeg.asset.json";
import ousmanePhoto from "@/assets/ousmane-deh.jpeg.asset.json";
import awMansourPhoto from "@/assets/aw-mansour.jpeg.asset.json";
import { SiteHeader, SiteFooter } from "@/components/layout";
import { ToolsMarquee } from "@/components/tools-marquee";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/reveal";
import { Eyebrow } from "@/components/eyebrow";
import { CredibilityBand } from "@/components/credibility-band";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";
import { supabase } from "@/integrations/supabase/client";


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
        { property: "og:url", content: "https://fulania.com/" },
      ],
      links: [
        { rel: "canonical", href: "https://fulania.com/" },
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
            potentialAction: {
              "@type": "SearchAction",
              target: "https://fulania.com/dictionary?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "FulanIA",
            url: "https://fulania.com/",
            logo: "https://fulania.com/favicon.ico",
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

  const pulaaku = [
    { word: "Semteende", meaning: t("pulaaku.semteende"), icon: Shield },
    { word: "Munyal", meaning: t("pulaaku.munyal"), icon: Heart },
    { word: "Hakkiilo", meaning: t("pulaaku.hakkiilo"), icon: Lightbulb },
    { word: "Neddaaku", meaning: t("pulaaku.neddaaku"), icon: Users },
  ];

  const piliers = [
    { icon: Bot, title: t("pillar.assistant.t"), desc: t("pillar.assistant.d") },
    { icon: BookOpen, title: t("pillar.dict.t"), desc: t("pillar.dict.d") },
    { icon: GraduationCap, title: t("pillar.learn.t"), desc: t("pillar.learn.d") },
    { icon: Mic, title: t("pillar.voice.t"), desc: t("pillar.voice.d") },
    { icon: Library, title: t("pillar.lib.t"), desc: t("pillar.lib.d") },
  ];

  const publics = [
    { tag: t("public.t1"), desc: t("public.d1") },
    { tag: t("public.t2"), desc: t("public.d2") },
    { tag: t("public.t3"), desc: t("public.d3") },
    { tag: t("public.t4"), desc: t("public.d4") },
    { tag: t("public.t5"), desc: t("public.d5") },
    { tag: t("public.t6"), desc: t("public.d6") },
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt={t("alt.hero")} className="h-full w-full object-cover" width={1920} height={1080} fetchPriority="high" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-br from-earth/95 via-earth/85 to-earth/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-earth via-earth/30 to-transparent" />
          <div className="absolute inset-0 bg-dot-gold opacity-[0.08] mix-blend-screen" aria-hidden />
          <div className="pointer-events-none absolute -right-24 top-1/4 h-[28rem] w-[28rem] rounded-full bg-[var(--gold)]/25 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-primary/30 blur-3xl" aria-hidden />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pt-14 pb-20 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <motion.div
            className="max-w-2xl text-cream"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }}
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-earth/50 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-[var(--gold)] backdrop-blur-md"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] opacity-60 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
              </span>
              {t("hero.badge")}
            </motion.div>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}
              className="mt-6 font-display text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.02em] text-balance sm:text-6xl lg:text-7xl"
            >
              {t("hero.title1")}{" "}
              <span className="italic font-normal text-shimmer-gold">{t("hero.title2")}</span>.
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
              className="mt-5 max-w-xl text-[15px] leading-relaxed text-cream/80 sm:text-lg"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <Link to="/auth" className="cta-attract group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--gold)] px-6 py-4 text-sm font-semibold text-earth shadow-[0_12px_40px_-8px_rgba(212,164,74,0.5)] transition hover:bg-[var(--gold)]/95 hover:shadow-[0_20px_60px_-12px_rgba(212,164,74,0.7)]">
                <span className="relative z-10">{t("btn.chat")}</span>
                <ArrowRight className="relative z-10 h-4 w-4 cta-bob" />
              </Link>
              <a href="#solution" className="cta-breath inline-flex items-center justify-center gap-2 rounded-2xl border border-cream/25 bg-cream/[0.04] px-6 py-4 text-sm font-medium text-cream backdrop-blur-md transition hover:border-cream/50 hover:bg-cream/10">
                {t("btn.discover")}
              </a>
            </motion.div>

            <motion.dl
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.1 } } }}
              className="mt-12 grid max-w-md grid-cols-3 gap-4 rounded-2xl border border-cream/15 bg-earth/40 p-5 backdrop-blur-md sm:mt-14 sm:gap-6 sm:p-6"
            >
              <div><dt className="text-[10px] uppercase tracking-[0.18em] text-cream/55">{t("stats.speakers")}</dt><dd className="mt-1.5 font-display text-2xl font-semibold text-[var(--gold)]">~100 M</dd></div>
              <div className="border-x border-cream/10 px-4"><dt className="text-[10px] uppercase tracking-[0.18em] text-cream/55">{t("stats.countries")}</dt><dd className="mt-1.5 font-display text-2xl font-semibold text-[var(--gold)]">20+</dd></div>
              <div><dt className="text-[10px] uppercase tracking-[0.18em] text-cream/55">{t("stats.dialects")}</dt><dd className="mt-1.5 font-display text-2xl font-semibold text-[var(--gold)]">4</dd></div>
            </motion.dl>
          </motion.div>
        </div>
      </section>

      {/* CREDIBILITY BAND */}
      <CredibilityBand />

      {/* TOOLS MARQUEE */}
      <section className="bg-secondary/30 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10 max-w-2xl">
            <Eyebrow>La plateforme</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.01em] text-balance sm:text-4xl lg:text-5xl">
              Un écosystème d'outils au service du Pulaar
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Assistants, tuteurs, traducteurs, gardiens de la culture — chaque outil est un compagnon spécialisé.
            </p>
          </Reveal>
          <ToolsMarquee />
        </div>
      </section>

      {/* SOLUTION */}
      <section id="solution" className="py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <Reveal>
            <Eyebrow>{t("sol.tag")}</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">{t("sol.title")}</h2>
            <p className="mt-5 text-lg text-muted-foreground">{t("sol.body")}</p>

            <div className="mt-8 space-y-4">
              <div className="rounded-xl border border-border bg-card p-5 transition hover:border-muted-foreground/40">
                <p className="text-sm uppercase tracking-wider text-muted-foreground">{t("sol.notLabel")}</p>
                <p className="mt-1.5 text-foreground/80">{t("sol.notText")}</p>
              </div>
              <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5 transition hover:border-primary/60">
                <p className="text-sm uppercase tracking-wider text-primary">{t("sol.isLabel")}</p>
                <p className="mt-1.5 text-foreground">{t("sol.isText")}</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-[var(--gold)]/20 blur-2xl animate-float-glow" aria-hidden />
            <motion.img
              src={portraitImg}
              alt={t("alt.portrait")}
              loading="lazy"
              width={1024}
              height={1024}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-square w-full rounded-2xl object-cover shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 max-w-[240px] rounded-xl border border-border bg-card p-4 shadow-xl">
              <p className="font-display text-sm italic text-primary">« Pulaagu ko ngallu mawngu »</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("sol.quoteCaption")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PILIERS */}
      <section id="piliers" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow>{t("pillars.tag")}</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">{t("pillars.title")}</h2>
            <p className="mt-5 text-lg text-muted-foreground">{t("pillars.body")}</p>
          </Reveal>

          <StaggerGroup className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {piliers.map(({ icon: Icon, title, desc }, idx) => (
              <StaggerItem key={title} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                <div className="absolute right-5 top-5 font-display text-5xl font-bold text-primary/10 transition group-hover:text-primary/20">0{idx + 1}</div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-110 group-hover:bg-primary/15">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </StaggerItem>
            ))}
            <StaggerItem>
              <Link to="/auth" className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border-2 border-primary bg-primary p-7 text-primary-foreground transition hover:-translate-y-1 hover:bg-primary/90 hover:shadow-2xl">
                <Sparkles className="h-8 w-8 transition group-hover:rotate-12" />
                <div>
                  <h3 className="font-display text-xl font-semibold">{t("pillars.try")}</h3>
                  <p className="mt-2 text-sm text-primary-foreground/85">{t("pillars.tryBody")}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                    {t("pillars.open")} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

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
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-700" />
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
                    <XCircle className="mt-0.5 h-5 w-5 flex-none text-primary" />
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

          <div className="mt-20">
            <Reveal>
              <h3 className="font-display text-3xl font-semibold sm:text-4xl">{t("pulaaku.title")}</h3>
              <p className="mt-3 max-w-2xl text-cream/75">{t("pulaaku.body")}</p>
            </Reveal>

            <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pulaaku.map(({ word, meaning, icon: Icon }) => (
                <StaggerItem
                  key={word}
                  className="group rounded-2xl border border-cream/15 bg-cream/[0.03] p-6 transition hover:-translate-y-1 hover:border-[var(--gold)]/50 hover:bg-cream/[0.06] hover:shadow-xl"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gold)]/15 text-[var(--gold)] transition group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 font-display text-2xl font-semibold text-[var(--gold)]">{word}</p>
                  <p className="mt-2 text-sm text-cream/75">{meaning}</p>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* PUBLIC */}
      <section className="bg-secondary/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow>{t("public.tag")}</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">{t("public.title")}</h2>
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publics.map(({ tag, desc }) => (
              <StaggerItem key={tag} className="rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
                  <Users className="h-3 w-3" />{tag}
                </div>
                <p className="mt-4 text-sm text-foreground/80">{desc}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
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
              <Eyebrow>Équipe</Eyebrow>
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
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
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

      {/* CONTACT */}
      <section id="contact" className="relative overflow-hidden bg-earth py-24 text-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <Eyebrow tone="gold">{t("contact.porter")}</Eyebrow>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight">{t("author.name")}</h2>
              <p className="mt-5 whitespace-pre-line text-cream/80">
                {t("contact.bio")}
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <Eyebrow tone="gold">{t("contact.callTag")}</Eyebrow>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight">{t("contact.callTitle")}</h2>
              <p className="mt-5 text-cream/80">{t("contact.callBody")}</p>

              <StaggerGroup className="mt-8 space-y-3">
                <StaggerItem>
                  <a href="mailto:awmedmansour@outlook.com" className="flex items-center gap-4 rounded-xl border border-cream/15 bg-cream/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-[var(--gold)]/50 hover:bg-cream/[0.08]">
                    <Mail className="h-5 w-5 text-[var(--gold)]" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-cream/60">{t("contact.email")}</p>
                      <p className="text-cream">awmedmansour@outlook.com</p>
                    </div>
                  </a>
                </StaggerItem>
                <StaggerItem>
                  <a href="tel:+213780306486" className="flex items-center gap-4 rounded-xl border border-cream/15 bg-cream/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-[var(--gold)]/50 hover:bg-cream/[0.08]">
                    <Phone className="h-5 w-5 text-[var(--gold)]" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-cream/60">{t("contact.phone")}</p>
                      <p className="text-cream">+213 780 30 64 86</p>
                    </div>
                  </a>
                </StaggerItem>
                <StaggerItem className="flex items-center gap-4 rounded-xl border border-cream/15 bg-cream/[0.03] p-4">
                  <MapPin className="h-5 w-5 text-[var(--gold)]" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-cream/60">{t("contact.address")}</p>
                    <p className="text-cream">{t("contact.location")}</p>
                  </div>
                </StaggerItem>
              </StaggerGroup>

              <div className="mt-6">
                <SocialLinks />
              </div>
              <Link to="/auth" className="group mt-6 inline-flex items-center gap-2 rounded-md bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-earth transition hover:-translate-y-0.5 hover:bg-[var(--gold)]/90 hover:shadow-lg">
                {t("contact.tryAi")} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
