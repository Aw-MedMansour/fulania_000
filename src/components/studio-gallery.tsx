import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import home from "@/assets/studio-page-17-image-6.jpg.asset.json";
import features from "@/assets/studio-page-17-image-5.jpg.asset.json";
import login from "@/assets/studio-page-17-image-4.jpg.asset.json";
import creation from "@/assets/studio-page-17-image-3.jpg.asset.json";
import scenario from "@/assets/studio-page-17-image-2.jpg.asset.json";
import history from "@/assets/studio-page-17-image-1.jpg.asset.json";
import scene from "@/assets/studio-page-18-image-3.jpg.asset.json";
import editing from "@/assets/studio-page-18-image-2.jpg.asset.json";
import assembly from "@/assets/studio-page-18-image-1.jpg.asset.json";

const screenshots = [
  { asset: home, title: "Page d’accueil", description: "« Votre studio vidéo propulsé par l’IA » : l’IA écrit le scénario, découpe les scènes et génère les séquences, en Pulaar, en français ou les deux." },
  { asset: features, title: "Fonctionnalités", description: "Scénario et storyboard modifiables, séquences vidéo générées scène par scène, adaptation entre Pulaar et français." },
  { asset: login, title: "Connexion", description: "Accès par compte (e-mail et mot de passe), avec possibilité de s’inscrire." },
  { asset: creation, title: "Création d’une vidéo", description: "Étape 1 : décrire l’idée, puis choisir la langue, le type de contenu, le format et la durée." },
  { asset: scenario, title: "Génération du scénario", description: "Création du scénario et du storyboard, puis vidéo générée scène par scène." },
  { asset: history, title: "Mes dernières créations", description: "Historique des vidéos : publicité FulanIA, présentation des fonctionnalités, format vertical TikTok/Reels/Shorts." },
  { asset: scene, title: "Scène générée", description: "Pour chaque scène : voix off, instruction vidéo, régénération de la scène et téléchargement en MP4 (exemple en Pulaar, format vertical 9:16)." },
  { asset: editing, title: "Édition par scène", description: "Chaque scène peut être modifiée, refaite seule et téléchargée séparément." },
  { asset: assembly, title: "Assemblage du projet", description: "Assemblage en MP4 : voix off IA (français) ou enregistrée (Pulaar), motion design, sous-titres et son des scènes." },
];

export function StudioGallery() {
  return (
    <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
      {screenshots.map(({ asset, title, description }) => (
        <figure key={title} className="min-w-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="inverse" className="group relative h-auto w-full overflow-hidden rounded-md border-cream/20 p-0" aria-label={`Agrandir : ${title}`}>
                <img src={asset.url} alt={`FulanIA Studio — ${title}`} loading="lazy" decoding="async" width={360} height={660} className="aspect-[6/11] w-full object-contain" />
                <span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-md bg-earth text-gold"><Maximize2 /></span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[94dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-lg">
              <DialogTitle className="pr-8">FulanIA Studio — {title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
              <img src={asset.url} alt={title} className="mx-auto max-h-[65dvh] w-auto object-contain" />
            </DialogContent>
          </Dialog>
          <figcaption className="mt-3 font-sans text-sm font-semibold text-cream">{title}</figcaption>
        </figure>
      ))}
    </div>
  );
}