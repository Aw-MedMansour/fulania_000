
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TYPE public.pulaar_pos AS ENUM ('nom','verbe','adjectif','adverbe','pronom','interjection','expression','proverbe','conjonction','preposition','determinant','numeral');
CREATE TYPE public.entry_origin AS ENUM ('traditionnel','emprunt_arabe','emprunt_francais','emprunt_anglais','neologisme','propose');
CREATE TYPE public.entry_status AS ENUM ('valide','propose','incertain');

CREATE TABLE public.dictionary_v2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  headword TEXT NOT NULL,
  headword_normalized TEXT GENERATED ALWAYS AS (lower(headword)) STORED,
  pos public.pulaar_pos NOT NULL,
  noun_class TEXT,
  verb_class TEXT,
  domain TEXT NOT NULL,
  pronunciation_ipa TEXT,
  variant_fouta_tooro TEXT,
  variant_maasina TEXT,
  variant_fouta_jallon TEXT,
  variant_adamaawa TEXT,
  french TEXT NOT NULL,
  english TEXT,
  arabic TEXT,
  example_pulaar TEXT,
  example_french TEXT,
  example_english TEXT,
  synonyms TEXT[],
  related TEXT[],
  origin public.entry_origin NOT NULL DEFAULT 'traditionnel',
  status public.entry_status NOT NULL DEFAULT 'valide',
  sources TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dict_v2_headword_norm ON public.dictionary_v2(headword_normalized);
CREATE INDEX idx_dict_v2_domain ON public.dictionary_v2(domain);
CREATE INDEX idx_dict_v2_pos ON public.dictionary_v2(pos);
CREATE INDEX idx_dict_v2_status ON public.dictionary_v2(status);
CREATE INDEX idx_dict_v2_french_trgm ON public.dictionary_v2 USING gin (french gin_trgm_ops);
CREATE INDEX idx_dict_v2_headword_trgm ON public.dictionary_v2 USING gin (headword gin_trgm_ops);

GRANT SELECT ON public.dictionary_v2 TO anon, authenticated;
GRANT ALL ON public.dictionary_v2 TO service_role;

ALTER TABLE public.dictionary_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dict_v2_public_read" ON public.dictionary_v2 FOR SELECT USING (true);
CREATE POLICY "dict_v2_admin_write" ON public.dictionary_v2 FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_dict_v2_updated BEFORE UPDATE ON public.dictionary_v2
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
