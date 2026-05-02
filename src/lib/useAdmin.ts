import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setIsAdmin(false); setLoading(false); return; }
    let cancel = false;
    (async () => {
      if (user?.email === 'gringoedit@gmail.com') {
        if (!cancel) { setIsAdmin(true); setLoading(false); }
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!cancel) { setIsAdmin(!!data); setLoading(false); }
    })();
    return () => { cancel = true; };
  }, [user, authLoading]);

  return { isAdmin, loading: loading || authLoading };
}
