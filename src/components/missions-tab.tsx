import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import {
  Flame, Heart, Trophy, Star, Volume2, X, Check, Sparkles, Loader2, LogIn, Award, Infinity as InfinityIcon, Zap,
} from "lucide-react";
import {
  getLearningState,
  getOrGenerateDailyMissions,
  submitAnswer,
  completeMission,
  type Mission,
  type Exercise,
  type LearningState,
} from "@/lib/janngude.functions";
import { EndlessPlayer } from "@/components/endless-player";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BADGE_META: Record<string, { label: string; emoji: string; desc: string }> = {
  almuudo: { label: "Almuudo", emoji: "📚", desc: "L'apprenti — 100 XP atteints" },
  pulaagu: { label: "Pulaagu", emoji: "🤝", desc: "Savoir-vivre — 3 jours de suite" },
  durnoowo: { label: "Durnoowo", emoji: "🐄", desc: "L'éleveur — 10 missions complétées" },
  gawlo: { label: "Gawlo", emoji: "🎤", desc: "Le griot — 1 000 XP" },
  ceerno: { label: "Ceerno", emoji: "👑", desc: "Le maître — 5 000 XP" },
};

export function MissionsTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fetchState = useServerFn(getLearningState);
  const fetchMissions = useServerFn(getOrGenerateDailyMissions);
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [endless, setEndless] = useState(false);

  const stateQ = useQuery({
    queryKey: ["janngude-state"],
    queryFn: () => fetchState(),
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  const missionsQ = useQuery({
    queryKey: ["janngude-missions"],
    queryFn: () => fetchMissions(),
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  if (!user) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-[var(--gold)]" />
        <h3 className="mt-3 font-display text-xl font-semibold text-earth">Janngude — Apprends chaque jour</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Missions quotidiennes, séries, cœurs et badges culturels Peuls.
          <br />Connecte-toi pour commencer.
        </p>
        <Link to="/auth" search={{ next: "/learn" }}>
          <Button className="mt-5"><LogIn className="mr-1.5 h-4 w-4" /> Se connecter</Button>
        </Link>
      </div>
    );
  }

  const state = stateQ.data;
  const missions = missionsQ.data ?? [];

  return (
    <div className="space-y-6">
      <StatsBar state={state} loading={stateQ.isLoading} />

      {/* Hero — Aventure infinie */}
      <button
        type="button"
        onClick={() => setEndless(true)}
        disabled={!state || state.hearts === 0}
        className={cn(
          "group relative w-full overflow-hidden rounded-3xl border-2 border-[var(--gold)]/40 bg-gradient-to-br from-[var(--gold)]/15 via-card to-[var(--terracotta)]/20 p-5 text-left transition-all sm:p-6",
          state && state.hearts > 0 && "hover:-translate-y-0.5 hover:shadow-lg hover:border-[var(--gold)]",
          (!state || state.hearts === 0) && "opacity-60",
        )}
      >
        <div className="absolute -right-6 -top-6 text-[140px] opacity-10 transition-transform group-hover:rotate-12">✨</div>
        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--gold)] to-[var(--terracotta)] text-3xl shadow-lg sm:h-20 sm:w-20 sm:text-4xl">
            🚀
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-earth/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cream">
              <InfinityIcon className="h-3 w-3" /> Nouveauté
            </div>
            <h3 className="mt-1.5 font-display text-xl font-bold text-earth sm:text-2xl">Aventure infinie</h3>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Exercices générés en continu par l'IA · QCM · Écoute · Saisie
            </p>
          </div>
          <Zap className="hidden h-6 w-6 text-[var(--gold)] transition-transform group-hover:scale-125 sm:block" />
        </div>
      </button>

      <div>
        <h3 className="mb-3 font-display text-lg font-semibold text-earth">Missions du jour</h3>
        {missionsQ.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl border border-border bg-muted/30" />
            ))}
          </div>
        ) : missions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Aucune mission disponible pour le moment. Réessaie dans un instant.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {missions.map((m) => (
              <MissionCard key={m.id} mission={m} onStart={() => setActiveMission(m)} disabled={!state || state.hearts === 0} />
            ))}
          </div>
        )}
        {state && state.hearts === 0 && (
          <p className="mt-3 text-xs text-destructive">
            Plus de cœurs — reviens dans {Math.ceil((state.next_heart_in_sec ?? 1800) / 60)} min.
          </p>
        )}
      </div>

      <BadgesRow unlocked={state?.badges ?? []} />

      {activeMission && (
        <MissionPlayer
          mission={activeMission}
          state={state ?? null}
          onClose={() => setActiveMission(null)}
          onCompleted={async () => {
            setActiveMission(null);
            await qc.invalidateQueries({ queryKey: ["janngude-state"] });
            await qc.invalidateQueries({ queryKey: ["janngude-missions"] });
          }}
        />
      )}

      {endless && (
        <EndlessPlayer
          state={state ?? null}
          onClose={async () => {
            setEndless(false);
            await qc.invalidateQueries({ queryKey: ["janngude-state"] });
          }}
          onTick={() => { /* refresh on close only */ }}
        />
      )}
    </div>
  );
}

/* ----------------- Stats bar ----------------- */

function StatsBar({ state, loading }: { state: LearningState | undefined; loading: boolean }) {
  if (loading || !state) {
    return <div className="h-20 animate-pulse rounded-2xl border border-border bg-muted/30" />;
  }
  const prevLevelXp = 100 * (state.level - 1) * (state.level - 1);
  const pct = Math.min(100, Math.round(((state.xp - prevLevelXp) / (state.next_level_xp - prevLevelXp)) * 100));

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-4">
        <Stat icon={<Trophy className="h-4 w-4" />} label="Niveau" value={String(state.level)} accent="text-[var(--gold)]" />
        <Stat icon={<Star className="h-4 w-4" />} label="XP" value={String(state.xp)} accent="text-amber-500" />
        <Stat icon={<Flame className="h-4 w-4" />} label="Série" value={`${state.streak_days} j`} accent="text-orange-500" />
        <Stat
          icon={<Heart className="h-4 w-4" />}
          label="Cœurs"
          value={`${state.hearts}/${state.max_hearts}`}
          accent={state.hearts === 0 ? "text-destructive" : "text-rose-500"}
        />
        <Stat icon={<Sparkles className="h-4 w-4" />} label="À réviser" value={String(state.due_count)} accent="text-sky-500" />
      </div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Niveau {state.level}</span>
          <span>{state.xp} / {state.next_level_xp} XP</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--terracotta)] transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("flex h-7 w-7 items-center justify-center rounded-md bg-muted", accent)}>{icon}</span>
      <div className="leading-tight">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="font-display text-sm font-semibold text-earth">{value}</p>
      </div>
    </div>
  );
}

/* ----------------- Mission card ----------------- */

function MissionCard({ mission, onStart, disabled }: { mission: Mission; onStart: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onStart}
      disabled={disabled || mission.completed}
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-card p-4 text-left transition",
        !disabled && !mission.completed && "hover:-translate-y-0.5 hover:border-[var(--gold)]/60 hover:shadow-md",
        disabled && "opacity-60",
        mission.completed && "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20",
      )}
    >
      <div className="flex items-start justify-between">
        <span className="rounded-full bg-earth/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-earth">
          Mission {mission.slot}
        </span>
        {mission.completed && <Check className="h-4 w-4 text-emerald-600" />}
      </div>
      <h4 className="mt-3 font-display text-lg font-semibold text-earth">{mission.title}</h4>
      <p className="mt-1 text-xs text-muted-foreground">
        {mission.exercises.length} exercices · ~5 min
      </p>
      {mission.completed && mission.score !== null && (
        <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          ✓ Terminée — {mission.score}%
        </p>
      )}
    </button>
  );
}

/* ----------------- Badges ----------------- */

function BadgesRow({ unlocked }: { unlocked: string[] }) {
  const set = new Set(unlocked);
  return (
    <div>
      <h3 className="mb-3 font-display text-lg font-semibold text-earth">Badges culturels</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(BADGE_META).map(([code, meta]) => {
          const has = set.has(code);
          return (
            <div
              key={code}
              title={meta.desc}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
                has
                  ? "border-[var(--gold)]/60 bg-[var(--gold)]/10 text-earth"
                  : "border-border bg-muted/40 text-muted-foreground opacity-60",
              )}
            >
              <span className="text-base leading-none">{meta.emoji}</span>
              <span className="font-medium">{meta.label}</span>
              {has && <Award className="h-3 w-3 text-[var(--gold)]" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------- Mission player (modal plein écran) ----------------- */

function MissionPlayer({
  mission,
  state,
  onClose,
  onCompleted,
}: {
  mission: Mission;
  state: LearningState | null;
  onClose: () => void;
  onCompleted: () => void;
}) {
  const submit = useServerFn(submitAnswer);
  const finish = useServerFn(completeMission);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [hearts, setHearts] = useState(state?.hearts ?? 5);
  const [finishing, setFinishing] = useState(false);

  const total = mission.exercises.length;
  const ex: Exercise | undefined = mission.exercises[idx];
  const progress = Math.round((idx / total) * 100);
  const isCorrect = picked === ex?.answer;

  const choose = (opt: string) => {
    if (picked || !ex) return;
    setPicked(opt);
    const ok = opt === ex.answer;
    if (ok) setCorrectCount((c) => c + 1);
    else setHearts((h) => Math.max(0, h - 1));
    // fire-and-forget côté serveur
    submit({ data: { mission_id: mission.id, exercise_id: ex.id, entry_id: ex.entry_id, correct: ok } }).catch(() => {});
  };

  const next = async () => {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setPicked(null);
      return;
    }
    setDone(true);
    setFinishing(true);
    const score = Math.round((correctCount / total) * 100);
    try {
      await finish({ data: { mission_id: mission.id, score, total } });
    } catch (e) {
      console.error(e);
    } finally {
      setFinishing(false);
    }
  };

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Audio désactivé pour Janngude tant que la prononciation TTS n'est pas fiable.

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* header */}
      <div className="flex flex-none items-center gap-3 border-b border-border px-4 py-3">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--terracotta)] transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium text-rose-500">
          <Heart className="h-4 w-4 fill-current" /> {hearts}
        </div>
      </div>

      {/* content */}
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-8 sm:py-12">
        {!done && ex && (
          <>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Question {idx + 1} / {total}
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-earth sm:text-3xl">{ex.prompt}</h2>
            {ex.kind === "mcq_pl_to_fr" && (
              <button onClick={() => speak(ex.pulaar)} className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Volume2 className="h-3.5 w-3.5" /> Écouter
              </button>
            )}

            <div className="mt-6 grid gap-2">
              {ex.options.map((opt) => {
                const isThis = picked === opt;
                const showRight = picked && opt === ex.answer;
                const showWrong = isThis && !isCorrect;
                return (
                  <button
                    key={opt}
                    onClick={() => choose(opt)}
                    disabled={!!picked}
                    className={cn(
                      "rounded-xl border-2 px-4 py-4 text-left text-base transition",
                      !picked && "border-border bg-card hover:border-[var(--gold)]/60 hover:bg-[var(--gold)]/5",
                      showRight && "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30",
                      showWrong && "border-destructive bg-destructive/10 text-destructive",
                      picked && !isThis && opt !== ex.answer && "opacity-50",
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {picked && (
              <div
                className={cn(
                  "mt-5 rounded-xl border p-3 text-sm",
                  isCorrect
                    ? "border-emerald-500/40 bg-emerald-50/60 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                    : "border-destructive/40 bg-destructive/5 text-destructive",
                )}
              >
                <p className="font-semibold">
                  {isCorrect ? "✓ Bravo !" : "✗ Pas tout à fait"}
                </p>
                <p className="mt-0.5 text-foreground/80">
                  <span className="font-display italic">{ex.pulaar}</span> — {ex.french}
                </p>
              </div>
            )}

            <div className="mt-auto pt-6">
              <Button className="w-full" size="lg" disabled={!picked} onClick={next}>
                {idx + 1 >= total ? "Terminer" : "Continuer"}
              </Button>
            </div>
          </>
        )}

        {done && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="text-6xl">🎉</div>
            <h2 className="mt-4 font-display text-3xl font-semibold text-earth">Mission complétée</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Score : {correctCount} / {total}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">XP gagnés</p>
                <p className="mt-1 font-display text-xl font-semibold text-[var(--gold)]">+{correctCount * 10 + 50}</p>
              </div>
              <div className="rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Précision</p>
                <p className="mt-1 font-display text-xl font-semibold text-earth">{Math.round((correctCount / total) * 100)}%</p>
              </div>
            </div>
            <Button className="mt-8" size="lg" disabled={finishing} onClick={onCompleted}>
              {finishing ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Sauvegarde…</> : "Retour aux missions"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
