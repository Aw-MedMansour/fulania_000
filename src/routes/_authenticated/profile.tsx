import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Flame,
  Heart,
  History,
  TrendingUp,
  ArrowLeft,
  Star,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Mon Profil | FulanIA" },
      {
        name: "description",
        content:
          "Votre profil FulanIA — favoris, historique et progression dans l'apprentissage du Pulaar.",
      },
    ],
  }),
  component: ProfilePage,
});

type Entry = {
  id: string;
  pulaar: string;
  french: string;
  arabic: string | null;
  english: string | null;
  category: string | null;
  pronunciation: string | null;
};

function ProfilePage() {
  const { user } = useAuth();

  const { data: entries = [] } = useQuery({
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

  const { data: stats } = useQuery({
    queryKey: ["user_stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as
        | {
            total_views: number;
            total_favorites: number;
            streak_days: number;
            last_active: string | null;
          }
        | null;
    },
  });

  const { data: cloudFavs = [] } = useQuery({
    queryKey: ["user_favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_favorites")
        .select("entry_id, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as { entry_id: string; created_at: string }[];
    },
  });

  const { data: cloudHist = [] } = useQuery({
    queryKey: ["user_history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_history")
        .select("entry_id, viewed_at")
        .eq("user_id", user!.id)
        .order("viewed_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as { entry_id: string; viewed_at: string }[];
    },
  });

  const favEntries = useMemo(() => {
    const map = new Map(entries.map((e) => [e.id, e]));
    return cloudFavs
      .map((f) => map.get(f.entry_id))
      .filter(Boolean) as Entry[];
  }, [entries, cloudFavs]);

  const histEntries = useMemo(() => {
    const map = new Map(entries.map((e) => [e.id, e]));
    const seen = new Set<string>();
    const result: { entry: Entry; viewed_at: string }[] = [];
    for (const h of cloudHist) {
      const entry = map.get(h.entry_id);
      if (entry && !seen.has(entry.id)) {
        seen.add(entry.id);
        result.push({ entry, viewed_at: h.viewed_at });
      }
    }
    return result;
  }, [entries, cloudHist]);

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const h of cloudHist) {
      const entry = entries.find((e) => e.id === h.entry_id);
      if (entry?.category) {
        counts[entry.category] = (counts[entry.category] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [entries, cloudHist]);

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const initials = user?.email
    ? user.email
        .split("@")[0]
        .split(/[._-]/)
        .map((s) => s[0]?.toUpperCase())
        .slice(0, 2)
        .join("")
    : "?";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>

        {/* Profile Header */}
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-earth text-xl font-bold text-[var(--gold)]">
            {initials}
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-earth sm:text-3xl">
              Mon Profil
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user?.email}
            </p>
            <p className="text-xs text-muted-foreground/70">
              Membre depuis le {joinedDate}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={<Eye className="h-5 w-5" />}
            label="Mots consultés"
            value={stats?.total_views ?? 0}
          />
          <StatCard
            icon={<Heart className="h-5 w-5" />}
            label="Favoris"
            value={stats?.total_favorites ?? 0}
          />
          <StatCard
            icon={<Flame className="h-5 w-5" />}
            label="Série (jours)"
            value={stats?.streak_days ?? 0}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Dernière activité"
            value={
              stats?.last_active
                ? new Date(stats.last_active).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })
                : "—"
            }
          />
        </div>

        <Tabs defaultValue="progression">
          <TabsList className="mb-6">
            <TabsTrigger value="progression" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Progression
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-1.5">
              <Star className="h-3.5 w-3.5" /> Favoris
              <Badge variant="secondary" className="ml-1">
                {favEntries.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-3.5 w-3.5" /> Historique
              <Badge variant="secondary" className="ml-1">
                {histEntries.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progression" className="space-y-6">
            {/* Category breakdown */}
            {categoryStats.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-display text-lg font-semibold text-earth">
                  Catégories les plus consultées
                </h3>
                <div className="space-y-3">
                  {categoryStats.map(([cat, count]) => {
                    const max = categoryStats[0][1];
                    const pct = max > 0 ? (count / max) * 100 : 0;
                    return (
                      <div key={cat}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="capitalize">{cat}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-earth transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Weekly activity mock */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 font-display text-lg font-semibold text-earth">
                Activité récente
              </h3>
              {cloudHist.length > 0 ? (
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    const dayLabel = d.toLocaleDateString("fr-FR", {
                      weekday: "narrow",
                    });
                    const dayStr = d.toISOString().split("T")[0];
                    const count = cloudHist.filter((h) =>
                      h.viewed_at.startsWith(dayStr)
                    ).length;
                    const intensity =
                      count === 0
                        ? "bg-muted"
                        : count <= 2
                          ? "bg-earth/30"
                          : count <= 5
                            ? "bg-earth/60"
                            : "bg-earth";
                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div
                          className={cn(
                            "h-10 w-full rounded-md transition",
                            intensity,
                          )}
                          title={`${count} consultation${count > 1 ? "s" : ""}`}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {dayLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune activité enregistrée. Consultez des mots dans le
                  dictionnaire pour voir votre progression.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            {favEntries.length === 0 ? (
              <EmptyState
                icon={<Heart className="h-8 w-8" />}
                title="Aucun favori"
                description="Ajoutez des mots à vos favoris depuis le dictionnaire pour les retrouver ici."
                action={
                  <Link to="/dictionary">
                    <Button variant="outline">Aller au dictionnaire</Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {favEntries.map((entry) => (
                  <EntryLinkCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {histEntries.length === 0 ? (
              <EmptyState
                icon={<History className="h-8 w-8" />}
                title="Aucun historique"
                description="Votre historique de consultation apparaîtra ici."
                action={
                  <Link to="/dictionary">
                    <Button variant="outline">Aller au dictionnaire</Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {histEntries.map(({ entry, viewed_at }) => (
                  <div
                    key={entry.id + viewed_at}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                  >
                    <Link
                      to="/dictionary"
                      className="min-w-0 flex-1"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-lg font-semibold text-earth">
                          {entry.pulaar}
                        </span>
                        {entry.pronunciation && (
                          <span className="text-xs italic text-muted-foreground">
                            /{entry.pronunciation}/
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {entry.french}
                      </p>
                    </Link>
                    <div className="ml-4 flex shrink-0 flex-col items-end gap-1">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {entry.category ?? "—"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground/70">
                        {new Date(viewed_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <SiteFooter />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-[var(--gold)]">{icon}</div>
      <p className="mt-2 font-display text-2xl font-bold text-earth">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EntryLinkCard({ entry }: { entry: Entry }) {
  return (
    <Link
      to="/dictionary"
      className="group rounded-lg border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-baseline gap-2">
        <span className="font-display text-lg font-semibold text-earth">
          {entry.pulaar}
        </span>
        {entry.pronunciation && (
          <span className="text-xs italic text-muted-foreground">
            /{entry.pronunciation}/
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{entry.french}</p>
      <div className="mt-2 flex items-center gap-2">
        {entry.category && (
          <Badge variant="outline" className="text-[10px] capitalize">
            {entry.category}
          </Badge>
        )}
        {entry.english && (
          <span className="text-[10px] text-muted-foreground/70">
            EN: {entry.english}
          </span>
        )}
      </div>
    </Link>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <div className="mb-3 text-muted-foreground">{icon}</div>
      <h3 className="font-display text-lg font-semibold text-earth">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      <div className="mt-4">{action}</div>
    </div>
  );
}
