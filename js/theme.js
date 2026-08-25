/* Theme control.
   The stored choice wins. With no stored choice the OS preference wins, and
   the page keeps following the OS if it changes mid-visit. */
(function () {
  var root = document.documentElement;
  var KEY = 'aicos-theme';
  var meta = document.querySelector('meta[name="theme-color"]');
  var mq = window.matchMedia('(prefers-color-scheme: light)');

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function current() {
    return root.getAttribute('data-theme') || (mq.matches ? 'light' : 'dark');
  }

  function paint(theme) {
    root.setAttribute('data-theme', theme);
    if (meta) meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#000000');

    var label = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-label', label);
      buttons[i].setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      buttons[i].setAttribute('title', label);
    }
  }

  paint(current());

  // only allow colour transitions after first paint, so loading never cross-fades
  requestAnimationFrame(function () { root.classList.add('theme-ready'); });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    var next = current() === 'light' ? 'dark' : 'light';
    try { localStorage.setItem(KEY, next); } catch (err) {}
    paint(next);
  });

  function follow() { if (!stored()) paint(mq.matches ? 'light' : 'dark'); }
  if (mq.addEventListener) mq.addEventListener('change', follow);
  else if (mq.addListener) mq.addListener(follow);
})();
