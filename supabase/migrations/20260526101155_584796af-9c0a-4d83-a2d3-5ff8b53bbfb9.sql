-- Remove direct public read access on donations base table
DROP POLICY IF EXISTS "Confirmed donations readable for view" ON public.donations;
REVOKE SELECT ON public.donations FROM anon, authenticated;

-- Recreate the safe public view using definer rights so it can read the base table
-- without granting anon/authenticated any direct access to sensitive columns
DROP VIEW IF EXISTS public.donations_public;
CREATE VIEW public.donations_public AS
SELECT
  id,
  amount_cents,
  currency,
  display_name,
  message,
  status,
  created_at,
  confirmed_at
FROM public.donations
WHERE status = 'confirmed';

GRANT SELECT ON public.donations_public TO anon, authenticated;