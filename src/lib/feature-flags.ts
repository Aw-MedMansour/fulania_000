// Bascules temporaires pour masquer/désactiver des fonctionnalités.
// Mettre à false pour réactiver.
export const DICTIONARY_DISABLED = false;

// Date de retour affichée sur la page de maintenance. null = "bientôt".
export const DICTIONARY_DISABLED_UNTIL: string | null = null;

// Écran « en réparation » pour tout le site. Mettre à false pour tout réouvrir.
export const MAINTENANCE_ENABLED = true;

// Date/heure de retour affichées sur l'écran de maintenance. null = "bientôt".
export const MAINTENANCE_UNTIL: string | null = null;

// Ces adresses restent ouvertes pendant la maintenance (outils techniques, robots, sitemap).
export const MAINTENANCE_EXEMPT_PREFIXES = [
  "/auth",
  "/.lovable/oauth/consent",
  "/mcp",
  "/.mcp",
  "/.well-known",
  "/api",
  "/lovable",
  "/sitemap.xml",
  "/robots.txt",
];
