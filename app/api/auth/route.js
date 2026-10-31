import { NextResponse } from "next/server";
import { checkPassword, makeToken, sessionCookie, clearCookie, isAuthed } from "@/lib/auth";

export async function GET(req) {
  return NextResponse.json({ ok: await isAuthed(req) });
}

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600)); // freine les essais brutaux
    return NextResponse.json({ ok: false, error: "Mot de passe incorrect." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", sessionCookie(makeToken()));
  return res;
}

export async function DELETE(req) {
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", clearCookie());
  return res;
}
