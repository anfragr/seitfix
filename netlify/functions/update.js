/* BRANDHOF · Netlify Function "update"
   Nimmt vom Admin-Panel (/admin) PDFs + karten.json entgegen, prüft das Passwort
   und legt alles in EINEM Commit über die GitHub-API im Repo ab.
   Netlify baut danach automatisch neu (ca. 30–60 Sekunden).

   Benötigte Umgebungsvariablen (Netlify → Site configuration → Environment variables):
     ADMIN_PASSWORD   Passwort für das Admin-Panel
     GITHUB_TOKEN     Fine-grained Token mit "Contents: Read and write" für genau dieses Repo
     GITHUB_REPO      z. B. "ivohrovat/brandhof"
     GITHUB_BRANCH    optional, Standard "main"
*/
const crypto = require('crypto');

const MAX_FILE = 4.5 * 1024 * 1024; // Netlify-Limit für den Request liegt bei 6 MB
const ALLOWED = {
  tageskarte: 'karten/tageskarte.pdf',
  wochenplan: 'karten/wochenplan.pdf',
  speisekarte: 'karten/speisekarte.pdf',
  saisonkarte: 'karten/saisonkarte.pdf',
  international: 'karten/international.pdf',
};

const json = (status, body) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

async function gh(token, method, path, body) {
  const res = await fetch('https://api.github.com' + path, {
    method,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'brandhof-admin',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }
  if (!res.ok) throw new Error('GitHub ' + method + ' ' + path + ' → ' + res.status + ': ' + (data.message || text).slice(0, 200));
  return data;
}


// ---- Popup & Öffnungszeiten aus dem Admin säubern (nur erlaubte Felder, nur gültige Uhrzeiten)
const TAGE = ['mo', 'di', 'mi', 'do', 'fr', 'sa', 'so'];
const ZEIT = /^([01]\d|2[0-4]):[0-5]\d$/;
function cleanPopup(p) {
  p = p && typeof p === 'object' ? p : {};
  return {
    aktiv: p.aktiv === true,
    titel: String(p.titel || '').trim().slice(0, 80),
    text: String(p.text || '').replace(/\r/g, '').trim().slice(0, 600),
    bis: /^\d{4}-\d{2}-\d{2}$/.test(p.bis || '') ? p.bis : '',
  };
}
function cleanOz(o) {
  o = o && typeof o === 'object' ? o : {};
  const t = o.tage && typeof o.tage === 'object' ? o.tage : {};
  const tage = {};
  for (const d of TAGE) {
    const x = t[d] && typeof t[d] === 'object' ? t[d] : {};
    const von = ZEIT.test(x.von || '') ? x.von : '';
    const bis = ZEIT.test(x.bis || '') ? x.bis : '';
    const kueche = ZEIT.test(x.kueche || '') ? x.kueche : bis;
    tage[d] = { offen: x.offen === true && !!von && !!bis, von, bis, kueche };
  }
  return { tage, feiertage_geschlossen: o.feiertage_geschlossen !== false };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, fehler: 'Nur POST.' });

  const { ADMIN_PASSWORD, GITHUB_TOKEN, GITHUB_REPO } = process.env;
  const BRANCH = process.env.GITHUB_BRANCH || 'main';
  if (!ADMIN_PASSWORD || !GITHUB_TOKEN || !GITHUB_REPO) {
    return json(500, { ok: false, fehler: 'Server nicht konfiguriert: ADMIN_PASSWORD, GITHUB_TOKEN und GITHUB_REPO müssen in Netlify gesetzt sein.' });
  }

  let payload;
  try { payload = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body); }
  catch (e) { return json(400, { ok: false, fehler: 'Ungültige Anfrage.' }); }

  if (!payload || !safeEqual(payload.passwort || '', ADMIN_PASSWORD)) {
    await new Promise((r) => setTimeout(r, 800)); // kleine Bremse gegen Durchprobieren
    return json(401, { ok: false, fehler: 'Falsches Passwort.' });
  }

  // ---- Dateien prüfen
  const files = [];
  for (const f of payload.dateien || []) {
    const path = ALLOWED[f.schluessel];
    if (!path) return json(400, { ok: false, fehler: 'Unbekannte Karte: ' + f.schluessel });
    const buf = Buffer.from(String(f.base64 || ''), 'base64');
    if (!buf.length) return json(400, { ok: false, fehler: 'Leere Datei für ' + f.schluessel });
    if (buf.length > MAX_FILE) return json(413, { ok: false, fehler: f.schluessel + ': PDF ist größer als 4,5 MB. Bitte kleiner speichern.' });
    if (buf.slice(0, 4).toString() !== '%PDF') return json(400, { ok: false, fehler: f.schluessel + ': Das ist keine PDF-Datei.' });
    files.push({ path, base64: buf.toString('base64') });
  }

  // ---- karten.json prüfen
  let karten = payload.karten;
  if (karten && typeof karten === 'object') {
    karten.aktualisiert = new Date().toISOString();
    for (const k of Object.keys(ALLOWED)) { karten[k] = Object.assign({}, karten[k] || {}, { datei: ALLOWED[k] }); }
    karten.einstellungen = { gastgarten: !(karten.einstellungen && karten.einstellungen.gastgarten === false) };
    karten.popup = cleanPopup(karten.popup);
    if (karten.oeffnungszeiten) karten.oeffnungszeiten = cleanOz(karten.oeffnungszeiten);
  } else karten = null;

  if (!files.length && !karten) return json(400, { ok: false, fehler: 'Nichts zu speichern.' });

  // ---- Ein Commit über die Git-Data-API
  try {
    const R = '/repos/' + GITHUB_REPO;
    const ref = await gh(GITHUB_TOKEN, 'GET', R + '/git/ref/heads/' + BRANCH);
    const headSha = ref.object.sha;
    const headCommit = await gh(GITHUB_TOKEN, 'GET', R + '/git/commits/' + headSha);

    const tree = [];
    for (const f of files) {
      const blob = await gh(GITHUB_TOKEN, 'POST', R + '/git/blobs', { content: f.base64, encoding: 'base64' });
      tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    if (karten) {
      const blob = await gh(GITHUB_TOKEN, 'POST', R + '/git/blobs', { content: JSON.stringify(karten, null, 2) + '\n', encoding: 'utf-8' });
      tree.push({ path: 'karten/karten.json', mode: '100644', type: 'blob', sha: blob.sha });
    }

    const newTree = await gh(GITHUB_TOKEN, 'POST', R + '/git/trees', { base_tree: headCommit.tree.sha, tree });
    const names = files.map((f) => f.path.replace('karten/', '')).concat(karten ? ['karten.json'] : []);
    const commit = await gh(GITHUB_TOKEN, 'POST', R + '/git/commits', {
      message: 'Karten aktualisiert: ' + names.join(', ') + ' (via /admin)',
      tree: newTree.sha,
      parents: [headSha],
    });
    await gh(GITHUB_TOKEN, 'PATCH', R + '/git/refs/heads/' + BRANCH, { sha: commit.sha, force: false });

    return json(200, { ok: true, commit: commit.sha.slice(0, 7), dateien: names });
  } catch (err) {
    return json(502, { ok: false, fehler: 'Speichern fehlgeschlagen: ' + err.message });
  }
};
