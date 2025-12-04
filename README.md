# Gatsun website

## A propos

Gatsun est une association étudiante de l’INSA Lyon qui gère un studio d'enregistrement et de production musicale.

Ce depot contient le code du site web de l’association, qui comprend :

- Un site vitrine public avec des informations sur l'asso et un formulaire de contact : `gatsun.fr`
- Un calendrier à usage interne à l'association qui permet aux membres de réserver le studio : `calendar.gatsun.fr` ou `gatsun.fr/calendar`

Le nom de domaine est géré par OVH.

## Stack technique

- Next.js 15 (App Router) + React 19
- Tailwind CSS v4 avec les plugins `tailwindcss-motion` et `tailwindcss-intersect` pour les animations.
- FullCalendar 6 pour l’UI du calendrier.
- PostgreSQL avec le package `pg` pour la base de donnée des évènements du calendrier
- `Resend` pour l’envoi d’emails pour le formulaire de contact, `zod` pour la validation des données du forumulaire.
- Tout est dans un seul conteneur Docker

## Fonctionnement détaillé

### Site vitrine

- Par principale : `src/app/page.tsx`.
- `ContactForm` utilise `useActionState` pour appeler la server action `sendEmail`. L’email part depuis `no-reply@gatsun.fr` vers `contact@gatsun.asso-insa-lyon.fr`.
- Les validations sont faites côté serveur via Zod ; les erreurs sont renvoyées au formulaire.

### Calendrier interne

- Aucune authentification, c'est voulu ! Les données ne sont pas sensibles et si elles sont backup régulièrement, AU PIRE, on peu rollback.
- UI FullCalendar.
- Communication avec le serveur via des server actions pour les créations/éditions/suppressions d’événements.
- **Optimistic UI & Race Conditions** :
  - Le client applique immédiatement les changements localement (Optimistic UI) pour une interface réactive.
  - Une stratégie "Last Write Wins" basée sur des timestamps (`eventMutationTimestamps`) empêche les réponses serveur obsolètes d'écraser les modifications locales récentes, évitant les problèmes de race condition lors d'éditions rapides.
  - Un état de chargement global (`isSyncing`) avec un compteur de mutations actives gère l'indicateur "Sauvegarde...".
  - Un état de chargement initial (`isInitialLoading`) bloque l'interface jusqu'à la récupération des premières données.
- **Server Sent Events (SSE)** :
  - Le serveur notifie les clients des changements via SSE.
  - Chaque client génère un `connectionId` unique envoyé lors des mutations.
  - Le serveur renvoie ce `connectionId` dans le payload SSE, permettant au client émetteur d'ignorer sa propre notification (puisqu'il a déjà mis à jour son UI localement), économisant un re-fetch inutile.
  - Les autres clients reçoivent l'événement `update` et rechargent les données.
  - Le SSE diffuse également le nombre de spectateurs connectés (`viewers`).
- Les événements sont stockés dans la table `calendar_events`. 
- Si ils ont l'attribut `repeat_weekly` à 1, ils sont récurrents et seront dupliqués toutes les semaines quand le serveur enverra la liste des évènements au client.
- Il y a une table `calendar_event_exceptions`. Si une occurence est présente dans cette table, elle ne sera pas affichée.
- Cela permet l'édition/suppression/déplacement d'une seule occurence de l'évènement.

### Dashboard admin

- Accessible via `/admin`. La page racine redirige automatiquement vers `/admin/login` si aucun cookie `admin_session` valide n’est présent et vers `/admin/dashboard` lorsqu’une session signée est détectée.
- Authentification par mot de passe unique : l’action serveur `loginAction` compare le mot de passe au hash `ADMIN_PASSWORD_HASH` (bcrypt). En cas de succès, `createSession` signe un cookie HMAC avec `ADMIN_SESSION_SECRET` valable 1 heure. `logoutAction` supprime simplement ce cookie.
- L’écran `/admin/dashboard` charge le JSON des tarifs via `getPricingData` qui lit `site_settings.key = 'pricing_data'`. Le JSON parsé est injecté dans `PricingCards` pour offrir une prévisualisation live identique au site public.
- L’édition s’effectue directement dans un textarea (JSON brut). Un clic sur « Enregistrer » affiche une modale de confirmation avant d’appeler `updatePricingData`, qui revérifie la session, revalide la structure (`services[]` + `footnotes[]`) puis persiste le JSON en base.
- En cas d’erreur serveur ou de JSON invalide, un message est affiché ; les succès rafraîchissent simplement la notification « Tarifs mis à jour ». Aucun rafraîchissement complet n’est nécessaire.

### Middleware

- `src/middleware.ts` réécrit toute requête destinée à un sous-domaine `calendar.*` vers `/calendar` et ajoute `X-Robots-Tag: noindex, nofollow` pour éviter l’indexation par les moteurs de recherche du calendrier interne.
- Les autres routes sont servies normalement par le routeur Next.js.

## Variables d’environnement

Créez un `.env` en fournissez ces variables :

| Variable | Description |
| --- | --- |
| `RESEND_API_KEY` | Jeton API Resend ; indispensable pour envoyer les emails de contact. |
| `DATABASE_URL` | URL de connexion à la base de données PostgreSQL. Exemple : `postgres://user:password@host:port` |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt du mot de passe du dashboard admin. Générer via `node scripts/hash-password.js` et copier la valeur proposée. |
| `ADMIN_SESSION_SECRET` | Clé utilisée pour signer le cookie `admin_session`. N'importe quelle chaîne longue et secrète fonctionne. |

## Lancer le projet en local

Il faut avoir npm installé sur son ordinateur, puis dans le dossier du projet, lancez :

```bash
npm install
npm run dev
```

- `RESEND_API_KEY` peut rester vide en dev : le formulaire affichera une erreur d’envoi mais le reste du site fonctionne.

