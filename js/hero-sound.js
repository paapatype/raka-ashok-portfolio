/* RAKA ASHOK - hero sound: tap to stream a SoundCloud track from its HALFWAY point.
   Icon-only mute/unmute (never pauses); auto-advances. While unmuted, the tagline REACTS to the music -
   the track's waveform amplitude drives the variable font weight + scale.
   PER-SONG reactivity: each track can carry its own config via window.RAKA_REACT_MAP (keyed by track url),
   with a "_default" fallback for untuned tracks. Tune them in tools/tagline-tuner.html. */
(function () {
  "use strict";
  var btn = document.getElementById("hero-sound");
  var iframe = document.getElementById("hero-sc");
  var tagline = document.querySelector(".hero-tagline");
  if (!btn || !iframe) return;
  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LIST = (window.RAKA_MUSIC || []).filter(function (t) { return t && t.url; });
  var tracks = LIST.map(function (t) { return t.url; });
  if (!tracks.length || typeof SC === "undefined" || !SC.Widget) { btn.style.display = "none"; return; }

  // ---- per-song reactive config ----
  // target = minWeight + min(1,(amp*gain)^curve) * (maxWeight-minWeight); level eases by attack/release.
  var DEFAULT = { gain: 1, minWeight: 300, maxWeight: 880, curve: 1.7, attack: 0.55, release: 0.14, scaleAmt: 0.055, gate: 0 };
  function clone(o) { var r = {}; for (var k in DEFAULT) r[k] = (o && o[k] != null) ? o[k] : DEFAULT[k]; return r; }
  var MAP = window.RAKA_REACT_MAP || {};
  if (!MAP._default) MAP._default = clone(DEFAULT);
  window.RAKA_REACT_MAP = MAP;
  var REACT = window.RAKA_REACT || clone(MAP._default);   // ACTIVE config - a STABLE object the frame loop reads
  window.RAKA_REACT = REACT;
  function applyConfig(url) { var c = MAP[url] || MAP._default || DEFAULT; for (var k in DEFAULT) REACT[k] = (c[k] != null ? c[k] : DEFAULT[k]); }
  function titleFor(url) { for (var i = 0; i < LIST.length; i++) if (LIST[i].url === url) return LIST[i].title || ""; return ""; }
  function idxOf(url) { for (var i = 0; i < LIST.length; i++) if (LIST[i].url === url) return i; return -1; }

  var widget = SC.Widget(iframe);
  var started = false, muted = false, lastIdx = -1, playing = false;
  var samples = null, sampMax = 1, relPos = 0, relAt = 0, durMs = 0, level = REACT.minWeight, raf = 0;
  function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

  function pick() { var i; do { i = Math.floor(Math.random() * tracks.length); } while (tracks.length > 1 && i === lastIdx); return tracks[i]; }

  function loadWaveform() {
    samples = null;
    try {
      widget.getCurrentSound(function (snd) {
        if (snd && snd.waveform_url) {
          var wf = snd.waveform_url.replace(/\.png(\?|$)/, ".json$1"); // need the JSON samples, not the PNG image
          fetch(wf).then(function (r) { return r.json(); }).then(function (d) {
            if (d && d.samples && d.samples.length) { samples = d.samples; sampMax = (d.height || Math.max.apply(null, d.samples)) || 1; }
          }).catch(function () {}); // CORS/parse fail -> falls back to the beat clock
        }
      });
    } catch (e) {}
  }

  function announce(url) {
    var i = idxOf(url); if (i >= 0) lastIdx = i;
    window.RAKA_URL = url;
    window.RAKA_TRACK = titleFor(url);
    applyConfig(url);                                            // swap the active config to this track's
    if (typeof window.RAKA_ON_TRACK === "function") { try { window.RAKA_ON_TRACK(url, window.RAKA_TRACK); } catch (e) {} }
  }
  function loadTrack(url) {
    url = url || pick();
    announce(url);
    widget.load(url, { auto_play: true, callback: function () {
      widget.getDuration(function (ms) {
        durMs = ms || 0;
        try { if (ms) widget.seekTo(Math.floor(ms * 0.5)); } catch (e) {}  // start from the HALFWAY point
        widget.setVolume(muted ? 0 : 100);
        widget.play();
      });
      loadWaveform();
    } });
  }

  widget.bind(SC.Widget.Events.PLAY, function () { playing = true; });
  widget.bind(SC.Widget.Events.PAUSE, function () { playing = false; });
  widget.bind(SC.Widget.Events.PLAY_PROGRESS, function (e) {
    relPos = e.relativePosition || 0; relAt = now();
    if (!durMs && e.currentPosition && e.relativePosition) durMs = e.currentPosition / e.relativePosition;
  });
  widget.bind(SC.Widget.Events.FINISH, function () { if (started) loadTrack(); });           // continuous
  if (SC.Widget.Events.ERROR) widget.bind(SC.Widget.Events.ERROR, function () { if (started) loadTrack(); });

  function frame() {
    if (!(started && !muted) || reduce) { raf = 0; return; }
    var R = REACT, span = (R.maxWeight - R.minWeight) || 1, target, amp = 0, mode;
    if (samples && durMs) {
      var rp = relPos + (playing ? (now() - relAt) / durMs : 0);
      if (rp < 0) rp = 0; else if (rp > 1) rp = 1;
      amp = (samples[Math.min(samples.length - 1, Math.floor(rp * samples.length))] || 0) / sampMax; // 0..1
      var g = R.gate || 0; amp = g < 1 ? Math.max(0, amp - g) / (1 - g) : 0;                          // noise gate
      target = R.minWeight + Math.min(1, Math.pow(amp * R.gain, R.curve)) * span;                     // loud -> heavy + big
      mode = "waveform";
    } else {
      var ph = (now() % 414) / 414;                                                                   // fallback: ~145 BPM clock
      amp = Math.pow(1 - ph, 2.4);
      target = R.minWeight + amp * span * 0.92;
      mode = "clock";
    }
    level += (target - level) * (target > level ? R.attack : R.release);                              // attack / release
    tagline.style.fontVariationSettings = '"wght" ' + Math.round(level);
    tagline.style.transform = "scale(" + (1 + Math.max(0, level - R.minWeight) / span * R.scaleAmt).toFixed(3) + ")";
    window.RAKA_REACT_LIVE = { amp: amp, level: level, mode: mode };                                  // for the tuner meters
    raf = requestAnimationFrame(frame);
  }
  function startReact() { if (!raf && !reduce) raf = requestAnimationFrame(frame); }
  function stopReact() { if (raf) { cancelAnimationFrame(raf); raf = 0; } level = REACT.minWeight; tagline.style.fontVariationSettings = ""; tagline.style.transform = ""; window.RAKA_REACT_LIVE = { amp: 0, level: REACT.minWeight, mode: "off" }; }

  function paint() {
    var on = started && !muted;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", started ? (muted ? "Unmute music" : "Mute music") : "Play music");
    root.classList.toggle("sound-on", on);
    if (on) startReact(); else stopReact();
  }
  function ensureStarted() { if (!started) { started = true; muted = false; try { widget.setVolume(100); widget.play(); } catch (e) {} } } // iOS: play() in the gesture

  btn.addEventListener("click", function () {
    if (!started) { ensureStarted(); loadTrack(); }              // first click = start a random track from halfway
    else { muted = !muted; widget.setVolume(muted ? 0 : 100); }  // mute / unmute only - never pauses
    paint();
  });

  window.RAKA_NEXT = function () { ensureStarted(); loadTrack(); paint(); };                       // skip to a random track
  window.RAKA_PLAY = function (url) { if (!url) return; ensureStarted(); loadTrack(url); paint(); }; // play a SPECIFIC track

  paint();
})();
