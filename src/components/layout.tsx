import { Link } from "@tanstack/react-router";
import { LogOut, Sparkles, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const { user } = useAuth();
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
          <a href="/#solution" className="text-sm font-medium text-foreground/80 hover:text-primary">Solution</a>
          <a href="/#piliers" className="text-sm font-medium text-foreground/80 hover:text-primary">Piliers</a>
          <Link to="/dictionary" className="text-sm font-medium text-foreground/80 hover:text-primary">Dictionnaire</Link>
          <Link to="/admin/import" className="text-sm font-medium text-foreground/80 hover:text-primary">Import</Link>
          <a href="/#culture" className="text-sm font-medium text-foreground/80 hover:text-primary">Culture</a>
          <a href="/#vision" className="text-sm font-medium text-foreground/80 hover:text-primary">Vision</a>
          <a href="/#contact" className="text-sm font-medium text-foreground/80 hover:text-primary">Contact</a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground/80 hover:bg-accent"
              title={user.email ?? ""}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground/80 hover:bg-accent"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Connexion</span>
            </Link>
          )}
          <Link
            to="/chat"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Essayer</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
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
              Intelligence Artificielle au service de la langue et de la culture Peules.
            </p>
            <p className="mt-3 font-display text-sm italic text-[var(--gold)]">
              « Pulaagu ko ngallu mawngu »
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm uppercase tracking-widest text-[var(--gold)]">
              Explorer
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-cream/80">
              <li><a href="/#solution" className="hover:text-[var(--gold)]">Notre solution</a></li>
              <li><a href="/#piliers" className="hover:text-[var(--gold)]">Les 5 piliers</a></li>
              <li><a href="/#culture" className="hover:text-[var(--gold)]">Langue &amp; culture</a></li>
              <li><a href="/#vision" className="hover:text-[var(--gold)]">Vision &amp; feuille de route</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm uppercase tracking-widest text-[var(--gold)]">
              Contact
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-cream/80">
              <li>Aw Mohamedou Mansour</li>
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
              <li className="text-cream/60">Boumerdes, Algérie</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-cream/10 pt-6 text-xs text-cream/60 sm:flex-row">
          <p>© 2026 FulanIA — Tous droits réservés</p>
          <p className="font-display italic">Notre culture, notre force. L'intelligence, notre avenir.</p>
        </div>
      </div>
    </footer>
  );
}
