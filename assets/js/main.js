/* =========================================================================
   luise.pro/freshly — main.js
   Vanilla JS. Sin librerías. Sin localStorage/sessionStorage.
   Estética "El Índice": claro por defecto, oscuro = edición nocturna.
   ========================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* -------- 1. TEMA — siempre oscuro (edición nocturna) -------- */
  document.documentElement.setAttribute("data-theme", "dark");

  /* modo PDF/impresión: revela todo y abre desplegables (?showall=1) */
  var SHOWALL = /[?&]showall=1/.test(location.search);

  /* -------- 2. Masthead: sombra al hacer scroll -------- */
  var masthead = $("#masthead");
  function onScroll() { if (masthead) masthead.classList.toggle("is-scrolled", window.scrollY > 12); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* -------- 3. Nav móvil (burger) -------- */
  var burger = $("#burger");
  var navMobile = $("#navMobile");
  if (burger && navMobile) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", open ? "false" : "true");
      burger.setAttribute("aria-label", open ? "Abrir menú" : "Cerrar menú");
      navMobile.classList.toggle("is-open", !open);
    });
    $$("a", navMobile).forEach(function (a) {
      a.addEventListener("click", function () {
        burger.setAttribute("aria-expanded", "false");
        navMobile.classList.remove("is-open");
      });
    });
  }

  /* -------- 4. Stagger: indexar hijos -------- */
  $$("[data-stagger]").forEach(function (group) {
    $$(":scope > *", group).forEach(function (child, i) { child.style.setProperty("--i", i); });
  });

  /* -------- 5. Reveals + stagger (IntersectionObserver) -------- */
  var revealEls = $$(".reveal, [data-stagger]");
  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  }

  /* -------- 6. Contadores animados -------- */
  function format(n, d) { return n.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count-to"));
    var dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = format(target, dec) + suffix; return; }
    var dur = 1300, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased, dec) + suffix;
      if (p < 1) requestAnimationFrame(step); else el.textContent = format(target, dec) + suffix;
    }
    requestAnimationFrame(step);
  }
  var countIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); countIO.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$("[data-count-to]").forEach(function (el) { countIO.observe(el); });

  /* -------- 7. Animar barras (funnel, ice) y curva (chart) al entrar -------- */
  var animIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-animated"); animIO.unobserve(e.target); } });
  }, { threshold: 0.3 });
  $$('[data-interactive="funnel"], [data-interactive="ice"], [data-interactive="chart"], [data-interactive="gchart"]').forEach(function (el) { animIO.observe(el); });

  /* -------- 8. Nav link activo -------- */
  var sections = $$("main section[id]");
  var navLinks = $$(".folio-nav a");
  if (sections.length && navLinks.length) {
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.getAttribute("id");
          navLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spyIO.observe(s); });
  }

  /* -------- 9. Flip cards -------- */
  $$(".flip").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.setAttribute("aria-pressed", btn.getAttribute("aria-pressed") === "true" ? "false" : "true");
    });
  });

  /* -------- 10. Comparador (tabs accesibles) -------- */
  var compare = $('[data-interactive="compare"]');
  if (compare) {
    var tabs = $$(".compare__tab", compare);
    function selectTab(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        var panel = $("#" + t.getAttribute("aria-controls"));
        if (panel) { panel.hidden = !on; panel.classList.toggle("is-active", on); }
      });
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { selectTab(tab); });
      tab.addEventListener("keydown", function (ev) {
        if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
          ev.preventDefault();
          var next = ev.key === "ArrowRight" ? tabs[(i + 1) % tabs.length] : tabs[(i - 1 + tabs.length) % tabs.length];
          next.focus(); selectTab(next);
        }
      });
    });
  }

  /* -------- 12. Simulador LTV/CAC (ratio indexado, sin euros) -------- */
  var repeat = $("#simRepeat"), owned = $("#simOwned"), aov = $("#simAov");
  if (repeat && owned && aov) {
    var repeatOut = $("#simRepeatOut"), ownedOut = $("#simOwnedOut"), aovOut = $("#simAovOut");
    var fill = $("#simFill"), valueEl = $("#simValue"), gauge = $("#simGauge");
    function computeIndex(r, o, a) {
      var ltv = (1 + (r / 100) * 1.9) * (a / 100);
      var cac = 1.25 - (o / 100) * 0.45;
      return (ltv / cac) / 1.30;
    }
    function render() {
      var r = +repeat.value, o = +owned.value, a = +aov.value;
      repeatOut.textContent = r + "%"; ownedOut.textContent = o + "%"; aovOut.textContent = a;
      var idx = computeIndex(r, o, a);
      valueEl.textContent = idx.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      var pct = Math.max(0, Math.min(100, ((idx - 0.6) / (1.6 - 0.6)) * 100));
      fill.style.width = pct + "%";
      var ok = idx >= 1.0;
      gauge.classList.toggle("is-ok", ok);
      gauge.setAttribute("aria-label", "Ratio LTV/CAC indexado: " + valueEl.textContent + (ok ? ", por encima del umbral de rentabilidad" : ", por debajo del umbral"));
    }
    [repeat, owned, aov].forEach(function (i) { i.addEventListener("input", render); });
    render();
  }

  /* -------- 13. Tooltips reutilizables + resaltado del elemento activo -------- */
  (function initTips() {
    var targets = $$("[data-tip]");
    if (!targets.length) return;
    var touch = window.matchMedia("(hover: none)").matches;

    var tip = document.createElement("div");
    tip.className = "tip";
    tip.setAttribute("role", "status");
    tip.setAttribute("aria-hidden", "true");
    document.body.appendChild(tip);
    var current = null;

    function strip(html) { var d = document.createElement("div"); d.innerHTML = html; return d.textContent.replace(/\s+/g, " ").trim(); }

    targets.forEach(function (el) {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
      if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", strip(el.getAttribute("data-tip")));
      if (!el.getAttribute("role")) el.setAttribute("role", "img");
    });

    function place(x, y) {
      var tw = tip.offsetWidth, th = tip.offsetHeight, vw = window.innerWidth, vh = window.innerHeight, pad = 8;
      var px = x + 14, py = y + 16;
      if (px + tw + pad > vw) px = x - tw - 14;
      if (px < pad) px = pad;
      if (py + th + pad > vh) py = y - th - 14;
      if (py < pad) py = pad;
      tip.style.transform = "translate(" + Math.round(px) + "px," + Math.round(py) + "px)";
    }
    function placeAtEl(el) {
      var r = el.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight, vw = window.innerWidth, pad = 8;
      var px = r.left + r.width / 2 - tw / 2, py = r.top - th - 10;
      if (py < pad) py = r.bottom + 10;
      if (px + tw + pad > vw) px = vw - tw - pad;
      if (px < pad) px = pad;
      tip.style.transform = "translate(" + Math.round(px) + "px," + Math.round(py) + "px)";
    }
    function show(el) {
      current = el;
      tip.innerHTML = el.getAttribute("data-tip");
      tip.classList.add("is-on");
      tip.setAttribute("aria-hidden", "false");
      var g = el.closest("[data-tip-group]");
      if (g) g.classList.add("tipping");
      el.classList.add("ti-active");
    }
    function hide() {
      tip.classList.remove("is-on");
      tip.setAttribute("aria-hidden", "true");
      if (current) {
        var g = current.closest("[data-tip-group]");
        if (g) g.classList.remove("tipping");
        current.classList.remove("ti-active");
        current = null;
      }
    }

    if (!touch) {
      targets.forEach(function (el) {
        el.addEventListener("mouseenter", function (e) { show(el); place(e.clientX, e.clientY); });
        el.addEventListener("mousemove", function (e) { if (current === el) place(e.clientX, e.clientY); });
        el.addEventListener("mouseleave", hide);
        el.addEventListener("focus", function () { show(el); placeAtEl(el); });
        el.addEventListener("blur", hide);
      });
    } else {
      targets.forEach(function (el) {
        el.addEventListener("click", function (e) { e.stopPropagation(); if (current === el) { hide(); } else { show(el); placeAtEl(el); } });
        el.addEventListener("focus", function () { show(el); placeAtEl(el); });
        el.addEventListener("blur", hide);
      });
      document.addEventListener("click", function () { if (current) hide(); });
      window.addEventListener("scroll", function () { if (current) hide(); }, { passive: true });
    }
    window.addEventListener("keydown", function (e) { if (e.key === "Escape" && current) hide(); });
  })();

  /* -------- 14. Diagrama de silos (G10): botón "Conectar" -------- */
  var silosBtn = $("#silosConnect");
  if (silosBtn) {
    silosBtn.addEventListener("click", function () {
      var s = $(".silos");
      if (!s) return;
      s.classList.remove("is-animated");
      void s.offsetWidth;
      s.classList.add("is-animated");
    });
  }

  /* -------- 15. Forecast diario operativo + CSV (Sección 03) -------- */
  (function forecastDaily() {
    var body = $("#fdailyBody");
    if (!body) return;

    var BASE = 98659;
    // buckets semanales S1–S8 (mes 0-based: nov=10, dic=11)
    var WEEKS = [
      { id: "S1", label: "S1 · 1–7 nov", s: [2026,10,1],  e: [2026,10,7],  phase: "Pre-calentamiento", M: 1.27, CR: 0.037, AOV: 47, ERS: 0.12 },
      { id: "S2", label: "S2 · 8–14 nov", s: [2026,10,8],  e: [2026,10,14], phase: "Pre-calentamiento", M: 1.39, CR: 0.037, AOV: 47, ERS: 0.12 },
      { id: "S3", label: "S3 · 15–21 nov", s: [2026,10,15], e: [2026,10,21], phase: "Freshly Week",     M: 2.70, CR: 0.043, AOV: 52, ERS: 0.15 },
      { id: "S4", label: "S4 · 22–29 nov", s: [2026,10,22], e: [2026,10,29], phase: "Black Week",       M: 4.50, CR: 0.052, AOV: 55, ERS: 0.18 },
      { id: "S5", label: "S5 · 30 nov–6 dic", s: [2026,10,30], e: [2026,11,6],  phase: "Navidad",        M: 2.57, CR: 0.041, AOV: 58, ERS: 0.15 },
      { id: "S6", label: "S6 · 7–13 dic", s: [2026,11,7],  e: [2026,11,13], phase: "Navidad",           M: 2.47, CR: 0.041, AOV: 58, ERS: 0.15 },
      { id: "S7", label: "S7 · 14–20 dic", s: [2026,11,14], e: [2026,11,20], phase: "Navidad",          M: 2.85, CR: 0.041, AOV: 58, ERS: 0.15 },
      { id: "S8", label: "S8 · 21–31 dic", s: [2026,11,21], e: [2026,11,31], phase: "Last Call",        M: 1.65, CR: 0.039, AOV: 48, ERS: 0.10 }
    ];
    function wdMult(d) { var g = d.getDay(); if (g === 1 || g === 2) return 0.95; if (g === 3 || g === 4) return 1.00; if (g === 5) return 1.10; if (g === 6) return 1.05; return 0.95; }
    function evMult(d) {
      var m = d.getMonth(), day = d.getDate();
      if (m === 10 && day === 27) return 1.8;   // Black Friday
      if (m === 10 && day === 30) return 1.4;    // Cyber Monday
      if (m === 11 && (day === 21 || day === 22)) return 1.3; // corte envíos
      if (m === 11 && day === 24) return 0.7;
      if (m === 11 && day === 25) return 0.4;
      if (m === 11 && day === 31) return 0.6;
      return 1;
    }
    var nf = new Intl.NumberFormat("es-ES");
    var eur = function (n) { return nf.format(n) + " €"; };
    var pct = function (r) { return (r * 100).toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%"; };
    var shortDate = function (d) { return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }); };

    function computeDay(d, w) {
      var sessions = Math.round(BASE * w.M * wdMult(d) * evMult(d) / 100) * 100;
      var trans = Math.round(sessions * w.CR);
      var ingresos = Math.round(trans * w.AOV / 1000) * 1000;
      var inversion = Math.round(ingresos * w.ERS / 1000) * 1000;
      return { sessions: sessions, trans: trans, ingresos: ingresos, inversion: inversion };
    }

    var rowsHTML = "", csv = ["fecha;fase;sesiones;cr;aov;transacciones;ingresos;inversion"];
    WEEKS.forEach(function (w, wi) {
      var start = new Date(w.s[0], w.s[1], w.s[2]);
      var end = new Date(w.e[0], w.e[1], w.e[2]);
      var wk = { sessions: 0, trans: 0, ingresos: 0, inversion: 0 };
      var dayRows = "";
      for (var d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        var cur = new Date(d);
        var v = computeDay(cur, w);
        wk.sessions += v.sessions; wk.trans += v.trans; wk.ingresos += v.ingresos; wk.inversion += v.inversion;
        dayRows += '<tr class="fday" data-wk="' + wi + '">' +
          '<td>' + shortDate(cur) + '</td><td>' + w.phase + '</td>' +
          '<td class="num">' + nf.format(v.sessions) + '</td><td class="num">' + pct(w.CR) + '</td>' +
          '<td class="num">' + eur(w.AOV) + '</td><td class="num">' + nf.format(v.trans) + '</td>' +
          '<td class="num">' + eur(v.ingresos) + '</td><td class="num">' + eur(v.inversion) + '</td></tr>';
        var iso = cur.getFullYear() + "-" + String(cur.getMonth() + 1).padStart(2, "0") + "-" + String(cur.getDate()).padStart(2, "0");
        csv.push([iso, w.phase, v.sessions, (w.CR * 100).toFixed(1).replace(".", ",") + "%", w.AOV, v.trans, v.ingresos, v.inversion].join(";"));
      }
      rowsHTML += '<tr class="fweek" data-wk="' + wi + '" tabindex="0" role="button" aria-expanded="false">' +
        '<th scope="row" class="fweek__lbl">' + w.label + '</th><td>' + w.phase + '</td>' +
        '<td class="num">' + nf.format(wk.sessions) + '</td><td class="num">' + pct(w.CR) + '</td>' +
        '<td class="num">' + eur(w.AOV) + '</td><td class="num">' + nf.format(wk.trans) + '</td>' +
        '<td class="num">' + eur(wk.ingresos) + '</td><td class="num">' + eur(wk.inversion) + '</td></tr>' + dayRows;
    });
    body.innerHTML = rowsHTML;

    // toggle semana → días
    function toggleWeek(tr) {
      var wi = tr.getAttribute("data-wk");
      var open = tr.classList.toggle("is-open");
      tr.setAttribute("aria-expanded", open ? "true" : "false");
      $$('.fday[data-wk="' + wi + '"]', body).forEach(function (r) { r.classList.toggle("is-shown", open); });
    }
    $$(".fweek", body).forEach(function (tr) {
      tr.addEventListener("click", function () { toggleWeek(tr); });
      tr.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleWeek(tr); } });
    });

    // CSV
    var csvBtn = $("#fdailyCsv");
    if (csvBtn) {
      csvBtn.addEventListener("click", function () {
        var blob = new Blob(["﻿" + csv.join("\n")], { type: "text/csv;charset=utf-8;" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url; a.download = "freshly-forecast-diario-nov-dic-2026.csv";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // en modo PDF, desplegar todas las semanas
    if (SHOWALL) $$(".fweek", body).forEach(function (tr) { if (!tr.classList.contains("is-open")) tr.click(); });
  })();

  /* -------- 16. Modo PDF/impresión (?showall=1): revela y expande todo -------- */
  if (SHOWALL) {
    $$(".reveal, [data-stagger]").forEach(function (el) { el.classList.add("is-in"); });
    $$('[data-interactive], .silos, .tshape, .chart').forEach(function (el) { el.classList.add("is-animated"); });
    $$("details").forEach(function (d) { d.open = true; });
  }

})();
