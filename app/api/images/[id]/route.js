import { sql, initDB } from "@/lib/db";

// Sert une image stockée en base (JPEG base64) avec un cache navigateur long.
export async function GET(req, { params }) {
  await initDB();
  const { id } = await params;
  const rows = await sql()`SELECT data FROM images WHERE id = ${Number(id)}`;
  if (!rows.length) return new Response("Not found", { status: 404 });
  const dataUrl = rows[0].data;
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const bytes = Buffer.from(base64, "base64");
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
