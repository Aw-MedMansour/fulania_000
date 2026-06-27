import { cn } from "@/lib/utils";

type Tone = "primary" | "gold";

/**
 * Editorial eyebrow: thin rule + dot + uppercase label.
 * Use above section titles for a refined, professional rhythm.
 */
export function Eyebrow({
  children,
  tone = "primary",
  className,
  align = "start",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  align?: "start" | "center";
}) {
  const color =
    tone === "gold" ? "text-[var(--gold)]" : "text-primary";
  const ruleColor =
    tone === "gold" ? "bg-[var(--gold)]/50" : "bg-primary/50";
  const dotColor =
    tone === "gold" ? "bg-[var(--gold)]" : "bg-primary";

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        align === "center" && "justify-center",
        className
      )}
    >
      <span className={cn("h-px w-8 sm:w-10", ruleColor)} aria-hidden />
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} aria-hidden />
      <span
        className={cn(
          "text-[11px] font-medium uppercase tracking-[0.24em]",
          color
        )}
      >
        {children}
      </span>
    </div>
  );
}
