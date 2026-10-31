import "./globals.css";

export const metadata = {
  title: "Antoine LePeintre — Peintures originales",
  description:
    "Galerie de tableaux originaux peints à la main par Antoine LePeintre. Huiles et acryliques uniques — contactez l'artiste pour acquérir une œuvre.",
  openGraph: {
    title: "Antoine LePeintre — Peintures originales",
    description: "Galerie de tableaux originaux peints à la main. Œuvres uniques, disponibles à l'acquisition.",
    type: "website",
    locale: "fr_FR",
    siteName: "Antoine LePeintre",
  },
};

export default function RootLayout({ children }) {
  const contact = process.env.PUBLIC_CONTACT_EMAIL || "contact@antoinelepeintre.fr";
  const insta = process.env.PUBLIC_INSTAGRAM || "https://www.instagram.com/antoinelepeintre/";
  return (
    <html lang="fr">
      <body>
        <nav className="nav">
          <a className="brand" href="/">ANTOINE LEPEINTRE</a>
          <div className="nav-links">
            <a href="/#galerie">Galerie</a>
            <a href="/#suivre">Suivre</a>
            <a href="/#apropos">À propos</a>
            <a href="/admin" className="admin-link">Admin</a>
          </div>
        </nav>
        {children}
        <footer className="footer">
          <div className="footer-inner">
            <p className="footer-brand">Antoine LePeintre</p>
            <p>
              <a href={insta} target="_blank" rel="noopener noreferrer">Instagram</a>
            </p>
            <p className="footer-links">
              <a href="/mentions-legales">Mentions légales</a>
              <a href="/confidentialite">Confidentialité</a>
            </p>
            <p className="footer-legal">© {new Date().getFullYear()} Antoine LePeintre — Œuvres originales protégées.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
