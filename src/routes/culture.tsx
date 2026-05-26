import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Library, Quote, BookMarked, Music2, Shirt, Utensils, Crown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageNav } from "@/components/page-nav";

export const Route = createFileRoute("/culture")({
  head: () => {
    const l = getCurrentLang();
    return {
      meta: [
        { title: tFor(l, "seo./culture.title") },
        { name: "description", content: tFor(l, "seo./culture.desc") },
        { property: "og:title", content: tFor(l, "seo./culture.title") },
        { property: "og:description", content: tFor(l, "seo./culture.desc") },
        { property: "og:url", content: "https://fulania.com/culture" },
      ],
    };
  },
  component: CulturePage,
});

const PROVERBS = [
  { pulaar: "Pulaagu ko ngallu mawngu.", fr: "Le Pulaaku est une grande richesse." },
  { pulaar: "Neɗɗo ko jiyaaɗo wonnde mum.", fr: "L'homme est esclave de sa parole." },
  { pulaar: "Hakkille ɓuri doole.", fr: "L'intelligence vaut mieux que la force." },
  { pulaar: "Mo woni e ngendi mum, woni e koyɗe mum.", fr: "Qui est chez les siens est sur ses propres pieds." },
  { pulaar: "Ko hakkunde teŋle ñaamiraa, wonaa hakkunde gite.", fr: "On mange avec les mains, pas avec les yeux." },
  { pulaar: "Ngaynaako mo wuyaani na ɗalata na'i mum.", fr: "Le berger qui ne veille pas perd son troupeau." },
];

const TALES = [
  { title: "Demmba e Foroyel", summary: "Conte initiatique d'un jeune berger du Fouta confronté au génie de la brousse — une leçon sur la patience et le respect des aînés." },
  { title: "Samba Gelaajo Jeegi", summary: "Épopée du prince guerrier du Fouta Toro, héros chanté par les griots et symbole du courage Peul." },
  { title: "Tyamaba, le serpent du fleuve", summary: "Légende du serpent gardien du fleuve Sénégal, protecteur des Halpulaar de la vallée." },
  { title: "Goggo e jiwo mum", summary: "Récit d'une tante et de sa nièce, transmis pour enseigner aux jeunes filles les valeurs du Pulaaku." },
];

const TRADITIONS = [
  { icon: Crown, title: "Pulaaku", body: "Code moral fondamental : munyal (patience), semteende (pudeur), hakkille (sagesse), neɗɗaaku (humanité)." },
  { icon: Shirt, title: "Mbubba & Taara", body: "Boubous brodés, foulards et bijoux d'or des femmes Peules — héritage esthétique millénaire." },
  { icon: Music2, title: "Hoddu & Riti", body: "Luth des griots et vièle des bergers : musiques qui accompagnent veillées, mariages et transhumances." },
  { icon: Utensils, title: "Cuisine", body: "Thiéboudienne, maafe, lacciri ko kosam (couscous au lait), gnirie : une table où se transmet la culture." },
];

function CulturePage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState("proverbs");

  // Auth optional — page accessible without sign-in.


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-8">
          

          <div className="inline-flex items-center gap-2 text-sm font-medium text-earth">
            <Library className="h-4 w-4" /> {t("hub.f5.title")}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-earth sm:text-4xl">
          {t("cult.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{t("cult.subtitle")}</p>

        <Tabs value={tab} onValueChange={setTab} className="mt-7">
          <TabsList className="bg-secondary/60">
            <TabsTrigger value="proverbs" className="gap-1.5"><Quote className="h-3.5 w-3.5" /> {t("cult.tab.proverbs")}</TabsTrigger>
            <TabsTrigger value="tales" className="gap-1.5"><BookMarked className="h-3.5 w-3.5" /> {t("cult.tab.tales")}</TabsTrigger>
            <TabsTrigger value="traditions" className="gap-1.5"><Crown className="h-3.5 w-3.5" /> {t("cult.tab.traditions")}</TabsTrigger>
          </TabsList>

          <TabsContent value="proverbs" className="mt-6 grid gap-3 sm:grid-cols-2">
            {PROVERBS.map((p, i) => (
              <figure key={i} className="rounded-xl border border-border bg-card p-5">
                <Quote className="h-5 w-5 text-[var(--gold)]" />
                <blockquote className="mt-2 font-display text-lg italic text-earth">« {p.pulaar} »</blockquote>
                <figcaption className="mt-2 text-sm text-muted-foreground">{p.fr}</figcaption>
              </figure>
            ))}
          </TabsContent>

          <TabsContent value="tales" className="mt-6 grid gap-3 sm:grid-cols-2">
            {TALES.map((tale) => (
              <article key={tale.title} className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-display text-lg font-semibold text-earth">{tale.title}</h2>
                <p className="mt-2 text-sm text-foreground/85">{tale.summary}</p>
              </article>
            ))}
          </TabsContent>

          <TabsContent value="traditions" className="mt-6 grid gap-3 sm:grid-cols-2">
            {TRADITIONS.map(({ icon: Icon, title, body }) => (
              <article key={title} className="rounded-xl border border-border bg-card p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-earth text-cream">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-3 font-display text-lg font-semibold text-earth">{title}</h2>
                <p className="mt-1.5 text-sm text-foreground/85">{body}</p>
              </article>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
