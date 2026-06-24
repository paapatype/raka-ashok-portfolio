/* RAKA ASHOK - hero sound: tap to stream a RANDOM SoundCloud track from its HALFWAY point.
   Icon-only mute/unmute (never pauses); auto-advances. While unmuted, the tagline REACTS to the
   music: the track's waveform amplitude at the live playhead drives the variable font weight + scale
   (punchy attack/decay). Falls back to a punchy 145-BPM pulse if the waveform isn't reachable. */
(function () {
  "use strict";
  var btn = document.getElementById("hero-sound");
  var iframe = document.getElementById("hero-sc");
  var tagline = document.querySelector(".hero-tagline");
  if (!btn || !iframe) return;
  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tracks = ((window.RAKA_MUSIC || []).map(function (t) { return t.url; })).filter(Boolean);
  if (!tracks.length || typeof SC === "undefined" || !SC.Widget) { btn.style.display = "none"; return; }

  var widget = SC.Widget(iframe);
  var started = false, muted = false, lastIdx = -1, playing = false;
  var samples = null, sampMax = 1, relPos = 0, relAt = 0, durMs = 0, level = 300, raf = 0;
  function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

  function pick() { var i; do { i = Math.floor(Math.random() * tracks.length); } while (tracks.length > 1 && i === lastIdx); lastIdx = i; return tracks[i]; }

  function loadWaveform() {
    samples = null;
    try {
      widget.getCurrentSound(function (snd) {
        if (snd && snd.waveform_url) {
          var wf = snd.waveform_url.replace(/\.png(\?|$)/, ".json$1"); // need the JSON samples, not the PNG image
          fetch(wf).then(function (r) { return r.json(); }).then(function (d) {
            if (d && d.samples && d.samples.length) { samples = d.samples; sampMax = (d.height || Math.max.apply(null, d.samples)) || 1; }
          }).catch(function () {}); // CORS/parse fail -> reactive motion falls back to the beat pulse
        }
      });
    } catch (e) {}
  }
  function loadTrack() {
    widget.load(pick(), { auto_play: true, callback: function () {
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
    var target;
    if (samples && durMs) {
      var rp = relPos + (playing ? (now() - relAt) / durMs : 0);
      if (rp < 0) rp = 0; else if (rp > 1) rp = 1;
      var amp = (samples[Math.min(samples.length - 1, Math.floor(rp * samples.length))] || 0) / sampMax; // 0..1
      target = 300 + Math.pow(amp, 1.7) * 580;                 // loud/bass -> heavy + big
    } else {
      var ph = (now() % 414) / 414;                            // fallback: punchy ~145 BPM clock
      target = 300 + Math.pow(1 - ph, 2.4) * 520;
    }
    level += (target - level) * (target > level ? 0.55 : 0.14); // fast attack, slower release = punch
    tagline.style.fontVariationSettings = '"wght" ' + Math.round(level);
    tagline.style.transform = "scale(" + (1 + Math.max(0, level - 300) / 580 * 0.055).toFixed(3) + ")";
    raf = requestAnimationFrame(frame);
  }
  function startReact() { if (!raf && !reduce) raf = requestAnimationFrame(frame); }
  function stopReact() { if (raf) { cancelAnimationFrame(raf); raf = 0; } level = 300; tagline.style.fontVariationSettings = ""; tagline.style.transform = ""; }

  function paint() {
    var on = started && !muted;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", started ? (muted ? "Unmute music" : "Mute music") : "Play music");
    root.classList.toggle("sound-on", on);
    if (on) startReact(); else stopReact();
  }

  btn.addEventListener("click", function () {
    if (!started) {
      started = true; muted = false;
      try { widget.setVolume(100); widget.play(); } catch (e) {}  // iOS: unlock audio synchronously in the gesture...
      loadTrack();                                                // ...then load a random track + seek to halfway
    } else {
      muted = !muted; widget.setVolume(muted ? 0 : 100);          // mute / unmute only - never pauses
    }
    paint();
  });
  paint();
})();
