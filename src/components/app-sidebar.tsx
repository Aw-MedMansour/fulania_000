import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, MessageSquare, Languages, BookOpen, Sparkles, GraduationCap,
  Library, Radio, Info, Mail, LogIn, LogOut,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { DICTIONARY_DISABLED } from "@/lib/feature-flags";

const tools = [
  { title: "Accueil", url: "/", icon: Home },
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "Traduire", url: "/translate", icon: Languages },
  { title: "Dictionnaire", url: "/dictionary", icon: BookOpen, hidden: DICTIONARY_DISABLED },
  { title: "Culture", url: "/culture", icon: Sparkles },
  { title: "Apprendre", url: "/learn", icon: GraduationCap },
  { title: "Bibliothèque", url: "/library", icon: Library },
  { title: "Hub", url: "/hub", icon: Radio },
] as const;

const more = [
  { title: "À propos", url: "/about", icon: Info },
  { title: "Contact", url: "/contact", icon: Mail },
] as const;

async function signOut() {
  const { supabase } = await import("@/integrations/supabase/client");
  await supabase.auth.signOut();
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { user } = useAuth();
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname.startsWith(url));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-earth text-cream">
            <span className="font-display text-lg font-bold text-[var(--gold)]">F</span>
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col leading-none">
              <span className="truncate font-display text-base font-semibold tracking-tight text-earth">FulanIA</span>
              <span className="truncate text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Pulaagu &amp; IA</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Outils</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.filter((t) => !("hidden" in t && t.hidden)).map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Plus</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {more.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {user ? (
              <SidebarMenuButton onClick={() => signOut()} tooltip="Déconnexion">
                <LogOut className="h-4 w-4" />
                <span className="truncate">{user.email ?? "Déconnexion"}</span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton asChild tooltip="Connexion">
                <Link to="/auth" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Connexion</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
