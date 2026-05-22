## Objectif

Faire en sorte que le bouton « Retour » de chaque outil (chat, dictionary, learn, translate, culture) ramène **toujours à la page réellement précédente** (accueil, hub, ou un autre outil), au lieu de retomber arbitrairement sur `/hub` ou `/`.

## Diagnostic

Aujourd'hui :
- Les `<Link>` poussent bien dans l'historique (OK).
- `PageNav` appelle `router.history.back()` — correct en théorie.
- **Mais** plusieurs `navigate({ replace: true })` cassent la chaîne :
  - `auth.tsx` : après connexion → `/hub` en `replace` → la page d'origine (ex. `/`) est perdue, donc « Retour » depuis `/chat` saute à un état imprévu.
  - `culture.tsx` et `translate.tsx` : `navigate({ to: "/auth", replace: true })` quand non connecté → impossible de revenir à l'outil d'origine après login.
  - `hub.tsx` (signOut) : `replace: true` vers `/` — pas un bug de retour mais à harmoniser.
- Les CTA de l'accueil (`index.tsx`) envoient tous vers `/auth` sans mémoriser l'outil ciblé → l'utilisateur ne revient jamais sur l'outil voulu.

## Plan

### 1. Paramètre `?next=` pour rediriger après auth
- `auth.tsx` :
  - Lire `search.next` (string, route validée via `validateSearch`).
  - Après `signIn` / `signUp` réussi ET « Continuer sans compte » → `navigate({ to: next ?? "/hub" })` **sans `replace`**, afin de préserver l'historique.
  - Si déjà connecté à l'arrivée sur `/auth` → rediriger vers `next ?? "/hub"`.

### 2. Garde d'auth des outils protégés
- `culture.tsx`, `translate.tsx` : remplacer
  `navigate({ to: "/auth", replace: true })` par
  `navigate({ to: "/auth", search: { next: "/culture" } })` (idem translate).
  Garder `replace: true` ici est OK (on ne veut pas que « Retour » re-déclenche la garde), mais on transmet `next` pour boucler proprement après login.

### 3. CTA de l'accueil
- `index.tsx` : les liens « Assistant IA », « Dictionnaire », etc. passent par `<Link to="/auth" search={{ next: "/chat" }}>` (ou `/dictionary`, `/learn`…). Les CTA génériques restent `to="/auth"` sans `next` (→ hub).

### 4. PageNav — robustesse du retour
- `page-nav.tsx` : `router.history.back()` reste la base.
- Détecter le cas « pas d'historique applicatif » (ex. ouverture directe d'un lien) via `window.history.length <= 1` **ou** un compteur de navigations dans `sessionStorage` — fallback vers `/hub` si connecté, sinon `/`. (Comportement actuel conservé, légère amélioration.)

### 5. Harmonisation
- Retirer les `replace: true` superflus dans `hub.tsx` (signOut peut rester en replace : voulu).
- Vérifier qu'aucun `<Link>` n'utilise `replace` pour la navigation inter-outils.

## Hors scope
- Pas de refonte visuelle de PageNav.
- Pas de modification des Edge Functions ni du contenu i18n.
- Pas de changement du flux d'inscription.

## Vérification
- Scénario A : `/` → clic « Assistant IA » → `/auth?next=/chat` → login → `/chat` → bouton Retour → revient sur `/` (pas sur `/hub`).
- Scénario B : `/hub` → `/chat` → Retour → `/hub`.
- Scénario C : `/dictionary` → `/chat` → Retour → `/dictionary`.
- Scénario D : ouverture directe de `/chat` (lien partagé) → Retour → `/hub` si connecté, `/` sinon.