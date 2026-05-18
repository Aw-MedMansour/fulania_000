-- Create user_stats table for tracking user progress
CREATE TABLE public.user_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_views INTEGER NOT NULL DEFAULT 0,
    total_favorites INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    last_active DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see and update their own stats
CREATE POLICY "Users can view own stats"
ON public.user_stats
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
ON public.user_stats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
ON public.user_stats
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to update user stats when history is added
CREATE OR REPLACE FUNCTION public.increment_user_stats()
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user_history insert
CREATE TRIGGER on_history_insert_update_stats
AFTER INSERT ON public.user_history
FOR EACH ROW
EXECUTE FUNCTION public.increment_user_stats();

-- Function to update favorite count
CREATE OR REPLACE FUNCTION public.update_favorite_count()
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user_favorites insert/delete
CREATE TRIGGER on_favorite_change_update_stats
AFTER INSERT OR DELETE ON public.user_favorites
FOR EACH ROW
EXECUTE FUNCTION public.update_favorite_count();