/* Mobile-only poster stack — a physical pile of posters that fans on swipe and
   settles back into a vertical stack. Active poster front-and-centre; swipe/tap/
   arrow-keys to browse; loops; transform+opacity only; respects reduced-motion. */
(function () {
  var DATA = (window.RAKA_DATA && window.RAKA_DATA.posters) || [];
  var stack = document.getElementById("pstack");
  var stage = document.getElementById("pstack-stage");
  var capEl = document.getElementById("pstack-cap");
  var cntEl = document.getElementById("pstack-count");
  if (!stack || !stage || !DATA.length) return;

  var mq = window.matchMedia("(max-width:767px)");
  var n = DATA.length;
  var active = 0;
  var cards = [];
  var built = false;
  var dragging = false, dragDx = 0, dragProg = 0;

  function VW() { return window.innerWidth; }
  function pad(x) { return x < 10 ? "0" + x : "" + x; }
  function mod(p) { return ((p % n) + n) % n; }
  function wrap(p) { p = mod(p); if (p > n / 2) p -= n; return p; } // nearest signed distance

  function build() {
    if (built) return;
    stage.innerHTML = "";
    cards = [];
    for (var i = 0; i < n; i++) {
      var el = document.createElement("div");
      el.className = "pcard";
      var img = document.createElement("img");
      img.alt = DATA[i].title || ("Poster " + (i + 1));
      img.decoding = "async";
      el.appendChild(img);
      stage.appendChild(el);
      cards.push({ el: el, img: img, i: i, loaded: false });
    }
    built = true;
  }

  function ensureSrc(c, p) {
    if (!c.loaded && Math.abs(p) <= 5) { c.img.src = DATA[c.i].thumb; c.loaded = true; }
  }

  // resting transform for a signed relative position p
  function rest(p) {
    if (p === 0) return { x: 0, y: 0, s: 1, r: 0, z: 100, o: 1 };
    if (p > 0) { // pile receding downward/back
      if (p > 3) return { x: 0, y: 104, s: .82, r: 0, z: 100 - p, o: 0 };
      var y = [0, 34, 62, 86][p], s = [1, .94, .89, .85][p], r = [0, 2.2, -2.4, 1.6][p], o = [1, .95, .82, .6][p];
      return { x: 0, y: y, s: s, r: r, z: 100 - p, o: o };
    }
    return { x: -1.15 * VW(), y: -8, s: .92, r: -8, z: 110, o: 0 }; // exited / parked left (on top while leaving)
  }

  function applyTo(c, t) {
    var xs = (t.x >= 0 ? "+ " + t.x : "- " + (-t.x)) + "px";
    var ys = (t.y >= 0 ? "+ " + t.y : "- " + (-t.y)) + "px";
    c.el.style.transform = "translate(calc(-50% " + xs + "), calc(-50% " + ys + ")) scale(" + t.s + ") rotate(" + t.r + "deg)";
    c.el.style.zIndex = t.z;
    c.el.style.opacity = t.o;
    c.el.style.pointerEvents = "none";
  }

  function layout() {
    for (var k = 0; k < n; k++) {
      var c = cards[k];
      var p = wrap(c.i - active);
      ensureSrc(c, p);
      if (dragging && (p > 3 || p < -1)) continue; // only restyle the visible window mid-drag
      var t = rest(p);
      if (dragging) {
        if (p === 0) { t.x = dragDx; t.r = dragDx * 0.02; }
        else if (p === 1) { t.x = dragProg * 0.17 * VW(); t.r += dragProg * 1.6; }      // peek right
        else if (p === 2) { t.x = -dragProg * 0.14 * VW(); t.r += -dragProg * 1.2; }    // peek left
        else if (p === -1) { t.o = Math.min(0.55, dragProg * 0.7); t.x = -0.62 * VW() * dragProg - 4; }
      }
      applyTo(c, t);
    }
    updateMeta();
  }

  function updateMeta() {
    var d = DATA[mod(active)];
    if (capEl) capEl.textContent = d.title || "";
    if (cntEl) cntEl.textContent = pad(mod(active) + 1) + " / " + pad(n);
  }

  function go(dir) { active += dir; layout(); }

  // ---- pointer / swipe ----
  var pid = null, sx = 0, sy = 0, captured = false, moved = false;
  stage.addEventListener("pointerdown", function (e) {
    if (!mq.matches) return;
    pid = e.pointerId; sx = e.clientX; sy = e.clientY;
    captured = false; moved = false; dragDx = 0; dragProg = 0;
  });
  stage.addEventListener("pointermove", function (e) {
    if (pid === null || !mq.matches) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (!captured) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        captured = true; moved = true; dragging = true; stage.classList.add("is-dragging");
        try { stage.setPointerCapture(pid); } catch (_) {}
      } else if (Math.abs(dy) > 10) { pid = null; return; } // vertical → let page scroll
      else return;
    }
    e.preventDefault();
    dragDx = dx; dragProg = Math.min(Math.abs(dx) / 120, 1);
    layout();
  }, { passive: false });
  function endDrag() {
    if (pid === null) return;
    var dx = dragDx, wasDrag = captured;
    pid = null; captured = false;
    if (!wasDrag) return;
    dragging = false; stage.classList.remove("is-dragging");
    var TH = Math.max(46, VW() * 0.16);
    dragDx = 0; dragProg = 0;
    if (dx <= -TH) go(1);
    else if (dx >= TH) go(-1);
    else layout();
  }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  // ---- tap left/right ----
  stage.addEventListener("click", function (e) {
    if (!mq.matches) return;
    if (moved) { moved = false; return; }
    var r = stage.getBoundingClientRect();
    go((e.clientX - r.left) > r.width / 2 ? 1 : -1);
  });

  // ---- keyboard ----
  stack.addEventListener("keydown", function (e) {
    if (!mq.matches) return;
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  });

  function init() {
    if (!mq.matches || !DATA.length) return;
    build();
    stage.classList.add("no-anim");
    layout();
    requestAnimationFrame(function () { stage.classList.remove("no-anim"); });
  }
  if (mq.addEventListener) mq.addEventListener("change", function () { if (mq.matches) init(); });
  window.addEventListener("resize", function () { if (mq.matches && built) layout(); }, { passive: true });
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
