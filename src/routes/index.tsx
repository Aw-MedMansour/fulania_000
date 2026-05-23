import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Sparkles, BookOpen, GraduationCap, Mic, Library, Bot,
  XCircle, CheckCircle2, Languages, Users, Globe, Heart, Lightbulb, Shield,
  Mail, Phone, MapPin,
} from "lucide-react";
import heroImg from "@/assets/hero-sahel.jpg";
import portraitImg from "@/assets/culture-portrait.jpg";
import patternImg from "@/assets/pattern.jpg";
import { SiteHeader, SiteFooter } from "@/components/layout";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";

export const Route = createFileRoute("/")({
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
    };
  },
  component: Index,
});

function Index() {
  const { t } = useLanguage();

  const dialects = [
    { name: "Pulaar", zone: t("dialect.zone.pulaar"), speakers: "~5 M", note: t("dialect.note.pulaar") },
    { name: "Pular", zone: t("dialect.zone.pular"), speakers: "~8 M", note: t("dialect.note.pular") },
    { name: "Fulfulde", zone: t("dialect.zone.fulfulde"), speakers: "~15 M", note: t("dialect.note.fulfulde") },
    { name: "Fula", zone: t("dialect.zone.fula"), speakers: "~20 M", note: t("dialect.note.fula") },
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
          <img src={heroImg} alt={t("alt.hero")} className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-earth/95 via-earth/80 to-earth/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-earth/80 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-2xl text-cream">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-earth/40 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--gold)] backdrop-blur">
              <Sparkles className="h-3 w-3" />
              {t("hero.badge")}
            </div>

            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              {t("hero.title1")}{" "}
              <span className="italic text-[var(--gold)]">{t("hero.title2")}</span>.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-cream/85">{t("hero.subtitle")}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-md bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-earth shadow-lg transition hover:bg-[var(--gold)]/90">
                {t("btn.chat")} <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#solution" className="inline-flex items-center gap-2 rounded-md border border-cream/30 px-6 py-3 text-sm font-medium text-cream backdrop-blur transition hover:bg-cream/10">
                {t("btn.discover")}
              </a>
            </div>

            <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-cream/20 pt-6">
              <div><dt className="text-xs uppercase tracking-widest text-cream/60">{t("stats.speakers")}</dt><dd className="mt-1 font-display text-2xl font-semibold text-[var(--gold)]">50–60 M</dd></div>
              <div><dt className="text-xs uppercase tracking-widest text-cream/60">{t("stats.countries")}</dt><dd className="mt-1 font-display text-2xl font-semibold text-[var(--gold)]">20+</dd></div>
              <div><dt className="text-xs uppercase tracking-widest text-cream/60">{t("stats.dialects")}</dt><dd className="mt-1 font-display text-2xl font-semibold text-[var(--gold)]">4</dd></div>
            </dl>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="bg-secondary/40 bg-grain py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.2em] text-primary">{t("problem.tag")}</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">{t("problem.title")}</h2>
            <p className="mt-5 text-lg text-muted-foreground">{t("problem.body")}</p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-7">
              <h3 className="font-display text-lg font-semibold text-foreground">{t("problem.other")}</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {[t("problem.other1"), t("problem.other2"), t("problem.other3"), t("problem.other4")].map((x) => (
                  <li key={x} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-emerald-700" />
                    <span className="text-foreground/80">{x}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-7">
              <h3 className="font-display text-lg font-semibold text-primary">{t("problem.pulaar")}</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {[t("problem.pulaar1"), t("problem.pulaar2"), t("problem.pulaar3"), t("problem.pulaar4")].map((x, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <XCircle className="mt-0.5 h-5 w-5 flex-none text-primary" />
                    <span className="text-foreground/80">{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-10 max-w-3xl border-l-2 border-primary pl-5 font-display text-xl italic text-foreground/90">
            {t("problem.quote")}
          </p>
        </div>
      </section>

      {/* SOLUTION */}
      <section id="solution" className="py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-primary">{t("sol.tag")}</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">{t("sol.title")}</h2>
            <p className="mt-5 text-lg text-muted-foreground">{t("sol.body")}</p>

            <div className="mt-8 space-y-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm uppercase tracking-wider text-muted-foreground">{t("sol.notLabel")}</p>
                <p className="mt-1.5 text-foreground/80">{t("sol.notText")}</p>
              </div>
              <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5">
                <p className="text-sm uppercase tracking-wider text-primary">{t("sol.isLabel")}</p>
                <p className="mt-1.5 text-foreground">{t("sol.isText")}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-[var(--gold)]/20 blur-2xl" aria-hidden />
            <img src={portraitImg} alt={t("alt.portrait")} loading="lazy" width={1024} height={1024} className="relative aspect-square w-full rounded-2xl object-cover shadow-2xl" />
            <div className="absolute -bottom-6 -left-6 max-w-[240px] rounded-xl border border-border bg-card p-4 shadow-xl">
              <p className="font-display text-sm italic text-primary">« Pulaagu ko ngallu mawngu »</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("sol.quoteCaption")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CULTURE */}
      <section id="culture" className="relative overflow-hidden bg-earth py-24 text-cream">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "400px" }} aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">{t("culture.tag")}</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">{t("culture.title")}</h2>
            <p className="mt-5 text-lg text-cream/75">{t("culture.body")}</p>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-cream/15">
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

          <div className="mt-20">
            <h3 className="font-display text-3xl font-semibold sm:text-4xl">{t("pulaaku.title")}</h3>
            <p className="mt-3 max-w-2xl text-cream/75">{t("pulaaku.body")}</p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pulaaku.map(({ word, meaning, icon: Icon }) => (
                <div key={word} className="group rounded-2xl border border-cream/15 bg-cream/[0.03] p-6 transition hover:border-[var(--gold)]/50 hover:bg-cream/[0.06]">
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
            <span className="text-xs uppercase tracking-[0.2em] text-primary">{t("pillars.tag")}</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">{t("pillars.title")}</h2>
            <p className="mt-5 text-lg text-muted-foreground">{t("pillars.body")}</p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {piliers.map(({ icon: Icon, title, desc }, idx) => (
              <div key={title} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                <div className="absolute right-5 top-5 font-display text-5xl font-bold text-primary/10">0{idx + 1}</div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
            <Link to="/auth" search={{ next: "/chat" }} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-primary bg-primary p-7 text-primary-foreground transition hover:-translate-y-1 hover:bg-primary/90">
              <Sparkles className="h-8 w-8" />
              <div>
                <h3 className="font-display text-xl font-semibold">{t("pillars.try")}</h3>
                <p className="mt-2 text-sm text-primary-foreground/85">{t("pillars.tryBody")}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                  {t("pillars.open")} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
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
            <span className="text-xs uppercase tracking-[0.2em] text-primary">{t("public.tag")}</span>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">{t("public.title")}</h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publics.map(({ tag, desc }) => (
              <div key={tag} className="rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
                  <Users className="h-3 w-3" />{tag}
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
              <span className="text-xs uppercase tracking-[0.2em] text-primary">{t("vision.tag")}</span>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-balance">{t("vision.title")}</h2>
              <p className="mt-5 text-muted-foreground">{t("vision.body")}</p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, label: t("vision.preserve") },
                  { icon: Heart, label: t("vision.transmit") },
                  { icon: GraduationCap, label: t("vision.educate") },
                  { icon: Globe, label: t("vision.value") },
                  { icon: Users, label: t("vision.gather") },
                  { icon: Languages, label: t("vision.include") },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
                    <Icon className="h-4 w-4 text-primary" />{label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-display text-2xl font-semibold">{t("vision.roadmap")}</h3>
              <ol className="mt-6 space-y-5">
                {phases.map((p) => (
                  <li key={p.id} className="relative rounded-2xl border border-border bg-card p-6 pl-20">
                    <div className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-base font-bold text-primary-foreground">{p.id}</div>
                    <h4 className="font-display text-lg font-semibold">{t("vision.phase")} {p.id} — {p.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative overflow-hidden bg-earth py-24 text-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">{t("contact.porter")}</span>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight">{t("author.name")}</h2>
              <p className="mt-5 whitespace-pre-line text-cream/80">
                {t("contact.bio")}
              </p>
            </div>

            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">{t("contact.callTag")}</span>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-tight">{t("contact.callTitle")}</h2>
              <p className="mt-5 text-cream/80">{t("contact.callBody")}</p>

              <div className="mt-8 space-y-3">
                <a href="mailto:awmedmansour@outlook.com" className="flex items-center gap-4 rounded-xl border border-cream/15 bg-cream/[0.03] p-4 transition hover:border-[var(--gold)]/50 hover:bg-cream/[0.08]">
                  <Mail className="h-5 w-5 text-[var(--gold)]" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-cream/60">{t("contact.email")}</p>
                    <p className="text-cream">awmedmansour@outlook.com</p>
                  </div>
                </a>
                <a href="tel:+213780306486" className="flex items-center gap-4 rounded-xl border border-cream/15 bg-cream/[0.03] p-4 transition hover:border-[var(--gold)]/50 hover:bg-cream/[0.08]">
                  <Phone className="h-5 w-5 text-[var(--gold)]" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-cream/60">{t("contact.phone")}</p>
                    <p className="text-cream">+213 780 30 64 86</p>
                  </div>
                </a>
                <div className="flex items-center gap-4 rounded-xl border border-cream/15 bg-cream/[0.03] p-4">
                  <MapPin className="h-5 w-5 text-[var(--gold)]" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-cream/60">{t("contact.address")}</p>
                    <p className="text-cream">{t("contact.location")}</p>
                  </div>
                </div>
              </div>

              <Link to="/auth" className="mt-8 inline-flex items-center gap-2 rounded-md bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-earth transition hover:bg-[var(--gold)]/90">
                {t("contact.tryAi")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
