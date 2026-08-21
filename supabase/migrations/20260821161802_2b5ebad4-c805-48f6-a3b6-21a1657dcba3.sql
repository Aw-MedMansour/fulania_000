DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname ILIKE '%book covers%' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.policyname);
  END LOOP;
END $$;

REVOKE INSERT, UPDATE, DELETE ON public.donations FROM anon, authenticated;
GRANT ALL ON public.donations TO service_role;