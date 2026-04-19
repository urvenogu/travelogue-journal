-- timestamp helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- DAYS
CREATE TABLE public.days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_number INT NOT NULL UNIQUE CHECK (day_number BETWEEN 1 AND 14),
  title TEXT NOT NULL,
  date DATE,
  location TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Days are viewable by everyone"
  ON public.days FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert days"
  ON public.days FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update days"
  ON public.days FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete days"
  ON public.days FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_days_updated_at
  BEFORE UPDATE ON public.days
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ENTRIES
CREATE TABLE public.entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_id UUID NOT NULL REFERENCES public.days(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  time TEXT,
  text TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  caption TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_entries_day_id ON public.entries(day_id);

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Entries are viewable by everyone"
  ON public.entries FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert entries"
  ON public.entries FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update entries"
  ON public.entries FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete entries"
  ON public.entries FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON public.entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('entry-images', 'entry-images', true);

CREATE POLICY "Entry images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'entry-images');

CREATE POLICY "Authenticated users can upload entry images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'entry-images');

CREATE POLICY "Authenticated users can update entry images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'entry-images');

CREATE POLICY "Authenticated users can delete entry images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'entry-images');