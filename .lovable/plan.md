# Refonte : FulanIA en app web

Transformer la page d'accueil `/` en interface d'application (dashboard produit) façon ChatGPT / Linear / Notion, et déplacer toute la landing marketing actuelle vers `/about`.

## Ce que voit l'utilisateur

**Nouvelle `/` (app shell)**

```text
┌──────────┬─────────────────────────────────────────┐
│          │  Header : logo · recherche · langue · │
│  Sidebar │           connexion / avatar            │
│          ├─────────────────────────────────────────┤
│  Accueil │                                         │
│  Chat    │   « Bienvenue sur FulanIA »            │
│  Traduire│   Barre de prompt rapide → envoie      │
│  Diction.│   direct vers /chat                     │
│  Culture │                                         │
│  Learn   │   Grille d'outils (cartes cliquables) :│
│  Biblio. │   Chat · Traduire · Dictionnaire ·     │
│  Hub     │   Culture · Learn · Bibliothèque · Hub │
│          │                                         │
│  ─────   │   Section « Continuer » (récent) si    │
│  À propos│   connecté, sinon « Découvrir »         │
│  Contact │                                         │
│  Réglages│   Footer discret : lien /about · legal │
└──────────┴─────────────────────────────────────────┘
```

- Sidebar rétractable (icon-only) via shadcn `Sidebar` déjà installé.
- Sur mobile : sidebar en drawer (bouton hamburger dans le header).
- Header compact avec `SidebarTrigger`, sélecteur de langue, bouton connexion / avatar.
- Zone principale : prompt hero + grille d'outils au lieu du hero Sahel plein écran.

**Nouvelle `/about`**

Reçoit tel quel tout le contenu marketing actuel de `/` :
hero Sahel, tools marquee, press band, founder spotlight, comité exécutif, section contact. C'est la page « vitrine » pour partager le projet, la presse, les partenaires.

**Navigation ajoutée**

- Header/sidebar de l'app : lien discret « À propos » vers `/about`.
- Sur `/about` : header standard du site (comme aujourd'hui) + un CTA « Ouvrir l'app » qui ramène vers `/`.

## Détail technique

1. **Nouveau composant `AppShell`** (`src/components/app-shell.tsx`)
   - Wrappe `SidebarProvider` + `AppSidebar` + header + `<main>`.
   - Utilisable par `/` (et potentiellement les routes outils plus tard).

2. **Nouveau `AppSidebar`** (`src/components/app-sidebar.tsx`)
   - Groupes : **Outils** (Chat, Traduire, Dictionnaire, Culture, Learn, Bibliothèque, Hub) et **Plus** (À propos, Contact).
   - Actif basé sur `useRouterState`.
   - Collapsible `icon`.

3. **Nouvelle `/` (app home)** — réécriture de `src/routes/index.tsx`
   - Supprime hero Sahel, marquee, press, founder, comité, contact du `/`.
   - Rend `AppShell` + :
     - Bloc d'accueil bilingue court (« Bienvenue · Bismillah »).
     - `PromptInputHero` : textarea + bouton « Demander à Janngude » → redirige vers `/chat?q=...`.
     - Grille responsive de cartes outils (2 col mobile → 4 col desktop) avec icône, titre, description courte, lien.
     - Section « Continuer » (masquée pour l'instant, placeholder « bientôt »).
   - `head()` mis à jour : titre « FulanIA — Application » / description app-first.

4. **Nouvelle `/about`** (`src/routes/about.tsx`)
   - Reçoit **exactement** le JSX marketing actuel de `/` : `SiteHeader`, hero Sahel, `ToolsMarquee`, sections mission, `PressBand`, `HeroProductPreview`, founder Aw Mansour, comité exécutif, `ContactSection`, `SiteFooter`.
   - Ajoute un bouton « Ouvrir l'app → » en tête qui `<Link to="/">`.
   - `head()` : « À propos de FulanIA — La première IA Pulaar ».

5. **Header (`SiteHeader`)** dans `src/components/layout.tsx`
   - Ajoute lien « À propos » dans la nav.
   - Le reste des pages (`/chat`, `/translate`, etc.) conserve le `SiteHeader` classique.

6. **SEO / metadata**
   - `/` : title/description orientés produit (« Application Pulaar — chat, traduction, dictionnaire »).
   - `/about` : reprend l'ancien SEO de `/` (hero Sahel, presse, équipe).
   - `sitemap.xml.ts` : ajouter `/about`.

7. **Non touché**
   - Backend, edge functions, MCP, dictionnaire gate, auth, i18n, feature flags, données, config email : rien.
   - Autres routes existantes (`/chat`, `/translate`, `/dictionary`, `/culture`, `/learn`, `/library`, `/hub`, `/contact`, `/auth`) : inchangées visuellement pour ce round. On peut les migrer sous `AppShell` plus tard si tu valides le résultat sur `/`.

## Livrable

Après ces modifs :
- `/` = app shell FulanIA (sidebar + prompt + grille d'outils).
- `/about` = ta landing actuelle complète, intacte.
- Lien mutuel entre les deux.

Je n'implémente que ça — pas d'autres changements. Tu approuves ce plan ?
