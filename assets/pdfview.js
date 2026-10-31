/* BRANDHOF · pdfview.js
   Am Handy/Tablet (bis 900px) zeigen Browser eingebettete PDFs schlecht an (nur erste Seite, kein Scrollen).
   Darum werden die Karten dort mit PDF.js (lokal in assets/pdfjs, keine Fremdverbindung) Seite für Seite
   als Bild gerendert, direkt unter dem Reiter, so wie am Laptop. Geladen wird nur die gerade sichtbare Karte. */
(function () {
  'use strict';
  var mq = window.matchMedia('(max-width: 900px)');
  var daten = null, lib = null, rendered = {};

  function pdfUrl(key) {
    var e = daten && daten[key];
    if (e && e.datei) return e.datei + '?v=' + encodeURIComponent(daten.aktualisiert || '');
    var f = document.querySelector('iframe[data-src="' + key + '"]');
    return f ? f.getAttribute('src').split('#')[0] : null;
  }
  function loadLib() {
    if (lib) return lib;
    lib = import('./pdfjs/pdf.min.mjs').then(function (m) {
      m.GlobalWorkerOptions.workerSrc = 'assets/pdfjs/pdf.worker.min.mjs';
      return m;
    });
    return lib;
  }
  function render(box) {
    var key = box.dataset.pdf; if (!key || rendered[key] || !mq.matches) return;
    var url = pdfUrl(key); if (!url) return;
    rendered[key] = true;
    box.innerHTML = '<p class="pdf-pages__status">Karte wird geladen …</p>';
    loadLib().then(function (pdfjs) {
      return pdfjs.getDocument({ url: url }).promise;
    }).then(function (doc) {
      box.innerHTML = '';
      var width = box.clientWidth || 360, ratio = Math.min(window.devicePixelRatio || 1, 2);
      var chain = Promise.resolve();
      for (var n = 1; n <= doc.numPages; n++) {
        (function (num) {
          chain = chain.then(function () { return doc.getPage(num); }).then(function (page) {
            var base = page.getViewport({ scale: 1 });
            var scale = width / base.width;
            var vp = page.getViewport({ scale: scale * ratio });
            var c = document.createElement('canvas');
            c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
            c.style.width = '100%'; c.style.height = 'auto';
            c.setAttribute('role', 'img'); c.setAttribute('aria-label', 'Seite ' + num + ' von ' + doc.numPages);
            box.appendChild(c);
            return page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
          });
        })(n);
      }
      return chain;
    }).catch(function () {
      rendered[key] = false;
      box.innerHTML = '<p class="pdf-pages__status">Die Karte konnte nicht angezeigt werden. Bitte oben auf „PDF öffnen“ tippen.</p>';
    });
  }
  function renderActive() {
    var p = document.querySelector('[role="tabpanel"][data-active] .pdf-pages'); if (p) render(p);
  }

  document.addEventListener('karten:ready', function (e) { daten = e.detail; renderActive(); });
  document.querySelectorAll('[role="tab"]').forEach(function (t) { t.addEventListener('click', function () { setTimeout(renderActive, 0); }); });
  // Falls karten.json nicht kommt: nach 2 s mit den statischen Pfaden rendern
  setTimeout(function () { if (!daten) renderActive(); }, 2000);
  if (mq.addEventListener) mq.addEventListener('change', function () { if (mq.matches) renderActive(); });
})();
