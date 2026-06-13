CREATE TABLE public._dict_pending (id uuid PRIMARY KEY, en text, ar text);
GRANT SELECT, INSERT, UPDATE, DELETE ON public._dict_pending TO authenticated;
GRANT ALL ON public._dict_pending TO service_role;
ALTER TABLE public._dict_pending ENABLE ROW LEVEL SECURITY;