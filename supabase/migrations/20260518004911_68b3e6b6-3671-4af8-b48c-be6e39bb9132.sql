-- Fix search path and revoke public execute on trigger functions
ALTER FUNCTION public.increment_user_stats() SET search_path = public;
ALTER FUNCTION public.update_favorite_count() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.increment_user_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_user_stats() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.update_favorite_count() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_favorite_count() FROM authenticated;