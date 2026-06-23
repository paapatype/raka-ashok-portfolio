/* RAKA ASHOK - first-visit loader (flip -> open) + full-bleed video hero.
   Loader: lens reverse-zooms in, does one 3D spin, FLIPs into the O of the RAKA ASHOK
   wordmark, then the O expands and hands off to the full-bleed hero (same clip = seamless).
   Clip is chosen from a pool, so it varies between sessions. */
(function () {
  "use strict";
  var root = document.documentElement;
  function bail() {
    root.classList.remove("tag-pending", "intro-on", "letters-in", "hero-opening");
    var i = document.getElementById("intro"); if (i && i.parentNode) i.parentNode.removeChild(i);
  }

  try {
    var hero = document.querySelector(".hero--video"); if (!hero) { bail(); return; }
    var heroVideo = hero.querySelector("video");
    var nav = document.querySelector(".nav");
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var saveData = !!(navigator.connection && navigator.connection.saveData);
    var small = matchMedia("(max-width: 768px)").matches;

    function setNavH() { if (nav) root.style.setProperty("--nav-h", nav.offsetHeight + "px"); }
    setNavH(); addEventListener("resize", setNavH);

    // ---- Raka clip pool (add files here; they auto-join the rotation) ----
    var POOL = [
      { mp4: "assets/video/raka-stage.mp4",  sm: "assets/video/raka-stage-sm.mp4",  poster: "assets/video/raka-stage-poster.jpg",  land: true },
      { mp4: "assets/video/raka-portal.mp4", sm: "assets/video/raka-portal-sm.mp4", poster: "assets/video/raka-portal-poster.jpg", land: false }
    ];
    function srcOf(c) { return (small || saveData) && c.sm ? c.sm : c.mp4; }
    function pickClip() {
      var arr = small ? POOL : POOL.filter(function (c) { return c.land; });
      if (!arr.length) arr = POOL;
      return arr[Math.floor(Math.random() * arr.length)];
    }
    function play(v) { if (!v) return; try { v.muted = true; } catch (e) {} var p; try { p = v.play(); } catch (e) {} if (p && p.catch) p.catch(function () {}); }
    function loadV(v, s) { if (v.dataset.on) return; v.src = s; v.dataset.on = "1"; try { v.load(); } catch (e) {} }
    function revealTagline() { root.classList.remove("tag-pending"); }

    // iOS / Low-Power autoplay fallback: kick playback on the first user gesture
    function kick() { if (heroVideo) play(heroVideo); var iv2 = document.getElementById("introVideo"); if (iv2) play(iv2); }
    ["touchstart", "pointerdown", "scroll"].forEach(function (ev) { addEventListener(ev, function h() { kick(); removeEventListener(ev, h); }, { passive: true }); });

    function heroPlayback(pick) {
      heroVideo.setAttribute("poster", pick.poster);
      if (reduce) {
        revealTagline();
        var on = function () { loadV(heroVideo, srcOf(pick)); play(heroVideo); }, off = function () { heroVideo.pause(); };
        hero.addEventListener("pointerenter", on); hero.addEventListener("pointerleave", off);
        hero.addEventListener("focusin", on); hero.addEventListener("focusout", off);
        return;
      }
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { loadV(heroVideo, srcOf(pick)); play(heroVideo); } else heroVideo.pause(); });
        }, { threshold: 0.15 });
        io.observe(heroVideo);
      } else { loadV(heroVideo, srcOf(pick)); play(heroVideo); }
      document.addEventListener("visibilitychange", function () { if (document.hidden) heroVideo.pause(); });
    }

    var introEl = document.getElementById("intro");
    var force = /intro/.test(location.search);
    var runIntro = root.classList.contains("intro-on") && introEl && !reduce && !saveData && (force || !sessionStorage.getItem("raka-hero-seen"));
    sessionStorage.setItem("raka-hero-seen", "1");

    if (!runIntro) {
      if (introEl && introEl.parentNode) introEl.parentNode.removeChild(introEl);
      root.classList.remove("intro-on");
      heroPlayback(pickClip());
      setTimeout(revealTagline, 120); // not rAF-gated, so it still fires in background tabs
      return;
    }

    // ---------- LOADER: flip -> open to full-bleed (one clip for continuity) ----------
    var pick = pickClip();
    var fly = document.getElementById("introFly");
    var iv = document.getElementById("introVideo");
    var Oslot = document.getElementById("introO");
    var skip = document.getElementById("introSkip");
    iv.setAttribute("poster", pick.poster); loadV(iv, srcOf(pick)); play(iv);

    var SLOW = /introslow/.test(location.search) ? 4 : 1;
    var EASE = "cubic-bezier(.22,.61,.36,1)", SPIN = "cubic-bezier(.5,0,.2,1)", IO = "cubic-bezier(.66,0,.2,1)";
    var T0 = "translate(-50%,-50%)";
    var done = false, anims = [], fdx = 0, fdy = 0, fs = 1;
    function rec(a) { anims.push(a); return a; }
    function flipStr(scale) { return T0 + " translate(" + fdx + "px," + fdy + "px) scale(" + scale + ")"; }

    function finish() {
      if (done) return; done = true;
      // real hero ready underneath, on the SAME clip + frame
      heroVideo.setAttribute("poster", pick.poster);
      loadV(heroVideo, srcOf(pick));
      try { heroVideo.currentTime = iv.currentTime || 0; } catch (e) {}
      play(heroVideo);
      // STRETCH the lens out until it fills the screen (stays opaque -> it *becomes* the hero)
      var bw = fly.offsetWidth || 528, bh = fly.offsetHeight || 181;
      var cover = Math.max(innerWidth / bw, innerHeight / bh) * 1.6; // fill + push the lens's curved edges off-screen
      try {
        rec(fly.animate(
          [{ transform: flipStr(fs) }, { transform: T0 + " translate(0px,0px) scale(" + cover + ")" }],
          { duration: 860 * SLOW, easing: "cubic-bezier(.6,0,.3,1)", fill: "both" }
        ));
      } catch (e) {}
      // over the last part of the stretch, dissolve the overlay into the matching hero behind it
      setTimeout(function () { root.classList.add("hero-opening"); introEl.classList.add("is-out"); }, 480 * SLOW);
      // ...then the rest appears
      setTimeout(function () { revealTagline(); heroPlayback(pick); }, 920 * SLOW);
      setTimeout(function () {
        if (introEl && introEl.parentNode) introEl.parentNode.removeChild(introEl);
        root.classList.remove("intro-on", "hero-opening");
      }, 1220 * SLOW);
    }

    function sequence() {
      rec(fly.animate( // 1) reverse-zoom in
        [{ transform: T0 + " scale(2.7)", filter: "blur(16px)", opacity: 0 },
         { transform: T0 + " scale(1)",   filter: "blur(2px)",  opacity: 1 }],
        { duration: 1150 * SLOW, easing: EASE, fill: "both" }
      )).finished.then(function () {
        if (done) return Promise.reject();
        return rec(fly.animate( // 2) one 3D spin
          [{ transform: T0 + " perspective(1400px) rotateY(0deg) scale(1)",    filter: "blur(2px)" },
           { transform: T0 + " perspective(1400px) rotateY(180deg) scale(1.05)", filter: "blur(9px)", offset: 0.5 },
           { transform: T0 + " perspective(1400px) rotateY(360deg) scale(1)",   filter: "blur(0px)" }],
          { duration: 1050 * SLOW, easing: SPIN, fill: "both" }
        )).finished;
      }).then(function () {
        if (done) return Promise.reject();
        // 3) FLIP into the O; letters assemble around it
        root.classList.add("letters-in");
        var fr = fly.getBoundingClientRect(), orc = Oslot.getBoundingClientRect();
        fdx = (orc.left + orc.width / 2) - (fr.left + fr.width / 2);
        fdy = (orc.top + orc.height / 2) - (fr.top + fr.height / 2);
        fs = orc.width / fr.width;
        return rec(fly.animate(
          [{ transform: T0 + " scale(1)" }, { transform: flipStr(fs) }],
          { duration: 900 * SLOW, easing: IO, fill: "both" }
        )).finished;
      }).then(function () {
        if (done) return Promise.reject();
        return new Promise(function (res) { setTimeout(res, 450 * SLOW); }); // hold on the wordmark
      }).then(function () { finish(); }).catch(function () {});
    }

    function skipNow() {
      if (done) return;
      anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
      root.classList.add("letters-in");
      finish();
    }
    if (skip) skip.addEventListener("click", skipNow);
    addEventListener("keydown", function (e) { if (e.key === "Escape") skipNow(); });
    addEventListener("wheel", function w() { skipNow(); removeEventListener("wheel", w); }, { passive: true });
    addEventListener("touchmove", function t() { skipNow(); removeEventListener("touchmove", t); }, { passive: true });

    requestAnimationFrame(function () { requestAnimationFrame(sequence); });
  } catch (err) { bail(); }
})();
