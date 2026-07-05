import { createFileRoute, Link, redirect } from "@tanstack/react-router";
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
import { DICTIONARY_DISABLED } from "@/lib/feature-flags";

export const Route = createFileRoute("/dictionary")({
  beforeLoad: () => {
    if (DICTIONARY_DISABLED) throw redirect({ to: "/" });
  },
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
      links: [
        { rel: "canonical", href: "https://fulania.com/dictionary" },
      ],
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
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "FulanIA", item: "https://fulania.com/" },
              { "@type": "ListItem", position: 2, name: "Dictionnaire", item: "https://fulania.com/dictionary" },
            ],
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
  pos: string | null;
  noun_class: string | null;
  status: string | null;
  origin: string | null;
  dialects: {
    fouta_tooro: string | null;
    maasina: string | null;
    fouta_jallon: string | null;
    adamaawa: string | null;
  };
  notes: string | null;
};

const DIALECTS = [
  { key: "all", label: "Tous dialectes" },
  { key: "fouta_tooro", label: "Fouta Tooro" },
  { key: "maasina", label: "Maasina" },
  { key: "fouta_jallon", label: "Fouta Jallon" },
  { key: "adamaawa", label: "Adamaawa" },
] as const;
type DialectKey = typeof DIALECTS[number]["key"];

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

const ALPHABET = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","Ɓ","Ɗ","Ƴ","Ñ","Ŋ"];

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-cream/15 bg-white/5 px-3 py-3 backdrop-blur-sm">
      <div className="font-display text-2xl font-bold text-[var(--gold)] sm:text-3xl">{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wider text-cream/70 sm:text-xs">{label}</div>
    </div>
  );
}


function DictionaryActive() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [letter, setLetter] = useState<string>("all");
  const [dialect, setDialect] = useState<DialectKey>("all");
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
    queryKey: ["dictionary_v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dictionary_v2" as never)
        .select("*")
        .order("headword", { ascending: true });
      if (error) throw error;
      return (data as any[]).map((r): Entry => ({
        id: r.id,
        pulaar: r.headword,
        french: r.french,
        arabic: r.arabic,
        english: r.english,
        category: r.domain,
        example_pulaar: r.example_pulaar,
        example_french: r.example_french,
        pronunciation: r.pronunciation_ipa,
        pos: r.pos,
        noun_class: r.noun_class,
        status: r.status,
        origin: r.origin,
        notes: r.notes,
        dialects: {
          fouta_tooro: r.variant_fouta_tooro,
          maasina: r.variant_maasina,
          fouta_jallon: r.variant_fouta_jallon,
          adamaawa: r.variant_adamaawa,
        },
      }));
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

  const stats = useMemo(() => {
    const total = entries.length;
    const domains = categories.length;
    const trilingual = entries.filter((e) => e.english && e.english.trim() !== "").length;
    const withArabic = entries.filter((e) => e.arabic && e.arabic.trim() !== "").length;
    return { total, domains, trilingual, withArabic };
  }, [entries, categories]);

  const normalizeFirst = (s: string) => {
    const c = s.trim().charAt(0).toLocaleUpperCase("fr");
    return c;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (category !== "all" && e.category !== category) return false;
      if (letter !== "all" && normalizeFirst(e.pulaar) !== letter) return false;
      if (dialect !== "all" && !e.dialects[dialect]) return false;
      if (!q) return true;
      return (
        e.pulaar.toLowerCase().includes(q) ||
        e.french.toLowerCase().includes(q) ||
        (e.english?.toLowerCase().includes(q) ?? false) ||
        (e.arabic?.includes(q) ?? false)
      );
    });
  }, [entries, query, category, letter, dialect]);


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
        <PageNav className="mb-4" />
        
        
        <section className="relative mb-6 overflow-hidden rounded-2xl bg-linear-to-br from-earth via-[#1e3a5f] to-[#0c2340] p-6 text-cream shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[var(--gold)]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[var(--terracotta)]/20 blur-3xl" />
          <div className="relative">
            <span className="inline-block rounded-full bg-[var(--terracotta)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cream">
              FulanIA · Janngude
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              {t("dict.title")}{" "}
              <span className="block text-[var(--gold)]">Pulaar / Fulfulde</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-cream/80 sm:text-base">
              {t("dict.subtitle")}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard value={stats.total.toLocaleString("fr-FR")} label={t("dict.stat.entries") || "Entrées"} />
              <StatCard value={String(stats.domains)} label={t("dict.stat.domains") || "Domaines"} />
              <StatCard value={stats.trilingual.toLocaleString("fr-FR")} label={t("dict.stat.trilingual") || "Trilingues (+ EN)"} />
              <StatCard value={stats.withArabic.toLocaleString("fr-FR")} label={t("dict.stat.arabic") || "Avec arabe"} />
            </div>
          </div>
        </section>


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

        <div className="sticky top-16 z-30 -mx-4 mb-6 px-4 py-3 sm:-mx-6 sm:px-6">
          <div className="rounded-2xl border border-cream/10 bg-linear-to-br from-[#1A2E44] to-[#0D1826] p-4 shadow-xl shadow-black/20 backdrop-blur-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gold)]" />
              <input
                id="dict-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("dict.search")}
                aria-label={t("dict.searchAria")}
                className="h-11 w-full rounded-lg border border-[var(--gold)]/30 bg-cream/10 pl-10 pr-10 text-sm text-cream placeholder:text-cream/50 focus:border-[var(--gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gold)]/40"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/60 hover:text-[var(--gold)]"
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

            <div className="mt-3 flex flex-wrap gap-2">
              {DIALECTS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDialect(d.key)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition",
                    dialect === d.key
                      ? "border-[var(--gold)] bg-[var(--gold)] text-[#0D1826]"
                      : "border-cream/20 text-cream/80 hover:border-[var(--gold)]/60 hover:text-cream",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                onClick={() => setLetter("all")}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-semibold transition",
                  letter === "all"
                    ? "border-[var(--gold)] bg-[var(--gold)] text-[#0D1826]"
                    : "border-cream/20 text-cream/80 hover:border-[var(--gold)]/50",
                )}
              >
                A–Z
              </button>
              {ALPHABET.map((L) => (
                <button
                  key={L}
                  onClick={() => setLetter(L === letter ? "all" : L)}
                  className={cn(
                    "h-7 w-7 rounded-md border text-xs font-semibold transition",
                    letter === L
                      ? "border-[var(--gold)] bg-[var(--gold)] text-[#0D1826]"
                      : "border-cream/15 text-cream/70 hover:border-[var(--gold)]/50",
                  )}
                >
                  {L}
                </button>
              ))}
            </div>
          </div>
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
        "rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider capitalize transition whitespace-nowrap",
        active
          ? "border-[var(--gold)] bg-[var(--gold)] text-[#0D1826]"
          : "border-cream/20 text-cream/80 hover:border-[var(--gold)]/60 hover:text-cream",
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
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-cream/5 bg-linear-to-br from-[#1A2E44] to-[#0D1826] p-5 shadow-lg shadow-black/10 transition hover:border-[var(--gold)]/40 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="font-display text-2xl font-semibold leading-tight text-cream">
              {entry.pulaar}
            </h2>
            {entry.pronunciation && (
              <span className="text-xs italic text-[var(--gold)]/80">/{entry.pronunciation}/</span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {entry.pos && (
              <span className="rounded border border-[var(--gold)]/40 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">
                {entry.pos}{entry.noun_class ? ` · ${entry.noun_class}` : ""}
              </span>
            )}
            {entry.category && (
              <span className="rounded border border-cream/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cream/60 capitalize">
                {entry.category.replace(/_/g, " ")}
              </span>
            )}
            {entry.status === "propose" && (
              <span className="rounded border border-[var(--terracotta)]/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--terracotta)]">
                proposé
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSpeak();
            }}
            className="rounded-md p-1.5 text-cream/60 transition hover:bg-cream/10 hover:text-[var(--gold)]"
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
                ? "text-[var(--gold)]"
                : "text-cream/60 hover:bg-cream/10 hover:text-[var(--gold)]",
            )}
            aria-label={t("dict.favorite")}
          >
            <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>
        </div>
      </div>

      <dl className="mt-4 space-y-2 border-t border-cream/10 pt-3 text-sm">
        <Row label="FR" value={entry.french} />
        {entry.english && <Row label="EN" value={entry.english} />}
        {entry.arabic && <Row label="AR" value={entry.arabic} dir="rtl" />}
      </dl>

      {(entry.dialects.fouta_tooro || entry.dialects.maasina || entry.dialects.fouta_jallon || entry.dialects.adamaawa) && (
        <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-md border border-cream/10 bg-cream/5 p-2 text-[11px]">
          {entry.dialects.fouta_tooro && <DialectRow code="F. Tooro" value={entry.dialects.fouta_tooro} />}
          {entry.dialects.maasina && <DialectRow code="Maasina" value={entry.dialects.maasina} />}
          {entry.dialects.fouta_jallon && <DialectRow code="F. Jallon" value={entry.dialects.fouta_jallon} />}
          {entry.dialects.adamaawa && <DialectRow code="Adamaawa" value={entry.dialects.adamaawa} />}
        </div>
      )}

      {entry.notes && (
        <p className="mt-2 text-[11px] italic text-cream/50">{entry.notes}</p>
      )}

      {entry.example_pulaar && (
        <div className="mt-3 rounded-md border-l-2 border-[var(--gold)] bg-cream/5 px-3 py-2 text-xs">
          <p className="font-display italic text-cream">« {entry.example_pulaar} »</p>
          {entry.example_french && (
            <p className="mt-0.5 text-cream/60">{entry.example_french}</p>
          )}
        </div>
      )}
    </article>
  );
}

function Row({ label, value, dir }: { label: string; value: string; dir?: "rtl" | "ltr" }) {
  return (
    <div className="flex gap-2.5">
      <dt className="w-7 shrink-0 text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">
        {label}
      </dt>
      <dd className="flex-1 text-cream/90 leading-snug" dir={dir}>
        {value}
      </dd>
    </div>
  );
}

function DialectRow({ code, value }: { code: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-[var(--gold)]/80">{code}</span>
      <span className="truncate font-medium text-cream/90">{value}</span>
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
    <div className="mb-6 rounded-xl border border-[var(--gold)]/40 bg-linear-to-br from-[var(--gold)]/5 to-[var(--terracotta)]/5 p-4">
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
