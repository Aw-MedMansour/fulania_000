import { motion } from "framer-motion";
import { Sparkles, Mic, Languages, BookOpen } from "lucide-react";

/**
 * Aperçu produit "à la macOS" affiché dans le hero de la page d'accueil.
 * Pur DOM/SVG — pas d'image bitmap, reste net à toute taille et léger.
 */
export function HeroProductPreview() {
  const messages = [
    { from: "user", text: "Comment dit-on « bienvenue » en Pulaar ?" },
    {
      from: "ai",
      text: "« Bisimilla » — accueil chaleureux, utilisé du Fuuta Tooro au Maasina.",
      meta: "Pulaar · Fuuta Tooro",
    },
    { from: "user", text: "Et en Fulfulde du Nigeria ?" },
  ];

  return (
    <div className="relative">
      {/* Halo */}
      <div
        className="pointer-events-none absolute -inset-10 rounded-[2rem] bg-[var(--gold)]/20 blur-3xl"
        aria-hidden
      />

      {/* Fenêtre principale */}
      <motion.div
        initial={{ opacity: 0, y: 24, rotateX: 6 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl border border-cream/15 bg-[#0e1014]/95 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl"
      >
        {/* Barre de titre macOS */}
        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-[11px] text-cream/60">
            <Sparkles className="h-3 w-3 text-[var(--gold)]" />
            fulania.com — Assistant
          </div>
          <span className="w-12" />
        </div>

        {/* Corps : conversation */}
        <div className="space-y-3 px-5 py-6 sm:px-6">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.18 }}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={
                  m.from === "user"
                    ? "max-w-[78%] rounded-2xl rounded-tr-sm bg-[var(--gold)]/95 px-4 py-2.5 text-[13px] font-medium text-earth"
                    : "max-w-[82%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[13px] text-cream/90"
                }
              >
                <p className="leading-snug">{m.text}</p>
                {m.meta && (
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]/80">
                    {m.meta}
                  </p>
                )}
              </div>
            </motion.div>
          ))}

          {/* Indicateur de frappe */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.4 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.04] px-4 py-3">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]/70"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: d * 0.18 }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Barre d'outils */}
        <div className="flex items-center justify-between border-t border-white/5 bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] text-cream/55">
            <span className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1">
              <Languages className="h-3 w-3 text-[var(--gold)]" /> FR ↔ Pulaar
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1">
              <BookOpen className="h-3 w-3 text-[var(--gold)]" /> Dictionnaire
            </span>
          </div>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--gold)]/90 text-earth">
            <Mic className="h-3.5 w-3.5" />
          </span>
        </div>
      </motion.div>

      {/* Carte flottante : statistique */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -bottom-6 -left-6 hidden rounded-xl border border-cream/15 bg-earth/85 px-4 py-3 shadow-2xl backdrop-blur-md sm:block"
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-cream/55">Locuteurs</p>
        <p className="mt-0.5 font-display text-xl font-semibold text-[var(--gold)]">~100 M</p>
      </motion.div>

      {/* Badge flottant : qualité */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.7 }}
        className="absolute -right-3 top-8 hidden rounded-full border border-[var(--gold)]/40 bg-earth/85 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--gold)] shadow-xl backdrop-blur-md md:flex"
      >
        4 dialectes · FR · EN · AR
      </motion.div>
    </div>
  );
}
