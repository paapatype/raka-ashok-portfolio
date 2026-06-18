/* shared site behaviour: nav state, scroll reveal */
(function () {
  // active nav pill
  var page = document.body.getAttribute("data-page");
  document.querySelectorAll(".nav__links .pill").forEach(function (a) {
    if (a.getAttribute("data-nav") === page) a.classList.add("is-active");
  });

  // nav border on scroll
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 6);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // scroll reveal
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
  function observeReveals(root) {
    (root || document).querySelectorAll(".reveal:not(.in)").forEach(function (el) {
      io.observe(el);
    });
  }
  window.__observeReveals = observeReveals;
  observeReveals();

  // year
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();

  // client belt - renders on any page that has #belt-track (duplicated for seamless loop)
  var beltTrack = document.getElementById("belt-track");
  if (beltTrack) {
    var fallback = ["Saras Co", "Roma Italian Deli", "Forlife", "Rootnine", "Lowe Lintas",
      "Phable", "Coderapper", "TED", "Adidas Originals", "Amazon.in", "Flipkart", "Nucleya",
      "Krunk", "Dualist Inquiry", "Social Offline", "Clustr", "Byg Brewski", "Azure Hospitality",
      "Heel & Buckle", "Cinnamon Pictures", "29K Investment Advisers", "Furlenco", "CommonFloor",
      "Malfnktion", "StayAbode", "Tuzo"];
    var items = (window.RAKA_CLIENTS && window.RAKA_CLIENTS.length)
      ? window.RAKA_CLIENTS
      : fallback.map(function (n) { return { name: n, logo: null }; });
    var bh = items.map(function (c) {
      var logo = c.logo ? '<img class="belt__logo" src="' + c.logo + '" alt="" loading="lazy">' : "";
      return '<span class="belt__item">' + logo + '<span class="belt__name">' + c.name + "</span></span>";
    }).join("");
    beltTrack.innerHTML = bh + bh;
    // reveal immediately - the belt is populated after the IntersectionObserver's
    // initial reading, so it would otherwise stay hidden when in view on load
    var beltEl = beltTrack.closest(".belt");
    if (beltEl) beltEl.classList.add("in");
    var beltSec = beltTrack.closest(".belt-section");
    if (beltSec) beltSec.querySelectorAll(".reveal").forEach(function (e) { e.classList.add("in"); });
  }

  // theme toggle (injected into the nav on every page; initial theme set by inline <head> script)
  var root = document.documentElement;
  var navLinks = document.querySelector(".nav__links");
  if (navLinks) {
    var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
    var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    var tbtn = document.createElement("button");
    tbtn.type = "button";
    tbtn.className = "pill pill--icon";
    tbtn.id = "theme-toggle";
    tbtn.setAttribute("aria-label", "Toggle dark mode");
    var paintIcon = function () {
      tbtn.innerHTML = root.getAttribute("data-theme") === "dark" ? SUN : MOON;
    };
    paintIcon();
    tbtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("raka-theme", next); } catch (e) {}
      paintIcon();
    });
    navLinks.appendChild(tbtn);
  }
})();
