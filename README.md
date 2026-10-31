# Galerie Antoine LePeintre

Site vitrine et galerie de tableaux originaux — application Next.js prête pour la production.

## Fonctionnalités

- **Galerie publique** : grille d'œuvres, filtres (disponibilité, taille, style, thème),
  badge « Nouveau » (30 jours), vue plein écran avec zoom, photos complémentaires par œuvre.
- **Administration** (`/admin`) : mot de passe, import de tableaux (métadonnées complètes,
  thème), photos multiples avec photo principale, recadrage tactile, mise en scène
  automatique (cadres classiques et caisses américaines, 7 ambiances de mur).
- **Mention de transparence** affichée : toiles originales, cadres/arrière-plans générés
  (visualisation non contractuelle).
- **Newsletter** : abonnement « Suivre la galerie » branché sur Brevo (données en UE),
  avec repli sur stockage local en base si Brevo n'est pas configuré.
- **Pages légales** : mentions légales (éditeur non professionnel) et politique de
  confidentialité RGPD.
- **Stockage** : base Postgres Neon (région Francfort), images servies avec cache long.

## Démarrage rapide (local)

```bash
cp .env.example .env   # renseigner DATABASE_URL (Neon) et ADMIN_PASSWORD
npm install
npm run dev            # http://localhost:3000
```

## Déploiement

Voir **DEPLOY.md** — guide pas à pas : Neon, Brevo, domaine, Netlify/Cloudflare Pages.
