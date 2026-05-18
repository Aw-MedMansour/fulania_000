-- Update the increment_user_stats trigger function to also calculate streak
CREATE OR REPLACE FUNCTION internal.increment_user_stats()
RETURNS TRIGGER AS $$
DECLARE
    current_streak INTEGER;
    last_date DATE;
BEGIN
    -- Get existing stats
    SELECT streak_days, last_active INTO current_streak, last_date
    FROM public.user_stats WHERE user_id = NEW.user_id;

    -- Calculate new streak
    IF last_date IS NULL THEN
        current_streak := 1;
    ELSIF last_date = CURRENT_DATE - 1 THEN
        current_streak := COALESCE(current_streak, 0) + 1;
    ELSIF last_date = CURRENT_DATE THEN
        current_streak := COALESCE(current_streak, 0);
    ELSE
        current_streak := 1;
    END IF;

    INSERT INTO public.user_stats (user_id, total_views, last_active, streak_days)
    VALUES (NEW.user_id, 1, CURRENT_DATE, current_streak)
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_views = public.user_stats.total_views + 1,
        last_active = CURRENT_DATE,
        streak_days = current_streak,
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;