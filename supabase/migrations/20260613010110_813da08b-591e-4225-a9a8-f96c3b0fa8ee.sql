UPDATE public.dictionary_entries d
SET english = COALESCE(d.english, NULLIF(p.en, '')),
    arabic  = COALESCE(d.arabic,  NULLIF(p.ar, ''))
FROM public._dict_pending p
WHERE d.id = p.id;

DROP TABLE public._dict_pending;