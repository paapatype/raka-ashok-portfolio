/* render a single project article from ?slug= */
(function () {
  var DATA = (window.RAKA_DATA && window.RAKA_DATA.projects) || [];
  var slug = new URLSearchParams(location.search).get("slug");
  var proj = DATA.filter(function (p) { return p.slug === slug; })[0] || DATA[0];
  if (!proj) return;

  document.title = proj.title + " — Raka Ashok";

  // header
  var head = document.querySelector("#proj-head");
  head.innerHTML =
    '<a class="back" href="work.html">' +
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>' +
    " Work</a>" +
    '<h1 class="display reveal">' + proj.title + "</h1>" +
    '<p class="proj-intro reveal">' + proj.intro + "</p>" +
    '<div class="proj-meta reveal">' +
    "<span><b>Role</b> &nbsp;" + proj.role + "</span>" +
    "<span><b>Year</b> &nbsp;" + proj.year + "</span>" +
    "<span><b>Field</b> &nbsp;" + proj.descriptor + "</span>" +
    "</div>";

  // slides
  var wrap = document.querySelector("#slides");
  if (proj.kind === "grouped") {
    wrap.innerHTML = renderGrouped(proj);
  } else {
    wrap.innerHTML = proj.slides.map(function (s, i) {
      var isDivider = (s.caption || "").length > 0 && (s.caption || "").length < 14;
      var cls = "slide reveal" + (isDivider ? " slide--divider" : "");
      var cap = s.caption
        ? '<div class="slide__cap"><span class="n">' + pad(i + 1) + "</span><span>" + s.caption + "</span></div>"
        : "";
      var ar = (s.w && s.h) ? (' style="aspect-ratio:' + s.w + "/" + s.h + '"') : "";
      return (
        '<figure class="' + cls + '">' +
        '<div class="slide__img"' + ar + '><img src="' + s.src + '" alt="' + proj.title + " — slide " + (i + 1) + '" loading="' + (i < 2 ? "eager" : "lazy") + '" decoding="async"></div>' +
        cap +
        "</figure>"
      );
    }).join("");
  }

  function renderGrouped(p) {
    var groups = [], cur = null;
    p.slides.forEach(function (it) {
      if (it.type === "section") { cur = { title: it.title, text: it.text, imgs: [] }; groups.push(cur); }
      else if (cur) { cur.imgs.push(it); }
    });
    return groups.map(function (g) {
      var cards = g.imgs.map(function (s) {
        return '<figure class="tht-card reveal"><img src="' + s.src + '" alt="' + g.title + '" loading="lazy" decoding="async"></figure>';
      }).join("");
      return '<section class="tht-group">' +
        '<span class="eyebrow reveal">' + g.title + "</span>" +
        '<p class="tht-text reveal">' + g.text + "</p>" +
        '<div class="tht-grid">' + cards + "</div>" +
        "</section>";
    }).join("");
  }

  // next project
  var idx = DATA.indexOf(proj);
  var next = DATA[(idx + 1) % DATA.length];
  var nextEl = document.querySelector("#proj-next");
  if (next && next !== proj) {
    nextEl.innerHTML =
      '<div class="stack-sm"><span class="eyebrow">Next project</span>' +
      '<a class="h2 link-line" href="project.html?slug=' + next.slug + '">' + next.title + " &rarr;</a></div>" +
      '<a class="btn" href="book.html">Book the artist <span class="arr">&rarr;</span></a>';
  }

  if (window.__observeReveals) window.__observeReveals(document.body);

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
})();
