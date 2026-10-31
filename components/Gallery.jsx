"use client";
import { useState } from "react";

const TAILLES = ["grand", "moyen", "petit"];
const CADRE_LABELS = {
  noir: "Bois noir mat", chene: "Chêne naturel", or: "Doré classique",
  "caisse-noir": "Caisse américaine noire", "caisse-chene": "Caisse américaine chêne", "caisse-blanc": "Caisse américaine blanche",
};
const FOND_LABELS = {
  clair: "mur clair", sombre: "mur sombre galerie", sauge: "vert sauge", "bleu-gris": "bleu-gris",
  terracotta: "terracotta", "vert-fonce": "vert profond", "bleu-nuit": "bleu nuit",
};

function uniq(arts, key) {
  return [...new Set(arts.map((a) => a[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr"));
}

function Card({ a, onOpen }) {
  const [cur, setCur] = useState(0);
  const shots = a.photos || [];
  const idx = Math.min(cur, Math.max(0, shots.length - 1));
  const src = shots.length ? (idx === 0 ? (a.renderUrl || shots[0].url) : shots[idx].url) : null;
  const isNew = a.createdAt && Date.now() - new Date(a.createdAt).getTime() < 30 * 24 * 3600 * 1000;
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@antoinelepeintre.fr";
  const subject = encodeURIComponent(`Intéressé par « ${a.titre} »`);
  const body = encodeURIComponent(
    `Bonjour Antoine,\n\nJe suis intéressé(e) par le tableau « ${a.titre} » (${a.technique}${a.largeur ? `, ${a.largeur} × ${a.hauteur} cm` : ""}).\n\nBien cordialement,`
  );
  return (
    <article className="card">
      <div className="card-img" onClick={() => onOpen(a, idx)}>
        {src && <img src={src} alt={a.titre} />}
        <span className={`badge ${a.sold ? "sold" : "dispo"}`}>{a.sold ? "Vendu" : "Disponible"}</span>
        {isNew && !a.sold && <span className="badge new">Nouveau</span>}
        {shots.length > 1 && (
          <div className="thumbs" onClick={(e) => e.stopPropagation()}>
            {shots.map((p, i) => (
              <button key={p.id} className={i === idx ? "active" : ""} onClick={() => setCur(i)} title={i === 0 ? "Photo principale" : `Photo ${i + 1}`}>
                <img src={p.url} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="card-body">
        <h3>{a.titre}</h3>
        <p className="card-meta">
          {a.technique}{a.largeur > 0 && ` · ${a.largeur} × ${a.hauteur} cm`} · <span style={{ textTransform: "capitalize" }}>{a.taille}</span>{a.annee ? ` · ${a.annee}` : ""}
        </p>
        <p className="card-style">{a.style}{a.theme ? " · " + a.theme : ""}</p>
        {a.commentaire && <p className="card-comment">{a.commentaire}</p>}
        <div className="card-actions">
          {!a.sold && (
            <a className="btn-interest" href={`mailto:${contact}?subject=${subject}&body=${body}`}>Intéressé</a>
          )}
        </div>
      </div>
    </article>
  );
}

function Lightbox({ a, startIdx, onClose }) {
  const shots = a.photos || [];
  const [i, setI] = useState(startIdx || 0);
  const [zoom, setZoom] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(null);

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Fermer">✕</button>
      <div
        className="lightbox-stage"
        style={{ cursor: zoom ? "grab" : "zoom-in" }}
        onClick={(e) => { e.stopPropagation(); setZoom((z) => { if (!z) setPan({ x: 0, y: 0 }); return !z; }); }}
        onPointerDown={(e) => { if (zoom) { e.currentTarget.setPointerCapture(e.pointerId); setDrag({ ...pan }); e.preventDefault(); } }}
        onPointerMove={(e) => { if (zoom && drag) setPan({ x: drag.x + e.movementX, y: drag.y + e.movementY }); }}
        onPointerUp={() => setDrag(null)}
      >
        {shots[i] && (
          <img
            src={shots[i].url} alt={a.titre} draggable={false}
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom ? 2.2 : 1})`, cursor: zoom ? "grab" : "zoom-in" }}
          />
        )}
      </div>
      <div className="lightbox-info" onClick={(e) => e.stopPropagation()}>
        <h3>{a.titre}</h3>
        <p>{a.technique}{a.largeur > 0 && ` · ${a.largeur} × ${a.hauteur} cm`}{a.annee ? ` · ${a.annee}` : ""}{a.theme ? ` · ${a.theme}` : ""}</p>
        {shots.length > 1 && (
          <div className="thumbs" style={{ position: "static", transform: "none", marginTop: 10, display: "inline-flex" }}>
            {shots.map((p, k) => (
              <button key={p.id} className={k === i ? "active" : ""} onClick={() => { setI(k); setZoom(false); setPan({ x: 0, y: 0 }); }}>
                <img src={p.url} alt="" />
              </button>
            ))}
          </div>
        )}
        <p className="hint">{zoom ? "Faites glisser pour explorer · appuyez pour dézoomer" : "Appuyez sur l'image pour zoomer"}</p>
      </div>
    </div>
  );
}

export default function Gallery({ artworks }) {
  const [filters, setFilters] = useState({ taille: "tous", style: "tous", theme: "tous", dispo: "tous" });
  const [lb, setLb] = useState(null); // { artwork, startIdx }
  const [email, setEmail] = useState("");
  const [subMsg, setSubMsg] = useState(null);

  const set = (k, v) => setFilters((p) => ({ ...p, [k]: v }));
  const active = Object.values(filters).some((v) => v !== "tous");

  const shown = artworks.filter((a) =>
    (filters.taille === "tous" || a.taille === filters.taille) &&
    (filters.style === "tous" || a.style === filters.style) &&
    (filters.theme === "tous" || a.theme === filters.theme) &&
    (filters.dispo === "tous" || (filters.dispo === "dispo") === !a.sold)
  );

  async function subscribe(e) {
    e.preventDefault();
    setSubMsg("Envoi…");
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      setSubMsg(d.ok ? "✅ Merci ! Vous recevrez les prochaines nouveautés." : `⚠️ ${d.error || "Erreur"}`);
      if (d.ok) setEmail("");
    } catch { setSubMsg("⚠️ Connexion impossible, réessayez."); }
  }

  return (
    <main>
      <header className="hero">
        <h1>Peintures <em>originales</em><br />par Antoine LePeintre</h1>
        <p>Chaque toile est une pièce unique, peinte à la main dans mon atelier. Contactez-moi si l'une d'elles vous parle.</p>
      </header>

      <section id="galerie">
        <div className="section" style={{ paddingBottom: 0 }}>
          <h2>Galerie</h2>
          <div className="rule" />
          <p className="disclaimer">
            Toutes les toiles présentées sont des créations originales. Les cadres et arrière-plans éventuels sont des images générées automatiquement, à titre de visualisation non contractuelle.
          </p>
        </div>

        <div className="grid" style={{ maxWidth: 1152 }}>
          <div className="filters" style={{ gridColumn: "1 / -1", paddingTop: 0 }}>
            {[["dispo", "Disponibilité", [["dispo", "Disponibles"], ["vendu", "Vendus"]]],
              ["taille", "Taille", TAILLES.map((t) => [t, t[0].toUpperCase() + t.slice(1)])],
              ["style", "Style", uniq(artworks, "style").map((s) => [s, s])],
              ["theme", "Thème", uniq(artworks, "theme").map((t) => [t, t])]].map(([key, label, options]) => (
              options.length > 0 && (
                <div key={key} className="filter-row">
                  <span className="filter-label">{label}</span>
                  <button className={`chip ${filters[key] === "tous" ? "active" : ""}`} onClick={() => set(key, "tous")}>Tous</button>
                  {options.map(([opt, optLabel]) => (
                    <button key={opt} className={`chip ${filters[key] === opt ? "active" : ""}`} onClick={() => set(key, opt)}>{optLabel}</button>
                  ))}
                </div>
              )
            ))}
            {active && (
              <div className="filter-row">
                <button className="chip reset" onClick={() => setFilters({ taille: "tous", style: "tous", theme: "tous", dispo: "tous" })}>✕ Réinitialiser les filtres</button>
              </div>
            )}
          </div>

          {shown.length === 0 && (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#8a857c", padding: "40px 0" }}>
              Aucune œuvre ne correspond à ces filtres pour l'instant — revenez bientôt !
            </p>
          )}
          {shown.map((a) => <Card key={a.id} a={a} onOpen={(art, idx) => setLb({ artwork: art, startIdx: idx })} />)}
        </div>
      </section>

      <section id="suivre" className="section">
        <h2>Suivre la galerie</h2>
        <div className="rule" />
        <p className="sub">Nouveaux tableaux, œuvres disponibles avant tout le monde…<br />Laissez votre email pour être prévenu à chaque publication.</p>
        <form className="subscribe-form" onSubmit={subscribe}>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.fr" />
          <button className="btn-dark" type="submit">M'alerter des nouveautés</button>
        </form>
        {subMsg && <p className="subscribe-msg">{subMsg}</p>}
        <p className="subscribe-legal">Votre email ne sert qu'aux alertes de la galerie. Aucune cession à des tiers, désinscription sur simple demande.</p>
      </section>

      <section id="apropos" className="section">
        <h2>À propos</h2>
        <div className="rule" />
        <p className="sub" style={{ textAlign: "left" }}>
          <strong style={{ color: "#3d3a35" }}>Antoine LePeintre</strong> peint depuis son atelier en France. Son travail explore
          la lumière, la matière et les paysages qui l'entourent. Chaque œuvre est unique, signée, et livrée avec soin.
          Pour toute question ou visite, écrivez-lui via le bouton « Intéressé » ou sur Instagram.
        </p>
      </section>

      {lb && <Lightbox a={lb.artwork} startIdx={lb.startIdx} onClose={() => setLb(null)} />}
    </main>
  );
}
