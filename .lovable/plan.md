## Problème

Un correctif de sécurité a ajouté `supabase.auth.getUser()` + rejet 401 dans 4 edge functions IA :
- `chat` (assistant)
- `translate` (traducteur)
- `dialect-translate` (variantes dialectales)
- `generate-lesson` (mini‑leçons Janngude)

Résultat : chaque clic envoie une requête → 401 « Unauthorized » → l'erreur passe presque inaperçue dans l'UI. Aucune réponse IA ne s'affiche pour les visiteurs non connectés.

## Objectif

Garder les fonctionnalités telles quelles. Rétablir leur fonctionnement pour TOUS les visiteurs, sans connexion obligatoire.

## Changements

Dans chacun des 4 fichiers ci‑dessous, retirer le bloc de vérification d'authentification ajouté récemment (le check `Authorization: Bearer`, la création du client Supabase « user‑bound », et le `getUser()` qui renvoie 401). Conserver le reste : validation d'input, appel à l'AI Gateway via `LOVABLE_API_KEY` côté serveur, gestion 429/402/502, RAG dictionnaire.

1. `supabase/functions/chat/index.ts` — supprimer le bloc auth (lignes ~257‑271).
2. `supabase/functions/translate/index.ts` — supprimer le bloc auth (lignes ~58‑67). Le client Supabase reste créé avec la clé anon pour le RAG dictionnaire (lectures publiques).
3. `supabase/functions/dialect-translate/index.ts` — supprimer le bloc auth (lignes ~53‑66). Supprimer le client Supabase (non utilisé pour le RAG dans cette fonction).
4. `supabase/functions/generate-lesson/index.ts` — supprimer le bloc auth (lignes ~75‑83). Le client Supabase reste pour le RAG dictionnaire.

Les 4 fonctions ont déjà `verify_jwt = false` dans `supabase/config.toml` — aucun changement de config nécessaire.

## Vérification

Après déploiement, tester via `curl_edge_functions` SANS Authorization :
- `POST /chat` avec un petit message → réponse SSE qui stream
- `POST /translate` avec un mot → carte JSON
- `POST /dialect-translate` avec un mot → carte dialectale JSON
- `POST /generate-lesson` avec un thème → leçon JSON

Puis dans le preview : ouvrir `/chat`, envoyer un message en navigation invité, vérifier qu'une réponse s'affiche.

## Note

C'est le retour au comportement d'avant le correctif `chat_open_endpoint`. La sécurité du `LOVABLE_API_KEY` reste assurée (jamais exposée au client). Le seul risque est l'abus de crédits par des bots : la limite de quota navigateur (`useGuestQuota`, 10 actions / 5h) reste en place côté client. Si on observe un abus réel, on pourra ajouter plus tard une protection serveur (rate‑limit par IP) sans rebloquer les invités.
