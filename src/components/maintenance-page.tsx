import { Mail, MessageCircle, Wrench } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { MAINTENANCE_UNTIL } from "@/lib/feature-flags";

type Message = {
  title: string;
  body: string;
  back: string;
  soon: string;
  contact: string;
};

const MESSAGES: Record<string, Message> = {
  fr: {
    title: "FulanIA est en réparation",
    body: "Nous améliorons l'assistant Pulaar. Le site sera de nouveau ouvert dans un instant.",
    back: "Retour",
    soon: "Retour bientôt",
    contact: "Nous écrire",
  },
  ff: {
    title: "FulanIA ina feewnee",
    body: "Min njiylotoo e ɓeydude wallitoowo Pulaar o. Site o udditaama seeɗa tan.",
    back: "Rutto",
    soon: "O artoto ko ɓooyaani",
    contact: "Winndan min",
  },
  en: {
    title: "FulanIA is under repair",
    body: "We are improving the Pulaar assistant. The site will be open again shortly.",
    back: "Back",
    soon: "Back soon",
    contact: "Write to us",
  },
  ar: {
    title: "FulanIA قيد الإصلاح",
    body: "نعمل على تحسين مساعد لغة البُول. سيعود الموقع للعمل قريبًا.",
    back: "رجوع",
    soon: "نعود قريبًا",
    contact: "راسلنا",
  },
};

function formatReturn(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return iso;
  }
}

export function MaintenancePage() {
  const { lang } = useLanguage();
  const m = MESSAGES[lang] ?? MESSAGES.fr;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-earth px-6 py-16 text-center text-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(212,164,74,0.18), transparent 70%), radial-gradient(45% 40% at 50% 100%, rgba(200,90,20,0.16), transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-[var(--gold)] text-earth shadow-[0_10px_30px_-12px_rgba(212,164,74,0.6)]">
          <Wrench className="h-7 w-7" />
        </div>

        <p className="mt-6 font-display text-xs uppercase tracking-[0.25em] text-[var(--gold)]">
          FulanIA
        </p>

        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-4xl">
          {m.title}
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-cream/75">{m.body}</p>

        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/40 px-4 py-1.5 text-xs font-medium text-[var(--gold)]">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] animate-pulse"
          />
          {MAINTENANCE_UNTIL ? `${m.back} : ${formatReturn(MAINTENANCE_UNTIL)}` : m.soon}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="mailto:contact.fulania@gmail.com"
            className="inline-flex items-center gap-2 rounded-md bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-earth transition hover:opacity-90"
          >
            <Mail className="h-4 w-4" />
            {m.contact}
          </a>
          <a
            href="https://wa.me/22232256718"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-cream/25 px-4 py-2 text-sm font-medium text-cream/85 transition hover:bg-cream/10"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>

        <p className="mt-10 font-display text-sm italic text-[var(--gold)]/80">
          « Pulaagu ko ngallu mawngu »
        </p>
      </div>
    </div>
  );
}
