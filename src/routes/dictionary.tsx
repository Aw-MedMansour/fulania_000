import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Cloud, Heart, History, Loader2, Search, Sparkles, Star, Volume2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { PageNav } from "@/components/page-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dictionary")({
  head: () => {
    const l = getCurrentLang();
    return {
      meta: [
        { title: tFor(l, "seo./dictionary.title") },
        { name: "description", content: tFor(l, "seo./dictionary.desc") },
        { property: "og:title", content: tFor(l, "seo./dictionary.title") },
        { property: "og:description", content: tFor(l, "seo./dictionary.desc") },
        { property: "og:url", content: "https://fulania.com/dictionary" },
      ],
      links: [{ rel: "canonical", href: "https://fulania.com/dictionary" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: tFor(l, "seo./dictionary.title"),
            url: "https://fulania.com/dictionary",
            description: tFor(l, "seo./dictionary.desc"),
            inLanguage: ["ff", "fr", "en", "ar"],
            isPartOf: { "@type": "WebSite", name: "FulanIA", url: "https://fulania.com/" },
          }),
        },
      ],
    };
  },
  component: DictionaryPage,
});

type Entry = {
  id: string;
  pulaar: string;
  french: string;
  arabic: string | null;
  english: string | null;
  category: string | null;
  example_pulaar: string | null;
  example_french: string | null;
  pronunciation: string | null;
};

type SearchScope = "all" | "fr" | "pulaar" | "en";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZƁƊƳÑŊ".split("");
const FAV_KEY = "fulania.dict.favorites";
const HIST_KEY = "fulania.dict.history";
const PAGE_SIZE = 30;

function readSet(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function startsWithLetter(text: string, letter: string): boolean {
  if (!text) return false;
  const first = text.trim().charAt(0).toLocaleUpperCase("fr");
  return first === letter.toLocaleUpperCase("fr");
}

function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const [letter, setLetter] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [view, setView] = useState<"all" | "fav" | "hist">("all");
  const [page, setPage] = useState(1);

  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const qc = useQueryClient();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (user) return;
    setFavorites(readSet(FAV_KEY));
    setHistory(readSet(HIST_KEY));
  }, [user]);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["dictionary"],
    queryFn: async () => {
      // Load in chunks to bypass PostgREST 1000-row default limit
      const all: Entry[] = [];
      const chunk = 1000;
      for (let from = 0; ; from += chunk) {
        const { data, error } = await supabase
          .from("dictionary_entries")
          .select("*")
          .order("french", { ascending: true })
          .range(from, from + chunk - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...(data as Entry[]));
        if (data.length < chunk) break;
      }
      return all;
    },
  });

  const { data: cloudFavs } = useQuery({
    queryKey: ["user_favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_favorites").select("entry_id");
      if (error) throw error;
      return data.map((r) => r.entry_id);
    },
  });

  const { data: cloudHist } = useQuery({
    queryKey: ["user_history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_history")
        .select("entry_id, viewed_at")
        .order("viewed_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      const seen = new Set<string>();
      const ids: string[] = [];
      for (const r of data) {
        if (!seen.has(r.entry_id)) {
          seen.add(r.entry_id);
          ids.push(r.entry_id);
        }
      }
      return ids;
    },
  });

  useEffect(() => {
    if (user && cloudFavs) setFavorites(cloudFavs);
  }, [user, cloudFavs]);
  useEffect(() => {
    if (user && cloudHist) setHistory(cloudHist);
  }, [user, cloudHist]);

  useEffect(() => {
    if (!user) return;
    const localFavs = readSet(FAV_KEY);
    const localHist = readSet(HIST_KEY);
    if (localFavs.length === 0 && localHist.length === 0) return;
    (async () => {
      if (localFavs.length) {
        await supabase
          .from("user_favorites")
          .upsert(
            localFavs.map((entry_id) => ({ user_id: user.id, entry_id })),
            { onConflict: "user_id,entry_id", ignoreDuplicates: true },
          );
      }
      if (localHist.length) {
        await supabase
          .from("user_history")
          .insert(localHist.map((entry_id) => ({ user_id: user.id, entry_id })));
      }
      localStorage.removeItem(FAV_KEY);
      localStorage.removeItem(HIST_KEY);
      qc.invalidateQueries({ queryKey: ["user_favorites", user.id] });
      qc.invalidateQueries({ queryKey: ["user_history", user.id] });
    })();
  }, [user, qc]);

  // Stats
  const stats = useMemo(() => {
    const total = entries.length;
    const cats = new Set<string>();
    let trilingue = 0;
    let withArabic = 0;
    for (const e of entries) {
      if (e.category) cats.add(e.category);
      if (e.english && e.english.trim()) trilingue++;
      if (e.arabic && e.arabic.trim()) withArabic++;
    }
    return { total, cats: cats.size, trilingue, withArabic };
  }, [entries]);

  // Category counts
  const categoriesWithCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      if (!e.category) continue;
      map.set(e.category, (map.get(e.category) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  // Filter
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (letter) {
        const hit =
          startsWithLetter(e.french, letter) ||
          startsWithLetter(e.pulaar, letter) ||
          (e.english ? startsWithLetter(e.english, letter) : false);
        if (!hit) return false;
      }
      if (!q) return true;
      const inFr = e.french.toLowerCase().includes(q);
      const inPu = e.pulaar.toLowerCase().includes(q);
      const inEn = e.english?.toLowerCase().includes(q) ?? false;
      const inAr = e.arabic?.includes(q) ?? false;
      if (scope === "fr") return inFr;
      if (scope === "pulaar") return inPu;
      if (scope === "en") return inEn;
      return inFr || inPu || inEn || inAr;
    });
  }, [entries, query, scope, letter, category]);

  const favEntries = useMemo(
    () => entries.filter((e) => favorites.includes(e.id)),
    [entries, favorites],
  );
  const histEntries = useMemo(() => {
    const map = new Map(entries.map((e) => [e.id, e]));
    return history.map((id) => map.get(id)).filter(Boolean) as Entry[];
  }, [entries, history]);

  const visible = view === "fav" ? favEntries : view === "hist" ? histEntries : filtered;
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [visible, page],
  );

  useEffect(() => {
    setPage(1);
  }, [query, scope, letter, category, view]);

  const toggleFavorite = async (id: string) => {
    const isFav = favorites.includes(id);
    const next = isFav ? favorites.filter((x) => x !== id) : [...favorites, id];
    setFavorites(next);
    if (user) {
      if (isFav) {
        await supabase
          .from("user_favorites")
          .delete()
          .eq("entry_id", id)
          .eq("user_id", user.id);
      } else {
        await supabase.from("user_favorites").insert({ user_id: user.id, entry_id: id });
      }
    } else {
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
    }
  };

  const pushHistory = async (id: string) => {
    setHistory((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 30);
      if (!user) localStorage.setItem(HIST_KEY, JSON.stringify(next));
      return next;
    });
    if (user) {
      await supabase.from("user_history").insert({ user_id: user.id, entry_id: id });
    }
  };

  const clearHistory = async () => {
    setHistory([]);
    if (user) await supabase.from("user_history").delete().eq("user_id", user.id);
    else localStorage.removeItem(HIST_KEY);
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ar" ? "ar-SA" : lang === "en" ? "en-US" : "fr-FR";
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a3d6e] via-[#155a92] to-[#1e7bb8] text-white">
        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-white/5 blur-2xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <PageNav className="mb-6 [&_*]:text-white/80" />
          <span className="inline-block rounded-full bg-[var(--terracotta,#f06b2a)] px-4 py-1 text-xs font-semibold uppercase tracking-wider shadow-md">
            Projet FulanIA
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {t("dict.title") || "Dictionnaire"}
            <br />
            <span className="text-[var(--gold,#f5a623)]">Pulaar / Fulfulde</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/85 sm:text-base">
            Bibliothèque linguistique multidomaine — {stats.total.toLocaleString("fr")} entrées,
            {" "}{stats.cats} domaines, sources académiques et communautaires.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard value={stats.total.toLocaleString("fr")} label="Entrées" />
            <StatCard value={String(stats.cats)} label="Domaines" />
            <StatCard value={stats.trilingue.toLocaleString("fr")} label="Trilingues (+ EN)" />
            <StatCard value={stats.withArabic.toLocaleString("fr")} label="Avec Arabe" />
          </div>
        </div>
      </section>

      {/* SEARCH BAR */}
      <div className="sticky top-16 z-30 border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher en français, pulaar ou anglais…"
              aria-label="Rechercher"
              className="h-12 rounded-full border-2 border-[#0a3d6e]/20 pl-10 pr-10 text-base shadow-sm focus-visible:border-[#0a3d6e]"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Effacer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex shrink-0 gap-1 rounded-full bg-muted p-1">
            {(["all", "fr", "pulaar", "en"] as SearchScope[]).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition sm:text-sm sm:px-4",
                  scope === s
                    ? "bg-[#0a3d6e] text-white shadow"
                    : "text-foreground/70 hover:text-foreground",
                )}
              >
                {s === "all" ? "Tout" : s === "fr" ? "FR" : s === "pulaar" ? "Pulaar" : "EN"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ALPHABET */}
        <div className="mb-6 flex flex-wrap justify-center gap-1.5">
          <button
            onClick={() => setLetter(null)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-semibold transition",
              !letter
                ? "border-[#0a3d6e] bg-[#0a3d6e] text-white"
                : "border-border bg-background hover:border-[#0a3d6e]/40",
            )}
          >
            Tout
          </button>
          {ALPHABET.map((l) => (
            <button
              key={l}
              onClick={() => setLetter(l === letter ? null : l)}
              className={cn(
                "min-w-[2rem] rounded-md border px-2 py-1 text-xs font-semibold transition",
                letter === l
                  ? "border-[#0a3d6e] bg-[#0a3d6e] text-white"
                  : "border-border bg-background hover:border-[#0a3d6e]/40",
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {/* AI Translator */}
        <AITranslator query={query} />

        {/* TOP TABS */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <TopTab active={view === "all"} onClick={() => setView("all")} icon={<BookOpen className="h-3.5 w-3.5" />}>
              Toutes <Badge variant="secondary" className="ml-1">{filtered.length}</Badge>
            </TopTab>
            <TopTab active={view === "fav"} onClick={() => setView("fav")} icon={<Heart className="h-3.5 w-3.5" />}>
              Favoris <Badge variant="secondary" className="ml-1">{favEntries.length}</Badge>
            </TopTab>
            <TopTab active={view === "hist"} onClick={() => setView("hist")} icon={<History className="h-3.5 w-3.5" />}>
              Historique <Badge variant="secondary" className="ml-1">{histEntries.length}</Badge>
            </TopTab>
          </div>
          {view === "hist" && histEntries.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              Effacer
            </Button>
          )}
        </div>

        {!user && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--gold,#f5a623)]/40 bg-[var(--gold,#f5a623)]/10 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Cloud className="h-4 w-4" />
              <span>Connecte-toi pour synchroniser favoris et historique.</span>
            </div>
            <Link to="/auth" search={{ next: "/dictionary" }} className="rounded-md bg-[#0a3d6e] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
              Se connecter
            </Link>
          </div>
        )}

        {/* GRID: sidebar + entries */}
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar domains */}
          <aside className="order-2 lg:order-1">
            <div className="sticky top-44 rounded-xl border border-border bg-card p-4">
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Domaines
              </h2>
              <div className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
                <DomainItem
                  active={category === "all"}
                  onClick={() => setCategory("all")}
                  label="Tous les domaines"
                  count={stats.total}
                  highlight
                />
                {categoriesWithCount.map(([cat, n]) => (
                  <DomainItem
                    key={cat}
                    active={category === cat}
                    onClick={() => setCategory(cat)}
                    label={cat}
                    count={n}
                  />
                ))}
              </div>
            </div>
          </aside>

          {/* Entries column */}
          <section className="order-1 lg:order-2">
            <p className="mb-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{visible.length.toLocaleString("fr")}</span>{" "}
              entrées
              {category !== "all" && <> — domaine <span className="font-medium text-foreground">{category}</span></>}
              {letter && <> — lettre <span className="font-medium text-foreground">{letter}</span></>}
            </p>

            {isLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-muted/40" />
                ))}
              </div>
            ) : pageItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
                Aucun résultat.
              </div>
            ) : (
              <div className="grid gap-3">
                {pageItems.map((e) => (
                  <EntryCard
                    key={e.id}
                    entry={e}
                    isFavorite={favorites.includes(e.id)}
                    onToggleFavorite={() => toggleFavorite(e.id)}
                    onSpeak={() => speak(e.pulaar)}
                    onVisit={() => pushHistory(e.id)}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ← Précédent
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{page}</span> / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Suivant →
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
      <div className="font-display text-2xl font-bold text-[var(--gold,#f5a623)] sm:text-3xl">
        {value}
      </div>
      <div className="mt-0.5 text-xs font-medium text-white/80 sm:text-sm">{label}</div>
    </div>
  );
}

function TopTab({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "border-[#0a3d6e] bg-[#0a3d6e] text-white"
          : "border-border bg-background text-foreground/70 hover:border-[#0a3d6e]/40 hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function DomainItem({
  active,
  onClick,
  label,
  count,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition",
        active
          ? highlight
            ? "bg-[var(--terracotta,#f06b2a)] text-white"
            : "bg-[#0a3d6e] text-white"
          : "text-foreground/80 hover:bg-muted",
      )}
    >
      <span className="truncate">{label}</span>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[10px] tabular-nums",
          active ? "bg-white/20" : "bg-muted text-muted-foreground",
        )}
      >
        {count.toLocaleString("fr")}
      </span>
    </button>
  );
}

function EntryCard({
  entry,
  isFavorite,
  onToggleFavorite,
  onSpeak,
  onVisit,
}: {
  entry: Entry;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSpeak: () => void;
  onVisit: () => void;
}) {
  return (
    <article
      onClick={onVisit}
      className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition hover:border-[#0a3d6e]/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold text-foreground sm:text-xl">
            {entry.french}
          </h3>
          <p className="mt-0.5 font-display text-base font-semibold text-[var(--terracotta,#f06b2a)] sm:text-lg">
            {entry.pulaar}
            {entry.pronunciation && (
              <span className="ml-2 text-xs font-normal italic text-muted-foreground">
                /{entry.pronunciation}/
              </span>
            )}
          </p>
          {entry.english && (
            <p className="mt-1 text-sm text-foreground/80">
              <span className="mr-1">🇬🇧</span>
              {entry.english}
            </p>
          )}
          {entry.arabic && (
            <p className="mt-1 text-sm text-foreground/80" dir="rtl">
              <span className="mr-1">🇸🇦</span>
              {entry.arabic}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {entry.category && (
            <Badge
              variant="outline"
              className="border-[#0a3d6e]/30 bg-[#0a3d6e]/5 text-[10px] font-semibold uppercase tracking-wider text-[#0a3d6e]"
            >
              {entry.category}
            </Badge>
          )}
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSpeak();
              }}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Écouter"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={cn(
                "rounded-md p-1.5 transition",
                isFavorite
                  ? "text-[var(--terracotta,#f06b2a)]"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              aria-label="Favori"
            >
              <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
            </button>
          </div>
        </div>
      </div>

      {entry.example_pulaar && (
        <div className="mt-3 rounded-md border-l-2 border-[var(--gold,#f5a623)] bg-muted/40 px-3 py-2 text-xs">
          <p className="font-display italic text-foreground">« {entry.example_pulaar} »</p>
          {entry.example_french && (
            <p className="mt-0.5 text-muted-foreground">{entry.example_french}</p>
          )}
        </div>
      )}
    </article>
  );
}

type AICard = {
  pulaar: string;
  pronunciation: string | null;
  french: string;
  english: string | null;
  arabic: string | null;
  category: string | null;
  example_pulaar: string | null;
  example_french: string | null;
  notes: string | null;
  confidence: "high" | "medium" | "low";
};

function AITranslator({ query }: { query: string }) {
  const { t, dialect, lang } = useLanguage();
  const [card, setCard] = useState<AICard | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState("");

  const word = query.trim();
  const canRun = word.length >= 2;

  useEffect(() => {
    setCard(null);
    setError(null);
  }, [word]);

  const run = async () => {
    if (!canRun) return;
    setLoading(true);
    setError(null);
    setLastQuery(word);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ word, sourceLang: "auto", dialect, lang }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "err");
      setCard(j.card);
      setSources(j.sources ?? []);
    } catch {
      setError(t("ai.translate.error") || "Erreur de traduction.");
    } finally {
      setLoading(false);
    }
  };

  if (!word) return null;

  return (
    <div className="mb-6 rounded-xl border border-[var(--gold,#f5a623)]/40 bg-gradient-to-br from-[var(--gold,#f5a623)]/5 to-[var(--terracotta,#f06b2a)]/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0a3d6e] text-[var(--gold,#f5a623)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Traduction IA</p>
            <p className="text-xs text-muted-foreground">« {word} »</p>
          </div>
        </div>
        <Button size="sm" onClick={run} disabled={loading || !canRun}>
          {loading ? (
            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Traduction…</>
          ) : (
            <><Sparkles className="mr-1.5 h-3.5 w-3.5" /> Traduire</>
          )}
        </Button>
      </div>
      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      {card && lastQuery === word && (
        <article className="mt-4 rounded-lg border border-border bg-card p-4">
          <h3 className="font-display text-xl font-bold text-foreground">{card.french}</h3>
          <p className="font-display text-lg font-semibold text-[var(--terracotta,#f06b2a)]">
            {card.pulaar}
            {card.pronunciation && (
              <span className="ml-2 text-xs font-normal italic text-muted-foreground">/{card.pronunciation}/</span>
            )}
          </p>
          {card.english && <p className="mt-1 text-sm">🇬🇧 {card.english}</p>}
          {card.arabic && <p className="mt-1 text-sm" dir="rtl">🇸🇦 {card.arabic}</p>}
          {card.example_pulaar && (
            <div className="mt-3 rounded-md border-l-2 border-[var(--gold,#f5a623)] bg-muted/40 px-3 py-2 text-xs">
              <p className="font-display italic">« {card.example_pulaar} »</p>
              {card.example_french && <p className="mt-0.5 text-muted-foreground">{card.example_french}</p>}
            </div>
          )}
          {sources.length > 0 && (
            <p className="mt-3 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">Sources : </span>
              {sources.map((s, i) => (
                <span key={i}>{i > 0 && " · "}<span className="text-foreground">{s.pulaar}</span></span>
              ))}
            </p>
          )}
        </article>
      )}
    </div>
  );
}
