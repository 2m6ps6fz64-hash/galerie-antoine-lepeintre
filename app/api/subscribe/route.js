import { NextResponse } from "next/server";
import { sql, initDB } from "@/lib/db";

// Abonnement « Suivre la galerie » : stocke l'email localement et,
// si configuré, l'ajoute à la liste Brevo (double conformité RGPD).
export async function POST(req) {
  await initDB();
  const { email } = await req.json().catch(() => ({}));
  const clean = String(email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(clean)) {
    return NextResponse.json({ ok: false, error: "Email invalide" }, { status: 400 });
  }

  const s = sql();
  await s`INSERT INTO subscribers (email) VALUES (${clean})
         ON CONFLICT (email) DO NOTHING`;

  let brevo = "non-configuré (stockage local uniquement)";
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;
  if (apiKey && listId) {
    try {
      const r = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: { "api-key": apiKey, "Content-Type": "application/json", "accept": "application/json" },
        body: JSON.stringify({ email: clean, updateEnabled: true, listIds: [Number(listId)] }),
      });
      brevo = r.ok ? "ajouté à Brevo" : `Brevo a répondu ${r.status}`;
    } catch { brevo = "Brevo injoignable (email conservé localement)"; }
  }
  return NextResponse.json({ ok: true, brevo });
}
