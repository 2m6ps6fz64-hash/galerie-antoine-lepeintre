export const metadata = { title: "Politique de confidentialité — Antoine LePeintre" };

export default function Confidentialite() {
  return (
    <main className="legal">
      <h1>Politique de confidentialité</h1>

      <h2>Responsable du traitement</h2>
      <p>Antoine LePeintre, éditeur non professionnel du site (voir les mentions légales).</p>

      <h2>Données collectées</h2>
      <ul>
        <li><strong>Adresse email</strong> — uniquement si vous vous abonnez aux alertes de la galerie, pour vous informer des nouvelles œuvres publiées.</li>
        <li><strong>Messages</strong> — si vous écrivez via le bouton « Intéressé », votre message transite par votre propre logiciel email, hors de ce site.</li>
      </ul>
      <p>Aucun autre donnée personnelle n'est collectée. Le site ne dépose pas de cookies publicitaires et n'utilise pas de traceurs tiers.</p>

      <h2>Finalité et base légale</h2>
      <p>
        Les emails abonnés servent uniquement à l'envoi des alertes de la galerie (nouvelles œuvres).
        Base légale : votre consentement, recueilli lors de l'inscription. L'inscription peut être retirée à tout moment.
      </p>

      <h2>Sous-traitants</h2>
      <ul>
        <li><strong>Brevo</strong> (société française, données hébergées dans l'Union européenne) — envoi des emails d'alerte.</li>
        <li><strong>Hébergeur du site et de la base de données</strong> (cf. mentions légales).</li>
      </ul>

      <h2>Durée de conservation</h2>
      <p>Les emails abonnés sont conservés jusqu'à votre désinscription, ou au maximum 3 ans après le dernier envoi.</p>

      <h2>Vos droits</h2>
      <p>
        Conformément au RGPD et à la loi Informatique et Libertés, vous disposez de droits d'accès, de rectification,
        d'effacement, de limitation et d'opposition sur vos données. Pour les exercer, écrivez à l'adresse de contact
        indiquée dans les mentions légales. Vous pouvez également saisir la CNIL (cnil.fr).
      </p>

      <a className="back" href="/">← Retour à la galerie</a>
    </main>
  );
}
