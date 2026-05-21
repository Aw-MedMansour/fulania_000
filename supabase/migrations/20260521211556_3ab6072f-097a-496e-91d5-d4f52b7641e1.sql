
-- 1. Table donations
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 100 AND amount_cents <= 1000000),
  currency TEXT NOT NULL DEFAULT 'eur',
  display_name TEXT,
  message TEXT,
  user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','failed')),
  provider TEXT NOT NULL DEFAULT 'stripe' CHECK (provider IN ('stripe','external')),
  stripe_session_id TEXT UNIQUE,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (display_name IS NULL OR char_length(display_name) <= 50),
  CHECK (message IS NULL OR char_length(message) <= 200)
);

CREATE INDEX idx_donations_status_confirmed_at ON public.donations (status, confirmed_at DESC);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Lecture publique limitée aux dons confirmés (les colonnes sensibles ne sont pas exposées via la vue ci-dessous, mais on n'expose pas user_id côté API)
CREATE POLICY "Public can read confirmed donations"
ON public.donations FOR SELECT
USING (status = 'confirmed');

-- 2. Table fundraiser_goal (singleton)
CREATE TABLE public.fundraiser_goal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  goal_cents INTEGER NOT NULL CHECK (goal_cents > 0),
  external_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fundraiser_goal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read fundraiser goal"
ON public.fundraiser_goal FOR SELECT
USING (is_active = true);

-- 3. Vue stats publique
CREATE OR REPLACE VIEW public.donations_public_stats AS
SELECT
  COALESCE(SUM(amount_cents), 0)::BIGINT AS total_confirmed_cents,
  COUNT(*)::BIGINT AS donor_count
FROM public.donations
WHERE status = 'confirmed';

GRANT SELECT ON public.donations_public_stats TO anon, authenticated;

-- 4. Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_donations_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fundraiser_goal_updated_at
BEFORE UPDATE ON public.fundraiser_goal
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Seed objectif
INSERT INTO public.fundraiser_goal (title, description, goal_cents, external_url)
VALUES (
  'Soutenir FulanIA',
  'Aidez-nous à bâtir la première IA dédiée à la langue et à la culture Peule.',
  500000,
  NULL
);
