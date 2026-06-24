/* RAKA ASHOK - hero sound: tap to stream a RANDOM SoundCloud track from its HALFWAY point.
   The control only mutes / unmutes - it never pauses. Audio auto-advances to another random
   track (again from the halfway point) so it keeps streaming. While unmuted, the tagline bounces. */
(function () {
  "use strict";
  var btn = document.getElementById("hero-sound");
  var iframe = document.getElementById("hero-sc");
  if (!btn || !iframe) return;
  var root = document.documentElement;
  var tracks = ((window.RAKA_MUSIC || []).map(function (t) { return t.url; })).filter(Boolean);
  if (!tracks.length || typeof SC === "undefined" || !SC.Widget) { btn.style.display = "none"; return; }

  var widget = SC.Widget(iframe);
  var started = false, muted = false, lastIdx = -1;

  function pick() {
    var i; do { i = Math.floor(Math.random() * tracks.length); } while (tracks.length > 1 && i === lastIdx);
    lastIdx = i; return tracks[i];
  }
  function loadFromHalf() {
    widget.load(pick(), { auto_play: true, callback: function () {
      widget.getDuration(function (ms) {
        try { if (ms) widget.seekTo(Math.floor(ms * 0.5)); } catch (e) {}
        widget.setVolume(muted ? 0 : 100);
        widget.play();
      });
    } });
  }
  function paint() {
    var on = started && !muted;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", String(on));
    btn.setAttribute("aria-label", started ? (muted ? "Unmute sound" : "Mute sound") : "Play sound");
    root.classList.toggle("sound-on", on);
  }

  // keep it continuous - when a track ends (or fails to embed), roll into another from its halfway point
  widget.bind(SC.Widget.Events.FINISH, function () { if (started) loadFromHalf(); });
  if (SC.Widget.Events.ERROR) widget.bind(SC.Widget.Events.ERROR, function () { if (started) loadFromHalf(); });

  btn.addEventListener("click", function () {
    if (!started) { started = true; muted = false; loadFromHalf(); }   // first click (gesture) = start with sound
    else { muted = !muted; widget.setVolume(muted ? 0 : 100); }         // thereafter: mute / unmute only, never pause
    paint();
  });
  paint();
})();
