import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { sql, initDB, deleteImage } from "@/lib/db";

// PATCH : actions rapides sur une œuvre (vendu, retrait de la mise en scène, photo principale)
export async function PATCH(req) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  await initDB();
  const { id, action } = await req.json().catch(() => ({}));
  const s = sql();
  if (!id || !action) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

  if (action === "toggle-sold") {
    await s`UPDATE artworks SET sold = NOT sold WHERE id = ${Number(id)}`;
    return NextResponse.json({ ok: true });
  }
  if (action === "strip-scene") {
    const old = await s`SELECT render_image_id AS rid FROM artworks WHERE id = ${Number(id)}`;
    await s`UPDATE artworks SET render_image_id = NULL, cadre = 'aucun', fond = 'aucun' WHERE id = ${Number(id)}`;
    await deleteImage(old[0]?.rid);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
