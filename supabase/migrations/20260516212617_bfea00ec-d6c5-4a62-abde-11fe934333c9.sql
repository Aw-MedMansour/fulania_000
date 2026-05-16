CREATE TABLE public.dictionary_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pulaar TEXT NOT NULL,
  french TEXT NOT NULL,
  arabic TEXT,
  english TEXT,
  category TEXT,
  example_pulaar TEXT,
  example_french TEXT,
  pronunciation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_dict_pulaar ON public.dictionary_entries (lower(pulaar));
CREATE INDEX idx_dict_french ON public.dictionary_entries (lower(french));
CREATE INDEX idx_dict_category ON public.dictionary_entries (category);

ALTER TABLE public.dictionary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dictionary is publicly readable"
ON public.dictionary_entries FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert entries"
ON public.dictionary_entries FOR INSERT
TO authenticated
WITH CHECK (true);