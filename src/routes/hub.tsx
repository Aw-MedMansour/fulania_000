import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  MessageSquareText,
  BookOpen,
  GraduationCap,
  Languages,
  Library,
  ArrowRight,
  LogOut,
  Sparkles,
  Home,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageNav } from "@/components/page-nav";
import { SiteFooter } from "@/components/layout";
import { BrandLogo } from "@/components/brand-logo";
import patternImg from "@/assets/pattern.jpg";

export const Route = createFileRoute("/hub")({
  head: () => {
    const l = getCurrentLang();
    return {
      meta: [
        { title: tFor(l, "seo./hub.title") },
        { name: "description", content: tFor(l, "seo./hub.desc") },
        { property: "og:title", content: tFor(l, "seo./hub.title") },
        { property: "og:description", content: tFor(l, "seo./hub.desc") },
        { property: "og:url", content: "https://www.fulania.com/hub" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: HubPage,
});

function HubPage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const { t } = useLanguage();

  const features = [
    {
      to: "/chat",
      icon: MessageSquareText,
      title: t("hub.f1.title"),
      desc: t("hub.f1.desc"),
      accent: "from-[var(--gold)]/30 to-[var(--gold)]/0",
      iconBg: "bg-[#d4a44a]",
      ring: "ring-[#d4a44a]/40",
      delay: "0s",
    },
    {
      to: "/dictionary",
      icon: BookOpen,
      title: t("hub.f2.title"),
      desc: t("hub.f2.desc"),
      accent: "from-emerald-500/25 to-transparent",
      iconBg: "bg-emerald-500",
      ring: "ring-emerald-400/40",
      delay: "0.4s",
    },
    {
      to: "/learn",
      icon: GraduationCap,
      title: t("hub.f3.title"),
      desc: t("hub.f3.desc"),
      accent: "from-sky-500/25 to-transparent",
      iconBg: "bg-sky-500",
      ring: "ring-sky-400/40",
      delay: "0.8s",
    },
    {
      to: "/translate",
      icon: Languages,
      title: t("hub.f4.title"),
      desc: t("hub.f4.desc"),
      accent: "from-rose-500/25 to-transparent",
      iconBg: "bg-rose-500",
      ring: "ring-rose-400/40",
      delay: "1.2s",
    },
    {
      to: "/culture",
      icon: Library,
      title: t("hub.f5.title"),
      desc: t("hub.f5.desc"),
      accent: "from-amber-500/25 to-transparent",
      iconBg: "bg-amber-500",
      ring: "ring-amber-400/40",
      delay: "1.6s",
    },
  ];

  const firstName = (user?.email ?? "").split("@")[0];

  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "420px" }}
        aria-hidden
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandLogo size={36} />
        </Link>
        <div className="flex items-center gap-2">
          <PageNav />

          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link to="/">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Accueil</span>
            </Link>
          </Button>



          
          {session ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/", replace: true });
              }}
              className="gap-1.5 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t("btn.signout")}</span>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link to="/auth">{t("auth.tab.signin")}</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8">
        <section className="mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-earth">
            <Sparkles className="h-3 w-3" />
            {t("hub.tag")}
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-earth sm:text-4xl">
            {firstName ? `${t("hub.hello")}, ${firstName}` : t("hub.hello")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {t("hub.subtitle")}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ to, icon: Icon, title, desc, accent, iconBg, ring, delay }) => (
            <Link
              key={to}
              to={to}
              className="hub-card group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 hover:border-[var(--gold)]/50 hover:shadow-lg"
              style={{ animationDelay: delay }}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition-opacity group-hover:opacity-100`} aria-hidden />
              <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} text-cream shadow-sm hub-icon-ring ${ring}`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="relative mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden /> Disponible
              </span>
              <h2 className="relative mt-3 font-display text-xl font-semibold text-earth">{title}</h2>
              <p className="relative mt-1.5 text-sm text-muted-foreground">{desc}</p>
              <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                {t("hub.open")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-earth">En développement</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Ces fonctions ne sont pas encore disponibles. Elles sont affichées à titre informatif.</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { t: "Reconnaissance vocale", d: "Dicter en Pulaar avec prise en compte des sons ɓ, ɗ, ƴ, ŋ." },
              { t: "Correction de textes en temps réel", d: "Suggestions orthographiques pendant la saisie en Pulaar." },
            ].map((x) => (
              <li key={x.t} className="rounded-xl border border-dashed border-border bg-card/60 p-5">
                <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Bientôt</span>
                <p className="mt-2 font-display text-lg font-semibold text-earth">{x.t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{x.d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted-foreground">
            Envie de voir FulanIA en vidéo ? <a href="/#decouvrir" className="font-medium text-primary underline-offset-4 hover:underline">Regarder les présentations</a>
          </p>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
