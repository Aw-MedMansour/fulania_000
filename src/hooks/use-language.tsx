import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fr" | "ff" | "en" | "ar";

export const LANGUAGES: { code: Lang; label: string; native: string; flag: string; dir: "ltr" | "rtl" }[] = [
  { code: "fr", label: "Français", native: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "ff", label: "Pulaar", native: "Pulaar / Fulfulde", flag: "🌍", dir: "ltr" },
  { code: "en", label: "English", native: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "ar", label: "العربية", native: "العربية", flag: "🇸🇦", dir: "rtl" },
];

type Dict = Record<string, string>;

const translations: Record<Lang, Dict> = {
  fr: {
    "nav.solution": "Solution",
    "nav.pillars": "Piliers",
    "nav.dictionary": "Dictionnaire",
    "nav.culture": "Culture",
    "nav.vision": "Vision",
    "nav.contact": "Contact",
    "btn.try": "Essayer",
    "btn.signin": "Connexion",
    "btn.signout": "Déconnexion",
    "btn.discover": "Découvrir le projet",
    "btn.chat": "Discuter avec FulanIA",
    "hero.badge": "Premier assistant IA dédié à la culture Peule",
    "hero.title1": "L'intelligence artificielle au service du",
    "hero.title2": "Pulaagu",
    "hero.subtitle": "FulanIA préserve, transmet et valorise la langue Pulaar et la culture Halpulaar grâce à l'IA. Un griot du XXIᵉ siècle, accessible à tous, partout.",
    "stats.speakers": "Locuteurs",
    "stats.countries": "Pays",
    "stats.dialects": "Dialectes",
    "section.problem.tag": "Le constat",
    "section.solution.tag": "Notre réponse",
    "section.pillars.tag": "Les 5 piliers",
    "section.culture.tag": "Langue & culture",
    "section.vision.tag": "Vision",
    "section.contact.tag": "Contact",
    "footer.tagline": "Intelligence Artificielle au service de la langue et de la culture Peules.",
    "footer.explore": "Explorer",
    "footer.contact": "Contact",
    "footer.rights": "Tous droits réservés",
    "lang.switcher": "Langue",
  },
  ff: {
    "nav.solution": "Solisiyon",
    "nav.pillars": "Tugaale",
    "nav.dictionary": "Saggitorde",
    "nav.culture": "Pinal",
    "nav.vision": "Yiyannde",
    "nav.contact": "Heɓtugol",
    "btn.try": "Eto",
    "btn.signin": "Naatugol",
    "btn.signout": "Yaltugol",
    "btn.discover": "Yiy projet on",
    "btn.chat": "Yeewtu e FulanIA",
    "hero.badge": "Gardiiɗo assistant IA fuɗɗiiɗo e pinal Fulɓe",
    "hero.title1": "Hakkille kuɓɓinaaɗo ngam",
    "hero.title2": "Pulaagu",
    "hero.subtitle": "FulanIA no reena, yettina e teddina ɗemngal Pulaar e pinal Halpulaar e ballal IA. Gawlo ñalnde XXI, jeyaaɗo e kala nokku.",
    "stats.speakers": "Wolwooɓe",
    "stats.countries": "Leyɗe",
    "stats.dialects": "Ƴeewndeeji",
    "section.problem.tag": "Hawritannde",
    "section.solution.tag": "Jaabawol amen",
    "section.pillars.tag": "Tugaale 5",
    "section.culture.tag": "Ɗemngal e pinal",
    "section.vision.tag": "Yiyannde",
    "section.contact.tag": "Heɓtugol",
    "footer.tagline": "Hakkille kuɓɓinaaɗo ngam ɗemngal e pinal Fulɓe.",
    "footer.explore": "Yiilo",
    "footer.contact": "Heɓtugol",
    "footer.rights": "Hakkeeji fof reenaama",
    "lang.switcher": "Ɗemngal",
  },
  en: {
    "nav.solution": "Solution",
    "nav.pillars": "Pillars",
    "nav.dictionary": "Dictionary",
    "nav.culture": "Culture",
    "nav.vision": "Vision",
    "nav.contact": "Contact",
    "btn.try": "Try it",
    "btn.signin": "Sign in",
    "btn.signout": "Sign out",
    "btn.discover": "Discover the project",
    "btn.chat": "Chat with FulanIA",
    "hero.badge": "The first AI assistant dedicated to Fulani culture",
    "hero.title1": "Artificial intelligence serving the",
    "hero.title2": "Pulaagu",
    "hero.subtitle": "FulanIA preserves, transmits and celebrates the Pulaar language and Halpulaar culture through AI. A griot for the 21st century, accessible to everyone, everywhere.",
    "stats.speakers": "Speakers",
    "stats.countries": "Countries",
    "stats.dialects": "Dialects",
    "section.problem.tag": "The reality",
    "section.solution.tag": "Our answer",
    "section.pillars.tag": "The 5 pillars",
    "section.culture.tag": "Language & culture",
    "section.vision.tag": "Vision",
    "section.contact.tag": "Contact",
    "footer.tagline": "Artificial Intelligence serving the Fulani language and culture.",
    "footer.explore": "Explore",
    "footer.contact": "Contact",
    "footer.rights": "All rights reserved",
    "lang.switcher": "Language",
  },
  ar: {
    "nav.solution": "الحل",
    "nav.pillars": "الركائز",
    "nav.dictionary": "القاموس",
    "nav.culture": "الثقافة",
    "nav.vision": "الرؤية",
    "nav.contact": "اتصل",
    "btn.try": "جرّب",
    "btn.signin": "تسجيل الدخول",
    "btn.signout": "تسجيل الخروج",
    "btn.discover": "اكتشف المشروع",
    "btn.chat": "تحدّث مع FulanIA",
    "hero.badge": "أول مساعد ذكاء اصطناعي مخصّص للثقافة الفولانية",
    "hero.title1": "الذكاء الاصطناعي في خدمة",
    "hero.title2": "Pulaagu",
    "hero.subtitle": "تحافظ FulanIA على اللغة البولارية والثقافة الهلبولارية وتنقلها وتثمّنها بفضل الذكاء الاصطناعي. راوٍ تقليدي في القرن الحادي والعشرين، متاح للجميع في كل مكان.",
    "stats.speakers": "المتحدثون",
    "stats.countries": "الدول",
    "stats.dialects": "اللهجات",
    "section.problem.tag": "الواقع",
    "section.solution.tag": "جوابنا",
    "section.pillars.tag": "الركائز الخمس",
    "section.culture.tag": "اللغة والثقافة",
    "section.vision.tag": "الرؤية",
    "section.contact.tag": "اتصل بنا",
    "footer.tagline": "الذكاء الاصطناعي في خدمة اللغة والثقافة الفولانية.",
    "footer.explore": "استكشاف",
    "footer.contact": "اتصل",
    "footer.rights": "جميع الحقوق محفوظة",
    "lang.switcher": "اللغة",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };
const LangCtx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fulania.lang") as Lang | null;
      if (stored && translations[stored]) setLangState(stored);
    } catch {}
  }, []);

  useEffect(() => {
    const entry = LANGUAGES.find((l) => l.code === lang);
    if (typeof document !== "undefined" && entry) {
      document.documentElement.lang = lang;
      document.documentElement.dir = entry.dir;
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("fulania.lang", l); } catch {}
  };

  const t = (key: string) => translations[lang][key] ?? translations.fr[key] ?? key;

  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export function useLanguage(): Ctx {
  const ctx = useContext(LangCtx);
  if (!ctx) return { lang: "fr", setLang: () => {}, t: (k) => translations.fr[k] ?? k };
  return ctx;
}
