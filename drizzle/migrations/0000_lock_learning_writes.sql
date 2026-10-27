DROP POLICY IF EXISTS own_progress ON public.user_learning_progress;
CREATE POLICY own_progress_select ON public.user_learning_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS own_missions ON public.daily_missions;
CREATE POLICY own_missions_select ON public.daily_missions FOR SELECT TO authenticated USING (auth.uid() = user_id);
REVOKE INSERT, UPDATE, DELETE ON public.user_learning_progress FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.daily_missions FROM anon, authenticated;
GRANT ALL ON public.user_learning_progress TO service_role;
GRANT ALL ON public.daily_missions TO service_role;
GRANT ALL ON public.user_badges TO service_role;