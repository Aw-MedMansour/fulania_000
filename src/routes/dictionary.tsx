import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Heart, History, Search, Star, Volume2, X, Cloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dictionary")({
  head: () => ({
    meta: [
      { title: "Dictionnaire Pulaar ↔ FR ↔ AR ↔ EN | FulanIA" },
      {
        name: "description",
        content:
          "Dictionnaire interactif Pulaar — Français — Arabe — Anglais. Recherche, favoris, historique et exemples.",
      },
    ],
  }),
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

function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readSet(FAV_KEY));
    setHistory(readSet(HIST_KEY));
  }, []);

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

  const categories = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => e.category && set.add(e.category));
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (!q) return true;
      return (
        e.pulaar.toLowerCase().includes(q) ||
        e.french.toLowerCase().includes(q) ||
        (e.english?.toLowerCase().includes(q) ?? false) ||
        (e.arabic?.includes(q) ?? false)
      );
    });
  }, [entries, query, category]);

  const favEntries = useMemo(
    () => entries.filter((e) => favorites.includes(e.id)),
    [entries, favorites],
  );
  const histEntries = useMemo(() => {
    const map = new Map(entries.map((e) => [e.id, e]));
    return history.map((id) => map.get(id)).filter(Boolean) as Entry[];
  }, [entries, history]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  };

  const pushHistory = (id: string) => {
    setHistory((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 30);
      localStorage.setItem(HIST_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem(HIST_KEY);
    setHistory([]);
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-earth text-[var(--gold)]">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold text-earth sm:text-4xl">
              Saggitorde — Dictionnaire
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Pulaar ↔ Français ↔ العربية ↔ English. Recherchez un mot, écoutez sa prononciation,
              enregistrez vos favoris et retrouvez votre historique.
            </p>
          </div>
        </div>

        <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher en pulaar, français, arabe ou anglais…"
              className="h-12 pl-10 pr-10 text-base"
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

          {categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <CategoryChip active={category === "all"} onClick={() => setCategory("all")}>
                Tout
              </CategoryChip>
              {categories.map((c) => (
                <CategoryChip
                  key={c}
                  active={category === c}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </CategoryChip>
              ))}
            </div>
          )}
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Tous
              <Badge variant="secondary" className="ml-1">{filtered.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-1.5">
              <Heart className="h-3.5 w-3.5" /> Favoris
              <Badge variant="secondary" className="ml-1">{favEntries.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-3.5 w-3.5" /> Historique
              <Badge variant="secondary" className="ml-1">{histEntries.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <EntryList
              entries={filtered}
              isLoading={isLoading}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSpeak={speak}
              onVisit={pushHistory}
              emptyText={query ? "Aucun mot ne correspond à votre recherche." : "Aucune entrée."}
            />
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <EntryList
              entries={favEntries}
              isLoading={false}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSpeak={speak}
              onVisit={pushHistory}
              emptyText="Aucun favori pour l'instant. Touchez ♥ pour en ajouter."
            />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            {histEntries.length > 0 && (
              <div className="mb-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearHistory}>
                  Effacer l'historique
                </Button>
              </div>
            )}
            <EntryList
              entries={histEntries}
              isLoading={false}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSpeak={speak}
              onVisit={pushHistory}
              emptyText="Aucun mot consulté pour l'instant."
            />
          </TabsContent>
        </Tabs>
      </main>

      <SiteFooter />
    </div>
  );
}

function CategoryChip({
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
        "rounded-full border px-3 py-1 text-xs font-medium capitalize transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground/70 hover:border-primary/50 hover:text-foreground",
      )}
    >
      {children}
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
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg border border-border bg-muted/30" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map((e) => (
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
      className="group relative cursor-pointer rounded-lg border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="font-display text-xl font-semibold text-earth">{entry.pulaar}</h3>
            {entry.pronunciation && (
              <span className="text-xs italic text-muted-foreground">/{entry.pronunciation}/</span>
            )}
          </div>
          {entry.category && (
            <Badge variant="outline" className="mt-1 text-[10px] capitalize">
              {entry.category}
            </Badge>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
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
                ? "text-[var(--terracotta)]"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            aria-label="Favori"
          >
            <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>
        </div>
      </div>

      <dl className="mt-3 space-y-1.5 text-sm">
        <Row label="FR" value={entry.french} />
        {entry.arabic && <Row label="AR" value={entry.arabic} dir="rtl" />}
        {entry.english && <Row label="EN" value={entry.english} />}
      </dl>

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

function Row({ label, value, dir }: { label: string; value: string; dir?: "rtl" | "ltr" }) {
  return (
    <div className="flex gap-2">
      <dt className="w-7 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="flex-1 text-foreground" dir={dir}>
        {value}
      </dd>
    </div>
  );
}
