import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/** Lecteur YouTube léger : miniature puis iframe au clic (aucun son automatique avant action). */
export function LazyYouTube({ videoId, title }: { videoId: string; title: string }) {
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
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div ref={containerRef} className="relative aspect-video w-full overflow-hidden bg-muted">
      {!loaded && <Skeleton className="absolute inset-0 h-full w-full rounded-none" />}
      {inView && !activated && (
        <button
          type="button"
          onClick={() => setActivated(true)}
          aria-label={`Lire la vidéo : ${title}`}
          className="group absolute inset-0 flex items-center justify-center"
        >
          <img
            src={thumb}
            alt={title}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute inset-0 bg-earth/20 transition-colors group-hover:bg-earth/35" />
          <PlayBadge />
        </button>
      )}
      {activated && (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
          title={title}
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

/** Lecteur vidéo MP4 : affiche (poster) puis lecture au clic. */
export function LazyVideo({ src, poster, title }: { src: string; poster: string; title: string }) {
  const [activated, setActivated] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);

  if (activated) {
    return (
      <video controls autoPlay playsInline preload="auto" poster={poster} className="aspect-video w-full bg-earth" aria-label={title}>
        <source src={src} type="video/mp4" />
        Votre navigateur ne prend pas en charge la lecture vidéo.
      </video>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivated(true)}
      aria-label={`Lire la vidéo : ${title}`}
      className="group relative block aspect-video w-full overflow-hidden bg-muted"
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
      <span className="absolute inset-0 bg-earth/20 transition-colors group-hover:bg-earth/35" />
      <span className="absolute inset-0 flex items-center justify-center">
        <PlayBadge />
      </span>
    </button>
  );
}

function PlayBadge() {
  return (
    <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)] text-earth shadow-xl ring-4 ring-cream/30 transition-transform group-hover:scale-110">
      <Play className="h-7 w-7 translate-x-0.5 fill-current" />
    </span>
  );
}
