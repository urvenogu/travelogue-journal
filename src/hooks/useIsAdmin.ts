import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const check = async (userId: string | undefined) => {
      if (!userId) {
        if (active) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (!active) return;
      setIsAdmin(!!data);
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      check(session?.user?.id);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      check(session?.user?.id);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, loading };
};
