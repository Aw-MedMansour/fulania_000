import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Heart, History, Search, Sparkles, Star, Volume2, X, Cloud, Loader2, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { PageNav } from "@/components/page-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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

type Filter = "all" | "fr" | "ff" | "en";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZƁƊƳÑŊ".split("");
const FAV_KEY = "fulania.dict.favorites";
const HIST_KEY = "fulania.dict.history";

function readSet(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [letter, setLetter] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [view, setView] = useState<"all" | "favorites" | "history">("all");
  const { user } = useAuth();
  const { lang } = useLanguage();
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
      const { data, error } = await supabase
        .from("dictionary_entries")
        .select("*")
        .order("pulaar", { ascending: true });
      if (error) throw error;
      return data as Entry[];
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
        await supabase.from("user_favorites").upsert(
          localFavs.map((entry_id) => ({ user_id: user.id, entry_id })),
          { onConflict: "user_id,entry_id", ignoreDuplicates: true },
        );
      }
      if (localHist.length) {
        await supabase.from("user_history").insert(localHist.map((entry_id) => ({ user_id: user.id, entry_id })));
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
    let withEn = 0;
    let withAr = 0;
    for (const e of entries) {
      if (e.category) cats.add(e.category);
      if (e.english && e.english.trim()) withEn++;
      if (e.arabic && e.arabic.trim()) withAr++;
    }
    return { total, cats: cats.size, withEn, withAr };
  }, [entries]);

  // Category counts
  const categoriesWithCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      if (!e.category) continue;
      map.set(e.category, (map.get(e.category) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  // Filtering
  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return entries.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (letter) {
        const first = (e.pulaar?.[0] ?? "").toUpperCase();
        if (first !== letter) return false;
      }
      if (!q) return true;
      const inFr = normalize(e.french || "").includes(q);
      const inFf = normalize(e.pulaar || "").includes(q);
      const inEn = normalize(e.english || "").includes(q);
      if (filter === "fr") return inFr;
      if (filter === "ff") return inFf;
      if (filter === "en") return inEn;
      return inFr || inFf || inEn || (e.arabic?.includes(query.trim()) ?? false);
    });
  }, [entries, query, filter, letter, category]);

  const favEntries = useMemo(
    () => entries.filter((e) => favorites.includes(e.id)),
    [entries, favorites],
  );
  const histEntries = useMemo(() => {
    const map = new Map(entries.map((e) => [e.id, e]));
    return history.map((id) => map.get(id)).filter(Boolean) as Entry[];
  }, [entries, history]);

  const displayed = view === "favorites" ? favEntries : view === "history" ? histEntries : filtered;

  const toggleFavorite = async (id: string) => {
    const isFav = favorites.includes(id);
    const next = isFav ? favorites.filter((x) => x !== id) : [...favorites, id];
    setFavorites(next);
    if (user) {
      if (isFav) {
        await supabase.from("user_favorites").delete().eq("entry_id", id).eq("user_id", user.id);
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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0b3b6e] via-[#0e4d8a] to-[#1063ad] text-cream">
        <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[var(--gold)]/20 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-[280px] w-[280px] rounded-full bg-[var(--terracotta)]/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <PageNav className="mb-6 [&_*]:!text-cream/80 [&_a:hover]:!text-cream" />
          <span className="inline-flex items-center rounded-full bg-[var(--terracotta)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg">
            Projet FulanIA
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            Dictionnaire
            <br />
            <span className="bg-gradient-to-r from-[var(--gold)] to-[var(--terracotta)] bg-clip-text text-transparent">
              Pulaar / Fulfulde
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-cream/80 sm:text-base">
            Bibliothèque linguistique multidomaine — {stats.total.toLocaleString("fr-FR")} entrées,{" "}
            {stats.cats} domaines, sources académiques et communautaires.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <StatCard value={stats.total.toLocaleString("fr-FR")} label="Entrées" />
            <StatCard value={String(stats.cats)} label="Domaines" />
            <StatCard value={stats.withEn.toLocaleString("fr-FR")} label="Trilingues FR/EN/Pulaar" />
            <StatCard value={String(stats.withAr)} label="Avec Arabe" />
          </div>
        </div>
      </section>

      {/* SEARCH BAR (overlapping hero) */}
      <div className="mx-auto -mt-7 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/60 bg-card p-2 shadow-[0_20px_60px_-20px_rgba(11,59,110,0.35)] sm:p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--terracotta)]" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setView("all");
                }}
                placeholder="Chercher en français, pulaar ou anglais…"
                className="h-12 border-0 bg-transparent pl-10 pr-10 text-base focus-visible:ring-0"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 rounded-full bg-muted/60 p-1">
              {(["all", "fr", "ff", "en"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold transition",
                    filter === f
                      ? "bg-earth text-cream shadow"
                      : "text-foreground/60 hover:text-foreground",
                  )}
                >
                  {f === "all" ? "Tout" : f === "ff" ? "Pulaar" : f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Cloud banner */}
        {!user ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-earth">
              <Cloud className="h-4 w-4" />
              <span>Connecte-toi pour synchroniser tes favoris et ton historique.</span>
            </div>
            <Link to="/auth" search={{ next: "/dictionary" }} className="rounded-md bg-earth px-3 py-1.5 text-xs font-medium text-cream hover:opacity-90">
              Se connecter
            </Link>
          </div>
        ) : null}

        {/* Alphabet */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-1.5">
          <LetterChip active={letter === null} onClick={() => setLetter(null)}>
            Tout
          </LetterChip>
          {ALPHABET.map((l) => (
            <LetterChip key={l} active={letter === l} onClick={() => setLetter(letter === l ? null : l)}>
              {l}
            </LetterChip>
          ))}
        </div>

        {/* View tabs */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full bg-muted/40 p-1">
            <ViewTab active={view === "all"} onClick={() => setView("all")}>
              <BookOpen className="h-3.5 w-3.5" />
              <span>Tous</span>
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                {filtered.length.toLocaleString("fr-FR")}
              </Badge>
            </ViewTab>
            <ViewTab active={view === "favorites"} onClick={() => setView("favorites")}>
              <Heart className="h-3.5 w-3.5" />
              <span>Favoris</span>
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                {favEntries.length}
              </Badge>
            </ViewTab>
            <ViewTab active={view === "history"} onClick={() => setView("history")}>
              <History className="h-3.5 w-3.5" />
              <span>Historique</span>
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                {histEntries.length}
              </Badge>
            </ViewTab>
          </div>

          {/* Mobile domains trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <Menu className="mr-1.5 h-3.5 w-3.5" />
                Domaines
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>Domaines</SheetTitle>
              </SheetHeader>
              <DomainsList
                items={categoriesWithCounts}
                total={entries.length}
                active={category}
                onChange={setCategory}
              />
            </SheetContent>
          </Sheet>
        </div>

        <AITranslator query={query} />

        {/* 2-column layout */}
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-4">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Domaines
              </h3>
              <DomainsList
                items={categoriesWithCounts}
                total={entries.length}
                active={category}
                onChange={setCategory}
              />
            </div>
          </aside>

          {/* Entries */}
          <div>
            <div className="mb-4 flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-[var(--terracotta)]">
                {displayed.length.toLocaleString("fr-FR")}
              </span>
              <span className="text-sm text-muted-foreground">
                entrées
                {category !== "all" && (
                  <> — <span className="font-medium text-foreground">{category}</span></>
                )}
                {letter && (
                  <> — lettre <span className="font-medium text-foreground">{letter}</span></>
                )}
              </span>
            </div>

            <EntryList
              entries={displayed}
              isLoading={isLoading && view === "all"}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSpeak={speak}
              onVisit={pushHistory}
              emptyText={
                view === "favorites"
                  ? "Aucun favori pour l'instant."
                  : view === "history"
                  ? "Ton historique est vide."
                  : query
                  ? "Aucun résultat pour cette recherche."
                  : "Aucune entrée."
              }
            />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-cream/15 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <div className="font-display text-2xl font-bold text-[var(--gold)] sm:text-3xl">{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wider text-cream/70">{label}</div>
    </div>
  );
}

function LetterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 font-display text-sm font-semibold transition",
        active
          ? "border-[var(--terracotta)] bg-[var(--terracotta)] text-white shadow"
          : "border-border bg-card text-foreground/70 hover:border-[var(--terracotta)]/40 hover:text-[var(--terracotta)]",
      )}
    >
      {children}
    </button>
  );
}

function ViewTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
        active ? "bg-earth text-cream shadow" : "text-foreground/60 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function DomainsList({
  items,
  total,
  active,
  onChange,
}: {
  items: [string, number][];
  total: number;
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <ul className="space-y-1 text-sm">
      <li>
        <DomainRow active={active === "all"} onClick={() => onChange("all")} label="Tous les domaines" count={total} highlight />
      </li>
      {items.map(([name, count]) => (
        <li key={name}>
          <DomainRow active={active === name} onClick={() => onChange(name)} label={name} count={count} />
        </li>
      ))}
    </ul>
  );
}

function DomainRow({
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
        "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition",
        active
          ? highlight
            ? "bg-[var(--terracotta)] text-white"
            : "bg-earth text-cream"
          : "hover:bg-muted",
      )}
    >
      <span className="truncate text-xs font-medium capitalize">
        {label.replace(/_/g, " ")}
      </span>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
          active ? "bg-white/25 text-white" : "bg-muted text-foreground/70",
        )}
      >
        {count.toLocaleString("fr-FR")}
      </span>
    </button>
  );
}

function EntryList({
  entries,
  isLoading,
  favorites,
  onToggleFavorite,
  onSpeak,
  onVisit,
  emptyText,
}: {
  entries: Entry[];
  isLoading: boolean;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onSpeak: (text: string) => void;
  onVisit: (id: string) => void;
  emptyText: string;
}) {
  const [limit, setLimit] = useState(60);
  useEffect(() => {
    setLimit(60);
  }, [entries]);

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-muted/30" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  const slice = entries.slice(0, limit);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {slice.map((e) => (
          <EntryCard
            key={e.id}
            entry={e}
            isFavorite={favorites.includes(e.id)}
            onToggleFavorite={() => onToggleFavorite(e.id)}
            onSpeak={() => onSpeak(e.pulaar)}
            onVisit={() => onVisit(e.id)}
          />
        ))}
      </div>
      {limit < entries.length && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => setLimit((l) => l + 60)}>
            Voir plus ({(entries.length - limit).toLocaleString("fr-FR")} restantes)
          </Button>
        </div>
      )}
    </>
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
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-[var(--terracotta)]/40 hover:shadow-md"
    >
      {/* Top row: French headword + domain badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg font-bold text-earth">{entry.french}</h2>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="truncate font-display text-xl font-bold text-[var(--terracotta)]">
              {entry.pulaar}
            </span>
            {entry.pronunciation && (
              <span className="text-[10px] italic text-muted-foreground">/{entry.pronunciation}/</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {entry.category && (
            <span className="rounded-full bg-[var(--gold)]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--gold)]">
              {entry.category.replace(/_/g, " ").slice(0, 22)}
            </span>
          )}
          <div className="flex gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSpeak();
              }}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Écouter"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={cn(
                "rounded-md p-1 transition",
                isFavorite ? "text-[var(--terracotta)]" : "text-muted-foreground hover:bg-accent",
              )}
              aria-label="Favori"
            >
              <Star className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
            </button>
          </div>
        </div>
      </div>

      {/* Translations */}
      <div className="mt-3 space-y-1 text-sm">
        {entry.english && (
          <p className="text-foreground/80">
            <span className="mr-1">🇬🇧</span>
            {entry.english}
          </p>
        )}
        {entry.arabic && (
          <p className="text-foreground/80" dir="rtl">
            <span className="mr-1">🇸🇦</span>
            {entry.arabic}
          </p>
        )}
      </div>

      {/* Variante */}
      <p className="mt-2 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground/70">Variante :</span> {entry.pulaar}
      </p>

      {/* Example */}
      {entry.example_pulaar && (
        <div className="mt-3 rounded-md border-l-2 border-[var(--gold)] bg-muted/40 px-3 py-2 text-xs">
          <p className="font-display italic text-earth">« {entry.example_pulaar} »</p>
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
  const { dialect, lang } = useLanguage();
  const [card, setCard] = useState<AICard | null>(null);
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
    } catch {
      setError("La traduction IA a échoué.");
    } finally {
      setLoading(false);
    }
  };

  if (!word) return null;

  return (
    <div className="mb-6 rounded-xl border border-[var(--gold)]/40 bg-gradient-to-br from-[var(--gold)]/5 to-[var(--terracotta)]/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-earth text-[var(--gold)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-earth">Traduction IA</p>
            <p className="text-xs text-muted-foreground">« {word} »</p>
          </div>
        </div>
        <Button size="sm" onClick={run} disabled={loading || !canRun}>
          {loading ? (
            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Traduction…</>
          ) : (
            <><Sparkles className="mr-1.5 h-3.5 w-3.5" /> Traduire avec l'IA</>
          )}
        </Button>
      </div>

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

      {card && lastQuery === word && (
        <article className="mt-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl font-semibold text-[var(--terracotta)]">{card.pulaar}</h3>
              {card.pronunciation && (
                <span className="text-xs italic text-muted-foreground">/{card.pronunciation}/</span>
              )}
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                card.confidence === "high" && "bg-emerald-100 text-emerald-800",
                card.confidence === "medium" && "bg-amber-100 text-amber-800",
                card.confidence === "low" && "bg-destructive/15 text-destructive",
              )}
            >
              {card.confidence}
            </span>
          </div>
          <dl className="mt-3 space-y-1 text-sm">
            <p><strong className="text-muted-foreground">FR :</strong> {card.french}</p>
            {card.english && <p>🇬🇧 {card.english}</p>}
            {card.arabic && <p dir="rtl">🇸🇦 {card.arabic}</p>}
          </dl>
          {card.example_pulaar && (
            <div className="mt-3 rounded-md border-l-2 border-[var(--gold)] bg-muted/40 px-3 py-2 text-xs">
              <p className="font-display italic text-earth">« {card.example_pulaar} »</p>
              {card.example_french && <p className="mt-0.5 text-muted-foreground">{card.example_french}</p>}
            </div>
          )}
        </article>
      )}
    </div>
  );
}
