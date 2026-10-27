import { Download, Mic2, Radio, Youtube } from "lucide-react";
import radioCoverAsset from "@/assets/fulania-radio-cover.png.asset.json";
import radioVideoAsset from "@/assets/ali-diallo-radio-mauritanie.mp4.asset.json";
import { LazyVideo, LazyYouTube } from "@/components/video-players";
import { Reveal } from "@/components/reveal";
import { Eyebrow } from "@/components/eyebrow";

/** Section « Découvrez FulanIA » : les vidéos de présentation (déplacées depuis le Hub). */
export function DiscoverVideos() {
  return (
    <section id="decouvrir" className="scroll-mt-20 bg-secondary/30 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <Eyebrow>Vidéos de présentation</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-balance sm:text-5xl">
            Découvrez FulanIA
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Présentation, entretien et passage radio : l'équipe explique la mission et les ambitions de FulanIA.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <VideoCard
            icon={Youtube}
            label="Présentation"
            title="Découvrez FulanIA en vidéo"
            desc="Par Meimouna Sy — Vice-présidente, responsable communication & sensibilisation."
          >
            <LazyYouTube videoId="atXu0sjsEF4" title="Présentation de FulanIA par Meimouna Sy" />
          </VideoCard>

          <VideoCard
            icon={Mic2}
            label="Entretien exclusif"
            title="L'Entretien Exclusif avec L'Infos Plus"
            desc="L'équipe revient sur la naissance, la mission et les ambitions de la première IA dédiée à la langue et à la culture peules."
          >
            <LazyYouTube videoId="XXDGAmGVJFU" title="FulanIA : L'Entretien Exclusif avec L'Infos Plus" />
          </VideoCard>

          <div className="lg:col-span-2">
            <VideoCard
              icon={Radio}
              label="Radio Mauritanie"
              title="FulanIA à la Radio Mauritanie"
              desc="Ali Diallo, co-fondateur et responsable des partenariats, présente la mission de FulanIA et l'apport de l'IA à la langue pulaar."
              extra={
                <a
                  href={radioVideoAsset.url}
                  download="fulania-radio-mauritanie.mp4"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/50 hover:text-primary"
                >
                  <Download className="h-4 w-4" /> Télécharger la vidéo
                </a>
              }
            >
              <LazyVideo src={radioVideoAsset.url} poster={radioCoverAsset.url} title="Passage d'Ali Diallo à la Radio Mauritanie" />
            </VideoCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function VideoCard({
  icon: Icon, label, title, desc, children, extra,
}: {
  icon: typeof Radio; label: string; title: string; desc: string; children: React.ReactNode; extra?: React.ReactNode;
}) {
  return (
    <article className="h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {children}
      <div className="p-5 sm:p-6">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
          <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
        </p>
        <h3 className="mt-2 font-display text-xl font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
        {extra}
      </div>
    </article>
  );
}
