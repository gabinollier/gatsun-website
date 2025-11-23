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
- Le serveur modifie la DB et notifie les clients du changement via un Server Sent Event (SSE).
- Quand un client reçoit un message SSE `update`, il recharge tous les événements affichés.
- Les événements sont stockés dans la table `calendar_events`. 
- Si ils ont l'attribut `repeat_weekly` à 1, ils sont récurrents et seront dupliqués toutes les semaines quand le serveur enverra la liste des évènements au client.
- Il y a une table `calendar_event_exceptions`. Si une occurence est présente dans cette table, elle ne sera pas affichée.
- Cela permet l'édition/suppression/déplacement d'une seule occurence de l'évènement.

### Middleware

- `src/middleware.ts` réécrit toute requête destinée à un sous-domaine `calendar.*` vers `/calendar` et ajoute `X-Robots-Tag: noindex, nofollow` pour éviter l’indexation par les moteurs de recherche du calendrier interne.
- Les autres routes sont servies normalement par le routeur Next.js.

## Variables d’environnement

Créez un `.env` en fournissez ces variables :

| Variable | Description |
| --- | --- |
| `RESEND_API_KEY` | Jeton API Resend ; indispensable pour envoyer les emails de contact. |
| `DATABASE_URL` | URL de connexion à la base de données PostgreSQL. Exemple : `postgres://user:password@host:port` |

## Lancer le projet en local

Il faut avoir npm installé sur son ordinateur, puis dans le dossier du projet, lancez :

```bash
npm install
npm run dev
```

- `RESEND_API_KEY` peut rester vide en dev : le formulaire affichera une erreur d’envoi mais le reste du site fonctionne.

## Evolutions possibles

- Petit dashboard pour pouvoir changer les tarifs affichés sur le site vitrine sans avoir à modifier le code.