CREATE TABLE public.video_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 1,
  total_purchased integer NOT NULL DEFAULT 0,
  total_used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.video_credits TO authenticated;
GRANT ALL ON public.video_credits TO service_role;
ALTER TABLE public.video_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own video credits read" ON public.video_credits FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.video_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id text,
  model text NOT NULL,
  description text NOT NULL,
  prompt text NOT NULL,
  aspect_ratio text NOT NULL DEFAULT '16:9',
  duration_seconds integer NOT NULL DEFAULT 8,
  resolution text NOT NULL DEFAULT '720p',
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  storage_path text,
  credits_spent integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX video_generations_user_created_idx ON public.video_generations (user_id, created_at DESC);
GRANT SELECT, DELETE ON public.video_generations TO authenticated;
GRANT ALL ON public.video_generations TO service_role;
ALTER TABLE public.video_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own videos read" ON public.video_generations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own videos delete" ON public.video_generations FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER video_credits_updated_at BEFORE UPDATE ON public.video_credits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER video_generations_updated_at BEFORE UPDATE ON public.video_generations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();