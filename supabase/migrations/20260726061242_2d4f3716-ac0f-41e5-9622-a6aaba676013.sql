
-- user_learning_progress
DROP POLICY IF EXISTS "own_progress" ON public.user_learning_progress;
CREATE POLICY "own_progress" ON public.user_learning_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- chat_conversations
DROP POLICY IF EXISTS "Users view own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users insert own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users update own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users delete own conversations" ON public.chat_conversations;
CREATE POLICY "Users view own conversations" ON public.chat_conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own conversations" ON public.chat_conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own conversations" ON public.chat_conversations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own conversations" ON public.chat_conversations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- chat_messages
DROP POLICY IF EXISTS "Users view own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users insert own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users delete own messages" ON public.chat_messages;
CREATE POLICY "Users view own messages" ON public.chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own messages" ON public.chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- user_favorites
DROP POLICY IF EXISTS "Users view own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users insert own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users delete own favorites" ON public.user_favorites;
CREATE POLICY "Users view own favorites" ON public.user_favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own favorites" ON public.user_favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own favorites" ON public.user_favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- user_history
DROP POLICY IF EXISTS "Users view own history" ON public.user_history;
DROP POLICY IF EXISTS "Users insert own history" ON public.user_history;
DROP POLICY IF EXISTS "Users delete own history" ON public.user_history;
CREATE POLICY "Users view own history" ON public.user_history FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own history" ON public.user_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own history" ON public.user_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- daily_missions
DROP POLICY IF EXISTS "own_missions" ON public.daily_missions;
CREATE POLICY "own_missions" ON public.daily_missions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
