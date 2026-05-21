## Objectif

Ajouter une page **Soutenir FulanIA** (`/support`) permettant à toute personne (connectée ou non) de contribuer au financement du projet, avec :
- dons libres (montant au choix)
- 3 paliers de soutien prédéfinis
- objectif chiffré avec barre de progression publique
- paiement par carte (Stripe intégré) **ou** lien vers une cagnotte externe
- mur public des donateurs, affichant chaque soutien **après confirmation du paiement**

---

## Parcours utilisateur

1. Depuis le Hub, le footer ou un bouton sur la home : l'utilisateur clique sur **Soutenir**.
2. Page `/support` :
   - Bandeau avec total collecté / objectif + barre de progression
   - Choix du montant : 3 paliers (Ami 10 €, Mécène 50 €, Bienfaiteur 200 €) **ou** "Autre montant"
   - Champ optionnel : nom à afficher (sinon "Anonyme") + petit message (max 200 caractères)
   - Deux boutons : **Payer par carte (Stripe)** ou **Soutenir via cagnotte externe** (lien HelloAsso/Leetchi configurable)
3. Après paiement carte réussi → redirection vers `/support/merci` qui confirme et affiche le nom du donateur dans le mur public.
4. Mur des donateurs : grille des contributions confirmées (nom + montant + message + date), triable par date ou montant.

---

## Architecture technique

### 1. Base de données (migration)

Nouvelle table `donations` :
- `amount_cents` (int), `currency` (text, défaut 'eur')
- `display_name` (text, nullable), `message` (text, nullable, max 200)
- `user_id` (uuid nullable — lié si donateur connecté)
- `status` (text : `pending` / `confirmed` / `failed`)
- `provider` (text : `stripe` / `external`)
- `stripe_session_id` (text, unique, nullable)
- `confirmed_at` (timestamptz nullable)
- created_at / updated_at

Table `fundraiser_goal` (1 ligne) :
- `goal_cents` (int, ex. 500000 = 5 000 €)
- `title`, `description`
- `external_url` (text — URL de la cagnotte externe, modifiable)

**RLS** :
- `donations` : SELECT public **uniquement** sur `status = 'confirmed'` et colonnes sûres (pas de données privées) ; INSERT/UPDATE bloqués au public (passe par server functions admin).
- `fundraiser_goal` : SELECT public, écriture admin uniquement.

Vue agrégée publique `donations_public_stats` : `total_confirmed_cents`, `donor_count`.

### 2. Server functions (TanStack `createServerFn`)

- `createDonationCheckout({ amount_cents, display_name?, message? })` → crée la ligne `donations` (status=pending) + crée une Stripe Checkout Session, retourne l'URL.
- `getFundraiserState()` → renvoie `{ goal, total_confirmed_cents, donor_count, recent_donors[] }` (via `supabaseAdmin`, projection sûre).
- `listDonors({ sort, limit })` → liste paginée des donateurs confirmés (nom, montant, message, date).

### 3. Webhook Stripe (server route publique)

Route `src/routes/api/public/webhooks/stripe.ts` :
- Vérifie la signature `Stripe-Signature` avec `STRIPE_WEBHOOK_SECRET`.
- Sur `checkout.session.completed` → met à jour la donation (`status='confirmed'`, `confirmed_at=now()`).
- Sur `payment_intent.payment_failed` → `status='failed'`.

### 4. Secrets à demander à l'utilisateur

- `STRIPE_SECRET_KEY` (clé API Stripe)
- `STRIPE_WEBHOOK_SECRET` (après création du webhook dans Stripe Dashboard)
- (Configurable en base) URL de la cagnotte externe — pas un secret.

> Note : J'utiliserai l'intégration Stripe BYOK (bring-your-own-key) plutôt que Lovable Payments / Paddle, car les **dons** ne sont pas un produit vendu — Paddle/Stripe-managed ne sont pas conçus pour ça. Stripe BYOK donne une flexibilité maximale (Checkout en mode `payment`, montants dynamiques, pas de catalogue produit nécessaire).

### 5. Frontend

Nouveaux fichiers :
- `src/routes/support.tsx` — page principale (barre progression, paliers, formulaire, mur des donateurs)
- `src/routes/support.merci.tsx` — page de confirmation après retour Stripe (utilise `session_id` pour confirmer côté serveur si webhook lent)
- `src/components/support/DonationForm.tsx`
- `src/components/support/DonorWall.tsx`
- `src/components/support/ProgressBar.tsx`

Modifications :
- `src/routes/hub.tsx` — ajout d'une 6e carte "Soutenir le projet"
- `src/components/layout.tsx` — lien "Soutenir" dans le header + footer
- `src/hooks/use-language.tsx` — ajout des clés i18n (FR/FF/EN/AR) pour toute l'UI cagnotte

### 6. Validation & sécurité

- Zod côté client **et** serveur : montant min 1 €, max 10 000 € ; `display_name` ≤ 50 chars ; `message` ≤ 200 chars ; pas d'HTML.
- Anti-doublon : `stripe_session_id` unique.
- Le mur n'affiche **jamais** d'email ou `user_id`.
- Vérification de signature webhook obligatoire avant toute écriture.

---

## Découpage en étapes (ordre d'exécution)

1. **Migration SQL** : tables `donations`, `fundraiser_goal`, vue stats, RLS, seed objectif (5 000 €).
2. Demande des secrets `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`.
3. Server functions + route webhook Stripe.
4. Pages `/support` et `/support/merci` + composants.
5. Intégration i18n (4 langues) + liens dans Hub/Header/Footer.
6. Test end-to-end avec carte test Stripe `4242 4242 4242 4242`.

---

## Hors scope (à demander plus tard si besoin)

- Reçus fiscaux / association loi 1901 (nécessite statut juridique).
- Dons récurrents mensuels (Stripe Subscriptions) — possible en V2.
- Édition admin du mur (modération de messages inappropriés) — peut être ajouté ensuite via un rôle `admin`.

Une fois le plan validé, je commencerai par la migration SQL.