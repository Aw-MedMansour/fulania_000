
-- Drop the overly broad public SELECT policy on donations
DROP POLICY IF EXISTS "Public can read confirmed donations" ON public.donations;

-- Create a public view exposing only safe columns for confirmed donations
CREATE OR REPLACE VIEW public.donations_public
WITH (security_invoker = on) AS
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

-- Grant read access to the safe view
GRANT SELECT ON public.donations_public TO anon, authenticated;

-- Add a minimal SELECT policy so the security_invoker view can read underlying rows,
-- but revoke direct column access on the base table for sensitive columns.
CREATE POLICY "Confirmed donations readable for view"
ON public.donations
FOR SELECT
TO anon, authenticated
USING (status = 'confirmed');

-- Revoke all column privileges on the base table from public roles, then re-grant only safe columns
REVOKE SELECT ON public.donations FROM anon, authenticated;
GRANT SELECT (id, amount_cents, currency, display_name, message, status, created_at, confirmed_at)
  ON public.donations TO anon, authenticated;
