import { Globe2, Languages, Users, Sparkles } from "lucide-react";
import { Reveal } from "@/components/reveal";

/**
 * Editorial credibility band placed between the hero and the rest
 * of the page. Reinforces scale & seriousness without breaking the
 * navy/gold tonal system.
 */
export function CredibilityBand() {
  const items = [
    { icon: Users, value: "~100 M", label: "Locuteurs Pulaar / Fulfulde" },
    { icon: Globe2, value: "20+", label: "Pays d'Afrique de l'Ouest & Centrale" },
    { icon: Languages, value: "4", label: "Grandes variantes dialectales" },
    { icon: Sparkles, value: "ISO 639-3 · ff", label: "Famille linguistique Niger-Congo" },
  ];

  return (
    <section
      aria-label="Indicateurs clés"
      className="relative border-y border-border/70 bg-card/40"
    >
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[var(--gold)]/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <Reveal>
          <ul className="grid grid-cols-2 gap-y-6 gap-x-4 sm:grid-cols-4 sm:divide-x sm:divide-border/60">
            {items.map(({ icon: Icon, value, label }, i) => (
              <li
                key={label}
                className={`flex items-start gap-3 ${
                  i > 0 ? "sm:pl-6" : ""
                }`}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold leading-tight text-foreground">
                    {value}
                  </p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {label}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-[var(--gold)]/40 to-transparent" />
    </section>
  );
}
