-- Add an owner-scoped SELECT policy so RLS is not "enabled with no policy".
-- Public donor wall continues to be exposed only via get_public_donations() / donations_public view.
CREATE POLICY "Users can view their own donations"
ON public.donations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
