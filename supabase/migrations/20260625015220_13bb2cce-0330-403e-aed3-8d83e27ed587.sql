-- 1. user_badges: split ALL policy into per-action policies; INSERT/UPDATE service_role only
DROP POLICY IF EXISTS own_badges ON public.user_badges;

CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own badges"
  ON public.user_badges FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert badges"
  ON public.user_badges FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update badges"
  ON public.user_badges FOR UPDATE
  TO service_role
  USING (true) WITH CHECK (true);

-- 2. books-covers: allow public read so cover images render. PDFs remain admin-only
-- (downloads are served via short-lived signed URLs from the server function).
CREATE POLICY "Public can read book covers"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'books-covers');