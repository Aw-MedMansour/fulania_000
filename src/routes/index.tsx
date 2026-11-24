import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, Sparkles, BookOpen, GraduationCap, Library, Bot,
  Languages, Users, Globe, Heart, Shield, Mail, Phone,
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
import { PressBand } from "@/components/press-band";
import { VideosSection } from "@/components/videos-section";
import { Button } from "@/components/ui/button";

import { ContactSection } from "@/components/contact-section";
import { StudioGallery } from "@/components/studio-gallery";
import { cn } from "@/lib/utils";



import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";


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
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
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
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "FulanIA",
            url: "https://fulania.com/",
            logo: "https://fulania.com/favicon.png",
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




  const piliers = [
    { to: "/chat", icon: Bot, title: t("pillar.assistant.t"), desc: t("pillar.assistant.d") },
    { to: "/dictionary", icon: BookOpen, title: t("pillar.dict.t"), desc: t("pillar.dict.d") },
    { to: "/learn", icon: GraduationCap, title: t("pillar.learn.t"), desc: t("pillar.learn.d") },
    { to: "/translate", icon: Languages, title: t("hub.f4.title"), desc: t("hub.f4.desc") },
    { to: "/culture", icon: Library, title: t("pillar.lib.t"), desc: t("pillar.lib.d") },
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
    <div className="home-page min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* HERO */}
      <section className="home-hero relative overflow-hidden bg-earth">
        <div className="absolute inset-0 bg-earth">
          <img src={heroImg} alt={t("alt.hero")} className="h-full w-full object-cover" width={1920} height={1080} fetchPriority="high" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-br from-earth/95 via-earth/80 to-earth/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-earth via-earth/30 to-transparent" />
          <div className="absolute inset-0 bg-dot-gold opacity-[0.08]" aria-hidden />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pt-9 pb-12 sm:px-6 sm:py-20 lg:px-8 lg:py-16 sm:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Colonne texte */}
            <motion.div
              className="min-w-0 text-cream lg:col-span-9 xl:col-span-8"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }}
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                className="inline-flex max-w-full items-start gap-2 rounded-md border border-[var(--gold)]/40 bg-earth/80 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.08em] text-[var(--gold)]"
              >
                <span className="relative mt-1 flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] opacity-60 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                </span>
                {t("hero.badge")}
              </motion.div>

              <p className="mt-5 font-sans text-xl font-bold text-cream">Fulan<span className="text-gold">IA</span></p>
              <motion.h1
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}
                className="mt-3 font-display text-4xl font-semibold leading-[1.02] tracking-normal text-balance sm:text-5xl lg:text-6xl"
              >
                {t("hero.title1")}{" "}
                <span className="italic font-normal text-shimmer-gold">{t("hero.title2")}</span>.
              </motion.h1>

              <motion.p
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
                className="mt-5 max-w-xl text-[15px] leading-relaxed text-cream/90 sm:text-lg"
              >
                {t("hero.subtitle")}
              </motion.p>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
              >
                <Button asChild variant="gold" size="lg" className="h-12 px-6"><Link to="/auth">{t("btn.chat")}<ArrowRight /></Link></Button>
                <Button asChild variant="inverse" size="lg" className="h-12 px-6"><a href="#solution">{t("btn.discover")}</a></Button>
              </motion.div>

              <motion.dl
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.1 } } }}
                className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-cream/10 pt-6 sm:mt-12"
              >
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-cream/55">{t("stats.speakers")}</dt>
                  <dd className="mt-1 font-display text-xl font-semibold text-[var(--gold)]">~100 M</dd>
                </div>
                <div className="h-8 w-px bg-cream/10" aria-hidden />
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-cream/55">{t("stats.countries")}</dt>
                  <dd className="mt-1 font-display text-xl font-semibold text-[var(--gold)]">20+</dd>
                </div>
                <div className="h-8 w-px bg-cream/10" aria-hidden />
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-cream/55">{t("stats.dialects")}</dt>
                  <dd className="mt-1 font-display text-xl font-semibold text-[var(--gold)]">Pulaar · Pular · Fulfulde</dd>
                </div>
              </motion.dl>
            </motion.div>


          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow>{t("problem.tag")}</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-balance sm:text-4xl">{t("problem.title")}</h2>
            <p className="mt-5 text-lg text-muted-foreground">{t("problem.body")}</p>
          </Reveal>

          <div className="mt-10 grid gap-8 border-y border-border py-8 sm:grid-cols-3">
            <div><p className="font-display text-4xl font-semibold text-gold-ink">~100 M</p><p className="mt-2 text-sm text-muted-foreground">{t("stats.speakers")}</p></div>
            <div><p className="font-display text-4xl font-semibold text-gold-ink">20+</p><p className="mt-2 text-sm text-muted-foreground">{t("stats.countries")}</p></div>
            <div><p className="font-display text-xl font-semibold">Pulaar · Pular · Fulfulde</p><p className="mt-2 text-sm text-muted-foreground">{t("stats.dialects")}</p></div>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {[t("problem.pulaar1"), t("problem.pulaar2"), t("problem.pulaar3"), t("problem.pulaar4")].map((text) => <li key={text} className="flex items-start gap-3 text-sm leading-relaxed"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-ink" />{text}</li>)}
          </ul>
          <Reveal>
            <p className="mt-10 max-w-3xl border-l-2 border-primary pl-5 font-display text-xl italic text-foreground/90">
              {t("problem.quote")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* SOLUTION */}
      <section id="solution" className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <Reveal>
            <Eyebrow>{t("sol.tag")}</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-balance sm:text-4xl">{t("sol.title")}</h2>
            <p className="mt-5 text-lg text-muted-foreground">{t("sol.body")}</p>
            <p className="mt-6 border-y border-gold/30 py-4 font-sans text-base font-semibold">FulanIA = Fulani (Pulaar) + IA (Intelligence artificielle)</p>

            <div className="mt-8 space-y-4">
              <div className="border-l border-border py-2 pl-5">
                <p className="text-sm uppercase tracking-wider text-muted-foreground">{t("sol.notLabel")}</p>
                <p className="mt-1.5 text-foreground/80">{t("sol.notText")}</p>
              </div>
              <div className="border-l-2 border-gold py-2 pl-5">
                <p className="text-sm uppercase tracking-wider text-primary">{t("sol.isLabel")}</p>
                <p className="mt-1.5 text-foreground">{t("sol.isText")}</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="relative min-w-0">
            <motion.img
              src={portraitImg}
              alt={t("alt.portrait")}
              loading="lazy"
              width={1024}
              height={1024}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[5/4] w-full rounded-lg object-cover"
            />
            <div className="relative mt-4 border-l-2 border-gold pl-4">
              <p className="font-display text-sm italic text-primary">« Pulaagu ko ngallu mawngu »</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("sol.quoteCaption")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PILIERS */}
      <section id="piliers" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow>{t("pillars.tag")}</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-balance sm:text-4xl">{t("pillars.title")}</h2>
            <p className="mt-5 text-lg text-muted-foreground">{t("pillars.body")}</p>
          </Reveal>

          <StaggerGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {piliers.map(({ to, icon: Icon, title, desc }, idx) => (
              <StaggerItem key={title} className={cn("lg:col-span-2", idx >= 3 && "lg:col-span-3", idx === piliers.length - 1 && "sm:col-span-2")}><Button asChild variant="ghost" className="group relative block h-full whitespace-normal rounded-lg border border-border bg-card p-6 text-left hover:border-gold/60 hover:bg-card"><Link to={to} className="flex h-full flex-col">
                <div className="absolute right-5 top-5 font-display text-5xl font-bold text-primary/10 transition group-hover:text-primary/20">0{idx + 1}</div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-110 group-hover:bg-primary/15">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm font-normal leading-relaxed text-muted-foreground">{desc}</p>
                <ArrowRight className="mt-auto pt-5 text-gold-ink" />
              </Link></Button></StaggerItem>
            ))}
          </StaggerGroup>
          <div className="mt-7 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-border pt-6">
            <div className="min-w-0"><h3 className="font-display text-lg font-semibold">{t("pillars.try")}</h3><p className="mt-1 text-sm text-muted-foreground">{t("pillars.tryBody")}</p></div>
            <Button asChild variant="outline" size="icon"><Link to="/auth" aria-label={t("pillars.open")} title={t("pillars.open")}><ArrowRight /></Link></Button>
          </div>
          <div className="mt-10"><ToolsMarquee /></div>
          <PressBand />
          <VideosSection embedded />
        </div>
      </section>

      <section id="studio" className="border-y border-gold/20 bg-earth py-16 text-cream sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div><Eyebrow tone="gold">FulanIA Studio</Eyebrow><h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">FulanIA Studio</h2><p className="mt-5 inline-flex items-center gap-2 border border-gold/40 px-3 py-1.5 text-xs text-gold"><span className="h-1.5 w-1.5 rounded-full bg-gold" />Bientôt disponible</p></div>
            <Button asChild variant="inverse" className="h-12"><a href="https://wa.me/22232256718" target="_blank" rel="noopener noreferrer"><Phone />WhatsApp<ArrowRight /></a></Button>
          </div>
          <div className="mt-12 grid gap-6 border-t border-cream/15 pt-8 sm:grid-cols-3">
            {[{ icon: Sparkles, name: 'Génération vidéo' }, { icon: Languages, name: 'Génération audio' }, { icon: Bot, name: 'Contenus visuels & motion design' }].map(({ icon: Icon, name }) => <div key={name} className="flex items-start gap-3"><Icon className="h-5 w-5 shrink-0 text-gold" /><h3 className="font-sans text-base font-semibold">{name}</h3></div>)}
          </div>
          <div className="mt-8 max-w-3xl space-y-4 text-sm leading-relaxed text-cream/80 sm:text-base">
            <p>FulanIA Studio est l’espace de FulanIA dédié à la création de vidéos par intelligence artificielle. Actuellement en cours de développement, il est conçu comme une fonctionnalité de FulanIA, tout en disposant d’une plateforme distincte consacrée à la génération de vidéos et de l’audio qui les accompagne.</p>
            <p>Sa vocation est de démocratiser l’accès à la génération de vidéos par IA, souvent difficile d’accès depuis l’Afrique et d’autres régions, notamment grâce à l’intégration de moyens de paiement locaux. Il s’adresse à la communauté Pulaar (peule) comme à toute personne intéressée par la création de vidéos par IA, quelle que soit sa communauté.</p>
          </div>
          <StudioGallery />
        </div>
      </section>
      {/* CULTURE */}
      <section id="culture" className="relative overflow-hidden bg-earth py-16 sm:py-20 text-cream">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "400px" }} aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow tone="gold">{t("culture.tag")}</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-balance sm:text-4xl">{t("culture.title")}</h2>
            <p className="mt-5 text-lg text-cream/75">{t("culture.body")}</p>
          </Reveal>

          <Button variant="inverse"
            type="button"
            onClick={() => setShowDialects((v) => !v)}
            className="mt-8 h-auto w-full justify-start whitespace-normal rounded-lg border border-cream/15 bg-cream/[0.03] px-4 py-3 text-left font-display text-base font-semibold text-[var(--gold)] transition hover:border-[var(--gold)]/40 hover:bg-cream/[0.06]"
            aria-expanded={showDialects}
          >
            Pulaar {showDialects ? "▾" : "▸"}
            <span className="ml-2 text-xs font-normal text-cream/60">
              {showDialects ? "Masquer les variantes" : "Voir les variantes dialectales"}
            </span>
          </Button>

          {showDialects && (
            <Reveal delay={0.1} className="mt-4 overflow-x-auto rounded-lg border border-cream/15">
              <table className="min-w-[520px] w-full text-left text-sm">
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

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {['Pular', 'Fulfulde'].map(name => <div key={name} className="border-t border-cream/20 py-5"><h3 className="font-display text-xl text-gold">{name}</h3><p className="mt-2 text-sm text-cream/70">À compléter</p></div>)}
          </div>
          <blockquote className="mt-10 border-l-2 border-gold pl-5 font-display text-xl italic">« Pulaagu ko ngallu mawngu »<p className="mt-2 font-sans text-xs not-italic text-cream/60">{t("sol.quoteCaption")}</p></blockquote>
        </div>
      </section>

      {/* PUBLIC */}
      <section className="bg-secondary/40 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow>{t("public.tag")}</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-balance sm:text-4xl">{t("public.title")}</h2>
          </Reveal>
          <StaggerGroup className="audience-grid mt-12 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {publics.map(({ tag, desc }) => (
              <StaggerItem key={tag} className="rounded-2xl border border-border bg-card p-4 sm:p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="flex items-center gap-2 items-start text-sm font-semibold text-foreground">
                  <Users className="h-3 w-3" />{tag}
                </div>
                <p className="mt-4 text-sm text-foreground/80">{desc}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* VISION */}
      <section id="vision" className="py-16 sm:py-20">
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
              <StaggerGroup className="mt-6 border-l border-gold/50 space-y-1">
                {phases.map((p) => (
                  <StaggerItem key={p.id} className="relative py-6 pl-16 sm:pl-20">
                    <div className="absolute -left-5 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-gold bg-background font-display text-base font-bold text-gold-ink">{p.id}</div>
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
      <section id="comite" className="border-t border-border/60 bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow align="center">Équipe</Eyebrow>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-balance sm:text-4xl">
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
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-earth/90 to-earth">
                    {m.photo ? (
                      <img
                        src={m.photo}
                        alt={`Portrait de ${m.name}`}
                        loading="lazy"
                        className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.03]"
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
      {/* PORTEUR DU PROJET */}
      <div id="founder" className="relative overflow-hidden bg-earth py-20 text-cream sm:py-16 sm:py-20">
        <div className="absolute inset-0 bg-dot-gold opacity-[0.06]" aria-hidden />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <Eyebrow tone="gold">{t("contact.porter")}</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-normal text-balance sm:text-5xl lg:text-6xl">
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
      </div>


      </section>

      <section id="appel" className="bg-background">
        <div className="bg-earth py-16 text-cream sm:py-20"><div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8"><h2 className="font-display text-4xl font-semibold sm:text-5xl">Salam ! Parlons Pulaar.</h2><p className="mt-4 max-w-xl text-cream/75">{t("contact.ctaBody")}</p><div className="mt-7 flex flex-wrap gap-3"><Button asChild variant="gold" size="lg" className="h-12"><Link to="/auth">{t("btn.chat")}<ArrowRight /></Link></Button><Button asChild variant="inverse" size="lg" className="h-12"><Link to="/contact">{t("nav.contact")}</Link></Button></div></div></div>
        <ContactSection embedded />
      </section>
      <SiteFooter />
    </div>
  );
}
