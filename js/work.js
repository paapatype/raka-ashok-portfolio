/* render the work/design projects as thumbnail tiles */
(function () {
  var DATA = (window.RAKA_DATA && window.RAKA_DATA.projects) || [];
  var el = document.querySelector("#work-list");
  if (!el) return;
  el.innerHTML = DATA.map(function (p) {
    var thumb = (p.slides && p.slides[0] && p.slides[0].src) || "";
    var img = thumb ? '<img src="' + thumb + '" alt="' + p.title + '" loading="lazy" decoding="async">' : "";
    return (
      '<a class="wtile reveal" href="project.html?slug=' + p.slug + '">' +
      '<span class="wtile__img">' + img + "</span>" +
      '<span class="wtile__row"><span class="wtile__title">' + p.title + "</span>" +
      '<span class="wtile__yr">' + p.year + "</span></span>" +
      '<span class="wtile__role">' + p.role + "</span>" +
      "</a>"
    );
  }).join("");
  if (window.__observeReveals) window.__observeReveals(el);
})();
