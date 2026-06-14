
-- 1) Progression globale
CREATE TABLE public.user_learning_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  hearts INTEGER NOT NULL DEFAULT 5,
  last_heart_lost_at TIMESTAMPTZ,
  last_active_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_learning_progress TO authenticated;
GRANT ALL ON public.user_learning_progress TO service_role;
ALTER TABLE public.user_learning_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_progress" ON public.user_learning_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_user_learning_progress_updated_at
  BEFORE UPDATE ON public.user_learning_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) SRS par carte
CREATE TABLE public.user_card_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES public.dictionary_entries(id) ON DELETE CASCADE,
  ease REAL NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  next_review TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, entry_id)
);
CREATE INDEX idx_ucp_user_due ON public.user_card_progress(user_id, next_review);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_card_progress TO authenticated;
GRANT ALL ON public.user_card_progress TO service_role;
ALTER TABLE public.user_card_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_card_progress" ON public.user_card_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_user_card_progress_updated_at
  BEFORE UPDATE ON public.user_card_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Missions du jour
CREATE TABLE public.daily_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_date DATE NOT NULL,
  slot INTEGER NOT NULL,
  title TEXT NOT NULL,
  theme TEXT,
  exercises JSONB NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  score INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_date, slot)
);
CREATE INDEX idx_daily_missions_user_date ON public.daily_missions(user_id, mission_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_missions TO authenticated;
GRANT ALL ON public.daily_missions TO service_role;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_missions" ON public.daily_missions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4) Badges débloqués
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_badges" ON public.user_badges
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
