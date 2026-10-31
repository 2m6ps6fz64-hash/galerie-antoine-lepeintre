"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const TAILLES = ["grand", "moyen", "petit"];
const STYLES = ["Abstrait", "Paysage", "Portrait", "Animalier", "Nature morte", "Urbain", "Autre"];
const TECHNIQUES = ["Huile sur toile", "Acrylique sur toile", "Mixte sur toile", "Aquarelle", "Autre"];
const THEMES_SUGGERES = ["Paysage", "Montagne", "Mer", "Nature", "Urbain", "Portrait", "Animalier", "Abstrait", "Onirique", "Nature morte"];
const CADRES = [["aucun", "Sans cadre"], ["noir", "Bois noir mat"], ["chene", "Chêne naturel"], ["or", "Doré classique"],
  ["caisse-noir", "Caisse américaine noire"], ["caisse-chene", "Caisse américaine chêne"], ["caisse-blanc", "Caisse américaine blanche"]];
const FONDS = [["aucun", "Aucun"], ["clair", "Mur clair, lumière douce"], ["sombre", "Mur sombre, galerie"], ["sauge", "Vert sauge"],
  ["bleu-gris", "Bleu-gris"], ["terracotta", "Terracotta"], ["vert-fonce", "Vert profond"], ["bleu-nuit", "Bleu nuit"]];

const MURS = {
  clair: { wall1: "#f6f3ed", wall2: "#e9e4da", spot: "rgba(255,252,240,.5)", floor: "#d8c9b2", floorLine: "rgba(120,95,60,.25)" },
  sombre: { wall1: "#3b3b40", wall2: "#232327", spot: "rgba(255,220,160,.28)", floor: "#45403a", floorLine: "rgba(0,0,0,.4)" },
  sauge: { wall1: "#dce0d4", wall2: "#c0c8b2", spot: "rgba(255,255,245,.4)", floor: "#cdbfa4", floorLine: "rgba(90,100,70,.3)" },
  "bleu-gris": { wall1: "#d8dee4", wall2: "#b8c2cc", spot: "rgba(255,255,255,.35)", floor: "#a6a89d", floorLine: "rgba(60,70,90,.3)" },
  terracotta: { wall1: "#e8d0bc", wall2: "#d2a98d", spot: "rgba(255,240,220,.4)", floor: "#b3987e", floorLine: "rgba(120,70,40,.3)" },
  "vert-fonce": { wall1: "#41524a", wall2: "#2b3a33", spot: "rgba(255,235,200,.25)", floor: "#3a342c", floorLine: "rgba(0,0,0,.45)" },
  "bleu-nuit": { wall1: "#3d4756", wall2: "#272f3b", spot: "rgba(220,230,255,.22)", floor: "#33302b", floorLine: "rgba(0,0,0,.45)" },
};

// ---------- Utilitaires image (navigateur) ----------
function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

function fileToDataUrl(file, maxDim = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const ratio = Math.min(1, maxDim / Math.max(width, height));
        width = Math.round(width * ratio); height = Math.round(height * ratio);
        const c = document.createElement("canvas");
        c.width = width; c.height = height;
        c.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(c.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = () => reject(new Error("decode"));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function cropPhoto(src, rect, dispW, dispH) {
  const img = await loadImage(src);
  const sx = rect.x / dispW * img.width, sy = rect.y / dispH * img.height;
  const sw = rect.w / dispW * img.width, sh = rect.h / dispH * img.height;
  const c = document.createElement("canvas");
  c.width = Math.round(sw); c.height = Math.round(sh);
  c.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.75);
}

// Mise en scène : toile + cadre + arrière-plan (identique au prototype)
async function composeScene(photo, cadre, fond) {
  cadre = cadre || "aucun"; fond = fond || "aucun";
  const W = 900, H = 675;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  const mur = MURS[fond];
  if (mur) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, mur.wall1); g.addColorStop(1, mur.wall2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const spot = ctx.createRadialGradient(W / 2, H * 0.22, 50, W / 2, H * 0.22, W * 0.7);
    spot.addColorStop(0, mur.spot); spot.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = spot; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = mur.floor; ctx.fillRect(0, H * 0.84, W, H * 0.16);
    ctx.fillStyle = mur.floorLine; ctx.fillRect(0, H * 0.84, W, 3);
  } else { ctx.fillStyle = "#efece6"; ctx.fillRect(0, 0, W, H); }
  const img = await loadImage(photo);
  const isCaisse = cadre.startsWith("caisse");
  const pw = W * (fond === "aucun" ? 0.92 : 0.56);
  let dw = pw, dh = Math.round(pw * img.height / img.width);
  if (dh > H * 0.62) { dh = Math.round(H * 0.62); dw = Math.round(dh * img.width / img.height); }
  const bw = (W - dw) / 2, bh = (H - dh) / 2 - (fond === "aucun" ? 0 : H * 0.02);
  const F = Math.max(8, Math.round(dw * 0.045));
  const G = isCaisse ? Math.max(7, Math.round(dw * 0.022)) : 0;
  const Cf = isCaisse ? Math.max(10, Math.round(dw * 0.032)) : F;
  const out = isCaisse ? G + Cf : F;
  const M = cadre !== "aucun" && !isCaisse ? Math.round(F * 0.9) : 0;
  ctx.save();
  if (cadre === "aucun") {
    ctx.shadowColor = "rgba(0,0,0,.28)"; ctx.shadowBlur = 22; ctx.shadowOffsetY = 10;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(bw, bh, dw, dh);
  } else {
    ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    ctx.fillStyle = (cadre === "noir" || cadre === "caisse-noir") ? "#1c1c1e" : "#c9a468";
    ctx.fillRect(bw - out, bh - out, dw + 2 * out, dh + 2 * out);
  }
  ctx.restore();
  if (cadre !== "aucun") {
    const x0 = bw - out, y0 = bh - out, fw = dw + 2 * out, fh = dh + 2 * out;
    const drawFrame = (fill) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x0, y0, fw, Cf);
      ctx.fillRect(x0, y0 + fh - Cf, fw, Cf);
      ctx.fillRect(x0, y0, Cf, fh);
      ctx.fillRect(x0 + fw - Cf, y0, Cf, fh);
    };
    if (cadre === "noir") {
      const g = ctx.createLinearGradient(x0, 0, x0 + fw, 0);
      g.addColorStop(0, "#26262a"); g.addColorStop(0.5, "#131316"); g.addColorStop(1, "#2b2b2f");
      drawFrame(g);
    } else if (cadre === "chene" || cadre === "caisse-chene") {
      const g = ctx.createLinearGradient(x0, y0, x0 + fw, y0 + fh);
      g.addColorStop(0, "#c89a5e"); g.addColorStop(0.5, "#a3743f"); g.addColorStop(1, "#c08b52");
      drawFrame(g);
      ctx.strokeStyle = "rgba(90,60,30,.25)"; ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x0, y0 + (i + 0.5) * Cf / 3); ctx.lineTo(x0 + fw, y0 + (i + 0.5) * Cf / 3); ctx.stroke(); }
    } else if (cadre === "caisse-noir") {
      const g = ctx.createLinearGradient(x0, y0, x0 + fw, y0 + fh);
      g.addColorStop(0, "#2e2e32"); g.addColorStop(0.5, "#16161a"); g.addColorStop(1, "#333338");
      drawFrame(g);
    } else if (cadre === "caisse-blanc") {
      const g = ctx.createLinearGradient(x0, y0, x0 + fw, y0 + fh);
      g.addColorStop(0, "#fbfaf7"); g.addColorStop(0.5, "#e8e4dc"); g.addColorStop(1, "#f4f1ea");
      drawFrame(g);
    } else {
      const g = ctx.createLinearGradient(x0, y0, x0 + fw, y0 + fh);
      g.addColorStop(0, "#e8c96a"); g.addColorStop(0.45, "#b98f2e"); g.addColorStop(0.7, "#f0da8e"); g.addColorStop(1, "#a87e24");
      drawFrame(g);
    }
    if (M) { ctx.fillStyle = "#f8f6f1"; ctx.fillRect(bw - M, bh - M, dw + 2 * M, dh + 2 * M); }
    if (isCaisse) {
      ctx.strokeStyle = "rgba(0,0,0,.2)"; ctx.lineWidth = 2;
      ctx.strokeRect(bw - G, bh - G, dw + 2 * G, dh + 2 * G);
      ctx.fillStyle = "rgba(0,0,0,.12)";
      ctx.fillRect(bw, bh, dw, Math.max(3, G / 3));
    }
  }
  ctx.drawImage(img, bw, bh, dw, dh);
  return c.toDataURL("image/jpeg", 0.85);
}

// ---------- Fenêtre de recadrage ----------
function CropModal({ photo, onValidate, onCancel }) {
  const [rect, setRect] = useState(null);
  const [start, setStart] = useState(null);
  const [disp, setDisp] = useState(null);
  const boxRef = useRef(null);

  function pos(e) {
    const r = boxRef.current.getBoundingClientRect();
    return { x: Math.max(0, Math.min(r.width, e.clientX - r.left)), y: Math.max(0, Math.min(r.height, e.clientY - r.top)) };
  }
  async function validate() {
    if (!rect || rect.w < 20 || rect.h < 20) { onCancel(); return; }
    onValidate(await cropPhoto(photo, rect, disp.w, disp.h));
  }
  return (
    <div className="crop-modal" onClick={onCancel}>
      <div className="crop-box" onClick={(e) => e.stopPropagation()}>
        <h3>Recadrer la photo</h3>
        <p className="hint">Tracez un rectangle avec le doigt ou la souris, puis validez.</p>
        <div
          ref={boxRef} className="crop-area" style={{ touchAction: "none" }}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); e.preventDefault(); setStart(pos(e)); setRect(null); }}
          onPointerMove={(e) => { if (!start) return; e.preventDefault(); const p = pos(e); setRect({ x: Math.min(start.x, p.x), y: Math.min(start.y, p.y), w: Math.abs(p.x - start.x), h: Math.abs(p.y - start.y) }); }}
          onPointerUp={() => setStart(null)}
        >
          <img src={photo} alt="" onLoad={(e) => setDisp({ w: e.target.clientWidth, h: e.target.clientHeight })} draggable={false} />
          {rect && <div className="crop-rect" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }} />}
        </div>
        <div className="crop-actions">
          <button className="btn-dark" onClick={validate} disabled={!rect || !disp}>Recadrer</button>
          <button className="btn-plain" onClick={onCancel}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Formulaire ----------
const EMPTY = { titre: "", technique: TECHNIQUES[0], style: STYLES[0], theme: "", taille: "moyen", largeur: "", hauteur: "", annee: "", commentaire: "", sold: false, cadre: "aucun", fond: "aucun" };

function ArtworkForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(() => ({ ...EMPTY, ...(initial ? { ...initial, largeur: initial.largeur || "", hauteur: initial.hauteur || "" } : {}) }));
  const [photos, setPhotos] = useState(() => (initial?.photos || []).map((p) => ({ dataUrl: p.url, original: null, existingId: p.id })));
  const [preview, setPreview] = useState(null);
  const [cropIdx, setCropIdx] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    let ok = true;
    const main = photos[0]?.dataUrl;
    if (!main) { setPreview(null); return; }
    composeScene(main, f.cadre, f.fond).then((d) => { if (ok) setPreview(d); }).catch(() => {});
    return () => { ok = false; };
  }, [photos[0]?.dataUrl, f.cadre, f.fond]);

  async function readFiles(list, mode) {
    const files = Array.from(list || []);
    if (!files.length) return;
    setBusy(true); setError(null);
    const added = [];
    for (const file of files) {
      if (/\.heic$/i.test(file.name) || file.type === "image/heic") { setError("Les photos .HEIC d'iPhone ne sont pas lisibles ici. Exportez-la en JPG puis réessayez."); continue; }
      try { added.push(await fileToDataUrl(file)); }
      catch { setError(`Impossible de lire « ${file.name} ». Essayez un JPG ou PNG.`); }
    }
    if (added.length) {
      setPhotos((prev) => (mode === "main" ? added.map((d) => ({ dataUrl: d, original: null })) .concat(prev.slice(1)) : [...prev, ...added.map((d) => ({ dataUrl: d, original: null }))]));
    }
    setBusy(false);
  }

  function setMain(i) { setPhotos((prev) => [prev[i], ...prev.filter((_, j) => j !== i)]); }
  function removePhoto(i) { setPhotos((prev) => prev.filter((_, j) => j !== i)); }

  async function submit(e) {
    e.preventDefault();
    if (!f.titre.trim()) return;
    setBusy(true);
    let renderDataUrl = null;
    if (photos[0] && (f.cadre !== "aucun" || f.fond !== "aucun")) {
      try { renderDataUrl = await composeScene(photos[0].dataUrl, f.cadre, f.fond); } catch { renderDataUrl = null; }
    }
    // Les photos existantes non modifiées sont renvoyées par leur id (pas de ré-upload)
    const payloadPhotos = photos.map((p) =>
      p.existingId && !p.dataUrl.startsWith("data:")
        ? { existingId: p.existingId }
        : { dataUrl: p.dataUrl, originalDataUrl: p.original }
    );
    await onSave({
      artwork: { ...f, id: initial?.id, largeur: +f.largeur || 0, hauteur: +f.hauteur || 0 },
      photos: payloadPhotos,
      renderDataUrl,
    });
    setBusy(false);
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <h3 style={{ fontWeight: "normal", fontSize: 20, marginBottom: 16 }}>{initial ? "Modifier le tableau" : "Importer un nouveau tableau"}</h3>
      <div className="form-grid">
        <div className="full"><label className="field-label">Titre *</label><input className="field-input" value={f.titre} onChange={set("titre")} required /></div>
        <div><label className="field-label">Style</label>
          <select className="field-input" value={f.style} onChange={set("style")}>{STYLES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><label className="field-label">Technique</label>
          <select className="field-input" value={f.technique} onChange={set("technique")}>{TECHNIQUES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><label className="field-label">Thème</label>
          <input className="field-input" list="themes" value={f.theme || ""} onChange={set("theme")} placeholder="Ex. Montagne, Mer…" />
          <datalist id="themes">{THEMES_SUGGERES.map((t) => <option key={t}>{t}</option>)}</datalist></div>
        <div><label className="field-label">Taille</label>
          <select className="field-input" value={f.taille} onChange={set("taille")}>{TAILLES.map((t) => <option key={t} style={{ textTransform: "capitalize" }}>{t}</option>)}</select></div>
        <div><label className="field-label">Largeur (cm)</label><input className="field-input" type="number" min="0" value={f.largeur} onChange={set("largeur")} /></div>
        <div><label className="field-label">Hauteur (cm)</label><input className="field-input" type="number" min="0" value={f.hauteur} onChange={set("hauteur")} /></div>
        <div><label className="field-label">Année</label><input className="field-input" type="number" min="1900" max="2100" placeholder="2026" value={f.annee} onChange={set("annee")} /></div>
        <div className="full"><label className="field-label">Commentaire</label><textarea className="field-input" value={f.commentaire} onChange={set("commentaire")} placeholder="Quelques mots sur l'œuvre…" /></div>

        <div className="full">
          <label className="field-label">Photos — la 1ʳᵉ est la principale</label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 10 }}>
            <div className="photo-preview">
              {preview ? <img src={preview} alt="" /> : (photos[0] ? <img src={photos[0].dataUrl} alt="" /> : "Aperçu (photo principale)")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label className="btn-upload">{busy ? "Traitement…" : "Photo principale…"}
                <input type="file" accept="image/*" hidden onChange={(e) => { readFiles(e.target.files, "main"); e.target.value = ""; }} /></label>
              <label className="btn-upload secondary">＋ Photos complémentaires…
                <input type="file" accept="image/*" multiple hidden onChange={(e) => { readFiles(e.target.files, "more"); e.target.value = ""; }} /></label>
            </div>
          </div>
          {photos.length > 0 && (
            <div className="photo-thumbs">
              {photos.map((p, i) => (
                <div key={i} className="photo-thumb">
                  <img src={p.dataUrl} alt="" />
                  {i === 0 && <span className="tag">Principale</span>}
                  <div className="ops">
                    <button type="button" title="Recadrer" onClick={() => setCropIdx(i)}>✂</button>
                    {i !== 0 && <button type="button" title="Définir principale" onClick={() => setMain(i)}>★</button>}
                    <button type="button" title="Retirer" onClick={() => removePhoto(i)} style={{ color: "#b0413e" }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && <p style={{ color: "#b0413e", fontSize: 12, marginTop: 8 }}>⚠️ {error}</p>}
        </div>

        <div className="full">
          <div className="scene-box">
            <label className="field-label">Mise en scène automatique (optionnel)</label>
            <div className="form-grid" style={{ marginTop: 8 }}>
              <div><label className="field-label">Cadre</label>
                <select className="field-input" value={f.cadre || "aucun"} onChange={set("cadre")}>
                  {CADRES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select></div>
              <div><label className="field-label">Arrière-plan</label>
                <select className="field-input" value={f.fond || "aucun"} onChange={set("fond")}>
                  {FONDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select></div>
            </div>
            {(f.cadre !== "aucun" || f.fond !== "aucun") && (
              <div style={{ marginTop: 10 }}>
                <button type="button" className="btn-plain" onClick={() => setF((p) => ({ ...p, cadre: "aucun", fond: "aucun" }))}>✕ Retirer la mise en scène</button>
              </div>
            )}
            <p className="scene-current">
              Sélection : {f.cadre === "aucun" ? "sans cadre" : CADRES.find(([v]) => v === f.cadre)?.[1]}
              {" · "}{f.fond === "aucun" ? "sans arrière-plan" : FONDS.find(([v]) => v === f.fond)?.[1]}
            </p>
            <p className="scene-note">ℹ️ Toiles originales. Cadres et arrière-plans générés automatiquement — visualisation non contractuelle.</p>
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#615c53" }}>
          <input type="checkbox" checked={!!f.sold} onChange={(e) => setF((p) => ({ ...p, sold: e.target.checked }))} style={{ accentColor: "#b08d57", width: 16, height: 16 }} />
          Œuvre déjà vendue
        </label>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button className="btn-accent" type="submit" disabled={busy}>{initial ? "Enregistrer" : "Ajouter à la galerie"}</button>
        <button className="btn-plain" type="button" onClick={onCancel}>Annuler</button>
      </div>

      {cropIdx !== null && photos[cropIdx] && (
        <CropModal
          photo={photos[cropIdx].original || photos[cropIdx].dataUrl}
          onCancel={() => setCropIdx(null)}
          onValidate={(cropped) => {
            setPhotos((prev) => prev.map((p, j) => (j === cropIdx ? { ...p, original: p.original || p.dataUrl, dataUrl: cropped, existingId: null } : p)));
            setCropIdx(null);
          }}
        />
      )}
    </form>
  );
}

// ---------- Page admin ----------
export default function AdminPage() {
  const [authed, setAuthed] = useState(null); // null = vérification en cours
  const [pwd, setPwd] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [arts, setArts] = useState([]);
  const [editing, setEditing] = useState(undefined); // undefined = liste, null = création, objet = édition
  const [msg, setMsg] = useState(null);

  const refresh = useCallback(async () => {
    const r = await fetch("/api/artworks");
    const d = await r.json();
    setArts(d.artworks || []);
  }, []);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/auth");
      const d = await r.json();
      setAuthed(d.ok);
      if (d.ok) refresh();
    })();
  }, [refresh]);

  async function login(e) {
    e.preventDefault();
    setLoginError(null);
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pwd }) });
    const d = await r.json();
    if (d.ok) { setAuthed(true); setPwd(""); refresh(); }
    else setLoginError(d.error || "Erreur");
  }

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthed(false);
  }

  async function saveArtwork(payload) {
    const isEdit = !!payload.artwork.id;
    const r = await fetch("/api/artworks", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (r.ok) { setEditing(undefined); setMsg(isEdit ? "✅ Œuvre mise à jour." : "✅ Œuvre ajoutée à la galerie."); refresh(); }
    else setMsg("⚠️ Erreur lors de l'enregistrement.");
  }

  async function quickAction(id, action) {
    await fetch(`/api/artworks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
    refresh();
  }

  async function removeArtwork(id) {
    if (!confirm("Supprimer définitivement cette œuvre ?")) return;
    await fetch(`/api/artworks?id=${id}`, { method: "DELETE" });
    refresh();
  }

  if (authed === null) return <main className="admin-wrap"><p style={{ color: "#8a857c" }}>Vérification…</p></main>;

  if (!authed) {
    return (
      <main className="login-box">
        <h1 style={{ fontWeight: "normal", fontSize: 24 }}>Espace admin</h1>
        <p style={{ color: "#8a857c", fontSize: 14 }}>Galerie Antoine LePeintre</p>
        <form onSubmit={login}>
          <input type="password" placeholder="Mot de passe" value={pwd} onChange={(e) => setPwd(e.target.value)} autoFocus />
          <button className="btn-dark" type="submit" style={{ width: "100%" }}>Entrer</button>
        </form>
        {loginError && <p className="login-error">{loginError}</p>}
      </main>
    );
  }

  return (
    <main className="admin-wrap">
      <div className="admin-head">
        <h1 style={{ fontWeight: "normal", fontSize: 22 }}>Gestion de la galerie</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a className="btn-plain" href="/" style={{ textDecoration: "none" }}>Voir le site</a>
          <button className="btn-accent" onClick={() => setEditing(null)}>＋ Importer un tableau</button>
          <button className="btn-plain" onClick={logout}>Quitter</button>
        </div>
      </div>
      {msg && <div className="notice">{msg} <button onClick={() => setMsg(null)} style={{ border: "none", background: "none", cursor: "pointer", marginLeft: 6 }}>✕</button></div>}

      {editing !== undefined ? (
        <ArtworkForm
          initial={editing || null}
          onSave={saveArtwork}
          onCancel={() => setEditing(undefined)}
        />
      ) : (
        <div className="admin-list">
          {arts.length === 0 && (
            <div className="notice">Aucune œuvre pour l'instant. Cliquez sur « ＋ Importer un tableau » pour publier votre première création.</div>
          )}
          {arts.map((a) => (
            <div key={a.id} className="admin-row">
              <img src={a.renderUrl || a.photos[0]?.url || ""} alt="" />
              <div className="grow">
                <div className="t">{a.titre} {a.sold && <span style={{ color: "#8a857c", fontSize: 12 }}>(vendu)</span>}</div>
                <div className="m">{a.technique}{a.largeur > 0 && ` · ${a.largeur} × ${a.hauteur} cm`} · {a.style}{a.theme && ` · ${a.theme}`} · {a.photos.length} photo(s)</div>
              </div>
              <div className="ops">
                <button className="btn-plain" onClick={() => setEditing(a)}>Modifier</button>
                <button className="btn-plain" onClick={() => quickAction(a.id, "toggle-sold")}>{a.sold ? "Remettre en vente" : "Marquer vendu"}</button>
                {a.renderUrl && <button className="btn-plain" onClick={() => quickAction(a.id, "strip-scene")}>Retirer la mise en scène</button>}
                <button className="btn-plain btn-danger" onClick={() => removeArtwork(a.id)}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
