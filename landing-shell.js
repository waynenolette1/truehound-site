/*
 * Truehound landing first paint (scripts/landing-shell.mjs prints the shell).
 *
 * 1. Shows the static hero only on the landing route for a signed-out
 *    visitor; anything else removes it at once. The React landing page
 *    removes it when it mounts; a hash change or a failed boot removes it too.
 * 2. Boots the app: in a production build the entry module is handed over on
 *    data-entry and started right after the shell's first frame, so the hero
 *    paints from HTML and CSS alone. Off the landing route it starts at once.
 */
(function () {
  var me = document.currentScript;
  var entry = me && me.getAttribute("data-entry");
  var boot = function () {
    if (!entry) return;
    var s = document.createElement("script");
    s.type = "module";
    s.crossOrigin = "";
    s.src = entry;
    document.head.appendChild(s);
    entry = null;
  };
  var shell = document.getElementById("landing-shell");
  var remove = function () {
    if (shell && shell.parentNode) shell.parentNode.removeChild(shell);
  };
  var landing = /^(#\/?(welcome)?(\?[^#]*)?)?$/.test(location.hash);
  var signedIn = false;
  try {
    signedIn = !!localStorage.getItem("atlas.session.v1");
  } catch (e) {
    signedIn = false;
  }
  if (!shell || !landing || signedIn) {
    remove();
    boot();
    return;
  }
  shell.hidden = false;
  window.addEventListener("hashchange", function () {
    if (!/^#\/?(welcome)?(\?[^#]*)?$/.test(location.hash)) remove();
  });
  setTimeout(remove, 15000);
  // After the shell has painted: the first contentful paint where the Paint
  // Timing API exists, else the next frame; a timer backs both up (a
  // background tab may never paint or run rAF).
  var started = false;
  var go = function () {
    if (started) return;
    started = true;
    boot();
  };
  try {
    new PerformanceObserver(function (list) {
      if (list.getEntriesByName("first-contentful-paint").length) setTimeout(go, 0);
    }).observe({ type: "paint", buffered: true });
  } catch (e) {
    if (window.requestAnimationFrame)
      requestAnimationFrame(function () {
        setTimeout(go, 0);
      });
  }
  setTimeout(go, 400);
})();
