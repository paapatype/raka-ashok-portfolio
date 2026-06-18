/* Music tiles - explorable grid, played inline via the SoundCloud Widget API */
(function () {
  var DATA = window.RAKA_MUSIC || [];
  var grid = document.getElementById("music-grid");
  if (!grid) return;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function playSVG() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  }

  grid.innerHTML = DATA.map(function (t, i) {
    var art = t.art
      ? '<img src="' + t.art + '" alt="' + esc(t.title) + '" loading="lazy" decoding="async">'
      : "";
    return (
      '<button class="mtile reveal" data-i="' + i + '" data-url="' + esc(t.url) + '" aria-label="Play ' + esc(t.title) + '">' +
      '<span class="mtile__art">' + art +
      '<span class="mtile__play"><span>' + playSVG() + "</span></span></span>" +
      '<span class="mtile__title">' + esc(t.title) + "</span>" +
      '<span class="mtile__meta">' + t.plays + " plays · " + t.dur + "</span>" +
      "</button>"
    );
  }).join("");
  if (window.__observeReveals) window.__observeReveals(grid);

  // ---- SoundCloud widget ----
  var player = document.getElementById("player");
  var iframe = document.getElementById("sc-widget");
  var widget = null, ready = false;
  function initWidget() {
    if (window.SC && SC.Widget && iframe) {
      widget = SC.Widget(iframe);
      widget.bind(SC.Widget.Events.READY, function () { ready = true; });
    }
  }
  initWidget();
  if (!widget) {
    var iv = setInterval(function () {
      if (window.SC && SC.Widget) { clearInterval(iv); initWidget(); }
    }, 150);
  }

  function loadAndPlay(url) {
    if (!widget) return;
    widget.load(url, {
      auto_play: true, visual: false, hide_related: true,
      show_comments: false, show_reposts: false, show_teaser: false, color: "0a0a0a"
    });
  }

  grid.addEventListener("click", function (e) {
    var b = e.target.closest(".mtile");
    if (!b) return;
    var url = b.getAttribute("data-url");
    grid.querySelectorAll(".mtile").forEach(function (x) { x.classList.remove("is-playing"); });
    b.classList.add("is-playing");
    player.classList.add("show");
    document.body.classList.add("player-open");
    if (widget && ready) loadAndPlay(url);
    else {
      var t = setInterval(function () {
        if (widget && ready) { clearInterval(t); loadAndPlay(url); }
      }, 120);
    }
  });

  var close = document.getElementById("player-close");
  if (close) close.addEventListener("click", function () {
    player.classList.remove("show");
    document.body.classList.remove("player-open");
    if (widget && ready) widget.pause();
    grid.querySelectorAll(".mtile").forEach(function (x) { x.classList.remove("is-playing"); });
  });
})();
