import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, Globe, Heart, LogOut, Sparkles, User as UserIcon, Menu, X, LayoutGrid, ArrowUpRight } from "lucide-react";
import { SocialLinks } from "@/components/social-links";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { DIALECTS, LANGUAGES, useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { DICTIONARY_DISABLED } from "@/lib/feature-flags";

async function signOut() {
  const { supabase } = await import("@/integrations/supabase/client");
  await supabase.auth.signOut();
}

export function LanguageSwitcher() {
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
      <Button variant="ghost"
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
      </Button>
      {open && (
        <div
          className="absolute end-0 z-50 mt-2 w-64 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg"
        >
          <ul role="listbox" aria-label={t("lang.switcher")}>
            {LANGUAGES.map((l) => {
              const isPulaar = l.code === "ff";
              return (
                <li key={l.code}>
                  <Button variant="ghost"
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
                  </Button>
                  {isPulaar && dialectsOpen && (
                    <ul role="listbox" aria-label="Dialecte Pulaar" className="border-t border-border bg-muted/40 px-2 py-1.5 space-y-0.5">
                      {DIALECTS.map((d) => (
                        <li key={d.code}>
                          <Button variant="ghost"
                            role="option"
                            aria-selected={d.code === dialect}
                            onClick={() => { setDialect(d.code); setOpen(false); }}
                            className="flex w-full items-center justify-between gap-2 rounded px-3 py-1.5 text-left text-sm hover:bg-accent"
                          >
                            <span className="font-medium">{d.label}</span>
                            {d.code === dialect && <Check className="h-3.5 w-3.5 text-primary" />}
                          </Button>
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
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen]);

  const navigation = (
    <>
      <a href="/#solution" onClick={() => setMenuOpen(false)}>{t("nav.solution")}</a>
      <a href="/#piliers" onClick={() => setMenuOpen(false)}>{t("nav.pillars")}</a>
      {!DICTIONARY_DISABLED && <Link to="/dictionary" onClick={() => setMenuOpen(false)}>{t("nav.dictionary")}</Link>}
      <Link to="/learn" onClick={() => setMenuOpen(false)}>{t("nav.learn")}</Link>
      <Link to="/culture" onClick={() => setMenuOpen(false)}>{t("nav.library")}</Link>
      <a href="/#culture" onClick={() => setMenuOpen(false)}>{t("nav.culture")}</a>
      <a href="/#vision" onClick={() => setMenuOpen(false)}>{t("nav.vision")}</a>
      <Link to="/contact" onClick={() => setMenuOpen(false)}>{t("nav.contact")}</Link>
    </>
  );
  const account = user ? (
    <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label={t("btn.signout")} title={t("btn.signout")}><LogOut /></Button>
  ) : (
    <Button asChild variant="ghost" size="icon"><Link to="/auth" aria-label={t("btn.signin")} title={t("btn.signin")}><UserIcon /></Link></Button>
  );
  return (
    <header className="site-header sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 xl:flex xl:justify-between xl:px-8">
        <Link to="/" className="min-w-0 shrink-0" aria-label="FulanIA"><BrandLogo /></Link>
        <nav className="desktop-navigation hidden min-w-0 items-center gap-3 text-xs font-semibold xl:flex" aria-label="Navigation principale">{navigation}</nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="hidden items-center gap-1.5 md:flex">
            <LanguageSwitcher />
            <Button asChild variant="outline" size="sm" className="border-gold/40"><Link to="/support" aria-label="Soutenir FulanIA — faire un don"><Heart className="text-gold-ink" />Soutenir</Link></Button>
            {account}
          </div>
          <Button asChild className="h-10 px-3 sm:px-4"><Link to="/chat" aria-label={t("btn.try")} title={t("btn.try")}><Sparkles /><span className="hidden sm:inline">{t("btn.try")}</span></Link></Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 xl:hidden" aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X /> : <Menu />}</Button>
        </div>
      </div>
      {menuOpen && (
        <div id="mobile-navigation" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background px-5 pb-6 pt-4 shadow-lg xl:hidden">
          <nav className="mobile-navigation mx-auto grid max-w-3xl grid-cols-2 gap-1 text-sm font-medium" aria-label="Navigation mobile">{navigation}</nav>
          <div className="mx-auto mt-4 flex max-w-3xl items-center justify-between gap-2 border-t border-border pt-4">
            <LanguageSwitcher />
            <Button asChild variant="outline" size="sm"><Link to="/support"><Heart className="text-gold-ink" />Soutenir</Link></Button>
            <Button asChild variant="ghost" size="icon"><Link to="/hub" aria-label={t("nav.hub")} title={t("nav.hub")}><LayoutGrid /></Link></Button>
            {account}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border/60 bg-earth text-cream">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <BrandLogo className="text-cream [&_.text-gold-ink]:text-gold" />
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
