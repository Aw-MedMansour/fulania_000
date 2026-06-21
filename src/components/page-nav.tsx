import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Home, LayoutGrid } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";

/**
 * Barre de navigation contextuelle affichée en haut des pages-outils
 * (chat, dictionary, learn, translate, culture, hub).
 * - Retour à l'historique précédent (sans déconnexion)
 * - Accueil public (/)
 * - Espace utilisateur (/hub) si connecté
 */
export function PageNav({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: user ? "/hub" : "/" });
    }
  };

  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-medium ${className}`}
      role="navigation"
      aria-label={t("nav.back")}
    >
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-foreground/80 backdrop-blur hover:bg-accent hover:text-foreground"
        aria-label={t("nav.back")}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{t("nav.back")}</span>
      </button>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-foreground/80 backdrop-blur hover:bg-accent hover:text-foreground"
        aria-label={t("nav.home")}
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t("nav.home")}</span>
      </Link>
      {user && (
        <Link
          to="/hub"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-foreground/80 backdrop-blur hover:bg-accent hover:text-foreground animate-pulse"
          aria-label={t("nav.hub")}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("nav.hub")}</span>
        </Link>
      )}
    </div>
  );
}
