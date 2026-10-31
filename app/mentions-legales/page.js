export const metadata = { title: "Mentions légales — Antoine LePeintre" };

export default function MentionsLegales() {
  const contact = process.env.PUBLIC_CONTACT_EMAIL || "contact@antoinelepeintre.fr";
  return (
    <main className="legal">
      <h1>Mentions légales</h1>

      <h2>Éditeur du site</h2>
      <p>
        Ce site est édité à titre non professionnel par Antoine LePeintre (artiste peintre), en France.
        Contact : <a href={`mailto:${contact}`} style={{ color: "#b08d57" }}>{contact}</a>.
      </p>
      <p>
        Conformément à l'article 1-1 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN),
        l'éditeur non professionnel communique ses éléments d'identification à son hébergeur, dont les coordonnées figurent ci-dessous.
      </p>

      <h2>Directeur de la publication</h2>
      <p>Antoine LePeintre.</p>

      <h2>Hébergeur</h2>
      <p>
        Le site est hébergé par l'hébergeur indiqué dans les informations de déploiement
        (Cloudflare Pages / Netlify — cf. la page « Conditions » ou la documentation de l'hébergeur affichée lors de la mise en ligne).
        <strong>À compléter au déploiement</strong> : nom, raison sociale, adresse, téléphone et email de l'hébergeur.
      </p>

      <h2>Base de données</h2>
      <p>
        Les données des œuvres sont stockées sur un serveur de base de données situé dans l'Union européenne (région Francfort, Allemagne).
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L'ensemble des œuvres présentées sur ce site (tableaux, photographies d'œuvres) est protégé par le droit d'auteur.
        Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite de l'artiste est interdite.
        Les rendus de cadres et d'arrière-plans sont des visualisations générées automatiquement, à titre non contractuel.
      </p>

      <a className="back" href="/">← Retour à la galerie</a>
    </main>
  );
}
