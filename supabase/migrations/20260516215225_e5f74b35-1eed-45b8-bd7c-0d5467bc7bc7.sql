
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES public.dictionary_entries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, entry_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own favorites" ON public.user_favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own favorites" ON public.user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own favorites" ON public.user_favorites
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_user_favorites_user ON public.user_favorites(user_id);

CREATE TABLE public.user_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES public.dictionary_entries(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own history" ON public.user_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own history" ON public.user_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own history" ON public.user_history
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_user_history_user_viewed ON public.user_history(user_id, viewed_at DESC);
