-- Drop the SECURITY DEFINER view flagged by the linter
DROP VIEW IF EXISTS public.donations_public;

-- Expose safe public donation data via a SECURITY DEFINER function
-- This keeps sensitive columns (stripe_session_id, user_id) inaccessible to public roles
CREATE OR REPLACE FUNCTION public.get_public_donations()
RETURNS TABLE (
  id uuid,
  amount_cents integer,
  currency text,
  display_name text,
  message text,
  status text,
  created_at timestamptz,
  confirmed_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, amount_cents, currency, display_name, message, status, created_at, confirmed_at
  FROM public.donations
  WHERE status = 'confirmed'
  ORDER BY confirmed_at DESC NULLS LAST;
$$;

REVOKE ALL ON FUNCTION public.get_public_donations() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_donations() TO anon, authenticated;

-- Recreate donations_public as a security_invoker view over the function for backwards compatibility
CREATE VIEW public.donations_public
WITH (security_invoker = on) AS
SELECT * FROM public.get_public_donations();

GRANT SELECT ON public.donations_public TO anon, authenticated;