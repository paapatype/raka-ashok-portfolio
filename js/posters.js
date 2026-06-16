/* posters grid + grid-size toggle + lightbox with caption reveal */
(function () {
  var DATA = (window.RAKA_DATA && window.RAKA_DATA.posters) || [];
  var gridEl = document.querySelector("#grid");
  var stripEl = document.querySelector("[data-strip]");
  var host = gridEl || stripEl;
  if (!host) return;

  var list = gridEl ? DATA : DATA.slice(0, 10);

  // ---- render cards ----
  function cardHTML(p, i) {
    var cap = p.caption
      ? '<div class="card__cap">' + escapeHTML(p.caption) + "</div>"
      : "";
    return (
      '<button class="card reveal" data-i="' + i + '" aria-label="View ' + escapeHTML(p.title) + '">' +
      '<img class="card__img" src="' + p.thumb + '" alt="' + escapeHTML(p.title) + '" loading="lazy" decoding="async">' +
      '<span class="card__plus" aria-hidden="true">+</span>' +
      '<span class="card__overlay">' +
      '<span class="card__title">' + escapeHTML(p.title) + "</span>" +
      cap +
      "</span>" +
      "</button>"
    );
  }
  host.innerHTML = list.map(cardHTML).join("");
  if (window.__observeReveals) window.__observeReveals(host);

  var total = document.querySelector("[data-total]");
  if (total) total.textContent = DATA.length + " posters · 2016–2026";

  // ---- grid-size toggle ----
  var seg = document.querySelector("[data-seg]");
  if (seg && gridEl) {
    seg.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-view]");
      if (!b) return;
      seg.querySelectorAll("button").forEach(function (x) { x.classList.remove("is-active"); });
      b.classList.add("is-active");
      gridEl.setAttribute("data-view", b.getAttribute("data-view"));
    });
  }

  // ---- lightbox ----
  var lb = document.createElement("div");
  lb.className = "lb";
  lb.innerHTML =
    '<div class="lb__top">' +
    '<span class="lb__count" data-count></span>' +
    '<button class="lb__close" aria-label="Close">' + icon("x") + "</button>" +
    "</div>" +
    '<div class="lb__stage">' +
    '<button class="lb__nav lb__nav--prev" aria-label="Previous">' + icon("prev") + "</button>" +
    '<img class="lb__img" alt="">' +
    '<button class="lb__nav lb__nav--next" aria-label="Next">' + icon("next") + "</button>" +
    "</div>" +
    '<div class="lb__cap"><h3></h3><p></p></div>';
  document.body.appendChild(lb);

  var lbImg = lb.querySelector(".lb__img");
  var lbTitle = lb.querySelector(".lb__cap h3");
  var lbText = lb.querySelector(".lb__cap p");
  var lbCount = lb.querySelector("[data-count]");
  var cur = 0;

  function show(i, dir) {
    cur = (i + list.length) % list.length;
    var p = list[cur];
    lb.classList.remove("cap-in");
    lbImg.classList.remove("is-in");
    var img = new Image();
    img.onload = function () {
      lbImg.src = p.full;
      lbImg.alt = p.title;
      requestAnimationFrame(function () { lbImg.classList.add("is-in"); });
    };
    img.src = p.full;
    lbTitle.textContent = p.title;
    lbText.textContent = p.caption || "";
    lbText.style.display = p.caption ? "" : "none";
    lbCount.textContent = pad(cur + 1) + " / " + pad(list.length);
    setTimeout(function () { lb.classList.add("cap-in"); }, 180);
  }

  function open(i) {
    show(i);
    lb.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function close() {
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  host.addEventListener("click", function (e) {
    var c = e.target.closest(".card");
    if (!c) return;
    open(parseInt(c.getAttribute("data-i"), 10));
  });
  lb.querySelector(".lb__close").addEventListener("click", close);
  lb.querySelector(".lb__nav--prev").addEventListener("click", function () { show(cur - 1); });
  lb.querySelector(".lb__nav--next").addEventListener("click", function () { show(cur + 1); });
  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target.classList.contains("lb__stage")) close();
  });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(cur - 1);
    else if (e.key === "ArrowRight") show(cur + 1);
  });

  // ---- helpers ----
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function icon(name) {
    var p = {
      x: '<path d="M5 5l14 14M19 5L5 19"/>',
      prev: '<path d="M15 5l-7 7 7 7"/>',
      next: '<path d="M9 5l7 7-7 7"/>'
    }[name];
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  }
})();
