import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      throw redirect({ to: "/auth", search: { redirect: "/profile" } });
    }
  },
  component: () => <Outlet />,
});
