# Génération de vidéos pulaar (fonctionnalité payante)

Nouvelle fonctionnalité : l'utilisateur décrit une scène (en pulaar, français, anglais ou arabe), FulanIA génère un clip vidéo de 5 à 8 secondes avec bande-son, puis le clip est stocké dans son espace personnel.

## Page `/video` (Widito)

- Réservée aux comptes connectés (redirection vers `/auth` sinon).
- Champ de description + choix du format (16:9 / 9:16), de la durée (5s ou 8s) et de la qualité (720p / 1080p).
- Un assistant IA reformule automatiquement la description en un prompt vidéo en anglais et enrichi (le modèle vidéo n'accepte que l'anglais) — l'utilisateur voit et peut corriger le prompt avant de lancer.
- Bouton « Générer » explicite : rien n'est lancé automatiquement.
- Barre de progression pendant la génération (1 à 3 minutes), puis lecteur vidéo + bouton de téléchargement.
- Galerie « Mes vidéos » sous le formulaire, avec suppression.

## Modèle payant (crédits)

- Chaque compte possède un solde de crédits vidéo. 1 crédit = 1 clip.
- 1 crédit offert à l'inscription pour essayer.
- Pas de génération possible à 0 crédit : message clair + lien vers la page d'achat.
- Le débit se fait au lancement du job ; en cas d'échec du job, le crédit est automatiquement recrédité.
- Pour l'instant, l'achat de crédits pointe vers la page `/support` (Bankily, Wave, PayPal…) avec un message « contacte-nous pour créditer ton compte », et un écran admin permet d'ajouter des crédits à un compte manuellement.
- Étape suivante (à valider séparément) : brancher Paddle pour l'achat automatique de packs de crédits.

## Détails techniques

- Table `video_credits` (solde par utilisateur) et `video_generations` (prompt, statut, modèle, coût en crédits, chemin du fichier). RLS : chaque utilisateur ne voit que ses lignes ; les écritures de solde passent uniquement par le serveur (service_role).
- Bucket de stockage privé `generated-videos`, lecture via URL signée courte.
- Fonctions serveur (`src/lib/video.functions.ts`, protégées par `requireSupabaseAuth`) :
  - `refineVideoPrompt` — réécrit la description en prompt vidéo anglais.
  - `startVideoGeneration` — vérifie le solde, débite, crée le job sur `google/gemini-omni-1.1-flash` via l'AI Gateway, enregistre la ligne.
  - `pollVideoGeneration` — interroge le job ; à la complétion, télécharge le MP4, l'envoie dans le stockage et renvoie l'URL signée ; en cas d'échec, rembourse le crédit.
  - `listMyVideos`, `deleteMyVideo`, et côté admin `grantVideoCredits`.
- Le client interroge le statut toutes les 8 secondes ; un seul job à la fois par utilisateur (la vidéo IA est coûteuse et le fournisseur limite les jobs simultanés).
- Ajout de la carte « Widito — Vidéos pulaar » dans le carrousel d'outils de la page d'accueil et dans le menu.
- Métadonnées SEO propres sur la nouvelle page.
