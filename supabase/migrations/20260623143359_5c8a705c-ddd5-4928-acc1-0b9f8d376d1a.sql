CREATE OR REPLACE FUNCTION public.exec_sql_admin(_sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  EXECUTE _sql;
END;
$$;

REVOKE ALL ON FUNCTION public.exec_sql_admin(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql_admin(text) TO service_role;