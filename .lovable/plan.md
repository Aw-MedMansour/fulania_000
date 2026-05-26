# Plan — Enrichir l'Assistant IA avec Recherche Internet & Pièces jointes

## Objectif
Permettre à l'utilisateur sur `/chat` de :
1. Activer une **recherche internet** (web search) pour enrichir les réponses avec des informations à jour et sourcées.
2. **Joindre des images et fichiers** (PDF, texte, photos) à ses messages, que l'assistant analyse.

## 1. Recherche Internet

**Approche :** intégrer le connecteur **Firecrawl** (search + scrape) côté serveur dans l'edge function `chat`.

- Ajout d'un toggle "🌐 Recherche web" dans l'UI de `/chat` (à côté du sélecteur de dialecte).
- Quand activé, le frontend envoie `webSearch: true` à l'edge function.
- L'edge function `chat/index.ts` :
  - Extrait les mots-clés du dernier message utilisateur (déjà fait pour le RAG dictionnaire).
  - Appelle `firecrawl.search(query, { limit: 5, scrapeOptions: { formats: ['markdown'] } })`.
  - Injecte les résultats (titres + extraits + URLs) dans le system prompt sous une section `=== RECHERCHE WEB ===`.
  - Demande au modèle de citer les sources `[1], [2]…` à la fin.
- Le frontend rend les citations cliquables sous la réponse.

**Prérequis :** connecter Firecrawl via `standard_connectors--connect`. Si l'utilisateur préfère ne pas utiliser Firecrawl, on peut basculer sur Perplexity (recherche IA native avec citations) — à confirmer.

## 2. Upload de fichiers et photos

**Approche :** uploads gérés côté client, envoyés à l'edge function en base64 (pas besoin de bucket Storage pour des pièces jointes éphémères).

- Bouton 📎 dans la barre de saisie de `/chat` :
  - Accepte images (`.png .jpg .webp`), PDF, texte (`.txt .md`).
  - Limite : 5 fichiers, 10 Mo total par message.
- Aperçu (vignette image, icône fichier) avant envoi, avec bouton supprimer.
- Le payload envoyé devient :
  ```ts
  { messages: [...], attachments: [{ name, mimeType, dataBase64 }] }
  ```
- Edge function `chat/index.ts` :
  - **Images** → passées directement au modèle Gemini en multimodal (`content: [{ type: 'image_url', image_url: { url: 'data:...' } }, { type: 'text', text: ... }]`). Gemini 2.5 Flash gère le multimodal nativement via Lovable AI Gateway.
  - **PDF/texte** → extraction texte côté serveur (texte brut directement ; PDF via lib légère ou simplement passer le binaire à Gemini qui supporte PDF en input multimodal).
  - Le contenu extrait est injecté dans le message utilisateur.

## 3. UI `/chat` — modifications

- Toggle "Recherche web" (icône globe) à côté du sélecteur de dialecte.
- Bouton trombone 📎 à gauche de la zone de texte.
- Vignettes des pièces jointes au-dessus du textarea.
- Badge "🌐 Sources" sous les réponses utilisant la recherche web, avec liens cliquables.

## 4. Aspects techniques

- Pas de changement DB.
- Edge function `chat` reste publique (sans auth) — conforme à la mémoire sécurité.
- Validation : limite stricte taille payload (15 Mo max), nombre de pièces jointes.
- Rate limiting léger par IP recommandé (déjà noté dans `@security-memory`).

## Questions avant de coder

1. **Moteur de recherche** : Firecrawl (scrape + search, flexible) ou **Perplexity** (réponses IA avec citations natives, plus simple) ?
2. **Persistance** : conserver l'historique des conversations en DB, ou rester sur du in-memory comme actuellement ?

Je peux démarrer dès ta validation — je partirai sur **Firecrawl + multimodal Gemini** sauf indication contraire.
