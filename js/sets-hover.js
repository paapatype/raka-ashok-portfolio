/* RAKA ASHOK - DJ-set cards: clean YouTube hover preview (muted, from mid-clip, no chrome).
   Uses the IFrame Player API: keeps the static thumbnail on top and only fades the video in once it's
   actually PLAYING (so the title card / spinner / logo never show), after seeking into the middle. The
   iframe is scaled up + clipped to hide any residual logo, and is non-interactive so hovering never
   surfaces YouTube's overlays. Clicking the card still opens the video. No preview on touch / reduced-motion. */
(function () {
  "use strict";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (matchMedia("(hover: none), (pointer: coarse)").matches) return;
  var cards = document.querySelectorAll(".setcard[data-yt]");
  if (!cards.length) return;

  var HOVER_START = 0.45;            // begin the preview ~45% into the clip
  var apiReady = false, queue = [];

  (function loadAPI() {
    if (window.YT && window.YT.Player) { apiReady = true; return; }
    if (document.getElementById("yt-iframe-api")) return;
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prev === "function") { try { prev(); } catch (e) {} }
      apiReady = true; queue.forEach(function (fn) { fn(); }); queue = [];
    };
    var s = document.createElement("script");
    s.id = "yt-iframe-api"; s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  })();
  function whenReady(fn) { if (apiReady && window.YT && window.YT.Player) fn(); else queue.push(fn); }

  Array.prototype.forEach.call(cards, function (card) {
    var media = card.querySelector(".setcard__media");
    var id = card.getAttribute("data-yt");
    if (!media || !id) return;
    var timer = 0, wrap = null, player = null, hovering = false;

    function build() {
      wrap = document.createElement("div");
      wrap.className = "setcard__video";
      var mount = document.createElement("div");      // YT replaces this node with the <iframe>
      wrap.appendChild(mount);
      media.appendChild(wrap);
      player = new YT.Player(mount, {
        videoId: id, width: "100%", height: "100%",
        playerVars: { autoplay: 1, mute: 1, controls: 0, modestbranding: 1, rel: 0, iv_load_policy: 3, fs: 0, disablekb: 1, playsinline: 1, loop: 1, playlist: id },
        events: {
          onReady: function (e) {
            try { e.target.mute(); } catch (x) {}
            var d = 0; try { d = e.target.getDuration(); } catch (x) {}
            try { e.target.seekTo(d ? d * HOVER_START : 30, true); } catch (x) {}
            try { e.target.playVideo(); } catch (x) {}
          },
          onStateChange: function (e) {                // 1 === PLAYING: now it's clean, fade it in
            if (e.data === 1 && hovering && wrap) wrap.classList.add("is-playing");
          }
        }
      });
    }
    function enter() {
      hovering = true;
      timer = setTimeout(function () { if (hovering) whenReady(function () { if (hovering && !player) build(); }); }, 150);
    }
    function leave() {
      hovering = false; clearTimeout(timer);
      if (player) { try { player.destroy(); } catch (e) {} player = null; }
      if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
      wrap = null;
    }
    card.addEventListener("mouseenter", enter);
    card.addEventListener("mouseleave", leave);
  });
})();
