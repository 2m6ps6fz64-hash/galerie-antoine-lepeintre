import { getArtworks } from "@/lib/db";
import Gallery from "@/components/Gallery";

export const dynamic = "force-dynamic";

export default async function Home() {
  let artworks = [];
  try {
    artworks = await getArtworks();
  } catch (e) {
    return (
      <main className="legal">
        <h1>Galerie en préparation</h1>
        <p>La base de données n'est pas encore configurée. Renseignez la variable <code>DATABASE_URL</code> (voir le fichier <code>.env.example</code> et le guide de déploiement).</p>
      </main>
    );
  }
  return <Gallery artworks={artworks} />;
}
