/* AICOS — theme, menu, entrance, reveal, flow.
   Nothing here is required to see content: reveal is only armed after this
   script runs, and a failsafe shows anything an observer misses. */
(function () {
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var KEY = 'aicos-theme';
  var mq = window.matchMedia('(prefers-color-scheme: light)');

  /* ---------- theme ---------- */
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function current() { return root.getAttribute('data-theme') || (mq.matches ? 'light' : 'dark'); }
  function paint(theme) {
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#000000');
    var label = theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', label);
      b.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      b.setAttribute('title', label);
    });
  }
  paint(current());
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

  /* ---------- entrance ---------- */
  var appears = document.querySelectorAll('.appear');
  appears.forEach(function (el) {
    el.addEventListener('animationend', function () { el.classList.add('is-in'); }, { once: true });
  });
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      var live = false;
      if (typeof document.getAnimations === 'function') {
        live = Array.prototype.some.call(appears, function (el) {
          if (typeof el.getAnimations !== 'function') return false;
          return el.getAnimations().some(function (a) {
            return a.playState === 'running' || a.playState === 'finished';
          });
        });
      }
      if (!live) appears.forEach(function (el) { el.classList.add('is-in'); });
    });
  });

  /* ---------- reveal on scroll (additive only) ---------- */
  if (hasIO && !reduced) {
    root.classList.add('reveal-ready');
    var rIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); rIO.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      else rIO.observe(el);
    });
    // failsafe: never let an observer be the reason content stays invisible
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { el.classList.add('in'); });
    }, 4000);
  }

  /* ---------- meters ---------- */
  function fill(scope) {
    scope.querySelectorAll('.bar i').forEach(function (bar) {
      if (reduced) return;
      bar.style.transform = 'scaleX(0)';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { bar.style.transform = 'scaleX(1)'; });
      });
    });
  }
  if (hasIO) {
    var mIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { fill(e.target); mIO.unobserve(e.target); } });
    }, { threshold: 0.25 });
    document.querySelectorAll('.example').forEach(function (el) { mIO.observe(el); });
  } else { fill(document); }

  /* ---------- the flow: work moves, then waits for a person ---------- */
  var flow = document.querySelector('.flow');
  if (flow) {
    flow.classList.add('js-on');
    var fillEl = flow.querySelector('.flow-fill');
    var dot = flow.querySelector('.flow-dot');
    var nodes = flow.querySelectorAll('.fnode');
    var gate = flow.querySelector('.fnode.gate');
    var label = flow.querySelector('.flow-gate-label');
    var stops = [0, 33.3333, 66.6667, 100];
    var timers = [];

    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function trackW() { return flow.querySelector('.flow-track').getBoundingClientRect().width; }
    function at(pct, ms) {
      var e = 'cubic-bezier(.16,1,.3,1)';
      fillEl.style.transition = 'transform ' + ms + 'ms ' + e;
      dot.style.transition = 'transform ' + ms + 'ms ' + e;
      fillEl.style.transform = 'scaleX(' + (pct / 100) + ')';
      dot.style.transform = 'translateX(' + (trackW() * pct / 100) + 'px)';
    }
    function reset() {
      clearTimers();
      fillEl.style.transition = dot.style.transition = 'none';
      fillEl.style.transform = 'scaleX(0)'; dot.style.transform = 'translateX(0px)';
      nodes.forEach(function (n) { n.classList.remove('done', 'holding'); });
      label.classList.remove('on');
    }
    if (reduced) {
      fillEl.style.transform = 'scaleX(1)';
      dot.style.transform = 'translateX(' + trackW() + 'px)';
      nodes.forEach(function (n) { n.classList.add('done'); });
    } else {
      var cycle = function () {
        reset();
        nodes[0].classList.add('done');
        timers.push(setTimeout(function () { at(stops[1], 900); }, 500));
        timers.push(setTimeout(function () { nodes[1].classList.add('done'); at(stops[2], 900); }, 1700));
        timers.push(setTimeout(function () { gate.classList.add('holding'); label.classList.add('on'); }, 2650));
        timers.push(setTimeout(function () {
          gate.classList.remove('holding'); gate.classList.add('done');
          label.classList.remove('on'); at(stops[3], 850);
        }, 5200));
        timers.push(setTimeout(function () { nodes[3].classList.add('done'); }, 6050));
        timers.push(setTimeout(cycle, 8200));
      };
      var running = false;
      if (hasIO) {
        var fIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting && !running) { running = true; cycle(); }
            else if (!e.isIntersecting && running) { running = false; clearTimers(); }
          });
        }, { threshold: 0.3 });
        fIO.observe(flow);
      } else { cycle(); }
    }
  }

  /* ---------- menu ----------
     The overlay lives at body level on purpose: .header has backdrop-filter,
     which would make it the containing block for any position:fixed child. */
  var burger = document.getElementById('burger');
  var mmenu = document.getElementById('mobile-menu');
  if (burger && mmenu) {
    var closeBtn = document.getElementById('menu-close');
    var lastFocus = null;

    function setMenu(open) {
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mmenu.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) {
        lastFocus = document.activeElement;
        var first = mmenu.querySelector('.mmenu-links a');
        if (first) setTimeout(function () { first.focus(); }, 60);
      } else if (lastFocus && lastFocus.focus) {
        lastFocus.focus();
      }
    }
    setMenu(false);

    burger.addEventListener('click', function () {
      setMenu(!document.body.classList.contains('menu-open'));
    });
    if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); });
    mmenu.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (a && !a.hasAttribute('data-theme-toggle')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
    });
    var desktop = window.matchMedia('(min-width: 901px)');
    function onChange(e) { if (e.matches) setMenu(false); }
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---------- hero video ----------
     iOS Safari paints its own start-playback button whenever autoplay is
     blocked (Low Power Mode, slow network, data saver) and the pseudo-element
     that hides it is not reliable. So the rule here is simple: if this client
     should not autoplay, it never gets a <video> at all — the theme-aware
     still image behind it is the hero. That also stops a 9.5MB download from
     ever starting on mobile data. */
  var vid = document.querySelector('.hero-video');
  if (vid) {
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
    var saveData = !!(conn && conn.saveData);
    var slowNet = !!(conn && /(^|-)2g$|^3g$/.test(conn.effectiveType || ''));
    var lowData = !!(conn && conn.downlink && conn.downlink < 2);
    var smallScreen = window.matchMedia('(max-width: 900px)').matches;
    var touch = window.matchMedia('(pointer: coarse)').matches;

    var allowed = !reduced && !saveData && !slowNet && !lowData && !smallScreen && !touch;

    if (!allowed) {
      vid.parentNode.removeChild(vid);   // no element, no play button, no bytes
    } else {
      vid.src = vid.getAttribute('data-src');
      vid.setAttribute('preload', 'auto');
      vid.load();

      var shown = false;
      function reveal() {
        if (shown) return;
        shown = true;
        vid.classList.add('is-playing');
      }
      function drop() { if (vid.parentNode) vid.parentNode.removeChild(vid); }
      function tryPlay() {
        if (document.hidden) return;          // a background tab is not a refusal
        var p = vid.play();
        if (p && p.then) p.then(reveal).catch(function () {
          // genuinely refused while visible — fall back to the still, silently
          if (!document.hidden) drop();
        });
      }
      // a page opened in a background tab must still get the video on focus
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) tryPlay();
      });
      vid.addEventListener('playing', reveal);
      vid.addEventListener('canplay', tryPlay);
      tryPlay();

      if (hasIO) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) tryPlay(); else vid.pause();
          });
        }, { threshold: 0.05 }).observe(vid);
      }
    }
  }

  /* ---------- footer year ---------- */
  document.querySelectorAll('.yr').forEach(function (e) { e.textContent = new Date().getFullYear(); });
})();
