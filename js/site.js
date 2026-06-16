/* shared site behaviour: nav state, scroll reveal */
(function () {
  // active nav pill
  var page = document.body.getAttribute("data-page");
  document.querySelectorAll(".nav__links .pill").forEach(function (a) {
    if (a.getAttribute("data-nav") === page) a.classList.add("is-active");
  });

  // nav border on scroll
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 6);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // scroll reveal
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
  function observeReveals(root) {
    (root || document).querySelectorAll(".reveal:not(.in)").forEach(function (el) {
      io.observe(el);
    });
  }
  window.__observeReveals = observeReveals;
  observeReveals();

  // year
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();

  // client belt — renders on any page that has #belt-track (duplicated for seamless loop)
  var beltTrack = document.getElementById("belt-track");
  if (beltTrack) {
    var clients = ["Saras Co", "Roma Italian Deli", "Forlife", "Rootnine", "Lowe Lintas",
      "Phable", "Coderapper", "TED", "Adidas Originals", "Amazon.in", "Flipkart", "Nucleya",
      "Krunk", "Dualist Inquiry", "Social Offline", "Clustr", "Byg Brewski", "Azure Hospitality",
      "Heel & Buckle", "Cinnamon Pictures", "29K Investment Advisers", "Furlenco", "CommonFloor",
      "Malfnktion", "StayAbode", "Tuzo"];
    var bh = clients.map(function (c) { return '<span class="belt__item">' + c + "</span>"; }).join("");
    beltTrack.innerHTML = bh + bh;
  }
})();
