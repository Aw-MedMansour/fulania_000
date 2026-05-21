import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { translations, LANGUAGES, type Lang } from "../hooks/use-language";

/**
 * Simule l'ouverture de chaque route et vérifie que tous les libellés affichés
 * (clés passées à t("...")) changent correctement quand on bascule la langue.
 *
 * On évite de monter un vrai navigateur : on lit chaque fichier de route,
 * on extrait les clés `t("...")` réellement utilisées dans le JSX,
 * puis on vérifie pour chacune que les 4 langues fournissent une traduction
 * et qu'elle diffère bien entre les langues.
 */

const ROUTES: Record<string, string> = {
  "/": "src/routes/index.tsx",
  "/auth": "src/routes/auth.tsx",
  "/chat": "src/routes/chat.tsx",
  "/dictionary": "src/routes/dictionary.tsx",
};

const T_KEY_RE = /\bt\(\s*["'`]([^"'`]+)["'`]\s*[),]/g;

function extractKeys(filePath: string): string[] {
  const src = readFileSync(resolve(process.cwd(), filePath), "utf8");
  const keys = new Set<string>();
  for (const m of src.matchAll(T_KEY_RE)) keys.add(m[1]);
  return [...keys];
}

const LANGS: Lang[] = LANGUAGES.map((l) => l.code);

describe("i18n — routes ouvrent et traduisent leurs libellés", () => {
  for (const [route, file] of Object.entries(ROUTES)) {
    describe(`route ${route} (${file})`, () => {
      const keys = extractKeys(file);

      it("utilise au moins une clé de traduction", () => {
        expect(keys.length).toBeGreaterThan(0);
      });

      it.each(LANGS)("définit toutes les clés en %s", (lang) => {
        const missing = keys.filter((k) => !translations[lang][k]);
        expect(missing, `Clés manquantes en ${lang} : ${missing.join(", ")}`).toEqual([]);
      });

      it("chaque libellé change entre fr, ff, en et ar", () => {
        // Quelques marques/proverbes peuvent rester identiques volontairement.
        // On exige qu'au moins 70% des clés diffèrent entre chaque paire de langues.
        const pairs: [Lang, Lang][] = [
          ["fr", "ff"], ["fr", "en"], ["fr", "ar"],
          ["ff", "en"], ["ff", "ar"], ["en", "ar"],
        ];
        for (const [a, b] of pairs) {
          const diff = keys.filter((k) => translations[a][k] !== translations[b][k]).length;
          const ratio = diff / keys.length;
          expect(
            ratio,
            `Trop peu de différences entre ${a} et ${b} sur ${route} (${diff}/${keys.length})`,
          ).toBeGreaterThanOrEqual(0.7);
        }
      });
    });
  }
});
