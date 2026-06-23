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
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageNav } from "@/components/page-nav";
import { SiteFooter } from "@/components/layout";
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
        { property: "og:url", content: "https://fulania.com/hub" },
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
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-earth text-cream">
            <span className="font-display text-lg font-bold text-[var(--gold)]">F</span>
          </div>
          <span className="font-display text-lg font-semibold text-earth">FulanIA</span>
        </Link>
        <div className="flex items-center gap-2">
          <PageNav />

          
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
              <h2 className="relative mt-5 font-display text-xl font-semibold text-earth">{title}</h2>
              <p className="relative mt-1.5 text-sm text-muted-foreground">{desc}</p>
              <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                {t("hub.open")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-16">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-earth">
              <Sparkles className="h-3 w-3" />
              Présentation
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-earth sm:text-3xl">
              Découvrez FulanIA en vidéo
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Par Meimouna Sy — Vice-présidente, Responsable communication & sensibilisation
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg ring-1 ring-[var(--gold)]/10">
            <div className="relative aspect-video w-full">
              <iframe
                src="https://www.youtube-nocookie.com/embed/atXu0sjsEF4?rel=0&modestbranding=1"
                title="Présentation de FulanIA par Meimouna Sy"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
