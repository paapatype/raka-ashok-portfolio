/* render the Work index rows */
(function () {
  var DATA = (window.RAKA_DATA && window.RAKA_DATA.projects) || [];
  var el = document.querySelector("#work-list");
  if (!el) return;
  function arr() {
    return '<svg class="arr" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  }
  el.innerHTML = DATA.map(function (p) {
    return (
      '<a class="row reveal" href="project.html?slug=' + p.slug + '">' +
      '<span class="row__title">' + p.title + "</span>" +
      '<span class="row__meta">' +
      '<span class="row__role">' + p.role + "</span>" +
      '<span class="yr">' + p.year + "</span>" +
      arr() +
      "</span>" +
      "</a>"
    );
  }).join("");
  if (window.__observeReveals) window.__observeReveals(el);
})();
