/* RAKA ASHOK - full-bleed video hero
   Picks a random clip from the pool (loader + hero don't always show the same one),
   plays it muted/looping behind the wordmark + tagline, with a first-visit entrance. */
(function () {
  "use strict";
  var root = document.documentElement;
  function bail() { root.classList.remove("tag-pending", "hero-intro"); }

  try {
    var hero = document.querySelector(".hero--video");
    if (!hero) { bail(); return; }
    var video = hero.querySelector("video");
    var nav = document.querySelector(".nav");
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var saveData = !!(navigator.connection && navigator.connection.saveData);
    var small = matchMedia("(max-width: 768px)").matches;

    // keep the hero pulled up exactly under the (transparent) nav
    function setNavH() { if (nav) root.style.setProperty("--nav-h", nav.offsetHeight + "px"); }
    setNavH();
    addEventListener("resize", setNavH);

    // ---- Raka clip pool (add more files here and they auto-join the rotation) ----
    var POOL = [
      { mp4: "assets/video/raka-stage.mp4",  sm: "assets/video/raka-stage-sm.mp4",  poster: "assets/video/raka-stage-poster.jpg",  land: true },
      { mp4: "assets/video/raka-portal.mp4", sm: "assets/video/raka-portal-sm.mp4", poster: "assets/video/raka-portal-poster.jpg", land: false }
    ];
    // desktop favours landscape clips; mobile can use any
    var candidates = small ? POOL : POOL.filter(function (c) { return c.land; });
    if (!candidates.length) candidates = POOL;
    var pick = candidates[Math.floor(Math.random() * candidates.length)];
    var src = (small || saveData) && pick.sm ? pick.sm : pick.mp4;
    video.setAttribute("poster", pick.poster);

    function play() { var p; try { p = video.play(); } catch (e) {} if (p && p.catch) p.catch(function () {}); }
    function load() { if (video.dataset.on) return; video.src = src; video.dataset.on = "1"; try { video.load(); } catch (e) {} }
    function revealTagline() { root.classList.remove("tag-pending"); }

    if (reduce) { // respect motion preference: static poster, play on hover/focus
      revealTagline();
      var on = function () { load(); play(); }, off = function () { video.pause(); };
      hero.addEventListener("pointerenter", on);
      hero.addEventListener("pointerleave", off);
      hero.addEventListener("focusin", on);
      hero.addEventListener("focusout", off);
      return;
    }

    // autoplay (muted) while in view, pause offscreen / when tab hidden
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { load(); play(); } else video.pause(); });
      }, { threshold: 0.15 });
      io.observe(video);
    } else { load(); play(); }
    document.addEventListener("visibilitychange", function () { if (document.hidden) video.pause(); });

    // entrance: first visit this session animates in (the "loader" moment); tagline last
    if (root.classList.contains("hero-intro")) {
      setTimeout(revealTagline, 1150);
      setTimeout(function () { root.classList.remove("hero-intro"); }, 2000);
    } else {
      requestAnimationFrame(function () { setTimeout(revealTagline, 120); });
    }
    sessionStorage.setItem("raka-hero-seen", "1");
  } catch (err) { bail(); }
})();
