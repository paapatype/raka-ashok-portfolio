/* About page — click any performance photo to open a large, navigable lightbox.
   Reuses the .lb lightbox styles. Hero + on-stage gallery, in DOM order. */
(function () {
  var imgs = Array.prototype.slice.call(
    document.querySelectorAll(".about-hero img, .live-grid img")
  );
  if (!imgs.length) return;

  function svg(n) {
    var p = { x: '<path d="M5 5l14 14M19 5L5 19"/>', prev: '<path d="M15 5l-7 7 7 7"/>', next: '<path d="M9 5l7 7-7 7"/>' }[n];
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  // make photos look and act clickable
  imgs.forEach(function (im, i) {
    im.style.cursor = "zoom-in";
    im.setAttribute("role", "button");
    im.setAttribute("tabindex", "0");
    im.addEventListener("click", function () { open(i); });
    im.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
    });
  });

  var lb = document.createElement("div");
  lb.className = "lb";
  lb.innerHTML =
    '<div class="lb__top">' +
    '<span class="lb__count" data-c></span>' +
    '<button class="lb__close" aria-label="Close">' + svg("x") + "</button>" +
    "</div>" +
    '<div class="lb__stage">' +
    '<button class="lb__nav lb__nav--prev" aria-label="Previous">' + svg("prev") + "</button>" +
    '<img class="lb__img" alt="">' +
    '<button class="lb__nav lb__nav--next" aria-label="Next">' + svg("next") + "</button>" +
    "</div>";
  document.body.appendChild(lb);

  var lbImg = lb.querySelector(".lb__img");
  var cEl = lb.querySelector("[data-c]");
  var cur = 0;

  function show(i) {
    cur = (i + imgs.length) % imgs.length;
    var src = imgs[cur].currentSrc || imgs[cur].src;
    lbImg.classList.remove("is-in");
    var pre = new Image();
    pre.onload = function () {
      lbImg.src = src; lbImg.alt = imgs[cur].alt || "";
      requestAnimationFrame(function () { lbImg.classList.add("is-in"); });
    };
    pre.src = src;
    cEl.textContent = pad(cur + 1) + " / " + pad(imgs.length);
  }
  function open(i) { show(i); lb.classList.add("is-open"); document.body.style.overflow = "hidden"; }
  function close() { lb.classList.remove("is-open"); document.body.style.overflow = ""; }

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

  // swipe on touch
  var sx = 0, sy = 0, down = false;
  lb.addEventListener("pointerdown", function (e) { down = true; sx = e.clientX; sy = e.clientY; });
  lb.addEventListener("pointerup", function (e) {
    if (!down) return; down = false;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1));
  });
})();
