import { Link } from "@tanstack/react-router";
import {
  MessageSquareText,
  BookOpen,
  GraduationCap,
  Languages,
  Library,
  Mic,
  Sparkles,
  Bot,
  PenLine,
  Headphones,
  Volume2,
  Globe,
  Heart,
  Feather,
  Radio,
  type LucideIcon,
} from "lucide-react";

type Tool = {
  to?: string;
  name: string;
  role: string;
  icon: LucideIcon;
  iconBg: string;
};

const tools: Tool[] = [
  { to: "/chat",       name: "Janngo",     role: "Assistant Pulaar",        icon: MessageSquareText, iconBg: "bg-[#d4a44a]" },
  { to: "/dictionary", name: "Saggitorde", role: "Dictionnaire vivant",     icon: BookOpen,          iconBg: "bg-emerald-500" },
  { to: "/learn",      name: "Janngude",   role: "Cours interactifs",       icon: GraduationCap,     iconBg: "bg-sky-500" },
  { to: "/translate",  name: "Firo",       role: "Traducteur multidialecte", icon: Languages,        iconBg: "bg-rose-500" },
  { to: "/culture",    name: "Pulaaku",    role: "Culture & traditions",    icon: Library,           iconBg: "bg-amber-500" },
  { to: "/chat",       name: "Hottoore",   role: "Conteur d'histoires",     icon: Feather,           iconBg: "bg-violet-500" },
  { to: "/learn",      name: "Hella",      role: "Coach prononciation",     icon: Mic,               iconBg: "bg-fuchsia-500" },
  { to: "/dictionary", name: "Helmere",    role: "Étymologie peule",        icon: PenLine,           iconBg: "bg-teal-500" },
  { to: "/translate",  name: "Wolwere",    role: "Texte vers voix",         icon: Volume2,           iconBg: "bg-indigo-500" },
  { to: "/chat",       name: "Naatu",      role: "Tuteur conversation",     icon: Bot,               iconBg: "bg-orange-500" },
  { to: "/culture",    name: "Daartol",    role: "Mémoire & griots",        icon: Headphones,        iconBg: "bg-lime-600" },
  { to: "/translate",  name: "Aduna",      role: "Pont entre dialectes",    icon: Globe,             iconBg: "bg-cyan-500" },
  { to: "/culture",    name: "Munyal",     role: "Sagesse pulaaku",         icon: Heart,             iconBg: "bg-pink-500" },
  { to: "/learn",      name: "Yiitere",    role: "Lecture guidée",          icon: Sparkles,          iconBg: "bg-yellow-500" },
  { to: "/chat",       name: "Sawtu",      role: "Radio & médias peuls",    icon: Radio,             iconBg: "bg-red-500" },
];

function Card({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  const inner = (
    <div className="flex w-[240px] shrink-0 items-center gap-3 rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[var(--gold)]/50 hover:shadow-md">
      <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${tool.iconBg} text-cream shadow-sm`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-semibold text-earth">{tool.name}</p>
        <p className="truncate text-[11px] text-muted-foreground">{tool.role}</p>
      </div>
    </div>
  );
  return tool.to ? (
    <Link to={tool.to} className="block">{inner}</Link>
  ) : inner;
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
  // Duplicate the list so the -50% translate produces a seamless loop.
  const loop = [...items, ...items];
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
  const row1 = tools.slice(0, 5);
  const row2 = tools.slice(5, 10);
  const row3 = tools.slice(10, 15);

  return (
    <div className="relative space-y-3 py-2">
      <Row items={row1} duration="48s" />
      <Row items={row2} duration="62s" reverse />
      <Row items={row3} duration="54s" />
    </div>
  );
}
