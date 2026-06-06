import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BookOpen, GraduationCap, Sparkles, RefreshCw, Check, X, Volume2, ArrowRight, ArrowLeft, Loader2, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { PageNav } from "@/components/page-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn")({
  head: () => {
    const l = getCurrentLang();
    return {
      meta: [
        { title: tFor(l, "seo./learn.title") },
        { name: "description", content: tFor(l, "seo./learn.desc") },
        { property: "og:title", content: tFor(l, "seo./learn.title") },
        { property: "og:description", content: tFor(l, "seo./learn.desc") },
        { property: "og:url", content: "https://fulania.com/learn" },
      ],
    };
  },
  component: LearnPage,
});

type Entry = {
  id: string;
  pulaar: string;
  french: string;
  arabic: string | null;
  english: string | null;
  category: string | null;
  pronunciation: string | null;
  example_pulaar: string | null;
  example_french: string | null;
};

function LearnPage() {
  const { t } = useLanguage();
  const [category, setCategory] = useState<string>("salutation");

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["learn-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dictionary_entries")
        .select("*")
        .order("pulaar");
      if (error) throw error;
      return data as Entry[];
    },
  });

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((e) => {
      if (e.category) map.set(e.category, (map.get(e.category) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const catEntries = useMemo(
    () => entries.filter((e) => e.category === category),
    [entries, category],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <PageNav className="mb-4" />
        
        
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-earth text-[var(--gold)]">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold text-earth sm:text-4xl">{t("learn.title")}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{t("learn.subtitle")}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("learn.pickCat")}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(([c, n]) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition",
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground/70 hover:border-primary/50",
                )}
              >
                {c} <span className="opacity-60">· {n}</span>
              </button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="lessons">
          <TabsList>
            <TabsTrigger value="lessons" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {t("learn.lessons")}</TabsTrigger>
            <TabsTrigger value="flashcards" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> {t("learn.flashcards")}</TabsTrigger>
            <TabsTrigger value="quiz" className="gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> {t("learn.quiz")}</TabsTrigger>
            <TabsTrigger value="ai" className="gap-1.5"><Wand2 className="h-3.5 w-3.5" /> {t("ai.lesson.tab")}</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="mt-6">
            <LessonView entries={catEntries} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="flashcards" className="mt-6">
            <FlashcardsView entries={catEntries} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="quiz" className="mt-6">
            <QuizView entries={catEntries} allEntries={entries} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <AILessonView defaultTopic={category} />
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}

/* ----------------------------- LESSON ----------------------------- */

function LessonView({ entries, isLoading }: { entries: Entry[]; isLoading: boolean }) {
  const { t, lang } = useLanguage();
  if (isLoading) return <SkeletonGrid />;
  if (entries.length === 0) return <Empty text={t("learn.empty")} />;

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ar" ? "ar-SA" : lang === "en" ? "en-US" : "fr-FR";
    u.rate = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <section aria-labelledby="lessons-heading">
    <h2 id="lessons-heading" className="sr-only">{t("learn.lessons")}</h2>
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map((e) => (
        <article key={e.id} className="rounded-lg border border-border bg-card p-4 transition hover:border-primary/40">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-xl font-semibold text-earth">{e.pulaar}</h3>
              {e.pronunciation && <span className="text-xs italic text-muted-foreground">/{e.pronunciation}/</span>}
            </div>
            <button onClick={() => speak(e.pulaar)} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label={t("entry.listen")}>
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-sm">{e.french}</p>
          {e.english && <p className="text-xs text-muted-foreground">{t("learn.langEN")} — {e.english}</p>}
          {e.arabic && <p className="text-xs text-muted-foreground" dir="rtl">{t("learn.langAR")} — {e.arabic}</p>}
          {e.example_pulaar && (
            <div className="mt-3 rounded-md border-l-2 border-[var(--gold)] bg-muted/40 px-3 py-2 text-xs">
              <p className="font-display italic text-earth">« {e.example_pulaar} »</p>
              {e.example_french && <p className="mt-0.5 text-muted-foreground">{e.example_french}</p>}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

/* --------------------------- FLASHCARDS --------------------------- */

function FlashcardsView({ entries, isLoading }: { entries: Entry[]; isLoading: boolean }) {
  const { t } = useLanguage();
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());

  if (isLoading) return <SkeletonGrid />;
  if (entries.length === 0) return <Empty text={t("learn.empty")} />;

  const card = entries[idx % entries.length];
  const next = () => { setIdx((i) => (i + 1) % entries.length); setFlipped(false); };
  const prev = () => { setIdx((i) => (i - 1 + entries.length) % entries.length); setFlipped(false); };
  const markKnown = () => { setKnownIds((s) => new Set([...s, card.id])); next(); };
  const markReview = () => { setKnownIds((s) => { const n = new Set(s); n.delete(card.id); return n; }); next(); };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("learn.cardOf").replace("{n}", String(idx + 1)).replace("{total}", String(entries.length))}</span>
        <span>{t("learn.known")} : {knownIds.size}</span>
      </div>
      <button
        onClick={() => setFlipped((f) => !f)}
        className="group relative flex min-h-[260px] w-full flex-col items-center justify-center rounded-2xl border-2 border-border bg-card p-8 text-center transition hover:border-primary/40 hover:shadow-lg"
        aria-label={t("learn.flip")}
      >
        {!flipped ? (
          <>
            <span className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Pulaar</span>
            <span className="font-display text-3xl font-semibold text-earth">{card.pulaar}</span>
            {card.pronunciation && <span className="mt-2 text-sm italic text-muted-foreground">/{card.pronunciation}/</span>}
          </>
        ) : (
          <>
            <span className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">FR / EN / AR</span>
            <span className="text-xl font-medium">{card.french}</span>
            {card.english && <span className="mt-1 text-sm text-muted-foreground">{card.english}</span>}
            {card.arabic && <span className="mt-1 text-sm text-muted-foreground" dir="rtl">{card.arabic}</span>}
          </>
        )}
        <span className="absolute bottom-3 right-3 text-[10px] text-muted-foreground opacity-60 group-hover:opacity-100">↻ {t("learn.flip")}</span>
      </button>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={markReview}><X className="mr-1.5 h-4 w-4" /> {t("learn.review")}</Button>
        <Button onClick={markKnown}><Check className="mr-1.5 h-4 w-4" /> {t("learn.known")}</Button>
      </div>
      <div className="mt-2 flex justify-between">
        <Button variant="ghost" size="sm" onClick={prev}><ArrowLeft className="mr-1 h-3.5 w-3.5" /> {t("learn.prev")}</Button>
        <Button variant="ghost" size="sm" onClick={next}>{t("learn.next")} <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
      </div>
    </div>
  );
}

/* ------------------------------- QUIZ ------------------------------ */

type QuizQ = { entry: Entry; options: string[]; answer: string };

function buildQuiz(catEntries: Entry[], pool: Entry[]): QuizQ[] {
  const sample = [...catEntries].sort(() => Math.random() - 0.5).slice(0, Math.min(8, catEntries.length));
  return sample.map((e) => {
    const distractors = pool
      .filter((x) => x.id !== e.id && x.french && x.french !== e.french)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((x) => x.french);
    const options = [...distractors, e.french].sort(() => Math.random() - 0.5);
    return { entry: e, options, answer: e.french };
  });
}

function QuizView({ entries, allEntries, isLoading }: { entries: Entry[]; allEntries: Entry[]; isLoading: boolean }) {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<QuizQ[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (isLoading) return <SkeletonGrid />;
  if (entries.length < 4) return <Empty text={t("learn.empty")} />;

  if (!questions) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <h3 className="font-display text-xl font-semibold">{t("learn.quiz")}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{t("learn.quizInfo").replace("{n}", String(entries.length))}</p>
        <Button className="mt-4" onClick={() => { setQuestions(buildQuiz(entries, allEntries)); setI(0); setScore(0); setDone(false); setPicked(null); }}>
          {t("learn.start")}
        </Button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const msg = pct >= 80 ? t("learn.resultGood") : pct >= 50 ? t("learn.resultMid") : t("learn.resultLow");
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <h3 className="font-display text-2xl font-semibold text-earth">{t("learn.resultTitle")}</h3>
        <p className="mt-4 font-display text-5xl font-bold text-[var(--terracotta)]">{score} / {questions.length}</p>
        <p className="mt-2 text-sm text-muted-foreground">{msg}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={() => setQuestions(null)}><RefreshCw className="mr-1.5 h-4 w-4" /> {t("learn.restart")}</Button>
          <Link to="/chat"><Button>{t("learn.askAI")} <ArrowRight className="ml-1.5 h-4 w-4" /></Button></Link>
        </div>
      </div>
    );
  }

  const q = questions[i];
  const isCorrect = picked === q.answer;

  const submit = () => {
    if (!picked) return;
    if (isCorrect) setScore((s) => s + 1);
    setTimeout(() => {
      if (i + 1 >= questions.length) setDone(true);
      else { setI(i + 1); setPicked(null); }
    }, 900);
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("learn.qOf").replace("{n}", String(i + 1)).replace("{total}", String(questions.length))}</span>
        <span>{t("learn.score")} : {score}</span>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Pulaar</p>
        <p className="mt-1 font-display text-3xl font-semibold text-earth">{q.entry.pulaar}</p>
        {q.entry.pronunciation && <p className="mt-1 text-xs italic text-muted-foreground">/{q.entry.pronunciation}/</p>}
        <div className="mt-5 grid gap-2">
          {q.options.map((opt) => {
            const isThis = picked === opt;
            const showRight = picked && opt === q.answer;
            const showWrong = isThis && !isCorrect;
            return (
              <button
                key={opt}
                onClick={() => !picked && setPicked(opt)}
                disabled={!!picked}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left text-sm transition",
                  !picked && "border-border bg-background hover:border-primary/50 hover:bg-primary/5",
                  showRight && "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30",
                  showWrong && "border-destructive bg-destructive/10 text-destructive",
                  picked && !isThis && opt !== q.answer && "opacity-50",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {picked && (
          <p className={cn("mt-3 text-sm font-medium", isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-destructive")}>
            {isCorrect ? `✓ ${t("learn.correct")}` : `✗ ${t("learn.wrong")} — ${q.answer}`}
          </p>
        )}
        <Button className="mt-4 w-full" disabled={!picked} onClick={submit}>
          {i + 1 >= questions.length ? t("learn.finish") : t("learn.next")}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------ helpers ----------------------------- */

function SkeletonGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-lg border border-border bg-muted/30" />
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

/* ------------------------------- AI LESSON ------------------------------ */

type Lesson = {
  title: string;
  intro: string;
  vocabulary: { pulaar: string; french: string; pronunciation: string | null }[];
  dialogue?: { speaker: string; pulaar: string; french: string }[];
  tips?: string[];
};

function AILessonView({ defaultTopic }: { defaultTopic: string }) {
  const { t, dialect, lang } = useLanguage();
  const [topic, setTopic] = useState(defaultTopic ?? "");
  const [level, setLevel] = useState<"debutant" | "intermediaire" | "avance">("debutant");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ar" ? "ar-SA" : lang === "en" ? "en-US" : "fr-FR";
    u.rate = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const run = async () => {
    const q = topic.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setLesson(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-lesson`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ topic: q, level, dialect, lang }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "err");
      setLesson(j.lesson);
    } catch {
      setError(t("ai.lesson.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--gold)]/40 bg-gradient-to-br from-[var(--gold)]/5 to-[var(--terracotta)]/5 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-earth text-[var(--gold)]">
            <Wand2 className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold text-earth">{t("ai.lesson.title")}</p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t("ai.lesson.placeholder")}
            className="h-11"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as any)}
            className="h-11 rounded-md border border-input bg-background px-3 text-sm"
            aria-label={t("ai.lesson.level")}
          >
            <option value="debutant">{t("ai.lesson.beg")}</option>
            <option value="intermediaire">{t("ai.lesson.int")}</option>
            <option value="avance">{t("ai.lesson.adv")}</option>
          </select>
          <Button onClick={run} disabled={loading || !topic.trim()} className="h-11">
            {loading ? (
              <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> {t("ai.lesson.loading")}</>
            ) : (
              <><Wand2 className="mr-1.5 h-4 w-4" /> {t("ai.lesson.cta")}</>
            )}
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>

      {lesson && (
        <article className="space-y-5 rounded-xl border border-border bg-card p-5">
          <header>
            <h3 className="font-display text-2xl font-semibold text-earth">{lesson.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{lesson.intro}</p>
          </header>

          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("ai.lesson.vocab")}
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {lesson.vocabulary.map((v, i) => (
                <div key={i} className="flex items-start justify-between gap-2 rounded-md border border-border bg-background p-3">
                  <div>
                    <p className="font-display font-semibold text-earth">{v.pulaar}</p>
                    {v.pronunciation && <p className="text-xs italic text-muted-foreground">/{v.pronunciation}/</p>}
                    <p className="mt-0.5 text-sm">{v.french}</p>
                  </div>
                  <button
                    onClick={() => speak(v.pulaar)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label="Listen"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {lesson.dialogue && lesson.dialogue.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("ai.lesson.dialog")}
              </h4>
              <div className="space-y-2">
                {lesson.dialogue.map((d, i) => (
                  <div key={i} className="rounded-md border-l-2 border-[var(--gold)] bg-muted/40 px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--terracotta)]">{d.speaker}</p>
                    <p className="font-display italic text-earth">« {d.pulaar} »</p>
                    <p className="text-xs text-muted-foreground">{d.french}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {lesson.tips && lesson.tips.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("ai.lesson.tips")}
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
                {lesson.tips.map((tip, i) => <li key={i}>{tip}</li>)}
              </ul>
            </section>
          )}
        </article>
      )}
    </div>
  );
}
