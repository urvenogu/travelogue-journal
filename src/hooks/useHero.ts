import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HeroSettings = {
  id: string;
  brand_name: string;
  eyebrow: string | null;
  headline: string;
  headline_italic: string | null;
  intro: string | null;
  button_label: string;
};

export const useHero = () => {
  const [hero, setHero] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("id, brand_name, eyebrow, headline, headline_italic, intro, button_label")
        .eq("setting_key", "hero")
        .maybeSingle();
      setHero((data as HeroSettings | null) ?? null);
      setLoading(false);
    })();
  }, []);

  return { hero, loading };
};
