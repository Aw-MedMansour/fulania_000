import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Heart, X, Flame, Volume2, Sparkles, Loader2, Star, Zap, MessageCircle } from "lucide-react";
import {
  generateEndlessBatch,
  submitAnswer,
  type Exercise,
  type LearningState,
} from "@/lib/janngude.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TutorChat } from "@/components/tutor-chat";

export function EndlessPlayer({
  state,
  onClose,
  onTick,
}: {
  state: LearningState | null;
  onClose: () => void;
  onTick: () => void;
}) {
  const fetchBatch = useServerFn(generateEndlessBatch);
  const submit = useServerFn(submitAnswer);

  const [queue, setQueue] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [hearts, setHearts] = useState(state?.hearts ?? 5);
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [combo, setCombo] = useState(0);
  const [xpGain, setXpGain] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);
  const [done, setDone] = useState(0);
  const [tutorOpen, setTutorOpen] = useState(false);
  const loadingMoreRef = useRef(false);

  const ex = queue[0];

  // Load first batch
  useEffect(() => {
    void loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prefetch when running low
  useEffect(() => {
    if (queue.length <= 3 && !loadingMoreRef.current) {
      void loadMore(false);
    }
  }, [queue.length]);

  // Hearts depleted → close after small delay
  useEffect(() => {
    if (hearts <= 0) {
      const t = setTimeout(onClose, 1800);
      return () => clearTimeout(t);
    }
  }, [hearts, onClose]);

  // Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  async function loadMore(initial: boolean) {
    loadingMoreRef.current = true;
    if (initial) setLoading(true);
    try {
      const batch = await fetchBatch({ data: { size: 10 } });
      setQueue((q) => [...q, ...batch]);
    } catch (e) {
      console.error(e);
    } finally {
      if (initial) setLoading(false);
      loadingMoreRef.current = false;
    }
  }

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  // auto-speak listen_pick prompts
  useEffect(() => {
    if (ex?.kind === "listen_pick") {
      const t = setTimeout(() => speak(ex.pulaar), 250);
      return () => clearTimeout(t);
    }
  }, [ex?.id, ex?.kind]);

  function judge(correct: boolean) {
    if (!ex) return;
    setFeedback(correct ? "ok" : "no");
    if (correct) {
      const bonus = combo >= 4 ? 5 : 0;
      setXpGain((x) => x + 10 + bonus);
      setCombo((c) => c + 1);
    } else {
      setHearts((h) => Math.max(0, h - 1));
      setCombo(0);
    }
    submit({
      data: {
        mission_id: "00000000-0000-0000-0000-000000000000",
        exercise_id: ex.id,
        entry_id: ex.entry_id,
        correct,
      },
    }).catch(() => {});
    onTick();
  }

  function choose(opt: string) {
    if (picked || !ex) return;
    setPicked(opt);
    judge(opt === ex.answer);
  }

  function checkTyped() {
    if (!ex || picked) return;
    const v = typed.toLowerCase().trim();
    const accept = ex.accept ?? [ex.answer.toLowerCase().trim()];
    const ok = accept.includes(v);
    setPicked(v || "—");
    judge(ok);
  }

  function next() {
    setPicked(null);
    setTyped("");
    setFeedback(null);
    setDone((d) => d + 1);
    setQueue((q) => q.slice(1));
  }

  const accent = useMemo(
    () => (feedback === "ok" ? "from-emerald-400 to-teal-500" : feedback === "no" ? "from-rose-400 to-red-500" : "from-[var(--gold)] to-[var(--terracotta)]"),
    [feedback],
  );

  // Game over screen
  if (hearts <= 0) {
    return (
      <Shell onClose={onClose}>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="text-7xl">💔</div>
          <h2 className="mt-4 font-display text-3xl font-semibold text-earth">Plus de cœurs !</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tu as terminé {done} exercices · +{xpGain} XP</p>
        </div>
      </Shell>
    );
  }

  if (loading || !ex) {
    return (
      <Shell onClose={onClose}>
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--gold)]" />
        </div>
      </Shell>
    );
  }

  const isCorrect = picked !== null && (
    ex.kind === "type_in"
      ? (ex.accept ?? [ex.answer.toLowerCase().trim()]).includes((picked ?? "").toLowerCase().trim())
      : picked === ex.answer
  );

  return (
    <Shell onClose={onClose}>
      {/* Top HUD */}
      <div className="flex-none border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-[var(--gold)]" /> Aventure infinie
              </span>
              <span>{done} terminés</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full bg-gradient-to-r transition-all", accent)} style={{ width: `${Math.min(100, (done % 10) * 10 + 10)}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-sm font-semibold text-rose-500">
            <Heart className="h-4 w-4 fill-current" /> {hearts}
          </div>
          {combo >= 2 && (
            <div className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-sm font-semibold text-orange-500 animate-in zoom-in">
              <Flame className="h-4 w-4 fill-current" /> ×{combo}
            </div>
          )}
          <div className="hidden items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-sm font-semibold text-amber-600 sm:flex">
            <Star className="h-4 w-4 fill-current" /> {xpGain}
          </div>
          <button
            onClick={() => setTutorOpen(true)}
            aria-label="Demander au tuteur"
            title="Tuteur IA"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--terracotta)] px-3 py-1.5 text-sm font-bold text-white shadow-md shadow-[var(--terracotta)]/30 hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Aide</span>
          </button>
        </div>
      </div>

      {/* Exercise area */}
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-6 sm:py-10">
        {/* Visual hero */}
        <div className="flex flex-col items-center">
          <div
            key={ex.id}
            className={cn(
              "flex h-32 w-32 items-center justify-center rounded-3xl text-7xl shadow-md transition-all duration-300 sm:h-40 sm:w-40 sm:text-8xl",
              "bg-gradient-to-br from-[var(--gold)]/15 via-card to-[var(--terracotta)]/15 border-2 border-[var(--gold)]/30",
              feedback === "ok" && "border-emerald-400 scale-110",
              feedback === "no" && "border-rose-400 animate-pulse",
            )}
          >
            {ex.emoji}
          </div>
          {ex.category && (
            <span className="mt-3 rounded-full bg-earth/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-earth">
              {ex.category}
            </span>
          )}
        </div>

        <h2 className="mt-5 text-center font-display text-xl font-semibold text-earth sm:text-2xl">
          {ex.prompt}
        </h2>

        {(ex.kind === "listen_pick" || ex.kind === "mcq_pl_to_fr") && (
          <button
            onClick={() => speak(ex.pulaar)}
            className="mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-500/20"
          >
            <Volume2 className="h-3.5 w-3.5" /> Réécouter
          </button>
        )}

        {/* Answer area */}
        <div className="mt-6">
          {ex.kind === "type_in" ? (
            <div className="space-y-2">
              <Input
                autoFocus
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !picked && checkTyped()}
                placeholder="Écris ta réponse en Pulaar…"
                className="h-14 text-center text-lg font-display"
                disabled={!!picked}
              />
              {ex.hint && <p className="text-center text-xs text-muted-foreground">indice : {ex.hint}</p>}
            </div>
          ) : (
            <div className="grid gap-2.5">
              {ex.options.map((opt) => {
                const isThis = picked === opt;
                const showRight = picked && opt === ex.answer;
                const showWrong = isThis && opt !== ex.answer;
                return (
                  <button
                    key={opt}
                    onClick={() => choose(opt)}
                    disabled={!!picked}
                    className={cn(
                      "rounded-2xl border-2 px-4 py-4 text-left text-base font-medium transition-all",
                      !picked && "border-border bg-card hover:-translate-y-0.5 hover:border-[var(--gold)] hover:shadow-md",
                      showRight && "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40",
                      showWrong && "border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-950/40",
                      picked && !isThis && opt !== ex.answer && "opacity-40",
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Feedback */}
        {picked && (
          <div
            className={cn(
              "mt-5 rounded-2xl border-2 p-4 text-sm animate-in slide-in-from-bottom-2",
              isCorrect
                ? "border-emerald-400 bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                : "border-rose-400 bg-rose-50/80 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
            )}
          >
            <p className="font-display text-base font-semibold">
              {isCorrect ? "🎉 Excellent !" : "😅 Pas tout à fait"}
            </p>
            <p className="mt-1">
              <span className="font-display italic text-base">{ex.pulaar}</span>
              {ex.hint && <span className="ml-1 text-xs opacity-70">{ex.hint}</span>}
              <span className="mx-1.5">·</span>
              <span>{ex.french}</span>
            </p>
          </div>
        )}

        <div className="mt-auto pt-6">
          {picked ? (
            <Button className="w-full" size="lg" onClick={next}>
              <Zap className="mr-1.5 h-4 w-4" /> Continuer
            </Button>
          ) : ex.kind === "type_in" ? (
            <Button className="w-full" size="lg" disabled={!typed.trim()} onClick={checkTyped}>
              Vérifier
            </Button>
          ) : null}
        </div>
      </div>
      {tutorOpen && (
        <TutorChat
          context={{ pulaar: ex.pulaar, french: ex.french, category: ex.category, hint: ex.hint }}
          onClose={() => setTutorOpen(false)}
        />
      )}
    </Shell>
  );
}

function Shell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="absolute right-3 top-3 z-10">
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="rounded-full bg-card/80 p-2 text-muted-foreground shadow-sm backdrop-blur hover:bg-card hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      {children}
    </div>
  );
}
