import logoAsset from "@/assets/fulania-logo.jpg.asset.json";

/** Référence centrale du logo FulanIA (fichier original, fond blanc). */
export const LOGO_URL = logoAsset.url;

type Props = {
  /** Taille du carré en pixels. */
  size?: number;
  /** Afficher le nom « FulanIA » à côté. */
  withName?: boolean;
  /** Sous-titre sous le nom. */
  tagline?: string;
  /** "light" = fond clair, "dark" = texte crème pour fonds sombres. */
  tone?: "light" | "dark";
  className?: string;
  /** Masquer le nom sous 640 px (en-têtes chargés). */
  compactOnMobile?: boolean;
};

/**
 * Logo FulanIA. L'image originale a un fond blanc : elle est posée dans une
 * tuile blanche arrondie pour rester lisible sur les fonds sombres comme clairs.
 */
export function BrandLogo({ size = 36, withName = true, tagline, tone = "light", className = "", compactOnMobile = false }: Props) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
      <span
        className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[oklch(1_0_0)] ring-1 ring-border/60 shadow-sm"
        style={{ width: size, height: size }}
      >
        <img
          src={LOGO_URL}
          alt="Logo FulanIA"
          width={size}
          height={size}
          decoding="async"
          className="h-full w-full scale-[1.25] object-contain"
        />
      </span>
      {withName && (
        <span className={`${compactOnMobile ? "hidden sm:flex" : "flex"} min-w-0 flex-col leading-none`}>
          <span className={`font-display text-lg font-semibold tracking-tight ${tone === "dark" ? "text-cream" : "text-earth"}`}>
            FulanIA
          </span>
          {tagline && (
            <span className={`mt-0.5 text-[10px] uppercase tracking-[0.15em] ${tone === "dark" ? "text-cream/60" : "text-muted-foreground"}`}>
              {tagline}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
