# Guide de déploiement — Galerie Antoine LePeintre

Ce projet est une application Next.js complète : galerie publique + interface d'administration
+ base de données Neon + abonnement newsletter Brevo. Hébergement gratuit (hors nom de domaine).

---

## 1. Créer la base de données (Neon) — ~5 minutes

1. Créez un compte sur **https://neon.tech** (offre gratuite, aucune carte bancaire).
2. Créez un projet en choisissant la région **Frankfurt (eu-central-1)** — données physiquement en Europe.
3. Dans le tableau de bord du projet, copiez la **Connection string** (mode *Pooled* recommandé).
4. Gardez cette chaîne : elle deviendra `DATABASE_URL`.

> Le schéma de tables (artworks, photos, images, abonnés) se crée automatiquement au premier
> chargement du site — rien à faire manuellement.

## 2. Créer le compte newsletter (Brevo) — ~5 minutes

1. Créez un compte sur **https://brevo.com** (gratuit jusqu'à plusieurs centaines d'abonnés).
2. **Contacts → Listes** : créez une liste « Alertes nouveautés » et notez son identifiant numérique.
3. **SMTP & API → Clés API** : générez une clé API (v3).
4. Notez : `BREVO_API_KEY` et `BREVO_LIST_ID`.
5. **Expéditeur** : dans Brevo, validez un expéditeur. Utilisez votre adresse de contact
   `contact@antoinelepeintre.fr` (après l'étape 5) ou votre adresse personnelle (elle ne sera
   visible que par Brevo, pas sur le site).

## 3. Acheter le nom de domaine — ~10 minutes

1. Chez un registrar (OVH, Gandi, Infomaniak…), vérifiez la disponibilité de **antoinelepeintre.fr**.
2. Achetez le domaine (environ 10-15 €/an).
3. **Redirection email** : dans les options du domaine, créez l'alias
   `contact@antoinelepeintre.fr` → votre vraie boîte email (gratuit chez tous les registrars).
   Votre adresse personnelle n'apparaît jamais sur le site.

## 4. Héberger le site (Netlify ou Cloudflare Pages) — ~10 minutes

### Option Netlify (le plus simple)
1. Déposez ce dossier dans un dépôt GitHub (nouveau dépôt privé suffit).
2. Sur **https://netlify.com**, « Add new site → Import an existing project » → choisissez le dépôt.
3. Netlify détecte Next.js automatiquement. Ajoutez les variables d'environnement
   (Site settings → Environment variables) :

   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | la chaîne Neon de l'étape 1 |
   | `ADMIN_PASSWORD` | votre mot de passe admin (solide !) |
   | `SESSION_SECRET` | chaîne aléatoire longue (`openssl rand -hex 32`) |
   | `PUBLIC_CONTACT_EMAIL` | `contact@antoinelepeintre.fr` |
   | `PUBLIC_INSTAGRAM` | `https://www.instagram.com/antoinelepeintre/` |
   | `BREVO_API_KEY` | la clé Brevo (étape 2) |
   | `BREVO_LIST_ID` | l'identifiant de liste Brevo |

4. Deploy. Votre site est en ligne sur une adresse provisoire `xxx.netlify.app`.

### Option Cloudflare Pages (bande passante illimitée)
Même principe : Workers & Pages → Create → Pages → Connect to Git. Les variables
d'environnement se renseignent dans Settings → Variables and Secrets.
Paramètres de build détectés automatiquement (framework Next.js).

## 5. Relier le domaine

Dans Netlify : Domain management → Add domain → `antoinelepeintre.fr`.
Netlify affiche deux serveurs de noms (ou deux enregistrements A/CNAME) : reportez-les
dans la zone DNS de votre registrar. Propagation : de quelques minutes à 24 h.
Le HTTPS est automatique et gratuit.

## 6. Finaliser les mentions légales

Ouvrez `app/mentions-legales/page.js` et remplacez la section « Hébergeur » par les
coordonnées exactes de Netlify/Cloudflare (nom, adresse, contact) — elles figurent dans
leurs conditions d'utilisation. C'est la seule mention à compléter après déploiement.

## 7. Premier lancement

1. Allez sur `https://antoinelepeintre.fr/admin`.
2. Connectez-vous avec `ADMIN_PASSWORD`.
3. Importez vos tableaux (photo principale + photos complémentaires, recadrage, mise en scène).
4. Vérifiez la galerie publique, les filtres, le zoom plein écran et le formulaire « Suivre ».

## Mises à jour ultérieures

- **Contenu** (nouveaux tableaux, prix, statut vendu) : directement dans `/admin`, aucun déploiement.
- **Code** : modifiez le dépôt et poussez → redéploiement automatique en ~1 minute.
- **Sauvegardes** : Neon conserve l'historique de votre base (restauration possible depuis
  le tableau de bord Neon). Vous pouvez aussi exporter vos œuvres via l'API si besoin.

## Dépannage rapide

| Symptôme | Cause probable |
|---|---|
| « Galerie en préparation » | `DATABASE_URL` absente ou erronée |
| Admin refuse le mot de passe | `ADMIN_PASSWORD` différent de celui saisi |
| Abonnement « stockage local uniquement » | `BREVO_API_KEY`/`BREVO_LIST_ID` non renseignés (les emails sont quand même conservés en base) |
| Site lent au 1er chargement | mise en veille Neon : réveil automatique en quelques secondes, normal en offre gratuite |
