import { Link } from "@tanstack/react-router";
import { DICTIONARY_DISABLED } from "@/lib/feature-flags";
import {
  MessageSquareText,
  BookOpen,
  GraduationCap,
  Languages,
  Library,
  BookMarked,
  Radio,
  type LucideIcon,
} from "lucide-react";

type Tool = {
  to: string;
  name: string;
  role: string;
  icon: LucideIcon;
  iconBg: string;
};

// Uniquement les outils réellement disponibles sur la plateforme.
const tools: Tool[] = [
  { to: "/chat",       name: "Janngo",     role: "Assistant Pulaar",         icon: MessageSquareText, iconBg: "bg-[#d4a44a]" },
  ...(!DICTIONARY_DISABLED ? [{ to: "/dictionary", name: "Saggitorde", role: "Dictionnaire Pulaar",      icon: BookOpen,          iconBg: "bg-emerald-500" }] : []),
  { to: "/learn",      name: "Janngude",   role: "Cours interactifs",        icon: GraduationCap,     iconBg: "bg-sky-500" },
  { to: "/translate",  name: "Firo",       role: "Traducteur multidialecte", icon: Languages,         iconBg: "bg-rose-500" },
  { to: "/culture",    name: "Pulaaku",    role: "Culture & traditions",     icon: Library,           iconBg: "bg-amber-500" },
  { to: "/library",    name: "Deftere",    role: "Bibliothèque peule",       icon: BookMarked,        iconBg: "bg-teal-500" },
  { to: "/hub",        name: "Sawtu",      role: "Radio Fulania Mauritanie", icon: Radio,             iconBg: "bg-red-500" },
];

function Card({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link to={tool.to} className="block">
      <div className="flex w-[240px] shrink-0 items-center gap-3 rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[var(--gold)]/50 hover:shadow-md">
        <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${tool.iconBg} text-cream shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-earth">{tool.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{tool.role}</p>
        </div>
      </div>
    </Link>
  );
}

function Row({
  items,
  duration,
  reverse = false,
}: {
  items: Tool[];
  duration: string;
  reverse?: boolean;
}) {
  // On duplique plusieurs fois pour remplir largement la piste et garder une boucle fluide.
  const loop = [...items, ...items, ...items, ...items];
  return (
    <div className="overflow-hidden marquee-mask">
      <div
        className={`marquee-track flex w-max gap-3 ${reverse ? "reverse" : ""}`}
        style={{ ["--marquee-duration" as string]: duration }}
      >
        {loop.map((t, i) => (
          <Card key={`${t.name}-${i}`} tool={t} />
        ))}
      </div>
    </div>
  );
}

export function ToolsMarquee() {
  // Trois rangées qui défilent, à partir des 7 vrais outils.
  const rowA = tools;
  const rowB = [...tools.slice(3), ...tools.slice(0, 3)];
  const rowC = [...tools.slice(5), ...tools.slice(0, 5)];

  return (
    <div className="relative space-y-3 py-2">
      <Row items={rowA} duration="50s" />
      <Row items={rowB} duration="64s" reverse />
      <Row items={rowC} duration="56s" />
    </div>
  );
}
