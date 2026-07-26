import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  MessageSquareText,
  BookOpen,
  GraduationCap,
  Languages,
  Library,
  ArrowRight,
  LogOut,
  Sparkles,
  Play,
  Radio,
  Download,
  Home,
  Menu,
  Bell,
  ArrowUp,
  MessageCircle,
  User,
  Leaf,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageNav } from "@/components/page-nav";
import { ToolsMarquee } from "@/components/tools-marquee";
import radioCoverAsset from "@/assets/fulania-radio-cover.png.asset.json";
import radioVideoAsset from "@/assets/ali-diallo-radio-mauritanie.mp4.asset.json";
import { SiteFooter } from "@/components/layout";
import { MobileTabBar } from "@/components/mobile-tab-bar";
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
    <div className="hub-mobile-dark relative min-h-screen bg-background pb-24 md:pb-0">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "420px" }}
        aria-hidden
      />

      <header className="relative z-10 mx-auto hidden max-w-6xl items-center justify-between px-5 py-5 sm:px-8 md:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-earth text-cream">
            <span className="font-display text-lg font-bold text-[var(--gold)]">F</span>
          </div>
          <span className="font-display text-lg font-semibold text-earth">FulanIA</span>
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

      <MobileHubHome
        signedIn={!!session}
        onSignOut={async () => {
          await supabase.auth.signOut();
          navigate({ to: "/", replace: true });
        }}
      />

      <main className="relative z-10 mx-auto hidden max-w-6xl px-5 pb-20 pt-4 sm:px-8 md:block">

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
          <div className="mb-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-earth">
              <Sparkles className="h-3 w-3" />
              La plateforme en mouvement
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-earth sm:text-3xl">
              Un écosystème d'outils au service du Pulaar
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Chaque outil est pensé comme un compagnon spécialisé — assistants, tuteurs, traducteurs, gardiens de la culture.
            </p>
          </div>
          <ToolsMarquee />
        </section>



        <section className="mt-16">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-earth">
              <Sparkles className="h-3 w-3" />
              Entretien exclusif
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-earth sm:text-3xl">
              FulanIA : L'Entretien Exclusif avec L'Infos Plus
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              L'équipe FulanIA revient sur la naissance, la mission et les ambitions de la première IA dédiée à la langue et à la culture peules.
            </p>
          </div>

          <LazyYouTube
            videoId="XXDGAmGVJFU"
            title="FulanIA : L'Entretien Exclusif avec L'Infos Plus"
          />
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

          <LazyYouTube
            videoId="atXu0sjsEF4"
            title="Présentation de FulanIA par Meimouna Sy"
          />

        </section>

        <section className="mt-16">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-earth">
              <Radio className="h-3 w-3" />
              Radio Mauritanie
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-earth sm:text-3xl">
              FulanIA à la Radio Mauritanie
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Avec Ali Diallo — Co-fondateur, Responsable des partenariats
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg ring-1 ring-[var(--gold)]/10">
            <LazyVideo
              src={radioVideoAsset.url}
              poster={radioCoverAsset.url}
              title="Passage d'Ali Diallo à la Radio Mauritanie"
            />
            <div className="border-t border-border p-6 sm:p-8">
              <p className="font-display text-lg font-semibold text-earth">
                Interview à la Radio Mauritanie
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ali Diallo présente la mission de FulanIA, ses partenariats et l'impact de l'IA au service de la langue pulaar.
              </p>
              <a
                href={radioVideoAsset.url}
                download="fulania-radio-mauritanie.mp4"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2 text-sm font-medium text-earth shadow-sm transition-transform hover:scale-[1.02]"
              >
                <Download className="h-4 w-4" />
                Télécharger la vidéo
              </a>
            </div>
          </div>
        </section>

      </main>

      <div className="md:block hidden">
        <SiteFooter />
      </div>
      <MobileTabBar />
    </div>

  );
}

import hubHeroSahel from "@/assets/hub-hero-sahel.jpg.asset.json";

const POPULAR_QUESTIONS = [
  { icon: MessageCircle, tone: "text-violet-300", bg: "bg-violet-500/15", q: "Comment dit-on « bonjour » en Pulaar ?" },
  { icon: BookOpen, tone: "text-amber-300", bg: "bg-amber-500/15", q: "Explique-moi le Pulaagu en quelques phrases." },
  { icon: User, tone: "text-emerald-300", bg: "bg-emerald-500/15", q: "Qui était El Hadj Oumar Tall ?" },
  { icon: Leaf, tone: "text-sky-300", bg: "bg-sky-500/15", q: "Donne-moi 3 proverbes peules avec leur sens." },
];

function MobileHubHome({ signedIn, onSignOut }: { signedIn: boolean; onSignOut: () => void }) {
  const [draft, setDraft] = useState("");

  const goToChat = (q?: string) => {
    const prompt = (q ?? draft).trim();
    if (prompt) {
      try {
        sessionStorage.setItem("fulania.pendingPrompt", prompt);
      } catch {
        /* ignore */
      }
    }
    window.location.href = "/chat";
  };

  return (
    <div className="relative z-10 md:hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-4 pb-3">
        <Link
          to="/"
          aria-label="Accueil"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white/80 ring-1 ring-white/10"
        >
          <Menu className="h-5 w-5" />
        </Link>
        <Link to="/hub" className="flex flex-col items-center leading-none">
          <span className="font-display text-xl font-semibold text-white">
            Fulan<span className="text-[var(--gold)]">IA</span>
          </span>
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-white/50">
            Assistant IA
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <button
              onClick={onSignOut}
              aria-label="Se déconnecter"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link
              to="/auth"
              aria-label="Notifications"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white/80 ring-1 ring-white/10"
            >
              <Bell className="h-4 w-4" />
            </Link>
          )}
        </div>
      </header>

      {/* Hero card */}
      <section className="px-4 pt-2">
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
          <img
            src={hubHeroSahel.url}
            alt=""
            width={1200}
            height={800}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1020]/40 via-[#0b1020]/55 to-[#0b1020]/85" />

          <div className="relative flex flex-col gap-5 p-5 pt-6 min-h-[300px]">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--gold)]/90 text-earth shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="mt-auto">
              <h1 className="font-display text-3xl font-semibold leading-tight text-white">
                Salaam alaykum
              </h1>
              <p className="mt-2 max-w-[80%] text-sm leading-relaxed text-white/80">
                Posez-moi vos questions sur la langue Pulaar, la culture Peule, l'histoire des Fulɓe.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                goToChat();
              }}
              className="mt-1 flex items-center gap-2 rounded-2xl bg-black/40 p-1.5 pl-4 ring-1 ring-white/15 backdrop-blur"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Comment puis-je vous aider aujourd'hui ?"
                className="flex-1 bg-transparent py-2 text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Envoyer"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--gold)] text-earth shadow-md transition-transform active:scale-95"
              >
                <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Popular questions */}
      <section className="px-4 pt-8">
        <div className="mb-3 flex items-center gap-2 px-1">
          <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
            Questions populaires
          </span>
        </div>

        <ul className="flex flex-col gap-2.5">
          {POPULAR_QUESTIONS.map(({ icon: Icon, tone, bg, q }) => (
            <li key={q}>
              <button
                onClick={() => goToChat(q)}
                className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.04] px-3.5 py-3.5 text-left ring-1 ring-white/10 transition-colors hover:bg-white/[0.07]"
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${bg} ${tone}`}>
                  <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                </span>
                <span className="flex-1 text-[13.5px] leading-snug text-white/90">{q}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-white/40" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}


function LazyYouTube({ videoId, title }: { videoId: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [activated, setActivated] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg ring-1 ring-[var(--gold)]/10"
    >
      <div className="relative aspect-video w-full bg-muted">
        {!loaded && <Skeleton className="absolute inset-0 h-full w-full rounded-none" />}

        {inView && !activated && (
          <button
            type="button"
            onClick={() => setActivated(true)}
            aria-label={`Lire la vidéo : ${title}`}
            className="group absolute inset-0 flex items-center justify-center"
          >
            <img
              src={thumb}
              alt={title}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)] text-earth shadow-xl ring-4 ring-white/20 transition-transform group-hover:scale-110">
              <Play className="h-7 w-7 translate-x-0.5 fill-current" />
            </span>
          </button>
        )}

        {activated && (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setLoaded(true)}
            className="absolute inset-0 h-full w-full"
          />
        )}
      </div>
    </div>
  );
}

function LazyVideo({ src, poster, title }: { src: string; poster: string; title: string }) {
  const [activated, setActivated] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);

  if (activated) {
    return (
      <video
        controls
        autoPlay
        playsInline
        preload="auto"
        poster={poster}
        className="aspect-video w-full bg-black"
        aria-label={title}
      >
        <source src={src} type="video/mp4" />
        Votre navigateur ne prend pas en charge la lecture vidéo.
      </video>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`Lire la vidéo : ${title}`}
      className="group relative block aspect-video w-full overflow-hidden bg-muted"
    >
      {!posterLoaded && <Skeleton className="absolute inset-0 h-full w-full rounded-none" />}
      <img
        src={poster}
        alt={title}
        loading="lazy"
        decoding="async"
        onLoad={() => setPosterLoaded(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)] text-earth shadow-xl ring-4 ring-white/20 transition-transform group-hover:scale-110">
          <Play className="h-7 w-7 translate-x-0.5 fill-current" />
        </span>
      </span>
    </button>
  );
}
