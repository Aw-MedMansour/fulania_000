import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ====== Types renvoyés au client ====== */

export type Exercise = {
  id: string;
  entry_id: string;
  kind: "mcq_fr_to_pl" | "mcq_pl_to_fr" | "fill_blank";
  prompt: string;
  options: string[];
  answer: string;
  hint?: string;
  pulaar: string;
  french: string;
};

export type Mission = {
  id: string;
  slot: number;
  title: string;
  theme: string | null;
  exercises: Exercise[];
  completed: boolean;
  score: number | null;
};

export type LearningState = {
  xp: number;
  level: number;
  next_level_xp: number;
  streak_days: number;
  hearts: number;
  max_hearts: number;
  next_heart_in_sec: number | null;
  due_count: number;
  badges: string[];
};

const MAX_HEARTS = 5;
const HEART_REGEN_MIN = 30;

function xpToLevel(xp: number) {
  // niveau 1 = 0, niveau N nécessite 100 * (N-1)^2 XP
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const nextLevelXp = 100 * level * level;
  return { level, next_level_xp: nextLevelXp };
}

function computeHearts(stored: number, lastLost: string | null) {
  if (stored >= MAX_HEARTS || !lastLost) {
    return { hearts: Math.min(stored, MAX_HEARTS), next_heart_in_sec: null as number | null };
  }
  const elapsedMin = (Date.now() - new Date(lastLost).getTime()) / 60000;
  const regenerated = Math.floor(elapsedMin / HEART_REGEN_MIN);
  const hearts = Math.min(MAX_HEARTS, stored + regenerated);
  if (hearts >= MAX_HEARTS) return { hearts, next_heart_in_sec: null };
  const remainder = HEART_REGEN_MIN - (elapsedMin % HEART_REGEN_MIN);
  return { hearts, next_heart_in_sec: Math.max(0, Math.round(remainder * 60)) };
}

const BADGES: { code: string; check: (s: { xp: number; streak: number; missions: number }) => boolean }[] = [
  { code: "almuudo", check: (s) => s.xp >= 100 },         // l'apprenti
  { code: "pulaagu", check: (s) => s.streak >= 3 },       // savoir-vivre
  { code: "durnoowo", check: (s) => s.missions >= 10 },   // l'éleveur (assidu)
  { code: "gawlo", check: (s) => s.xp >= 1000 },          // le griot
  { code: "ceerno", check: (s) => s.xp >= 5000 },         // le maître
];

/* ====== Lecture de l'état ====== */

export const getLearningState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // progression
    const { data: prog } = await supabase
      .from("user_learning_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    let xp = prog?.xp ?? 0;
    let storedHearts = prog?.hearts ?? MAX_HEARTS;
    const lastLost = prog?.last_heart_lost_at ?? null;
    const streak = prog?.streak_days ?? 0;

    // Reset streak si dernière activité > 1 jour
    let streakDays = streak;
    if (prog?.last_active_date) {
      const last = new Date(prog.last_active_date);
      const diff = Math.floor((Date.now() - last.getTime()) / 86400000);
      if (diff > 1) streakDays = 0;
    }

    const { hearts, next_heart_in_sec } = computeHearts(storedHearts, lastLost);
    const { level, next_level_xp } = xpToLevel(xp);

    // cartes dues
    const { count: due } = await supabase
      .from("user_card_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .lte("next_review", new Date().toISOString());

    // badges
    const { data: badgeRows } = await supabase
      .from("user_badges")
      .select("badge_code")
      .eq("user_id", userId);

    const state: LearningState = {
      xp,
      level,
      next_level_xp,
      streak_days: streakDays,
      hearts,
      max_hearts: MAX_HEARTS,
      next_heart_in_sec,
      due_count: due ?? 0,
      badges: (badgeRows ?? []).map((b) => b.badge_code),
    };
    return state;
  });

/* ====== Génération missions du jour ====== */

type DictEntry = {
  id: string;
  pulaar: string;
  french: string;
  pronunciation: string | null;
  category: string | null;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildMcq(entry: DictEntry, pool: DictEntry[], dir: "fr_to_pl" | "pl_to_fr"): Exercise {
  const isFR = dir === "fr_to_pl";
  const answer = isFR ? entry.pulaar : entry.french;
  const distractors = shuffle(pool.filter((p) => p.id !== entry.id))
    .slice(0, 3)
    .map((p) => (isFR ? p.pulaar : p.french));
  const options = shuffle([answer, ...distractors]);
  return {
    id: crypto.randomUUID(),
    entry_id: entry.id,
    kind: isFR ? "mcq_fr_to_pl" : "mcq_pl_to_fr",
    prompt: isFR
      ? `Comment dit-on « ${entry.french} » en Pulaar ?`
      : `Que signifie « ${entry.pulaar} » ?`,
    options,
    answer,
    pulaar: entry.pulaar,
    french: entry.french,
    hint: entry.pronunciation ? `/${entry.pronunciation}/` : undefined,
  };
}

export const getOrGenerateDailyMissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);

    // déjà générées ?
    const { data: existing } = await supabase
      .from("daily_missions")
      .select("id, slot, title, theme, exercises, completed, score")
      .eq("user_id", userId)
      .eq("mission_date", today)
      .order("slot");

    if (existing && existing.length === 3) {
      return existing.map((m) => ({
        id: m.id,
        slot: m.slot,
        title: m.title,
        theme: m.theme,
        exercises: m.exercises as unknown as Exercise[],
        completed: m.completed,
        score: m.score,
      })) as Mission[];
    }

    // Sélection : cartes dues d'abord, puis nouvelles par catégorie variée
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: dueRows } = await supabase
      .from("user_card_progress")
      .select("entry_id")
      .eq("user_id", userId)
      .lte("next_review", new Date().toISOString())
      .limit(12);

    const dueIds = (dueRows ?? []).map((r) => r.entry_id);

    let dueEntries: DictEntry[] = [];
    if (dueIds.length) {
      const { data } = await supabaseAdmin
        .from("dictionary_entries")
        .select("id, pulaar, french, pronunciation, category")
        .in("id", dueIds);
      dueEntries = ((data ?? []) as DictEntry[]).filter((e) => e.pulaar && e.french);
    }

    // Nouvelles entrées : on prend 30 entrées au hasard depuis des catégories variées
    const { data: newCandidates } = await supabaseAdmin
      .from("dictionary_entries")
      .select("id, pulaar, french, pronunciation, category")
      .not("french", "is", null)
      .not("pulaar", "is", null)
      .limit(400);

    const seenIds = new Set(dueEntries.map((d) => d.id));
    const newPool = shuffle(((newCandidates ?? []) as DictEntry[]).filter((e) => !seenIds.has(e.id) && e.pulaar && e.french));

    // Constitue 3 missions de 8 exos chacune
    const missionsToInsert: {
      mission_date: string;
      user_id: string;
      slot: number;
      title: string;
      theme: string | null;
      exercises: Exercise[];
      completed: boolean;
    }[] = [];

    const titlesByTheme: Record<string, string> = {
      salutation: "Calmes & politesse",
      famille: "En famille",
      nourriture: "À table",
      maison: "À la maison",
      nature: "Nature & saisons",
      corps: "Le corps",
      voyage: "En route",
      travail: "Au travail",
      sentiments: "Sentiments",
      animaux: "Animaux",
    };

    const distractorPool = (newCandidates ?? []) as DictEntry[];

    for (let slot = 1; slot <= 3; slot++) {
      const picks: DictEntry[] = [];
      // priorité : 4 dues si dispo
      const takeDue = dueEntries.splice(0, 4);
      picks.push(...takeDue);
      // complète avec 8 - takeDue nouveaux
      while (picks.length < 8 && newPool.length) {
        picks.push(newPool.shift()!);
      }
      if (picks.length < 4) break;

      const dominantTheme = picks.find((p) => p.category)?.category ?? null;
      const title = dominantTheme
        ? titlesByTheme[dominantTheme] ?? `Mission · ${dominantTheme}`
        : `Mission ${slot}`;

      const exercises: Exercise[] = picks.map((p, i) => {
        const dir = i % 2 === 0 ? "fr_to_pl" : "pl_to_fr";
        return buildMcq(p, distractorPool, dir);
      });

      missionsToInsert.push({
        mission_date: today,
        user_id: userId,
        slot,
        title,
        theme: dominantTheme,
        exercises,
        completed: false,
      });
    }

    if (!missionsToInsert.length) return [];

    // efface les vieilles missions du jour (si partielles)
    await supabase.from("daily_missions").delete().eq("user_id", userId).eq("mission_date", today);

    const { data: inserted, error } = await supabase
      .from("daily_missions")
      .insert(missionsToInsert)
      .select("id, slot, title, theme, exercises, completed, score")
      .order("slot");

    if (error) throw new Error(error.message);

    return (inserted ?? []).map((m) => ({
      id: m.id,
      slot: m.slot,
      title: m.title,
      theme: m.theme,
      exercises: m.exercises as unknown as Exercise[],
      completed: m.completed,
      score: m.score,
    })) as Mission[];
  });

/* ====== Soumission d'une réponse ====== */

const submitInput = z.object({
  mission_id: z.string().uuid(),
  exercise_id: z.string(),
  entry_id: z.string().uuid(),
  correct: z.boolean(),
});

export const submitAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => submitInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // SRS update
    const { data: existing } = await supabase
      .from("user_card_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("entry_id", data.entry_id)
      .maybeSingle();

    let ease = existing?.ease ?? 2.5;
    let interval = existing?.interval_days ?? 0;
    let reps = existing?.reps ?? 0;
    let lapses = existing?.lapses ?? 0;

    if (data.correct) {
      reps += 1;
      ease = Math.min(2.8, ease + 0.05);
      interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(interval * ease);
    } else {
      lapses += 1;
      reps = 0;
      ease = Math.max(1.3, ease - 0.2);
      interval = 1;
    }

    const nextReview = new Date(Date.now() + interval * 86400000).toISOString();

    await supabase
      .from("user_card_progress")
      .upsert(
        {
          user_id: userId,
          entry_id: data.entry_id,
          ease,
          interval_days: interval,
          reps,
          lapses,
          next_review: nextReview,
          last_reviewed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,entry_id" },
      );

    // XP / hearts
    const { data: prog } = await supabase
      .from("user_learning_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const today = new Date().toISOString().slice(0, 10);
    let xp = prog?.xp ?? 0;
    let streak = prog?.streak_days ?? 0;
    let storedHearts = prog?.hearts ?? MAX_HEARTS;
    let lastLost = prog?.last_heart_lost_at ?? null;

    // regen hearts d'abord
    const { hearts: currentHearts } = computeHearts(storedHearts, lastLost);
    storedHearts = currentHearts;

    if (data.correct) {
      xp += 10;
    } else {
      if (storedHearts > 0) {
        storedHearts -= 1;
        if (storedHearts < MAX_HEARTS) lastLost = new Date().toISOString();
      }
    }

    // streak update
    if (prog?.last_active_date !== today) {
      const last = prog?.last_active_date ? new Date(prog.last_active_date) : null;
      const dayDiff = last ? Math.floor((Date.now() - last.getTime()) / 86400000) : Infinity;
      streak = dayDiff === 1 ? streak + 1 : 1;
    }

    await supabase
      .from("user_learning_progress")
      .upsert(
        {
          user_id: userId,
          xp,
          level: xpToLevel(xp).level,
          streak_days: streak,
          hearts: storedHearts,
          last_heart_lost_at: lastLost,
          last_active_date: today,
        },
        { onConflict: "user_id" },
      );

    return { ok: true };
  });

/* ====== Finalisation d'une mission ====== */

const completeInput = z.object({
  mission_id: z.string().uuid(),
  score: z.number().int().min(0).max(100),
  total: z.number().int().min(1).max(20),
});

export const completeMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => completeInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    await supabase
      .from("daily_missions")
      .update({ completed: true, score: data.score, completed_at: new Date().toISOString() })
      .eq("id", data.mission_id)
      .eq("user_id", userId);

    // bonus mission : 50 XP
    const { data: prog } = await supabase
      .from("user_learning_progress")
      .select("xp")
      .eq("user_id", userId)
      .maybeSingle();
    const newXp = (prog?.xp ?? 0) + 50;
    await supabase
      .from("user_learning_progress")
      .update({ xp: newXp, level: xpToLevel(newXp).level })
      .eq("user_id", userId);

    // check badges
    const { count: missionsCount } = await supabase
      .from("daily_missions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true);

    const { data: progressForBadges } = await supabase
      .from("user_learning_progress")
      .select("xp, streak_days")
      .eq("user_id", userId)
      .maybeSingle();

    const stats = {
      xp: progressForBadges?.xp ?? 0,
      streak: progressForBadges?.streak_days ?? 0,
      missions: missionsCount ?? 0,
    };

    const unlocks = BADGES.filter((b) => b.check(stats));
    if (unlocks.length) {
      await supabase
        .from("user_badges")
        .upsert(
          unlocks.map((b) => ({ user_id: userId, badge_code: b.code })),
          { onConflict: "user_id,badge_code", ignoreDuplicates: true },
        );
    }

    return { ok: true, xp_gained: 50, badges: unlocks.map((b) => b.code) };
  });
