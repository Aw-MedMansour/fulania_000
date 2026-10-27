import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, Globe, Heart, LogOut, Sparkles, User as UserIcon } from "lucide-react";
import { SocialLinks } from "@/components/social-links";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DIALECTS, LANGUAGES, useLanguage } from "@/hooks/use-language";
import { DICTIONARY_DISABLED } from "@/lib/feature-flags";
import { BrandLogo } from "@/components/brand-logo";
import { Menu, X } from "lucide-react";

function MobileMenu() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const links: { label: string; to?: "/dictionary" | "/learn" | "/culture" | "/hub" | "/about" | "/contact"; href?: string }[] = [
    { label: t("nav.pillars"), href: "/#piliers" },
    { label: "Vidéos", href: "/#decouvrir" },
    ...(!DICTIONARY_DISABLED ? [{ label: t("nav.dictionary"), to: "/dictionary" as const }] : []),
    { label: t("nav.learn"), to: "/learn" },
    { label: t("nav.library"), to: "/culture" },
    { label: "Outils (Hub)", to: "/hub" },
    { label: "À propos", to: "/about" },
    { label: t("nav.contact"), to: "/contact" },
  ];
  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground/80 hover:bg-accent"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>
      {open && (
        <nav aria-label="Menu mobile" className="absolute inset-x-0 top-16 z-50 border-b border-border bg-background shadow-lg">
          <ul className="mx-auto max-w-7xl px-4 py-3">
            {links.map((l) => (
              <li key={l.label}>
                {l.to ? (
                  <Link to={l.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm font-medium hover:bg-accent">{l.label}</Link>
                ) : (
                  <a href={l.href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-sm font-medium hover:bg-accent">{l.label}</a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

async function signOut() {
  const { supabase } = await import("@/integrations/supabase/client");
  await supabase.auth.signOut();
}

function LanguageSwitcher() {
  const { lang, setLang, dialect, setDialect, dialectsOpen, setDialectsOpen, t } = useLanguage();
  const [open, setOpen] = useState(false);
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
            {LANGUAGES.map((l) => {
              const isPulaar = l.code === "ff";
              return (
                <li key={l.code}>
                  <button
                    role="option"
                    aria-selected={l.code === lang}
                    aria-expanded={isPulaar ? dialectsOpen : undefined}
                    onClick={() => {
                      setLang(l.code);
                      if (isPulaar) {
                        setDialectsOpen(true);
                      } else {
                        setDialectsOpen(false);
                        setOpen(false);
                      }
                    }}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-accent"
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden>{l.flag}</span>
                      <span>{l.native}</span>
                      {isPulaar && <span aria-hidden className="text-muted-foreground">{dialectsOpen ? "▾" : "▸"}</span>}
                    </span>
                    {l.code === lang && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                  {isPulaar && dialectsOpen && (
                    <ul role="listbox" aria-label="Dialecte Pulaar" className="border-t border-border bg-muted/40 px-2 py-1.5 space-y-0.5">
                      {DIALECTS.map((d) => (
                        <li key={d.code}>
                          <button
                            role="option"
                            aria-selected={d.code === dialect}
                            onClick={() => { setDialect(d.code); setOpen(false); }}
                            className="flex w-full items-center justify-between gap-2 rounded px-3 py-1.5 text-left text-sm hover:bg-accent"
                          >
                            <span className="font-medium">{d.label}</span>
                            {d.code === dialect && <Check className="h-3.5 w-3.5 text-primary" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
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
        <Link to="/" className="group flex min-w-0 items-center" aria-label="FulanIA — accueil">
          <BrandLogo size={38} tagline="Pulaagu & IA" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navigation principale">
          <a href="/#piliers" className="text-sm font-medium text-foreground/80 hover:text-primary">{t("nav.pillars")}</a>
          {!DICTIONARY_DISABLED && (
            <Link to="/dictionary" className="text-sm font-medium text-foreground/80 hover:text-primary">{t("nav.dictionary")}</Link>
          )}
          <Link to="/learn" className="text-sm font-medium text-foreground/80 hover:text-primary">{t("nav.learn")}</Link>
          <Link to="/culture" className="text-sm font-medium text-foreground/80 hover:text-primary">{t("nav.library")}</Link>
          <Link to="/hub" className="text-sm font-medium text-foreground/80 hover:text-primary">Outils</Link>
          <Link to="/about" className="text-sm font-medium text-foreground/80 hover:text-primary">À propos</Link>
          <Link to="/contact" className="text-sm font-medium text-foreground/80 hover:text-primary">{t("nav.contact")}</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/support"
            aria-label="Soutenir FulanIA — faire un don"
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-earth px-3 py-2 text-xs font-semibold text-cream shadow-[0_1px_0_rgba(0,0,0,0.04),0_6px_16px_-8px_rgba(120,72,20,0.45)] ring-1 ring-[var(--gold)]/40 transition hover:-translate-y-0.5 hover:ring-[var(--gold)] sm:text-sm"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[var(--gold)]/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
            />
            <span className="relative flex h-5 w-5 items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-[var(--gold)]/30 blur-[3px] animate-ping opacity-70"
              />
              <Heart className="relative h-3.5 w-3.5 fill-[var(--gold)] text-[var(--gold)]" />
            </span>
            <span className="relative">Soutenir</span>
          </Link>

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
          <MobileMenu />
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
            <BrandLogo size={40} tone="dark" />
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
              <li><a href="/#decouvrir" className="hover:text-[var(--gold)]">Vidéos</a></li>
              <li><Link to="/hub" className="hover:text-[var(--gold)]">Outils (Hub)</Link></li>
              <li><Link to="/about" className="hover:text-[var(--gold)]">À propos</Link></li>
              <li><a href="/#culture" className="hover:text-[var(--gold)]">{t("nav.culture")}</a></li>
              <li><Link to="/contact" className="hover:text-[var(--gold)]">{t("nav.contact")}</Link></li>
              <li><Link to="/support" className="font-semibold text-[var(--gold)] hover:opacity-80">❤ Soutenir FulanIA</Link></li>
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
                <a href="tel:+22232256718" className="hover:text-[var(--gold)]">
                  +222 32 25 67 18
                </a>
              </li>
              <li className="text-cream/60">{t("contact.location")}</li>
            </ul>
            <div className="mt-4">
              <SocialLinks />
            </div>
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
