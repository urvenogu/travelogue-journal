CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE DEFAULT 'hero',
  brand_name TEXT NOT NULL DEFAULT 'Fourteen Days',
  eyebrow TEXT,
  headline TEXT NOT NULL,
  headline_italic TEXT,
  intro TEXT,
  button_label TEXT NOT NULL DEFAULT 'Begin the journal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are viewable by everyone"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site settings"
  ON public.site_settings FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (setting_key, brand_name, eyebrow, headline, headline_italic, intro, button_label)
VALUES (
  'hero',
  'Fourteen Days',
  'A 14-day journal · May 2025',
  'Across the warm south,',
  'slowly.',
  'Two weeks tracing the Iberian coast — small towns, long lunches, and the kind of light that ruins you for everywhere else.',
  'Begin the journal'
);