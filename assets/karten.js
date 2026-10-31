/* BRANDHOF · karten.js
   Liest karten/karten.json (wird über /admin gepflegt) und füllt:
   - [data-k="pfad.zum.wert"]  → Text
   - [data-href="schluessel"]  → Link auf die PDF-Datei (+ Cache-Buster)
   - [data-src="schluessel"]   → iframe-Quelle
   - [data-oz…]                → Öffnungszeiten an allen Stellen der Seite
   - Hinweis-Popup (bei jedem Öffnen der Website)
   - Einstellungen (z. B. Gastgarten-Auswahl im Reservierungsformular) */
(function () {
  'use strict';
  var url = 'karten/karten.json?v=' + Math.floor(Date.now() / 60000); // max. 1 Minute Cache

  function get(obj, path) {
    return path.split('.').reduce(function (o, k) { return (o && o[k] !== undefined) ? o[k] : ''; }, obj);
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  /* ---------------- Öffnungszeiten ---------------- */
  var DAYS = [['mo', 'Mo', 'Montag'], ['di', 'Di', 'Dienstag'], ['mi', 'Mi', 'Mittwoch'], ['do', 'Do', 'Donnerstag'], ['fr', 'Fr', 'Freitag'], ['sa', 'Sa', 'Samstag'], ['so', 'So', 'Sonntag']];

  function runs(tage, keyFn) {
    var out = [], cur = null;
    DAYS.forEach(function (d, i) {
      var t = tage[d[0]] || {};
      if (!t.offen) { cur = null; return; }
      var key = keyFn(t);
      if (cur && cur.key === key && cur.end === i - 1) { cur.end = i; }
      else { cur = { key: key, start: i, end: i, t: t }; out.push(cur); }
    });
    return out;
  }
  function label(r, lang, strich) {
    var a = DAYS[r.start][lang ? 2 : 1], b = DAYS[r.end][lang ? 2 : 1];
    if (r.start === r.end) return a;
    if (r.end === r.start + 1) return strich ? a + ', ' + b : a + ' und ' + b;
    return a + (strich ? '–' : ' bis ') + b;
  }
  function list(arr) { return arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' und ' + arr[arr.length - 1]; }
  function kurzZeit(z) { return z.replace(/:00$/, ''); }

  function oeffnung(oz) {
    var tage = oz.tage || {};
    DAYS.forEach(function (d) { var t = tage[d[0]]; if (t && t.offen && !t.kueche) t.kueche = t.bis; });
    var zeitRuns = runs(tage, function (t) { return t.von + '|' + t.bis; });
    var tagRuns = runs(tage, function () { return 'x'; });
    var kRuns = runs(tage, function (t) { return t.kueche; });
    var offen = DAYS.filter(function (d) { return tage[d[0]] && tage[d[0]].offen; });
    if (!offen.length) return null;
    // Ruhetage in natürlicher Reihenfolge: ab dem Tag nach dem letzten offenen Block
    var last = tagRuns.length ? tagRuns[tagRuns.length - 1].end : 6, zu = [];
    for (var i = 1; i <= 7; i++) { var d = DAYS[(last + i) % 7]; if (!(tage[d[0]] && tage[d[0]].offen)) zu.push(d); }
    var feiertag = oz.feiertage_geschlossen !== false;
    var zuKurz = zu.map(function (d) { return d[1]; }), zuLang = zu.map(function (d) { return d[2]; });
    var kUniform = kRuns.length === 1 || kRuns.every(function (r) { return r.key === kRuns[0].key; });
    var ersterVon = zeitRuns[0].t.von;
    var vonUniform = offen.every(function (d) { return tage[d[0]].von === ersterVon; });
    var gleich = kUniform && vonUniform;
    // häufigste Küchenzeit (für die kompakte Angabe „11 bis 23“)
    var zaehl = {}, haupt = kRuns[0].key, hauptVon = ersterVon;
    offen.forEach(function (d) { var k = tage[d[0]].kueche; zaehl[k] = (zaehl[k] || 0) + 1; if (zaehl[k] > (zaehl[haupt] || 0)) { haupt = k; hauptVon = tage[d[0]].von; } });
    var kListe = kRuns.map(function (r) { return label(r, false, true) + ' bis ' + r.key; }).join(' · ');
    // Küche überall genau 1 Stunde vor Sperrstunde, aber Sperrstunde je Tag verschieden → relativ angeben
    function min(z, ab) { var p = (z || '').split(':'), m = (+p[0]) * 60 + (+p[1] || 0); if (ab !== undefined && m <= ab) m += 1440; return m; }
    var einsVor = offen.every(function (d) { var t = tage[d[0]], v = min(t.von); return min(t.bis, v) - min(t.kueche, v) === 60; });
    var relativ = einsVor && !kUniform;
    var res = {
      kurz: zeitRuns.map(function (r) { return label(r) + ' ' + r.t.von + ' bis ' + r.t.bis; }).join(' · ') + ' Uhr',
      kurzOhneUhr: zeitRuns.map(function (r) { return label(r) + ' ' + r.t.von + ' bis ' + r.t.bis; }),
      tage: tagRuns.map(function (r) { return label(r); }).join(', '),
      tageLangSatz: tagRuns.length === 1 && tagRuns[0].end > tagRuns[0].start
        ? 'von ' + DAYS[tagRuns[0].start][2] + ' bis ' + DAYS[tagRuns[0].end][2]
        : 'am ' + list(offen.map(function (d) { return d[2]; })),
      kueche: relativ ? 'Küche bis 1 Std. vor Sperrstunde' : kUniform ? 'Küche bis ' + kRuns[0].key : 'Küche: ' + kListe,
      kuecheLang: relativ ? 'bis 1 Stunde vor Sperrstunde' : kUniform ? 'durchgehend bis ' + kRuns[0].key + ' Uhr' : kListe + ' Uhr',
      kuecheKompakt: kurzZeit(hauptVon) + ' bis ' + kurzZeit(haupt),
      kuecheSatz: gleich ? 'Von ' + ersterVon + ' bis ' + kRuns[0].key + ' Uhr' : (relativ && vonUniform) ? 'Von ' + ersterVon + ' bis 1 Stunde vor Sperrstunde' : 'Während der Öffnungszeiten',
      telSatz: gleich ? tagRuns.map(function (r) { return label(r); }).join(', ') + ' von ' + ersterVon + ' bis ' + kRuns[0].key + ' Uhr' : 'während der Öffnungszeiten',
      ruheKurz: (zuKurz.concat(feiertag ? ['Feiertag'] : [])).join(', '),
      ruheSatz: list(zuKurz.concat(feiertag ? ['Feiertag'] : [])),
      ruheLang: (zuLang.concat(feiertag ? ['Feiertage'] : [])).join(', '),
      zeitRuns: zeitRuns,
      tageRoh: tage, kUniform: kUniform, kEins: kRuns[0].key, feiertag: feiertag
    };
    return res;
  }

  function setOz(oz) {
    var o = oeffnung(oz); if (!o) return;
    function each(sel, fn) { document.querySelectorAll(sel).forEach(fn); }
    each('[data-oz="kurz"]', function (el) { el.textContent = o.kurz; });
    each('[data-oz="kueche"]', function (el) { el.textContent = o.kueche; });
    each('[data-oz="tage"]', function (el) { el.textContent = o.tage; });
    each('[data-oz="tage-lang-satz"]', function (el) { el.textContent = o.tageLangSatz; });
    each('[data-oz="kueche-kompakt"]', function (el) { el.textContent = o.kuecheKompakt; });
    each('[data-oz="kueche-satz"]', function (el) { el.textContent = o.kuecheSatz; });
    each('[data-oz="tel-satz"]', function (el) { el.textContent = o.telSatz; });
    each('[data-oz="ruhetage-satz"]', function (el) { el.textContent = o.ruheSatz ? o.ruheSatz + ' Ruhetag' : 'ohne Ruhetag'; });
    each('[data-oz="hero"]', function (el) {
      el.innerHTML = o.zeitRuns.map(function (r) { return '<b>' + esc(label(r)) + '</b> ' + esc(r.t.von + ' bis ' + r.t.bis); }).join(' · ') + ' Uhr';
    });
    each('[data-oz="hero-kueche"]', function (el) { el.innerHTML = '<b>Küche</b> ' + esc(o.kuecheLang.replace(/ Uhr$/, '')); });
    each('[data-oz="footer"]', function (ul) {
      var h = o.kurzOhneUhr.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
      h += '<li>' + esc(o.kueche) + '</li>';
      if (o.ruheKurz) h += '<li>' + esc(o.ruheKurz + ' Ruhetag') + '</li>';
      ul.innerHTML = h;
    });
    // Öffnungszeiten-Liste (Block mit Wochentagen)
    var lists = [];
    each('[data-oz-li]', function (li) { if (lists.indexOf(li.parentNode) === -1) lists.push(li.parentNode); });
    lists.forEach(function (ul) {
      var first = ul.querySelector('[data-oz-li]');
      var frag = document.createDocumentFragment();
      function li(a, b) { var x = document.createElement('li'); x.setAttribute('data-oz-li', ''); x.innerHTML = '<span>' + esc(a) + '</span><span>' + esc(b) + '</span>'; frag.appendChild(x); }
      // jeder Tag einzeln, Montag bis Sonntag
      DAYS.forEach(function (d) {
        var t = o.tageRoh[d[0]] || {};
        li(d[2], t.offen ? t.von + ' bis ' + t.bis + ' Uhr' : 'Ruhetag');
      });
      ul.insertBefore(frag, first);
      // alte statische Einträge entfernen
      var neu = 7;
      var alle = ul.querySelectorAll('[data-oz-li]');
      for (var i = neu; i < alle.length; i++) alle[i].remove();
    });
  }

  /* ---------------- Hinweis-Popup ---------------- */
  function popup(p) {
    if (!p || !p.aktiv || !(p.text || '').trim()) return;
    if (p.bis) { var heute = new Date(); heute.setHours(0, 0, 0, 0); var bis = new Date(p.bis + 'T00:00:00'); if (heute > bis) return; }
    // Kommt bei jedem Öffnen der Website (auch bei neu laden), aber nicht beim Klicken von Seite zu Seite innerhalb der Website
    var intern = false;
    try { intern = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) {}
    if (intern) return;
    var css = '.bh-pop{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(15,31,22,.58);opacity:0;transition:opacity .25s}' +
      '.bh-pop.on{opacity:1}.bh-pop__card{background:var(--cream,#F3EEE3);color:var(--ink,#131A16);max-width:460px;width:100%;border-radius:14px;padding:28px 26px 22px;box-shadow:0 24px 60px rgba(0,0,0,.3);transform:translateY(10px);transition:transform .25s}' +
      '.bh-pop.on .bh-pop__card{transform:none}.bh-pop__eye{font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:var(--ochre-2,#A67C1E);margin:0 0 .6rem;font-weight:600}' +
      '.bh-pop__t{font-family:var(--font-serif,Georgia,serif);font-weight:400;font-size:1.7rem;line-height:1.15;margin:0 0 .7rem;color:var(--green-900,#14291D)}' +
      '.bh-pop__x p{margin:0 0 .7rem;line-height:1.55}.bh-pop__btn{margin-top:.6rem;border:0;border-radius:999px;background:var(--green-900,#14291D);color:var(--cream,#F3EEE3);padding:.85rem 1.4rem;font:inherit;font-weight:600;cursor:pointer}' +
      '.bh-pop__btn:hover{background:var(--green-700,#234533)}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var wrap = document.createElement('div'); wrap.className = 'bh-pop';
    wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'bh-pop-t');
    var card = document.createElement('div'); card.className = 'bh-pop__card';
    var eye = document.createElement('p'); eye.className = 'bh-pop__eye'; eye.textContent = 'Hinweis'; card.appendChild(eye);
    if (p.titel) { var t = document.createElement('h2'); t.className = 'bh-pop__t'; t.id = 'bh-pop-t'; t.textContent = p.titel; card.appendChild(t); }
    var x = document.createElement('div'); x.className = 'bh-pop__x';
    String(p.text).split(/\n{2,}/).forEach(function (abs) { var pe = document.createElement('p'); abs.split('\n').forEach(function (z, i) { if (i) pe.appendChild(document.createElement('br')); pe.appendChild(document.createTextNode(z)); }); x.appendChild(pe); });
    card.appendChild(x);
    var b = document.createElement('button'); b.type = 'button'; b.className = 'bh-pop__btn'; b.textContent = 'Alles klar'; card.appendChild(b);
    wrap.appendChild(card); document.body.appendChild(wrap);
    var vorher = document.activeElement;
    function zu() { wrap.classList.remove('on'); setTimeout(function () { wrap.remove(); }, 260); document.removeEventListener('keydown', k); if (vorher && vorher.focus) vorher.focus(); }
    function k(e) { if (e.key === 'Escape') zu(); }
    b.addEventListener('click', zu);
    wrap.addEventListener('click', function (e) { if (e.target === wrap) zu(); });
    document.addEventListener('keydown', k);
    setTimeout(function () { wrap.classList.add('on'); b.focus(); }, 600);
  }

  fetch(url, { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (data) {
    var stamp = encodeURIComponent(data.aktualisiert || '');

    document.querySelectorAll('[data-k]').forEach(function (el) {
      var v = get(data, el.dataset.k); if (v !== '') el.textContent = v;
    });
    document.querySelectorAll('[data-href]').forEach(function (a) {
      var e = data[a.dataset.href]; if (e && e.datei) a.href = e.datei + '?v=' + stamp;
    });
    document.querySelectorAll('[data-src]').forEach(function (f) {
      var e = data[f.dataset.src]; if (e && e.datei) f.src = e.datei + '?v=' + stamp + '#toolbar=0&navpanes=0';
    });
    if (data.oeffnungszeiten) { try { setOz(data.oeffnungszeiten); } catch (x) {} }
    try { popup(data.popup); } catch (x) {}

    // Einstellungen aus dem Admin: Gastgarten-Auswahl im Reservierungsformular ein/aus
    try { document.dispatchEvent(new CustomEvent('karten:ready', { detail: data })); } catch (x) {}
    var e = data.einstellungen || {};
    if (e.gastgarten === false) {
      var gf = document.getElementById('gastgarten-feld'); if (gf) gf.remove();
      var row = document.querySelector('[data-gastgarten-row]'); if (row) row.classList.remove('row-2');
    }
  }).catch(function () { /* Ohne JSON bleiben die statischen Fallbacks stehen */ });
})();
