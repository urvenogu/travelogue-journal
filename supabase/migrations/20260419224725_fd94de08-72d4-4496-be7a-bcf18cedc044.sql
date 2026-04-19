-- Add published flag to entries
ALTER TABLE public.entries
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;

-- Replace public SELECT policy: visitors only see published entries; admins still see all via the admin UI (it queries with auth)
DROP POLICY IF EXISTS "Entries are viewable by everyone" ON public.entries;

CREATE POLICY "Published entries are viewable by everyone"
  ON public.entries
  FOR SELECT
  TO anon, authenticated
  USING (
    published = true
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );