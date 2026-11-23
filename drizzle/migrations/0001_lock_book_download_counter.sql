REVOKE EXECUTE ON FUNCTION public.increment_book_downloads(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_book_downloads(uuid) TO service_role;