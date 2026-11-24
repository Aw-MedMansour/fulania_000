import { Reveal, StaggerGroup, StaggerItem } from "@/components/reveal";
import { Eyebrow } from "@/components/eyebrow";
import { Globe2, Users, Rocket, Smartphone, Clapperboard, CalendarCheck } from "lucide-react";

const stats = [
  { icon: Users, value: "100 000+", label: "visiteurs en deux mois" },
  { icon: Globe2, value: "~100", label: "pays sur quatre continents" },
  { icon: Rocket, value: "3 000", label: "comptes inscrits" },
  { icon: CalendarCheck, value: "5 juin", label: "lancement officiel, sans publicité payante" },
];

const roadmap = [
  { icon: CalendarCheck, tag: "Disponible", title: "Plateforme web", text: "Assistant IA, dictionnaire, apprentissage, traducteur multidialectal et bibliothèque culturelle." },
  { icon: Clapperboard, tag: "En développement", title: "FulanIA Studio", text: "Génération de vidéos et d'audio par IA, motion design et montage dans un même espace, avec paiements locaux." },
  { icon: Smartphone, tag: "Prochaine étape", title: "Applications mobiles", text: "FulanIA sur Android (Google Play) et iOS (App Store)." },
];

export function TractionSection() {
  return (
    <section id="traction" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-3xl">
          <Eyebrow>Startup technologique mauritanienne</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.01em] text-balance sm:text-4xl lg:text-5xl">
            Une communauté qui grandit, portée par de jeunes Mauritaniens
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Fondée par une équipe issue du milieu universitaire, FulanIA met l'intelligence artificielle au service
            d'une langue parlée dans une vingtaine de pays africains par une communauté pouvant atteindre 100 millions de personnes.
          </p>
        </Reveal>

        <StaggerGroup className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <StaggerItem key={label}>
              <div className="h-full rounded-2xl border border-border bg-card p-5 sm:p-6">
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-4 font-display text-3xl font-semibold text-foreground sm:text-4xl">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {roadmap.map(({ icon: Icon, tag, title, text }) => (
            <Reveal key={title}>
              <div className="h-full rounded-2xl bg-secondary/50 p-6">
                <div className="flex items-center justify-between">
                  <Icon className="h-6 w-6 text-primary" />
                  <span className="rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{tag}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
