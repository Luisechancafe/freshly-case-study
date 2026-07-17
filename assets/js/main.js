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
  $$('[data-interactive="funnel"], [data-interactive="ice"], [data-interactive="chart"]').forEach(function (el) { animIO.observe(el); });

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

})();
