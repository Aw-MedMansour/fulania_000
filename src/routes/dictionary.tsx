import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Heart, History, Search, Sparkles, Star, Volume2, X, Cloud, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { PageNav } from "@/components/page-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  // Migrate local -> cloud on first login
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
    if (user) {
      await supabase.from("user_history").delete().eq("user_id", user.id);
    } else {
      localStorage.removeItem(HIST_KEY);
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

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <PageNav className="mb-6" />
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-earth text-[var(--gold)]">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold text-earth sm:text-4xl">
              {t("dict.title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {t("dict.subtitle")}
            </p>
          </div>
        </div>

        {!user ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-earth">
              <Cloud className="h-4 w-4" />
              <span>{t("dict.cloudCta")}</span>
            </div>
            <Link to="/auth" search={{ next: "/dictionary" }} className="rounded-md bg-earth px-3 py-1.5 text-xs font-medium text-cream hover:opacity-90">
              {t("dict.signin")}
            </Link>
          </div>
        ) : (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
            <Cloud className="h-3.5 w-3.5 text-[var(--gold)]" />
            {t("dict.cloudSynced")}
          </div>
        )}

        <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="dict-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("dict.search")}
              aria-label={t("dict.searchAria")}
              className="h-12 pl-10 pr-10 text-base"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={t("dict.clearSearch")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <CategoryChip active={category === "all"} onClick={() => setCategory("all")}>
                {t("dict.all")}
              </CategoryChip>
              {categories.map((c) => (
                <CategoryChip key={c} active={category === c} onClick={() => setCategory(c)}>
                  {c}
                </CategoryChip>
              ))}
            </div>
          )}
        </div>

        <AITranslator query={query} isAuthed={!!user} />



        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> {t("dict.tab.all")}
              <Badge variant="secondary" className="ml-1">{filtered.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-1.5">
              <Heart className="h-3.5 w-3.5" /> {t("dict.tab.fav")}
              <Badge variant="secondary" className="ml-1">{favEntries.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-3.5 w-3.5" /> {t("dict.tab.hist")}
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
              emptyText={query ? t("dict.empty.search") : t("dict.empty.entries")}
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
              emptyText={t("dict.empty.fav")}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            {histEntries.length > 0 && (
              <div className="mb-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearHistory}>
                  {t("dict.clear")}
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
              emptyText={t("dict.empty.hist")}
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
  const { t } = useLanguage();
  return (
    <article
      onClick={onVisit}
      className="group relative cursor-pointer rounded-lg border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-xl font-semibold text-earth">{entry.pulaar}</h2>
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
            aria-label={t("dict.listen")}
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
            aria-label={t("dict.favorite")}
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

function AITranslator({ query, isAuthed }: { query: string; isAuthed: boolean }) {
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
      setError(t("ai.translate.error"));
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
            <p className="text-sm font-semibold text-earth">{t("ai.translate.title")}</p>
            <p className="text-xs text-muted-foreground">« {word} »</p>
          </div>
        </div>
        <Button size="sm" onClick={run} disabled={loading || !canRun}>
          {loading ? (
            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> {t("ai.translate.loading")}</>
          ) : (
            <><Sparkles className="mr-1.5 h-3.5 w-3.5" /> {t("ai.translate.cta")}</>
          )}
        </Button>
      </div>

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

      {card && lastQuery === word && (
        <article className="mt-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl font-semibold text-earth">{card.pulaar}</h3>
              {card.pronunciation && (
                <span className="text-xs italic text-muted-foreground">/{card.pronunciation}/</span>
              )}
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                card.confidence === "high" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
                card.confidence === "medium" && "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
                card.confidence === "low" && "bg-destructive/15 text-destructive",
              )}
            >
              {t(`ai.translate.confidence.${card.confidence}`)}
            </span>
          </div>
          {card.category && (
            <Badge variant="outline" className="mt-1 text-[10px] capitalize">{card.category}</Badge>
          )}

          <dl className="mt-3 space-y-1.5 text-sm">
            <Row label="FR" value={card.french} />
            {card.arabic && <Row label="AR" value={card.arabic} dir="rtl" />}
            {card.english && <Row label="EN" value={card.english} />}
          </dl>

          {card.example_pulaar && (
            <div className="mt-3 rounded-md border-l-2 border-[var(--gold)] bg-muted/40 px-3 py-2 text-xs">
              <p className="font-display italic text-earth">« {card.example_pulaar} »</p>
              {card.example_french && (
                <p className="mt-0.5 text-muted-foreground">{card.example_french}</p>
              )}
            </div>
          )}

          {card.notes && (
            <div className="mt-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{t("ai.translate.notes")} : </span>
              {card.notes}
            </div>
          )}

          <div className="mt-3 text-[11px] text-muted-foreground">
            {sources.length > 0 ? (
              <>
                <span className="font-semibold text-foreground">{t("ai.translate.sources")} : </span>
                {sources.map((s, i) => (
                  <span key={i}>{i > 0 && " · "}<span className="text-earth">{s.pulaar}</span></span>
                ))}
              </>
            ) : (
              <span className="italic">{t("ai.translate.nosrc")}</span>
            )}
          </div>
        </article>
      )}
    </div>
  );
}
