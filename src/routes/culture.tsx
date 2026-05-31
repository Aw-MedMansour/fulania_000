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

// Proverbs are quoted in Pulaar; the gloss switches with the UI language.
type Lang = "fr" | "en" | "ar" | "ff";
type Trio = Record<Lang, string>;

const PROVERBS: { pulaar: string; gloss: Trio }[] = [
  {
    pulaar: "Pulaagu ko ngallu mawngu.",
    gloss: {
      fr: "Le Pulaaku est une grande richesse.",
      en: "Pulaaku is a great wealth.",
      ar: "البولاكو ثروة عظيمة.",
      ff: "Pulaagu ko ngallu mawngu — ngalu mawngu.",
    },
  },
  {
    pulaar: "Neɗɗo ko jiyaaɗo wonnde mum.",
    gloss: {
      fr: "L'homme est esclave de sa parole.",
      en: "A person is bound by their word.",
      ar: "الإنسان رهين كلمته.",
      ff: "Neɗɗo ko jiyaaɗo konngol mum.",
    },
  },
  {
    pulaar: "Hakkille ɓuri doole.",
    gloss: {
      fr: "L'intelligence vaut mieux que la force.",
      en: "Wisdom beats strength.",
      ar: "العقل خير من القوة.",
      ff: "Hakkille ɓuri doole — miijo ɓuri sembe.",
    },
  },
  {
    pulaar: "Mo woni e ngendi mum, woni e koyɗe mum.",
    gloss: {
      fr: "Qui est chez les siens est sur ses propres pieds.",
      en: "Who stands among their own stands on their own feet.",
      ar: "من كان بين أهله فهو على قدميه.",
      ff: "Mo woni e ngendi mum, woni e doole mum.",
    },
  },
  {
    pulaar: "Ko hakkunde teŋle ñaamiraa, wonaa hakkunde gite.",
    gloss: {
      fr: "On mange avec les mains, pas avec les yeux.",
      en: "One eats with their hands, not with their eyes.",
      ar: "نأكل بالأيدي لا بالعيون.",
      ff: "Hakkunde teŋle ñaamirtee, wonaa gite.",
    },
  },
  {
    pulaar: "Ngaynaako mo wuyaani na ɗalata na'i mum.",
    gloss: {
      fr: "Le berger qui ne veille pas perd son troupeau.",
      en: "The shepherd who fails to watch loses his herd.",
      ar: "الراعي الذي لا يسهر يفقد قطيعه.",
      ff: "Ngaynaako mo reenaani, ena ɗala na'i mum.",
    },
  },
];

const TALES: { title: string; summary: Trio }[] = [
  {
    title: "Demmba e Foroyel",
    summary: {
      fr: "Conte initiatique d'un jeune berger du Fouta confronté au génie de la brousse — une leçon sur la patience et le respect des aînés.",
      en: "Initiation tale of a young Fouta shepherd facing the bush spirit — a lesson on patience and respect for elders.",
      ar: "حكاية تأهيل لراعٍ شاب من الفوتا يواجه روح الأدغال — درس في الصبر واحترام الكبار.",
      ff: "Taalol ngon ngaynaako kesum gonɗo Fuuta haalde e jinne ladde — janngirde munyal e neɗɗaaku mawɓe.",
    },
  },
  {
    title: "Samba Gelaajo Jeegi",
    summary: {
      fr: "Épopée du prince guerrier du Fouta Toro, héros chanté par les griots et symbole du courage Peul.",
      en: "Epic of the warrior prince of Fouta Toro, hero sung by griots and emblem of Fulɓe courage.",
      ar: "ملحمة الأمير المحارب لفوتا تورو، بطلٌ يغنّيه الڭراويون ورمز شجاعة الفولان.",
      ff: "Tinndol laamɗo hare Fuuta Tooro, kewɗo gawloɓe yim'a — maande cuusal Fulɓe.",
    },
  },
  {
    title: "Tyamaba, le serpent du fleuve",
    summary: {
      fr: "Légende du serpent gardien du fleuve Sénégal, protecteur des Halpulaar de la vallée.",
      en: "Legend of the serpent guardian of the Senegal River, protector of the valley's Halpulaar.",
      ar: "أسطورة الثعبان حارس نهر السنغال وحامي هلپولار الوادي.",
      ff: "Taariindi ngooroondi maayo Senegaal, deenoowo Halpulaar e jeeri maayo.",
    },
  },
  {
    title: "Goggo e jiwo mum",
    summary: {
      fr: "Récit d'une tante et de sa nièce, transmis pour enseigner aux jeunes filles les valeurs du Pulaaku.",
      en: "Story of an aunt and her niece, passed down to teach young girls the values of Pulaaku.",
      ar: "حكاية عمّة وابنة أخيها، تُروى لتعليم الفتيات قيم البولاكو.",
      ff: "Taalol goggo e jiwo mum, jokketenoongol ngam janngingol surbaaɓe wonaande Pulaagu.",
    },
  },
];

const TRADITIONS: { icon: typeof Crown; title: string; body: Trio }[] = [
  {
    icon: Crown,
    title: "Pulaaku",
    body: {
      fr: "Code moral fondamental : munyal (patience), semteende (pudeur), hakkille (sagesse), neɗɗaaku (humanité).",
      en: "Core moral code: munyal (patience), semteende (modesty), hakkille (wisdom), neɗɗaaku (humanity).",
      ar: "ميثاق أخلاقي جوهري: مونيال (الصبر)، سَمتيندي (الحياء)، حكِّيلي (الحكمة)، نِدّاكو (الإنسانية).",
      ff: "Aada mawɗo: munyal, semteende, hakkille, neɗɗaaku.",
    },
  },
  {
    icon: Shirt,
    title: "Mbubba & Taara",
    body: {
      fr: "Boubous brodés, foulards et bijoux d'or des femmes Peules — héritage esthétique millénaire.",
      en: "Embroidered boubous, headscarves and gold jewelry of Fulɓe women — a millennia-old aesthetic heritage.",
      ar: "بُبُّو مطرّز ومناديل وحلي ذهبية لنساء الفولان — إرث جمالي ممتد لآلاف السنين.",
      ff: "Mbubba binndaaɗi, taara e cuɗaari kaŋŋe rewɓe Fulɓe — donaaɗum njeenu ɓooyɗum.",
    },
  },
  {
    icon: Music2,
    title: "Hoddu & Riti",
    body: {
      fr: "Luth des griots et vièle des bergers : musiques qui accompagnent veillées, mariages et transhumances.",
      en: "Griots' lute and shepherds' fiddle: music that accompanies night gatherings, weddings and transhumance.",
      ar: "عود الڭراويين ورباب الرعاة: موسيقى ترافق السهرات والأعراس والترحال.",
      ff: "Hoddu gawloɓe e riti aynaaɓe: gimi tawtoraaɗi jamanuuji, kabbangol e perol.",
    },
  },
  {
    icon: Utensils,
    title: "Cuisine",
    body: {
      fr: "Thiéboudienne, maafe, lacciri ko kosam (couscous au lait), gnirie : une table où se transmet la culture.",
      en: "Thieboudienne, maafe, lacciri ko kosam (couscous with milk), gnirie: a table where culture is handed down.",
      ar: "تشيبوجين، مافي، لاسيري كو كوسام (كسكس بالحليب)، ݣْنيري: مائدة تنتقل عبرها الثقافة.",
      ff: "Cebu jen, maafe, lacciri ko kosam, ñiiri: taabal ɗo aada jokketee.",
    },
  },
];

function CulturePage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const { t, lang } = useLanguage();
  const [tab, setTab] = useState("proverbs");
  const L = lang as Lang;
  void t;

  // Auth optional — page accessible without sign-in.


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-8">
          <PageNav />



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
                <figcaption className="mt-2 text-sm text-muted-foreground">{p.gloss[L]}</figcaption>
              </figure>
            ))}
          </TabsContent>

          <TabsContent value="tales" className="mt-6 grid gap-3 sm:grid-cols-2">
            {TALES.map((tale) => (
              <article key={tale.title} className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-display text-lg font-semibold text-earth">{tale.title}</h2>
                <p className="mt-2 text-sm text-foreground/85">{tale.summary[L]}</p>
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
                <p className="mt-1.5 text-sm text-foreground/85">{body[L]}</p>
              </article>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
