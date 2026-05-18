-- First drop triggers depending on old functions
DROP TRIGGER IF EXISTS on_history_insert_update_stats ON public.user_history;
DROP TRIGGER IF EXISTS on_favorite_change_update_stats ON public.user_favorites;

-- Create private schema
CREATE SCHEMA IF NOT EXISTS internal;

-- Recreate functions in internal schema
CREATE OR REPLACE FUNCTION internal.increment_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_stats (user_id, total_views, last_active)
    VALUES (NEW.user_id, 1, CURRENT_DATE)
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_views = public.user_stats.total_views + 1,
        last_active = CURRENT_DATE,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION internal.update_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.user_stats (user_id, total_favorites)
        VALUES (NEW.user_id, 1)
        ON CONFLICT (user_id)
        DO UPDATE SET
            total_favorites = public.user_stats.total_favorites + 1,
            updated_at = now();
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.user_stats
        SET total_favorites = GREATEST(0, total_favorites - 1),
            updated_at = now()
        WHERE user_id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Now safe to drop old public functions
DROP FUNCTION IF EXISTS public.increment_user_stats();
DROP FUNCTION IF EXISTS public.update_favorite_count();

-- Recreate triggers pointing to internal functions
CREATE TRIGGER on_history_insert_update_stats
AFTER INSERT ON public.user_history
FOR EACH ROW
EXECUTE FUNCTION internal.increment_user_stats();

CREATE TRIGGER on_favorite_change_update_stats
AFTER INSERT OR DELETE ON public.user_favorites
FOR EACH ROW
EXECUTE FUNCTION internal.update_favorite_count();

-- Lock down internal schema
REVOKE ALL ON SCHEMA internal FROM PUBLIC;
REVOKE ALL ON SCHEMA internal FROM authenticated;
REVOKE ALL ON SCHEMA internal FROM anon;