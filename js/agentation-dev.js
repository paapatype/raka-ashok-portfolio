/* agentation (DEV EVAL ONLY) - visual-feedback toolbar for AI coding agents.
   Drops the <Agentation /> React component (bottom-right toolbar) onto the page via the esm.sh CDN,
   so this plain static site needs no React/bundler. GATED TO LOCALHOST so it never ships to production.
   Trialling the tool - remove js/agentation-dev.js + its <script> tag in index.html to drop it. */
(function () {
  "use strict";
  var h = location.hostname;
  if (!(h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h === "")) return; // dev machines only

  var REACT = "https://esm.sh/react@18";
  var DOM = "https://esm.sh/react-dom@18/client";
  var PKG = "https://esm.sh/agentation@3.0.2?deps=react@18,react-dom@18";

  Promise.all([import(REACT), import(DOM), import(PKG)]).then(function (m) {
    var React = m[0].default || m[0];
    var createRoot = m[1].createRoot;
    var Agentation = m[2].Agentation;
    if (!React || !createRoot || !Agentation) throw new Error("agentation/react not found on esm.sh");

    var mount = document.createElement("div");
    mount.id = "agentation-root";
    document.body.appendChild(mount);

    createRoot(mount).render(React.createElement(Agentation, {
      onCopy: function (md) { console.log("[agentation] copied markdown:\n" + md); },
      onSubmit: function (output, annotations) { console.log("[agentation] submit:", annotations.length, "annotation(s)\n" + output); }
    }));
    console.log("%c[agentation] loaded (dev)", "color:#7ee787", "- toolbar is bottom-right. Click it, then click any element to annotate.");
  }).catch(function (e) {
    console.warn("[agentation] failed to load from esm.sh:", e);
  });
})();
