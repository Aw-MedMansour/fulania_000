import { Link } from "@tanstack/react-router";
import { Radio, Mic2, Youtube, ArrowUpRight } from "lucide-react";

/**
 * "Vu & entendu dans" — bande de crédibilité éditoriale.
 * S'appuie sur les médias déjà couverts (Radio Mauritanie, L'Infos Plus, YouTube).
 */
export function PressBand() {
  const items = [
    { icon: Radio, label: "Radio Mauritanie", note: "Entretien — Ali Diallo" },
    { icon: Mic2, label: "L'Infos Plus", note: "Entretien exclusif" },
    { icon: Youtube, label: "YouTube", note: "Présentation FulanIA" },
  ];

  return (
    <section aria-label="Vu et entendu dans" className="border-y border-border/60 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-7 lg:px-8">
        <p className="font-display text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Vu &amp; entendu dans
        </p>
        <div className="grid flex-1 grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-3 lg:justify-items-center">
          {items.map(({ icon: Icon, label, note }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="h-4 w-4 flex-none text-primary/80" aria-hidden />
              <div className="leading-tight">
                <p className="font-display text-[15px] font-semibold text-foreground">{label}</p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{note}</p>
              </div>
            </div>
          ))}
        </div>
        <Link
          to="/hub"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-primary hover:text-primary/80"
        >
          Voir tout
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
