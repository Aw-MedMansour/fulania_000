# FulanIA 🌍

**L'intelligence artificielle au service du Pulaagu.**

FulanIA est un assistant d'intelligence artificielle capable de comprendre, de parler et de traduire la langue pulaar (fulfulde / pular). C'est une IA spécialisée, entièrement dédiée à la préservation et à la valorisation de la langue et de la culture peules.

🌐 **Site en ligne :** [fulania.com](https://fulania.com)

## ✨ Fonctionnalités

- **Assistant conversationnel** — répond à vos questions en pulaar (langue par défaut) et dans d'autres langues, sur la culture, l'histoire, la science et l'actualité
- **Traduction** — traduction entre le pulaar, le français, l'anglais et l'arabe, avec prise en charge des variantes dialectales
- **Dictionnaire trilingue** — plus de 8 000 entrées pulaar ↔ français / anglais / arabe, classées par dialecte, catégorie et domaine
- **Leçons et exercices** — parcours d'apprentissage générés par IA, missions quotidiennes et suivi de progression
- **Correction de textes** — aide à la rédaction en pulaar
- **Vocal** — synthèse et reconnaissance vocale
- **Serveur MCP public** — les capacités de FulanIA sont exposées via un serveur MCP (`/mcp`) pour les agents IA externes

## 🛠 Pile technique

| Domaine | Technologie |
|---|---|
| Frontend | React 19, TanStack Start (SSR), Tailwind CSS v4 |
| Backend | Lovable Cloud (Supabase) — base de données, authentification, stockage |
| IA | Lovable AI Gateway |
| Déploiement | Edge (Cloudflare Workers) |

## 🚀 Lancer le projet en local

```bash
# Installer les dépendances
bun install

# Lancer le serveur de développement
bun run dev
```

L'application est alors disponible sur `http://localhost:8080`.

> Les variables d'environnement (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`) sont gérées automatiquement par Lovable Cloud.

## 📁 Structure du projet

```
src/
├── routes/          # Pages et routes API (TanStack Router)
├── components/      # Composants d'interface
├── lib/             # Logique partagée, outils MCP, fonctions serveur
├── integrations/    # Clients générés (base de données, auth)
└── styles.css       # Thème et design tokens
```

## 🤝 Soutenir FulanIA

FulanIA est développée par une équipe de jeunes étudiants engagés. Vous pouvez soutenir le projet depuis la page [Soutenir](https://fulania.com/support).

## 📬 Contact

- Email : contact.fulania@gmail.com
- WhatsApp : +222 32 25 67 18
