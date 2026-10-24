import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Languages, Loader2, Volume2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageNav } from "@/components/page-nav";

export const Route = createFileRoute("/translate")({
  head: () => {
    const l = getCurrentLang();
    return {
      meta: [
        { title: tFor(l, "seo./translate.title") },
        { name: "description", content: tFor(l, "seo./translate.desc") },
        { property: "og:title", content: tFor(l, "seo./translate.title") },
        { property: "og:description", content: tFor(l, "seo./translate.desc") },
        { property: "og:url", content: "https://fulania.com/translate" },
      ],
    };
  },
  component: TranslatePage,
});

type Card = {
  source: string;
  meaning_fr: string;
  fouta_toro: string | null;
  fouta_djallon: string | null;
  macina: string | null;
  adamawa: string | null;
  notes: string | null;
  confidence: "high" | "medium" | "low";
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const FN_URL = `${SUPABASE_URL}/functions/v1/dialect-translate`;

function TranslatePage() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const { t, lang, dialectsOpen, setDialectsOpen } = useLanguage();
  const [text, setText] = useState("");
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speak = (s: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(s);
    u.lang = lang === "ar" ? "ar-SA" : lang === "en" ? "en-US" : "fr-FR";
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  // Auth optional — page accessible without sign-in.


  async function run() {
    const q = text.trim();
    if (!q || loading) return;
    setError(null);
    setLoading(true);
    setCard(null);
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      const r = await fetch(FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
          ...(s?.access_token ? { Authorization: `Bearer ${s.access_token}` } : {}),
        },
        body: JSON.stringify({ text: q, lang }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error ?? "Erreur");
      setCard(j.card as Card);
      setDialectsOpen(false);
    } catch (e: any) {
      setError(e?.message ?? t("ai.translate.error"));
    } finally {
      setLoading(false);
    }
  }

  const dialects: { key: keyof Card; label: string }[] = [
    { key: "fouta_toro", label: "Fuuta Tooro" },
    { key: "fouta_djallon", label: "Fuuta Jaloo" },
    { key: "macina", label: "Maasina" },
    { key: "adamawa", label: "Aadamaawa" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-8">
          <PageNav />



          <div className="inline-flex items-center gap-2 text-sm font-medium text-earth">
            <Languages className="h-4 w-4" /> {t("hub.f4.title")}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-earth sm:text-4xl">
          {t("dt.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t("dt.subtitle")}
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); run(); }}
          className="mt-6 flex flex-col gap-2.5 sm:flex-row"
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("dt.placeholder")}
            maxLength={200}
            className="h-12 text-base"
            aria-label={t("dt.placeholder")}
          />
          <Button type="submit" disabled={loading || !text.trim()} className="h-12 gap-2 px-6">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {t("dt.cta")}
          </Button>
        </form>

        {error && (
          <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        {card && (
          <section className="mt-8">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{t("dt.meaning")}</div>
              <div className="mt-1 font-display text-xl text-earth">« {card.source} »</div>
              <div className="mt-1 text-sm text-muted-foreground">→ {card.meaning_fr}</div>
              {card.notes && (
                <p className="mt-3 rounded-md bg-secondary/60 px-3 py-2 text-sm text-foreground/85">
                  {card.notes}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setDialectsOpen((v) => !v)}
              className="mt-5 w-full rounded-xl border border-border bg-card px-4 py-3 text-left font-display text-base font-semibold text-earth transition hover:border-[var(--gold)]/60"
              aria-expanded={dialectsOpen}
            >
              Pulaar {dialectsOpen ? "▾" : "▸"}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {dialectsOpen ? t("translate.toggle.hide") : t("translate.toggle.show")}
              </span>
            </button>

            {dialectsOpen && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {dialects.map((d) => {
                  const v = card[d.key] as string | null;
                  return (
                    <div
                      key={d.key}
                      className="flex flex-col rounded-xl border border-border bg-card p-4 transition hover:border-[var(--gold)]/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-display text-sm font-semibold text-earth">{d.label}</div>
                        {v && (
                          <button
                            type="button"
                            onClick={() => speak(v)}
                            aria-label={t("entry.listen")}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="mt-3 font-display text-xl text-foreground">
                        {v ?? <span className="text-sm italic text-muted-foreground">{t("dt.unknown")}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
