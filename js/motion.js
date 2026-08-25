/* Motion.
   Rules this file obeys:
   1. Nothing here is required to see content. Every element is visible with JS off;
      the reveal state is only armed after this script runs.
   2. prefers-reduced-motion switches everything to its finished state immediately.
   3. Motion carries meaning — the flow holds at the approval gate because the
      product holds at the approval gate. */
(function () {
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  if (reduced) { root.classList.add('no-anim'); }

  /* ---------- 1. scroll reveal (additive) ---------- */
  if (hasIO && !reduced) {
    root.classList.add('reveal-ready');
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    document.querySelectorAll('.reveal').forEach(function (el) {
      // already on screen at load? show it without animating in
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
      else revealIO.observe(el);
    });

    // Failsafe. The previous site left 29 elements at opacity:0 behind an observer
    // that could simply not fire. Nothing here is allowed to hide content for good:
    // after 4s every reveal is shown, whatever the observer did or did not do.
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { el.classList.add('in'); });
    }, 4000);
  }

  /* ---------- 2. meters grow to their real value ---------- */
  function fillMeters(scope) {
    scope.querySelectorAll('.bar i').forEach(function (bar) {
      var target = bar.getAttribute('data-w');
      if (target === null) { target = bar.style.width || '0'; bar.setAttribute('data-w', target); }
      if (reduced) return;                 // inline width already shows the true value
      bar.style.transform = 'scaleX(0)';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { bar.style.transform = 'scaleX(1)'; });
      });
    });
  }
  if (hasIO) {
    var meterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { fillMeters(e.target); meterIO.unobserve(e.target); }
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('.console, .example, .photo-band').forEach(function (el) { meterIO.observe(el); });
  } else {
    fillMeters(document);
  }

  /* ---------- 3. the console settles, row by row, and stops at the open one ---------- */
  var console_ = document.querySelector('.console');
  if (console_ && !reduced) {
    console_.classList.add('js-seq');
    var rows = console_.querySelectorAll('.queue-row');
    var start = function () {
      rows.forEach(function (row, i) {
        setTimeout(function () { row.classList.add('settled'); }, 380 + i * 260);
      });
    };
    if (hasIO) {
      var cIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { start(); cIO.disconnect(); } });
      }, { threshold: 0.2 });
      cIO.observe(console_);
    } else { start(); }
  }

  /* ---------- 4. the flow: work moves, and waits for a person ---------- */
  var flow = document.querySelector('.flow');
  if (flow) {
    flow.classList.add('js-on');
    var fill = flow.querySelector('.flow-fill');
    var dot = flow.querySelector('.flow-dot');
    var nodes = flow.querySelectorAll('.fnode');
    var gate = flow.querySelector('.fnode.gate');
    var label = flow.querySelector('.flow-gate-label');
    var stops = [0, 33.3333, 66.6667, 100];
    var timers = [];

    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function trackWidth() { return flow.querySelector('.flow-track').getBoundingClientRect().width; }
    function at(pct, ms) {
      var e = 'cubic-bezier(.16,1,.3,1)';
      fill.style.transition = 'transform ' + ms + 'ms ' + e;
      dot.style.transition = 'transform ' + ms + 'ms ' + e;
      fill.style.transform = 'scaleX(' + (pct / 100) + ')';
      dot.style.transform = 'translateX(' + (trackWidth() * pct / 100) + 'px)';
    }
    function reset() {
      clearTimers();
      fill.style.transition = dot.style.transition = 'none';
      fill.style.transform = 'scaleX(0)'; dot.style.transform = 'translateX(0px)';
      nodes.forEach(function (n) { n.classList.remove('done', 'passed', 'holding'); });
      label.classList.remove('on');
    }

    if (reduced) {
      // finished state: the whole loop drawn, gate cleared
      fill.style.transform = 'scaleX(1)';
      dot.style.transform = 'translateX(' + trackWidth() + 'px)';
      nodes.forEach(function (n) { n.classList.add('done'); });
      if (gate) gate.classList.add('passed');
    } else {
      var cycle = function () {
        reset();
        nodes[0].classList.add('done');
        timers.push(setTimeout(function () { at(stops[1], 900); }, 500));
        timers.push(setTimeout(function () { nodes[1].classList.add('done'); at(stops[2], 900); }, 1700));
        // the hold — this is the product
        timers.push(setTimeout(function () {
          gate.classList.add('holding');
          label.classList.add('on');
        }, 2650));
        timers.push(setTimeout(function () {
          gate.classList.remove('holding');
          gate.classList.add('done', 'passed');
          label.classList.remove('on');
          at(stops[3], 850);
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
        }, { threshold: 0.35 });
        fIO.observe(flow);
      } else { cycle(); }
    }
  }
})();
