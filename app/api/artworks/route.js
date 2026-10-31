import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getArtworks, sql, initDB, deleteImage } from "@/lib/db";

// GET : liste publique des œuvres
export async function GET() {
  return NextResponse.json({ artworks: await getArtworks() });
}

// POST : création (admin) — payload { artwork, photos: [{ dataUrl, originalDataUrl }] }
export async function POST(req) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await initDB();
  const body = await req.json();
  const a = body.artwork || {};
  if (!a.titre || !String(a.titre).trim()) {
    return NextResponse.json({ error: "Titre requis" }, { status: 400 });
  }
  const s = sql();
  const rows = await s`
    INSERT INTO artworks (titre, technique, style, theme, taille, largeur, hauteur, annee, commentaire, sold, cadre, fond)
    VALUES (${a.titre}, ${a.technique || "Huile sur toile"}, ${a.style || "Abstrait"}, ${a.theme || ""},
            ${a.taille || "moyen"}, ${+a.largeur || 0}, ${+a.hauteur || 0}, ${a.annee || ""},
            ${a.commentaire || ""}, ${!!a.sold}, ${a.cadre || "aucun"}, ${a.fond || "aucun"})
    RETURNING id`;
  const id = rows[0].id;
  await attachExtras(id, body);
  return NextResponse.json({ ok: true, id });
}

// PUT : modification (admin) — même payload avec artwork.id
export async function PUT(req) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await initDB();
  const body = await req.json();
  const a = body.artwork || {};
  if (!a.id) return NextResponse.json({ error: "id manquant" }, { status: 400 });
  const s = sql();
  await s`
    UPDATE artworks SET
      titre = ${a.titre}, technique = ${a.technique || "Huile sur toile"}, style = ${a.style || "Abstrait"},
      theme = ${a.theme || ""}, taille = ${a.taille || "moyen"}, largeur = ${+a.largeur || 0},
      hauteur = ${+a.hauteur || 0}, annee = ${a.annee || ""}, commentaire = ${a.commentaire || ""},
      sold = ${!!a.sold}, cadre = ${a.cadre || "aucun"}, fond = ${a.fond || "aucun"}
    WHERE id = ${Number(a.id)}`;
  // Remplacement complet des photos et du rendu
  const old = await s`SELECT render_image_id AS rid FROM artworks WHERE id = ${Number(a.id)}`;
  await s`DELETE FROM artwork_photos WHERE artwork_id = ${Number(a.id)}`;
  await s`UPDATE artworks SET render_image_id = NULL WHERE id = ${Number(a.id)}`;
  await deleteImage(old[0]?.rid);
  await attachExtras(a.id, body);
  return NextResponse.json({ ok: true, id: a.id });
}

// DELETE : suppression (admin) — ?id=
export async function DELETE(req) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await initDB();
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });
  const s = sql();
  const old = await s`SELECT render_image_id AS rid FROM artworks WHERE id = ${id}`;
  await s`DELETE FROM artwork_photos WHERE artwork_id = ${id}`;
  await s`DELETE FROM artworks WHERE id = ${id}`;
  await deleteImage(old[0]?.rid);
  return NextResponse.json({ ok: true });
}

// Enregistre les photos (et l'éventuel rendu mis en scène) d'une œuvre
async function attachExtras(artworkId, body) {
  const s = sql();
  const photos = body.photos || [];
  let pos = 0;
  for (const p of photos) {
    if (!p?.dataUrl) { pos += 1; continue; }
    const imgRows = await s`INSERT INTO images (data) VALUES (${p.dataUrl}) RETURNING id`;
    const imageId = imgRows[0].id;
    let originalId = null;
    if (p.originalDataUrl) {
      const oRows = await s`INSERT INTO images (data) VALUES (${p.originalDataUrl}) RETURNING id`;
      originalId = oRows[0].id;
    }
    await s`INSERT INTO artwork_photos (artwork_id, image_id, position, original_image_id)
            VALUES (${artworkId}, ${imageId}, ${pos}, ${originalId})`;
    pos += 1;
  }
  if (body.renderDataUrl) {
    const rRows = await s`INSERT INTO images (data) VALUES (${body.renderDataUrl}) RETURNING id`;
    await s`UPDATE artworks SET render_image_id = ${rRows[0].id} WHERE id = ${artworkId}`;
  }
}
