import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Day, Entry, DayWithEntries } from "@/types/blog";

export function useTrip() {
  const [data, setData] = useState<DayWithEntries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: days }, { data: entries }] = await Promise.all([
        supabase.from("days").select("*").order("day_number"),
        supabase.from("entries").select("*").order("position"),
      ]);
      if (!active) return;
      const byDay = new Map<string, Entry[]>();
      (entries as Entry[] | null)?.forEach((e) => {
        const list = byDay.get(e.day_id) ?? [];
        list.push(e);
        byDay.set(e.day_id, list);
      });
      const merged: DayWithEntries[] = ((days as Day[] | null) ?? []).map((d) => ({
        ...d,
        entries: byDay.get(d.id) ?? [],
      }));
      setData(merged);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { data, loading };
}
