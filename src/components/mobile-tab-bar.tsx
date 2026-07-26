import { Link, useLocation } from "@tanstack/react-router";
import { Home, MessageSquareText, BookOpen, GraduationCap, Languages, Library } from "lucide-react";

const tabs = [
  { to: "/hub", label: "Accueil", icon: Home },
  { to: "/chat", label: "Janggo", icon: MessageSquareText },
  { to: "/dictionary", label: "Saggitorde", icon: BookOpen },
  { to: "/learn", label: "Janngude", icon: GraduationCap },
  { to: "/translate", label: "Firo", icon: Languages },
  { to: "/culture", label: "Pulaaku", icon: Library },
] as const;

export function MobileTabBar() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0b1020]/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active =
            to === "/hub" ? pathname === "/hub" : pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-medium transition-colors ${
                  active
                    ? "text-[var(--gold)]"
                    : "text-white/55 hover:text-white/80"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${active ? "drop-shadow-[0_0_6px_rgba(212,164,74,0.55)]" : ""}`}
                  strokeWidth={active ? 2.4 : 1.8}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
