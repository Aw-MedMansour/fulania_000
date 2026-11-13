import { createFileRoute } from "@tanstack/react-router";
import { Heart, Sparkles } from "lucide-react";
import { MAINTENANCE_UNTIL } from "@/lib/feature-flags";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "FulanIA — Plateforme temporairement indisponible" },
      {
        name: "description",
        content:
          "FulanIA est momentanément indisponible pour maintenance. Nous revenons très vite.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "FulanIA — Plateforme temporairement indisponible" },
      {
        property: "og:description",
        content:
          "FulanIA est momentanément indisponible pour maintenance. Nous revenons très vite.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MaintenancePage,
});

function MaintenancePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      {/* Halo doré d'ambiance */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold)]/10 blur-3xl"
      />

      <div className="relative max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-earth shadow-[0_10px_30px_-10px_rgba(120,72,20,0.5)] ring-1 ring-[var(--gold)]/40">
          <span className="font-display text-3xl font-bold text-[var(--gold)]">F</span>
        </div>

        <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-earth">
          <Sparkles className="h-3.5 w-3.5" />
          Maintenance en cours
        </p>

        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-earth sm:text-4xl">
          Plateforme temporairement indisponible
        </h1>

        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          FulanIA fait une petite pause pour améliorer votre expérience.
          {MAINTENANCE_UNTIL
            ? ` Retour prévu le ${MAINTENANCE_UNTIL}.`
            : " Nous revenons très bientôt."}
        </p>

        <p className="mt-6 font-display text-sm italic text-[var(--gold)]">
          « Pulaagu ko ngallu mawngu »
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:contact.fulania@gmail.com"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Nous contacter
          </a>
          <a
            href="https://wa.me/22232256718"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            WhatsApp
          </a>
        </div>

        <p className="mt-10 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          Merci de votre patience
          <Heart className="h-3 w-3 fill-[var(--gold)] text-[var(--gold)]" />
          L'équipe FulanIA
        </p>
      </div>
    </div>
  );
}
