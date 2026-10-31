/* BRANDHOF · main.js
   Vanilla JS, keine Abhängigkeiten. Alles respektiert prefers-reduced-motion. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: transparent über Hero, fest nach Scroll ---------- */
  var header = document.querySelector('.header--over');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 40); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile Drawer ---------- */
  var burger = document.querySelector('.burger'), drawer = document.querySelector('.drawer');
  if (burger && drawer) {
    var setOpen = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      if (open) drawer.setAttribute('data-open', ''); else drawer.removeAttribute('data-open');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () { setOpen(burger.getAttribute('aria-expanded') !== 'true'); });
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---------- Reveal on Scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal], .words').forEach(function (el) { io.observe(el); });

  /* Wort-für-Wort-Reveal für .words */
  document.querySelectorAll('.words').forEach(function (el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    var i = 0;
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var inner = document.createElement('span'); inner.textContent = part; inner.style.setProperty('--i', i++);
            w.appendChild(inner); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  });

  /* ---------- Parallax (nur Transform, rAF, kein Layout-Thrash) ---------- */
  if (!reduce) {
    var px = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if (px.length) {
      var ticking = false;
      var update = function () {
        var vh = window.innerHeight;
        px.forEach(function (el) {
          var r = el.parentElement.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          var p = (r.top + r.height / 2 - vh / 2) / vh; // -1 .. 1
          var amt = (parseFloat(el.dataset.parallax) || 12) * 0.6;
          el.style.transform = 'translate3d(0,' + (p * amt) + '%,0)';
        });
        ticking = false;
      };
      window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
      update();
    }
  }

  /* ---------- Tabs (Speisekarte) ---------- */
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs = list.querySelectorAll('[role="tab"]');
    tabs.forEach(function (tab, idx) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.setAttribute('aria-selected', 'false'); t.tabIndex = -1; });
        tab.setAttribute('aria-selected', 'true'); tab.tabIndex = 0;
        document.querySelectorAll('[role="tabpanel"]').forEach(function (p) { p.removeAttribute('data-active'); });
        var panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.setAttribute('data-active', '');
      });
      tab.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return; e.preventDefault();
        var next = tabs[(idx + d + tabs.length) % tabs.length]; next.focus(); next.click();
      });
    });
  });

  /* ---------- Virtuelle Tour (erst nach Klick laden) ---------- */
  document.querySelectorAll('.tour__cover').forEach(function (cover) {
    cover.addEventListener('click', function () {
      var wrap = cover.parentElement, f = document.createElement('iframe');
      f.src = wrap.dataset.tourUrl; f.title = 'Virtuelle Tour'; f.allow = 'gyroscope; accelerometer; fullscreen'; f.setAttribute('allowfullscreen', '');
      wrap.appendChild(f); cover.hidden = true;
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.querySelector('.lightbox');
  if (lb) {
    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery__item')), img = lb.querySelector('img'), cur = 0;
    var show = function (i) { cur = (i + items.length) % items.length; img.src = items[cur].dataset.full; img.alt = items[cur].querySelector('img').alt; lb.hidden = false; document.body.style.overflow = 'hidden'; };
    var close = function () { lb.hidden = true; document.body.style.overflow = ''; };
    items.forEach(function (el, i) { el.addEventListener('click', function () { show(i); }); });
    lb.querySelector('.x').addEventListener('click', close);
    lb.querySelector('.p').addEventListener('click', function () { show(cur - 1); });
    lb.querySelector('.n').addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
  }

  /* ---------- Google Maps erst nach Klick laden (DSGVO) ---------- */
  document.querySelectorAll('.map__cover').forEach(function (cover) {
    cover.addEventListener('click', function () {
      var wrap = cover.parentElement, f = document.createElement('iframe');
      f.src = wrap.dataset.mapUrl; f.title = 'Karte: Restaurant Brandhof'; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
      wrap.appendChild(f); cover.hidden = true;
    });
  });

  /* ---------- Tab per URL-Hash öffnen (speisekarte.html#saisonkarte) ---------- */
  var openTabFromHash = function () {
    var h = (location.hash || '').replace('#', ''); if (!h) return;
    var tab = document.querySelector('[role="tab"][data-tab="' + h + '"]'); if (tab) tab.click();
  };
  openTabFromHash(); window.addEventListener('hashchange', openTabFromHash);

  /* ---------- Jahr im Footer ---------- */
  var y = document.getElementById('jahr'); if (y) y.textContent = String(new Date().getFullYear());
})();
