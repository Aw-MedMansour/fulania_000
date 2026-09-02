import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Clapperboard, Sparkles, Trash2, Download, Coins, Heart } from "lucide-react";
import { toast } from "sonner";
import {
  getVideoCredits,
  refineVideoPrompt,
  startVideoGeneration,
  pollVideoGeneration,
  listMyVideos,
  deleteMyVideo,
  type VideoItem,
} from "@/lib/video.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageNav } from "@/components/page-nav";

export const Route = createFileRoute("/_authenticated/video")({
  head: () => ({
    meta: [
      { title: "Widito — Générateur de vidéos pulaar | FulanIA" },
      {
        name: "description",
        content:
          "Décris une scène en pulaar, français, anglais ou arabe : FulanIA génère un clip vidéo avec son, inspiré de la culture peule.",
      },
      { property: "og:title", content: "Widito — Générateur de vidéos pulaar" },
      {
        property: "og:description",
        content: "Génère des clips vidéo à partir d'une description, dans l'univers visuel des Fulɓe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VideoPage,
});

type Ratio = "16:9" | "9:16";
type Dur = 4 | 6 | 8;
type Res = "720p" | "1080p";

function VideoPage() {
  const creditsFn = useServerFn(getVideoCredits);
  const refineFn = useServerFn(refineVideoPrompt);
  const startFn = useServerFn(startVideoGeneration);
  const pollFn = useServerFn(pollVideoGeneration);
  const listFn = useServerFn(listMyVideos);
  const deleteFn = useServerFn(deleteMyVideo);

  const [balance, setBalance] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [ratio, setRatio] = useState<Ratio>("16:9");
  const [duration, setDuration] = useState<Dur>(8);
  const [resolution, setResolution] = useState<Res>("720p");
  const [refining, setRefining] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const reload = useCallback(async () => {
    const [c, v] = await Promise.all([creditsFn({ data: {} }), listFn({ data: {} })]);
    setBalance(c.balance);
    setVideos(v);
  }, [creditsFn, listFn]);

  useEffect(() => {
    reload().catch(() => undefined);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [reload]);

  const handleRefine = async () => {
    if (description.trim().length < 3) return;
    setRefining(true);
    try {
      const r = await refineFn({ data: { description: description.trim() } });
      setPrompt(r.prompt);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec de la préparation du prompt.");
    } finally {
      setRefining(false);
    }
  };

  const handleGenerate = async () => {
    const finalPrompt = prompt.trim() || description.trim();
    if (finalPrompt.length < 3) return;
    setGenerating(true);
    setElapsed(0);
    try {
      const { id, balance: b } = await startFn({
        data: {
          description: description.trim() || finalPrompt,
          prompt: finalPrompt,
          aspectRatio: ratio,
          durationSeconds: duration,
          resolution,
        },
      });
      setBalance(b);
      toast.success("Génération lancée — compte 1 à 3 minutes.");

      timer.current = setInterval(() => setElapsed((s) => s + 1), 1000);
      // eslint-disable-next-line no-constant-condition
      while (true) {
        await new Promise((r) => setTimeout(r, 8000));
        const st = await pollFn({ data: { id } });
        if (st.status === "completed") {
          toast.success("Vidéo prête !");
          break;
        }
        if (st.status === "failed") {
          toast.error(st.error ?? "La génération a échoué — ton crédit a été remboursé.");
          break;
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Échec de la génération.");
    } finally {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      setGenerating(false);
      reload().catch(() => undefined);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteFn({ data: { id } });
    setVideos((v) => v.filter((x) => x.id !== id));
  };

  const noCredits = balance !== null && balance < 1;

  return (
    <div className="min-h-screen bg-background">
      <PageNav />
      <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-6 sm:px-6">
        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4a44a] text-cream shadow-sm">
              <Clapperboard className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold text-earth sm:text-3xl">Widito — vidéos pulaar</h1>
              <p className="text-sm text-muted-foreground">
                Décris une scène en pulaar, français, anglais ou arabe. FulanIA en fait un clip avec son.
              </p>
            </div>
            <Badge variant="secondary" className="ml-auto gap-1.5">
              <Coins className="h-3.5 w-3.5" />
              {balance === null ? "…" : `${balance} crédit${balance > 1 ? "s" : ""}`}
            </Badge>
          </div>
        </header>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
          <label className="mb-1.5 block text-sm font-medium text-earth" htmlFor="desc">
            Ta description
          </label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={1200}
            placeholder="Ex. : Un berger peul traverse le Sahel au coucher du soleil avec son troupeau, flûte au loin."
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefine} disabled={refining || generating}>
              {refining ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
              Améliorer le prompt
            </Button>
            <span className="text-xs text-muted-foreground">Optionnel — traduit et enrichit ta scène.</span>
          </div>

          {prompt && (
            <div className="mt-3">
              <label className="mb-1.5 block text-sm font-medium text-earth" htmlFor="prompt">
                Prompt vidéo (modifiable)
              </label>
              <Textarea id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} maxLength={2000} />
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Field label="Format">
              <Select value={ratio} onChange={(v) => setRatio(v as Ratio)} options={["16:9", "9:16"]} />
            </Field>
            <Field label="Durée">
              <Select
                value={String(duration)}
                onChange={(v) => setDuration(Number(v) as Dur)}
                options={["4", "6", "8"]}
                suffix="s"
                disabled={resolution === "1080p"}
              />
            </Field>
            <Field label="Qualité">
              <Select value={resolution} onChange={(v) => setResolution(v as Res)} options={["720p", "1080p"]} />
            </Field>
          </div>

          {noCredits ? (
            <div className="mt-4 rounded-xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-3 text-sm">
              <p className="font-medium text-earth">Tu n'as plus de crédit vidéo.</p>
              <p className="mt-1 text-muted-foreground">
                Chaque clip consomme 1 crédit. Contacte-nous depuis la page soutien pour recharger ton compte.
              </p>
              <Button asChild size="sm" className="mt-2">
                <Link to="/support">
                  <Heart className="mr-1.5 h-4 w-4" /> Obtenir des crédits
                </Link>
              </Button>
            </div>
          ) : (
            <Button
              className="mt-4 w-full sm:w-auto"
              onClick={handleGenerate}
              disabled={generating || description.trim().length < 3}
            >
              {generating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Clapperboard className="mr-1.5 h-4 w-4" />}
              {generating ? `Génération… ${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}` : "Générer la vidéo (1 crédit)"}
            </Button>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-3 font-display text-lg font-semibold text-earth">Mes vidéos</h2>
          {videos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune vidéo pour l'instant.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {videos.map((v) => (
                <article key={v.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  {v.url ? (
                    <video src={v.url} controls playsInline className="aspect-video w-full bg-black object-contain" />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                      {v.status === "failed" ? (v.error_message ?? "Échec") : "En cours…"}
                    </div>
                  )}
                  <div className="space-y-2 p-3">
                    <p className="line-clamp-2 text-sm text-earth">{v.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{v.resolution}</span>
                      <span>·</span>
                      <span>{v.duration_seconds}s</span>
                      <span>·</span>
                      <span>{v.aspect_ratio}</span>
                      <div className="ml-auto flex gap-1">
                        {v.url && (
                          <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                            <a href={v.url} download={`fulania-${v.id}.mp4`} aria-label="Télécharger">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleDelete(v.id)}
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  suffix = "",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  suffix?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o)}
          className={`flex-1 rounded-lg border px-2 py-1.5 text-sm transition ${
            value === o ? "border-[var(--gold)] bg-[var(--gold)]/15 text-earth" : "border-border text-muted-foreground"
          } ${disabled ? "opacity-50" : "hover:border-[var(--gold)]/60"}`}
        >
          {o}
          {suffix}
        </button>
      ))}
    </div>
  );
}
