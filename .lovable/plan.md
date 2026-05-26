## Objectif

Ajouter un historique de discussions, un système de crédits pour les invités, fixer l'OG image et nettoyer la navigation sur les pages outils.

## 1. Sidebar de discussions (chat)

- Sidebar pliable à gauche dans `/chat`, bouton hamburger en haut à gauche du composer.
- Visible **uniquement si connecté** ; sinon un encart "Connectez-vous pour conserver l'historique".
- Contient : bouton **"+ Nouvelle discussion"** et la liste des conversations passées (titre = 1ère question tronquée, date).
- Sélection d'une conversation → recharge ses messages. Suppression possible (corbeille au survol).
- Persistance backend : nouvelle table `chat_conversations` (id, user_id, title, created_at, updated_at) et `chat_messages` (id, conversation_id, role, content, sources jsonb, created_at) avec RLS `auth.uid() = user_id`.

## 2. Crédits invités (device-based)

- **Connecté → illimité.**
- **Non connecté →** quota par appareil, fenêtre glissante de 5 h :
  - 10 actions simples (chat normal)
  - 7 recherches web
  - 5 recherches approfondies
- Fingerprint local : ID stable en `localStorage` (`fulania_device_id`, uuid) + horodatages des actions par catégorie en `localStorage`. (Note : facilement contournable côté client ; un vrai blocage nécessite un backend de tracking — je signale la limite.)
- Quand un compteur atteint 0 : message **"Connectez-vous pour continuer — ou réessayez dans Xh Ymin"**, avec bouton "Se connecter".
- Affichage discret du quota restant sous le composer.

## 3. Nettoyer la navigation des pages outils

- Retirer `<PageNav />` (boutons Retour / Accueil / Espace) sur : `/chat`, `/dictionary`, `/learn`, `/translate`, `/culture`, `/hub`.
- L'utilisateur navigue via les gestes tactiles natifs (swipe back) et le bouton du navigateur.

## 4. Image OG (URL preview)

- Générer une image OG de marque (1200×630) et la référencer dans `__root.tsx` via `og:image` + `twitter:image` (URL absolue).
- Une image par défaut au niveau root (les routes feuilles existantes n'en ont pas, donc pas de conflit).

## Détails techniques

- Migration Supabase pour `chat_conversations` + `chat_messages` + RLS.
- `chat.tsx` : refactor pour lire/écrire les messages dans Supabase si `user`, sinon état local + compteurs `localStorage`.
- Nouveau hook `useGuestQuota()` exposant `{ remaining, canUse(kind), consume(kind), resetAt }`.
- Image OG via `imagegen` (premium, motif culturel Peul + logo FulanIA), enregistrée dans `src/assets/og-cover.jpg` et servie en URL absolue.

## Limites signalées

- Le blocage par appareil sans backend est contournable (vider le storage / navigation privée). Pour un blocage robuste il faudrait stocker les compteurs côté serveur indexés par device_id + IP — à faire dans une 2ᵉ itération si nécessaire.
