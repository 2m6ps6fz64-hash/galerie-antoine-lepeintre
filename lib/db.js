import { neon } from "@neondatabase/serverless";

let _sql = null;
export function sql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL manquante — voir .env.example");
  }
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

let _ready = null;
export function initDB() {
  if (!_ready) {
    _ready = (async () => {
      const s = sql();
      await s`
        CREATE TABLE IF NOT EXISTS images (
          id SERIAL PRIMARY KEY,
          data TEXT NOT NULL,            -- JPEG base64 (data URL)
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS artworks (
          id SERIAL PRIMARY KEY,
          titre TEXT NOT NULL,
          technique TEXT NOT NULL DEFAULT 'Huile sur toile',
          style TEXT NOT NULL DEFAULT 'Abstrait',
          theme TEXT NOT NULL DEFAULT '',
          taille TEXT NOT NULL DEFAULT 'moyen',
          largeur INT NOT NULL DEFAULT 0,
          hauteur INT NOT NULL DEFAULT 0,
          annee TEXT NOT NULL DEFAULT '',
          commentaire TEXT NOT NULL DEFAULT '',
          sold BOOLEAN NOT NULL DEFAULT false,
          cadre TEXT NOT NULL DEFAULT 'aucun',
          fond TEXT NOT NULL DEFAULT 'aucun',
          render_image_id INT REFERENCES images(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        CREATE TABLE IF NOT EXISTS artwork_photos (
          id SERIAL PRIMARY KEY,
          artwork_id INT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
          image_id INT NOT NULL REFERENCES images(id) ON DELETE CASCADE,
          position INT NOT NULL DEFAULT 0,
          original_image_id INT REFERENCES images(id) ON DELETE SET NULL
        );
        CREATE TABLE IF NOT EXISTS subscribers (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          source TEXT NOT NULL DEFAULT 'site',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `;
    })();
  }
  return _ready;
}

// Œuvres avec leurs photos (photo principale = position 0)
export async function getArtworks() {
  await initDB();
  const rows = await sql()`
    SELECT a.*, r.data AS render_data,
           (SELECT json_agg(json_build_object('id', p.id, 'position', p.position, 'image_id', p.image_id) ORDER BY p.position)
              FROM artwork_photos p WHERE p.artwork_id = a.id) AS photos
    FROM artworks a
    LEFT JOIN images r ON r.id = a.render_image_id
    ORDER BY a.created_at DESC, a.id DESC`;
  return rows.map((a) => ({
    id: a.id,
    titre: a.titre,
    technique: a.technique,
    style: a.style,
    theme: a.theme,
    taille: a.taille,
    largeur: a.largeur,
    hauteur: a.hauteur,
    annee: a.annee,
    commentaire: a.commentaire,
    sold: a.sold,
    cadre: a.cadre,
    fond: a.fond,
    createdAt: a.created_at,
    renderUrl: a.render_data ? `/api/images/${a.render_image_id}` : null,
    photos: (a.photos || []).map((p) => ({
      id: p.id,
      position: p.position,
      url: `/api/images/${p.image_id}`,
    })),
  }));
}

export async function getArtwork(id) {
  const all = await getArtworks();
  return all.find((a) => a.id === Number(id)) || null;
}

// Stocke une image (data URL JPEG) et renvoie son id
export async function saveImage(dataUrl) {
  await initDB();
  const rows = await sql()`INSERT INTO images (data) VALUES (${dataUrl}) RETURNING id`;
  return rows[0].id;
}

export async function deleteImage(id) {
  if (!id) return;
  await sql()`DELETE FROM images WHERE id = ${Number(id)}`;
}
