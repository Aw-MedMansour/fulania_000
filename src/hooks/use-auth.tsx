import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lazy import so the supabase client (which touches localStorage at
    // module evaluation) is never loaded during SSR.
    let unsub: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      if (cancelled) return;

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
        setSession(s);
        setUser(s?.user ?? null);
      });
      unsub = () => subscription.unsubscribe();

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  return { session, user, loading };
}
