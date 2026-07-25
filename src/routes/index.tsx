import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  MessageSquare, Languages, BookOpen, Sparkles, GraduationCap,
  Library, Radio, ArrowRight, Send, Info,
} from "lucide-react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";
import { DICTIONARY_DISABLED } from "@/lib/feature-flags";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => {
    const l = getCurrentLang();
    return {
      meta: [
        { title: "FulanIA — Application Pulaar : chat, traduction, dictionnaire" },
        { name: "description", content: "L'application FulanIA : discutez avec Janngude, traduisez, apprenez et explorez la culture Peule — en Pulaar, français, anglais et arabe." },
        { property: "og:title", content: "FulanIA — Application Pulaar" },
        { property: "og:description", content: "Chat, traduction, dictionnaire et apprentissage du Pulaar dans une seule app." },
        { property: "og:url", content: "https://fulania.com/" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: "https://fulania.com/" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "FulanIA",
            url: "https://fulania.com/",
            applicationCategory: "EducationalApplication",
            inLanguage: ["fr", "ff", "en", "ar"],
            description: tFor(l, "seo./.desc"),
          }),
        },
      ],
    };
  },
  component: Index,
});

const tools = [
  { title: "Chat avec Janngude", desc: "Posez vos questions — culture, histoire, sciences, actualité.", icon: MessageSquare, url: "/chat", accent: "from-[var(--gold)]/25 to-transparent" },
  { title: "Traduction", desc: "Pulaar ↔ Français · Anglais · Arabe, 4 dialectes.", icon: Languages, url: "/translate", accent: "from-primary/25 to-transparent" },
  { title: "Dictionnaire", desc: DICTIONARY_DISABLED ? "Bientôt disponible." : "Recherchez un mot dans la base Pulaar.", icon: BookOpen, url: DICTIONARY_DISABLED ? "/dictionary" : "/dictionary", accent: "from-earth/25 to-transparent" },
  { title: "Culture", desc: "Traditions, histoire et patrimoine Fulɓe.", icon: Sparkles, url: "/culture", accent: "from-[var(--gold)]/20 to-transparent" },
  { title: "Apprendre", desc: "Leçons et exercices de Pulaar.", icon: GraduationCap, url: "/learn", accent: "from-primary/20 to-transparent" },
  { title: "Bibliothèque", desc: "Livres, articles et ressources.", icon: Library, url: "/library", accent: "from-earth/20 to-transparent" },
  { title: "Hub médias", desc: "Vidéos, radio et actualités FulanIA.", icon: Radio, url: "/hub", accent: "from-[var(--gold)]/20 to-transparent" },
];

function Index() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");

  const submitPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const q = prompt.trim();
    navigate({ to: "/chat", search: q ? { q } : undefined });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <SidebarInset>
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/60 bg-background/85 px-3 backdrop-blur-md sm:px-5">
            <SidebarTrigger />
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="truncate text-sm font-medium text-muted-foreground">Application</span>
            </div>
            <Link
              to="/about"
              className="hidden items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground/80 hover:bg-accent sm:inline-flex"
            >
              <Info className="h-3.5 w-3.5" />
              À propos
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ouvrir le chat
            </Link>
          </header>

          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
            {/* Welcome */}
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-xs uppercase tracking-[0.2em] text-primary">Bismillah</p>
              <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-balance sm:text-4xl lg:text-5xl">
                Bienvenue sur <span className="italic text-shimmer-gold">FulanIA</span>
              </h1>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Votre application Pulaar : discutez, traduisez, apprenez et explorez.
              </p>
            </div>

            {/* Prompt hero */}
            <form
              onSubmit={submitPrompt}
              className="mx-auto mt-8 max-w-2xl rounded-2xl border border-border bg-card p-2 shadow-sm transition focus-within:border-primary/50 focus-within:shadow-md"
            >
              <div className="flex items-end gap-2">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitPrompt(e as unknown as React.FormEvent);
                    }
                  }}
                  rows={2}
                  placeholder="Posez une question à Janngude…"
                  className="min-h-[60px] flex-1 resize-none rounded-xl bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                  aria-label="Message pour Janngude"
                />
                <button
                  type="submit"
                  className="mb-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90"
                  aria-label="Envoyer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 px-2 pb-1 pt-1 text-[11px] text-muted-foreground">
                <span>Entrée pour envoyer · Shift+Entrée pour retour à la ligne</span>
              </div>
            </form>

            {/* Tools grid */}
            <div className="mt-12">
              <div className="mb-4 flex items-end justify-between">
                <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Outils</h2>
                <Link to="/about" className="text-xs font-medium text-primary hover:underline">
                  Découvrir le projet →
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <Link
                    key={tool.url + tool.title}
                    to={tool.url}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition group-hover:opacity-100 ${tool.accent}`} aria-hidden />
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-105 group-hover:bg-primary/15">
                      <tool.icon className="h-5 w-5" />
                    </div>
                    <h3 className="relative mt-4 font-display text-base font-semibold text-foreground">{tool.title}</h3>
                    <p className="relative mt-1 text-sm leading-relaxed text-muted-foreground">{tool.desc}</p>
                    <div className="relative mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      Ouvrir <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Continue placeholder */}
            <div className="mt-12 rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              <p>« Continuer » — vos conversations et leçons récentes apparaîtront bientôt ici.</p>
            </div>

            {/* Footer discret */}
            <footer className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
              <p>© 2026 FulanIA — {t("footer.rights")}</p>
              <div className="flex items-center gap-4">
                <Link to="/about" className="hover:text-primary">À propos</Link>
                <Link to="/contact" className="hover:text-primary">Contact</Link>
              </div>
            </footer>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
