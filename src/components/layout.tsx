import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, Globe, LogOut, Sparkles, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DIALECTS, LANGUAGES, useLanguage } from "@/hooks/use-language";

async function signOut() {
  const { supabase } = await import("@/integrations/supabase/client");
  await supabase.auth.signOut();
}

function LanguageSwitcher() {
  const { lang, setLang, dialect, setDialect, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [showDialects, setShowDialects] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  const currentDialect = DIALECTS.find((d) => d.code === dialect) ?? DIALECTS[0];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-2 text-xs font-medium text-foreground/80 hover:bg-accent"
        aria-label={t("lang.switcher")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {current.code.toUpperCase()}
          <span className="ms-1 text-muted-foreground">· {currentDialect.code === "fouta_toro" ? "FT" : currentDialect.code === "fouta_djallon" ? "FJ" : currentDialect.code === "maasina" ? "MA" : "AD"}</span>
        </span>
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div
          className="absolute end-0 z-50 mt-2 w-64 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg"
        >
          <ul role="listbox" aria-label={t("lang.switcher")}>
            {LANGUAGES.map((l) => (
              <li key={l.code}>
                <button
                  role="option"
                  aria-selected={l.code === lang}
                  onClick={() => { setLang(l.code); setOpen(false); }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-accent"
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden>{l.flag}</span>
                    <span>{l.native}</span>
                  </span>
                  {l.code === lang && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-border bg-muted/40 px-3 py-2">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Dialecte Pulaar
            </p>
            <ul role="listbox" aria-label="Dialecte Pulaar" className="space-y-0.5">
              {DIALECTS.map((d) => (
                <li key={d.code}>
                  <button
                    role="option"
                    aria-selected={d.code === dialect}
                    onClick={() => { setDialect(d.code); setOpen(false); }}
                    className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    <span className="flex flex-col">
                      <span className="font-medium">{d.label}</span>
                      {d.region && <span className="text-[10px] text-muted-foreground">{d.region}</span>}
                    </span>
                    {d.code === dialect && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const { user } = useAuth();
  const { t } = useLanguage();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-earth text-cream">
            <span className="font-display text-lg font-bold text-[var(--gold)]">F</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-earth">
              FulanIA
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Pulaagu &amp; IA
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="/#solution" className="text-sm font-medium text-foreground/80 hover:text-primary">{t("nav.solution")}</a>
          <a href="/#piliers" className="text-sm font-medium text-foreground/80 hover:text-primary">{t("nav.pillars")}</a>
          <Link to="/dictionary" className="text-sm font-medium text-foreground/80 hover:text-primary">{t("nav.dictionary")}</Link>
          <Link to="/learn" className="text-sm font-medium text-foreground/80 hover:text-primary">{t("nav.learn")}</Link>
          <a href="/#culture" className="text-sm font-medium text-foreground/80 hover:text-primary">{t("nav.culture")}</a>
          <a href="/#vision" className="text-sm font-medium text-foreground/80 hover:text-primary">{t("nav.vision")}</a>
          <a href="/#contact" className="text-sm font-medium text-foreground/80 hover:text-primary">{t("nav.contact")}</a>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {user ? (
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground/80 hover:bg-accent"
              title={user.email ?? ""}
              aria-label={t("btn.signout")}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("btn.signout")}</span>
            </button>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground/80 hover:bg-accent"
              aria-label={t("btn.signin")}
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("btn.signin")}</span>
            </Link>
          )}
          <Link
            to="/chat"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
            aria-label={t("btn.try")}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{t("btn.try")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border/60 bg-earth text-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--gold)] text-earth">
                <span className="font-display text-lg font-bold">F</span>
              </div>
              <span className="font-display text-xl font-semibold">FulanIA</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-cream/70">
              {t("footer.tagline")}
            </p>
            <p className="mt-3 font-display text-sm italic text-[var(--gold)]">
              « Pulaagu ko ngallu mawngu »
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm uppercase tracking-widest text-[var(--gold)]">
              {t("footer.explore")}
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-cream/80">
              <li><a href="/#solution" className="hover:text-[var(--gold)]">{t("nav.solution")}</a></li>
              <li><a href="/#piliers" className="hover:text-[var(--gold)]">{t("nav.pillars")}</a></li>
              <li><a href="/#culture" className="hover:text-[var(--gold)]">{t("nav.culture")}</a></li>
              <li><a href="/#vision" className="hover:text-[var(--gold)]">{t("nav.vision")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm uppercase tracking-widest text-[var(--gold)]">
              {t("footer.contact")}
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-cream/80">
              <li>{t("author.name")}</li>
              <li>
                <a href="mailto:awmedmansour@outlook.com" className="hover:text-[var(--gold)]">
                  awmedmansour@outlook.com
                </a>
              </li>
              <li>
                <a href="tel:+213780306486" className="hover:text-[var(--gold)]">
                  +213 780 30 64 86
                </a>
              </li>
              <li className="text-cream/60">{t("contact.location")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-cream/10 pt-6 text-xs text-cream/60 sm:flex-row">
          <p>© 2026 FulanIA — {t("footer.rights")}</p>
          <p className="font-display italic">{t("footer.motto")}</p>
        </div>
      </div>
    </footer>
  );
}
