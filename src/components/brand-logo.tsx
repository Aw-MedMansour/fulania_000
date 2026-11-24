import logoAsset from "@/assets/fulania-logo.webp.asset.json";
import symbolAsset from "@/assets/fulania-symbol-complete.webp.asset.json";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, full = false, compact = false }: { className?: string; full?: boolean; compact?: boolean }) {
  if (full) {
    return <img src={logoAsset.url} alt="FulanIA" width={768} height={768} className={cn("aspect-square w-36 rounded-lg object-contain", className)} />;
  }
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <span className="brand-symbol grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-md bg-logo-surface p-1">
        <img src={symbolAsset.url} alt={compact ? "FulanIA" : ""} width={520} height={452} className="h-full w-full object-contain" />
      </span>
      {!compact && <span className="whitespace-nowrap font-sans text-lg font-bold">Fulan<span className="text-gold-ink">IA</span></span>}
    </span>
  );
}