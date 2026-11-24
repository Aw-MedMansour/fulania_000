import { useEffect, useRef, useState } from "react";
import { Play, Radio, Download, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/reveal";
import { Eyebrow } from "@/components/eyebrow";
import radioCoverAsset from "@/assets/fulania-radio-cover.png.asset.json";
import radioVideoAsset from "@/assets/ali-diallo-radio-mauritanie.mp4.asset.json";
import interviewPreview from "@/assets/entretien-infos-plus.jpg.asset.json";
import presentationPreview from "@/assets/presentation-meimouna.jpg.asset.json";

/**
 * Section dédiée « FulanIA en vidéo » de la page d'accueil :
 * entretien L'Infos Plus, présentation par Meimouna Sy, passage Radio Mauritanie.
 */
export function VideosSection({ embedded = false }: { embedded?: boolean }) {
  return (
    <section id="videos" className={embedded ? "mt-16 border-t border-border pt-12" : "bg-secondary/30 py-16 sm:py-20"}>
      <div className={embedded ? "" : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"}>
        <Reveal className="mb-10 max-w-2xl">
          <Eyebrow>FulanIA en vidéo</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.01em] text-balance sm:text-4xl lg:text-5xl">
            La mission FulanIA, racontée par ceux qui la portent
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Entretiens, présentations et passages médias — découvrez la naissance et les ambitions de la première IA dédiée à la langue et à la culture peules.
          </p>
        </Reveal>

        <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_1fr_1fr]">
          {/* Entretien exclusif — vidéo principale */}
          <Reveal className="min-w-0">
            <figure className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
              <LazyYouTube
                videoId="XXDGAmGVJFU"
                title="FulanIA : L'Entretien Exclusif avec L'Infos Plus"
              />
              <figcaption className="border-t border-border p-5 sm:p-6">
                <p className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                  <Youtube className="h-3.5 w-3.5" /> Entretien exclusif
                </p>
                <p className="mt-2 font-display text-lg font-semibold text-foreground">
                  L'Entretien Exclusif avec L'Infos Plus
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  L'équipe FulanIA revient sur la naissance, la mission et les ambitions du projet.
                </p>
              </figcaption>
            </figure>
          </Reveal>

          {/* Présentation par Meimouna Sy */}
          <Reveal delay={0.1}>
            <figure className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
              <LazyYouTube
                videoId="atXu0sjsEF4"
                title="Présentation de FulanIA par Meimouna Sy"
              />
              <figcaption className="border-t border-border p-5 sm:p-6">
                <p className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                  <Youtube className="h-3.5 w-3.5" /> Présentation
                </p>
                <p className="mt-2 font-display text-lg font-semibold text-foreground">
                  Découvrez FulanIA en vidéo
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Par Meimouna Sy — Vice-présidente, Responsable communication &amp; sensibilisation.
                </p>
              </figcaption>
            </figure>
          </Reveal>

          {/* Radio Mauritanie */}
          <Reveal delay={0.2}>
            <figure className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
              <LazyVideo
                src={radioVideoAsset.url}
                poster={radioCoverAsset.url}
                title="Passage d'Ali Diallo à la Radio Mauritanie"
              />
              <figcaption className="border-t border-border p-5 sm:p-6">
                <p className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
                  <Radio className="h-3.5 w-3.5" /> Radio Mauritanie
                </p>
                <p className="mt-2 font-display text-lg font-semibold text-foreground">
                  FulanIA à la Radio Mauritanie
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ali Diallo — Co-fondateur, Responsable des partenariats — présente la mission et l'impact de FulanIA.
                </p>
                <a
                  href={radioVideoAsset.url}
                  download="fulania-radio-mauritanie.mp4"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2 text-sm font-medium text-earth shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <Download className="h-4 w-4" />
                  Télécharger la vidéo
                </a>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function LazyYouTube({ videoId, title }: { videoId: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [activated, setActivated] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const thumb = videoId === "XXDGAmGVJFU" ? interviewPreview.url : presentationPreview.url;

  return (
    <div ref={containerRef} className="relative aspect-video w-full bg-muted">
      {!loaded && <Skeleton className="absolute inset-0 h-full w-full rounded-none" />}

      {inView && !activated && (
        <Button variant="ghost"
          type="button"
          onClick={() => setActivated(true)}
          aria-label={`Lire la vidéo : ${title}`}
          className="group absolute inset-0 h-full w-full rounded-none p-0 flex items-center justify-center"
        >
          <img
            src={thumb}
            alt={title}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute inset-0 bg-earth/20 transition-colors group-hover:bg-earth/30" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)] text-earth shadow-xl ring-4 ring-cream/20 transition-transform group-hover:scale-110">
            <Play className="h-7 w-7 translate-x-0.5 fill-current" />
          </span>
        </Button>
      )}

      {activated && (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 h-full w-full"
        />
      )}
    </div>
  );
}

function LazyVideo({ src, poster, title }: { src: string; poster: string; title: string }) {
  const [activated, setActivated] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);

  if (activated) {
    return (
      <video
        controls
        autoPlay
        playsInline
        preload="auto"
        poster={poster}
        className="aspect-video w-full bg-earth"
        aria-label={title}
      >
        <source src={src} type="video/mp4" />
        Votre navigateur ne prend pas en charge la lecture vidéo.
      </video>
    );
  }

  return (
    <Button variant="ghost"
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`Lire la vidéo : ${title}`}
      className="group relative block h-auto aspect-video w-full overflow-hidden rounded-none bg-muted p-0"
    >
      {!posterLoaded && <Skeleton className="absolute inset-0 h-full w-full rounded-none" />}
      <img
        src={poster}
        alt={title}
        loading="lazy"
        decoding="async"
        onLoad={() => setPosterLoaded(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute inset-0 bg-earth/20 transition-colors group-hover:bg-earth/30" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)] text-earth shadow-xl ring-4 ring-cream/20 transition-transform group-hover:scale-110">
          <Play className="h-7 w-7 translate-x-0.5 fill-current" />
        </span>
      </span>
    </Button>
  );
}
