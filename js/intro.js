/* RAKA ASHOK — video-portal lockup + cinematic intro
   The "O" of ASHOK is a lens that plays footage. On first visit the lens flies in
   (reverse-zoom -> centre -> one 3D spin -> lands as the O), then the tagline fades in. */
(function () {
  "use strict";
  var root = document.documentElement;

  function clearStage() {
    root.classList.remove("lk-pending", "lens-pending", "tag-pending", "intro-on");
    var i = document.getElementById("intro");
    if (i && i.parentNode) i.parentNode.removeChild(i);
  }

  try {
    var reduce  = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var saveData = !!(navigator.connection && navigator.connection.saveData);
    var small   = matchMedia("(max-width: 768px)").matches;
    var isHome  = document.body.getAttribute("data-page") === "home";

    function srcFor(v) { return (small || saveData) && v.dataset.srcSm ? v.dataset.srcSm : v.dataset.src; }
    function load(v) { if (!v || v.dataset.on) return; var s = srcFor(v); if (s) { v.src = s; v.dataset.on = "1"; try { v.load(); } catch (e) {} } }
    function play(v) { if (!v) return; var p; try { p = v.play(); } catch (e) {} if (p && p.catch) p.catch(function () {}); }

    var heroLockup = document.querySelector(".hero-lockup");
    var heroVideo  = heroLockup ? heroLockup.querySelector("video") : null;

    // Hero lens playback once the intro is out of the way.
    function heroPlayback() {
      if (!heroVideo) return;
      if (reduce) { // hover/focus only
        var on = function () { load(heroVideo); play(heroVideo); };
        var off = function () { heroVideo.pause(); };
        heroLockup.addEventListener("pointerenter", on);
        heroLockup.addEventListener("pointerleave", off);
        heroLockup.addEventListener("focusin", on);
        heroLockup.addEventListener("focusout", off);
        return;
      }
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { load(heroVideo); play(heroVideo); } else heroVideo.pause(); });
      }, { threshold: 0.2 });
      io.observe(heroVideo);
      document.addEventListener("visibilitychange", function () { if (document.hidden) heroVideo.pause(); });
    }

    function revealTagline() { root.classList.remove("tag-pending"); }

    var introEl = document.getElementById("intro");
    var armed = root.classList.contains("intro-on"); // set pre-paint by the head script
    var shouldIntro = isHome && introEl && armed && !reduce && !saveData && !sessionStorage.getItem("raka-intro-seen");

    if (!shouldIntro) {
      if (introEl && introEl.parentNode) introEl.parentNode.removeChild(introEl);
      root.classList.remove("intro-on");
      requestAnimationFrame(function () {
        root.classList.remove("lk-pending", "lens-pending");
        setTimeout(revealTagline, 180);
      });
      heroPlayback();
      return;
    }

    // ---------- run the intro ----------
    sessionStorage.setItem("raka-intro-seen", "1");
    var lens = document.getElementById("introLens");
    var iv   = document.getElementById("introVideo");
    var skip = document.getElementById("introSkip");
    load(iv); play(iv);

    var EASE = "cubic-bezier(.22,.61,.36,1)", EASE_IO = "cubic-bezier(.66,0,.2,1)";
    var SLOW = /introslow/.test(location.search) ? 4 : 1; // debug: /index.html?introslow
    var done = false, anims = [];
    function rec(a) { anims.push(a); return a; }

    function finish() {
      if (done) return; done = true;
      if (heroVideo) { load(heroVideo); play(heroVideo); }
      root.classList.remove("lk-pending", "lens-pending"); // letters + real lens in
      if (introEl) introEl.classList.add("is-out", "bg-out");
      setTimeout(revealTagline, 360);                       // tagline fades in LAST
      setTimeout(function () {
        if (introEl && introEl.parentNode) introEl.parentNode.removeChild(introEl);
        root.classList.remove("intro-on");
      }, 720);
      heroPlayback();
    }

    function sequence() {
      // 1) reverse-zoom: huge + blurred -> centred
      rec(lens.animate(
        [{ transform: "scale(2.7)", filter: "blur(16px)", opacity: 0 },
         { transform: "scale(1)",   filter: "blur(2px)",  opacity: 1 }],
        { duration: 1150 * SLOW, easing: EASE, fill: "both" }
      )).finished.then(function () {
        if (done) return Promise.reject();
        // 2) exactly one 3D rotation, blur swells then resolves sharp
        return rec(lens.animate(
          [{ transform: "perspective(1400px) rotateY(0deg) scale(1)",    filter: "blur(2px)" },
           { transform: "perspective(1400px) rotateY(180deg) scale(1.05)", filter: "blur(9px)", offset: 0.5 },
           { transform: "perspective(1400px) rotateY(360deg) scale(1)",   filter: "blur(0px)" }],
          { duration: 1050 * SLOW, easing: "cubic-bezier(.5,0,.2,1)", fill: "both" }
        )).finished;
      }).then(function () {
        if (done) return Promise.reject();
        // 3) FLIP into the hero O; letters assemble; page revealed behind
        var target = document.querySelector(".hero-lockup .lockup__lens");
        root.classList.remove("lk-pending");
        if (introEl) introEl.classList.add("bg-out");
        if (!target) { finish(); return Promise.reject(); }
        var lr = lens.getBoundingClientRect(), tr = target.getBoundingClientRect();
        var dx = (tr.left + tr.width / 2) - (lr.left + lr.width / 2);
        var dy = (tr.top + tr.height / 2) - (lr.top + lr.height / 2);
        var s = tr.width / lr.width;
        return rec(lens.animate(
          [{ transform: "translate(0,0) scale(1)" },
           { transform: "translate(" + dx + "px," + dy + "px) scale(" + s + ")" }],
          { duration: 900 * SLOW, easing: EASE_IO, fill: "both" }
        )).finished;
      }).then(function () { finish(); }).catch(function () { /* skipped/cancelled */ });
    }

    function skipNow() {
      if (done) return;
      anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
      if (introEl) introEl.classList.add("bg-out");
      finish();
    }
    if (skip) skip.addEventListener("click", skipNow);
    addEventListener("keydown", function (e) { if (e.key === "Escape") skipNow(); });
    addEventListener("wheel", function w() { skipNow(); removeEventListener("wheel", w); }, { passive: true });
    addEventListener("touchmove", function t() { skipNow(); removeEventListener("touchmove", t); }, { passive: true });

    // start once laid out, so the FLIP target rect is correct
    requestAnimationFrame(function () { requestAnimationFrame(sequence); });
  } catch (err) {
    clearStage(); // never leave the hero hidden
  }
})();
