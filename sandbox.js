/* ==========================================================================
   SANDBOX.JS — booting real apps inside the portfolio
   --------------------------------------------------------------------------
   Two behaviours, both built on the same fact: the apps under assets/sandbox/
   are served from this origin, so the parent page can reach into the guest
   document. That is what makes it possible to show a live product on a work
   card without the card losing its manners.

     Thumbnails  A MacBook screen on a work card runs the project's real
                 landing page. It scrolls, it hovers, it drifts on its own —
                 and every click inside it is swallowed and turned into "open
                 the case study", so the card behaves like a card.

     Sandboxes   The same build on the case-study page at full size, with
                 nothing intercepted. Boots when it scrolls into view.

   Everything degrades: no JS, narrow screen, reduced motion or save-data and
   the poster image is simply what you get.
   ========================================================================== */
(function () {
  'use strict';

  var reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrow  = window.matchMedia('(max-width: 760px)').matches;
  var conn    = navigator.connection || {};
  var thrifty = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || '');

  /* Booting a 1.5MB app is not something to do four times at once. Every
     frame on the page — thumbnails and sandboxes alike — goes through this
     one queue, so at most a single app is ever downloading and parsing. */
  var queue = [], busy = false;
  function enqueue(fn) { queue.push(fn); pump(); }
  function pump() {
    if (busy || !queue.length) return;
    busy = true;
    queue.shift()(function () { busy = false; pump(); });
  }

  /* --------------------------------------------------------- guest helpers */

  /* The apps are not all shaped the same way. A marketing page scrolls its
     document; a dashboard pins the document at viewport height and scrolls an
     inner panel instead. Rather than special-casing each app, find whatever
     element in the guest actually has the most to scroll — that is the thing
     a visitor would reach for. */
  function findScroller(doc) {
    var best = doc.scrollingElement || doc.documentElement;
    var bestOver = best ? best.scrollHeight - best.clientHeight : 0;
    var all = doc.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var over = el.scrollHeight - el.clientHeight;
      if (over <= bestOver) continue;
      var oy = getComputedStyle(el).overflowY;
      if (oy === 'auto' || oy === 'scroll') { best = el; bestOver = over; }
    }
    return { el: best, range: bestOver };
  }

  function guestDoc(frame) {
    try { return frame.contentDocument || null; } catch (e) { return null; }
  }

  /* ======================================================================
     1. MACBOOK THUMBNAILS
     ====================================================================== */

  document.querySelectorAll('.mac-scene[data-app]').forEach(function (scene) {
    var frame  = scene.querySelector('.mac-live');
    var screen = scene.querySelector('.mac-screen');
    var card   = scene.closest('.card');
    if (!frame || !screen) return;

    /* ---- scale ----
       The guest is laid out at a fixed 1440x900 and shrunk to fit. Scaling
       the frame rather than resizing it is deliberate: give the iframe the
       card's real width and the app hits its own mobile breakpoints and
       collapses into a phone layout, which is not the artefact being shown. */
    var fit = function () {
      var w = screen.clientWidth;
      if (w) screen.style.setProperty('--mac-scale', (w / 1440).toFixed(5));
    };
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(screen);
    else window.addEventListener('resize', fit);

    /* On a phone the machine is about 150px across — the UI inside would be
       illegible and the download is pure cost. Same for save-data and for
       anyone who has asked the OS for less motion. The poster stays. */
    if (narrow || thrifty || reduce || !('IntersectionObserver' in window)) return;

    var started = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || started) return;
        started = true;
        io.disconnect();
        scene.classList.add('is-booting');
        enqueue(function (done) {
          var settled = false;
          var finish = function (ok) {
            if (settled) return;
            settled = true;
            scene.classList.remove('is-booting');
            if (ok) {
              scene.classList.add('is-live');
              screen.classList.add('live');
            }
            done();
          };
          frame.addEventListener('load', function () {
            /* one frame of grace so the app has painted before we cross-fade
               off the poster — otherwise the card flashes white */
            setTimeout(function () {
              var d = guestDoc(frame);
              if (!d) { finish(false); return; }
              lockGuest(frame, screen, card, d);
              drift(scene, frame, d);
              finish(true);
            }, 420);
          }, { once: true });
          /* a wedged asset must not wedge the queue behind it */
          setTimeout(function () { finish(false); }, 20000);
          frame.src = scene.dataset.app;
        });
      });
    }, { rootMargin: '160px 0px' });
    io.observe(scene);
  });

  /* ---- the leash ----
     Scroll and hover are the whole point, so they are left alone. Everything
     that would take a visitor somewhere — clicks, keys, form submits, the
     context menu — is caught in the capture phase on the guest document,
     which runs before React's own root-level delegation ever sees it.

     A click is not merely dropped, though: it does what clicking the card
     does. Anything else would read as a broken screenshot. */
  function lockGuest(frame, screen, card, d) {
    var href = card && card.getAttribute('href');

    var swallow = function (ev) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      /* click LAST, after the event is already neutralised, so navigating
         away can never be mistaken for the guest handling the click */
      if (ev.type === 'click' && href) window.location.href = href;
    };
    ['mousedown', 'mouseup', 'click', 'auxclick', 'dblclick',
     'submit', 'keydown', 'contextmenu', 'touchstart'
    ].forEach(function (t) { d.addEventListener(t, swallow, true); });

    /* Belt and braces for the one case capture cannot reach: a real
       navigation started by the browser rather than by a handler. */
    d.querySelectorAll('a[href]').forEach(function (a) { a.removeAttribute('href'); });
    d.querySelectorAll('a[target], form[target]').forEach(function (el) {
      el.removeAttribute('target');
    });

    /* The cursor bubble that trails over a work card is driven by mousemove
       on the card — which stops firing the moment the pointer crosses into
       the iframe, leaving the bubble frozen mid-card. Replay the guest's
       moves onto the card in PARENT coordinates and it keeps flowing as if
       the frame were not there. */
    if (card) {
      d.addEventListener('mousemove', function (ev) {
        var r = frame.getBoundingClientRect();
        var k = r.width / 1440;
        card.dispatchEvent(new MouseEvent('mousemove', {
          clientX: r.left + ev.clientX * k,
          clientY: r.top  + ev.clientY * k,
          bubbles: true
        }));
      }, true);
    }
  }

  /* ---- ambient drift ----
     A still screen inside a laptop reads as a screenshot of a laptop. A slow
     travel down the page reads as software. It ping-pongs with a dwell at
     each end, holds still whenever a person is actually looking at it — hover,
     hidden tab, off-screen card — and gives up permanently the first time
     they scroll it themselves, because competing with the visitor for control
     of a scrollbar is the most annoying thing an interface can do. */
  function drift(scene, frame, d) {
    var found = findScroller(d);
    var el = found.el;
    if (!el || found.range < 120) return;

    /* A guest that sets `scroll-behavior: smooth` — the verJSON site does —
       turns every scrollTop assignment into an ANIMATION, and writing one
       each frame restarts that animation from a standing start sixty times a
       second, so the page crawls and manual reads come back stale. Ambient
       drift wants instant positioning; the guest's smooth anchor scrolling is
       no loss here, because clicks are swallowed in a thumbnail anyway. */
    el.style.scrollBehavior = 'auto';
    d.documentElement.style.scrollBehavior = 'auto';

    /* One fixed speed reads completely differently on a 600px dashboard panel
       than on a 15,000px marketing page — the first would blur past, the
       second would look frozen. Scale it to the distance and clamp both ends
       so every card drifts at a rate the eye registers as deliberate. */
    var SPEED = Math.max(22, Math.min(85, found.range / 24));
    var DWELL = 1500;    // ms held at each end
    var dir = 1, holdUntil = 0, last = 0, hovering = false, surrendered = false;

    d.addEventListener('wheel',     function () { surrendered = true; }, { passive: true, capture: true });
    d.addEventListener('touchmove', function () { surrendered = true; }, { passive: true, capture: true });
    d.addEventListener('mouseover', function () { hovering = true;  }, true);
    d.addEventListener('mouseout',  function () { hovering = false; }, true);

    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { visible = e.isIntersecting; });
      }, { threshold: 0.15 }).observe(scene);
    }

    function step(ts) {
      if (surrendered) return;
      requestAnimationFrame(step);
      if (!last) { last = ts; return; }
      var dt = Math.min(ts - last, 64) / 1000;
      last = ts;
      if (hovering || document.hidden || !visible || ts < holdUntil) return;

      var range = el.scrollHeight - el.clientHeight;
      if (range < 40) return;
      var next = el.scrollTop + dir * SPEED * dt;
      if (next <= 0)          { next = 0;     dir =  1; holdUntil = ts + DWELL; }
      else if (next >= range) { next = range; dir = -1; holdUntil = ts + DWELL; }
      el.scrollTop = next;
    }
    requestAnimationFrame(step);
  }

  /* ======================================================================
     2. CASE-STUDY SANDBOXES
     ====================================================================== */

  document.querySelectorAll('.sb-stage[data-app]').forEach(function (stage) {
    var frame  = stage.querySelector('iframe');
    var launch = stage.querySelector('.sb-launch');
    var win    = stage.closest('.sb-win');
    if (!frame) return;

    /* A dashboard with a fixed desktop chrome has a width below which it
       stops being the thing you designed and becomes its own tablet build.
       data-w declares that intended viewport; the frame is laid out at it and
       scaled down to whatever space the page can give, rather than being
       handed a narrow box and quietly reflowing. Scaling never goes above 1 —
       blowing a 1280px app up to 1400 would just make it look wrong. */
    function fitStage() {
      var w = parseInt(stage.dataset.w, 10);
      if (!w) return;
      var box = stage.clientWidth;
      if (!box) return;
      var k = Math.min(1, box / w);
      frame.style.width  = w + 'px';
      frame.style.height = (stage.clientHeight / k) + 'px';
      frame.style.transform = 'scale(' + k.toFixed(5) + ')';
    }
    fitStage();
    if ('ResizeObserver' in window) new ResizeObserver(fitStage).observe(stage);
    else window.addEventListener('resize', fitStage);

    var booted = false;
    function boot() {
      if (booted) return;
      booted = true;
      stage.classList.add('booting');
      enqueue(function (done) {
        var settled = false;
        var finish = function (ok) {
          if (settled) return;
          settled = true;
          stage.classList.remove('booting');
          if (ok) {
            stage.classList.add('ready');
            if (win) win.classList.add('ready');
            watchFirstTouch(stage, frame);
          }
          done();
        };
        frame.addEventListener('load', function () {
          setTimeout(function () { finish(true); }, 300);
        }, { once: true });
        setTimeout(function () { finish(false); }, 25000);
        frame.src = stage.dataset.app;
      });
    }

    if (launch) launch.addEventListener('click', boot);

    /* Auto-boot as it scrolls up, so by the time the section is read the app
       is already running — but never on a metered connection, where the
       button keeps the decision with the person paying for the bytes. */
    if (!thrifty && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); boot(); } });
      }, { rootMargin: '300px 0px' });
      io.observe(stage);
    }

    /* reset / open-in-tab */
    var scope = win || stage;
    var reset = scope.querySelector('[data-sb-reset]');
    if (reset) reset.addEventListener('click', function () {
      stage.classList.remove('touched');
      frame.src = stage.dataset.app;
    });
    var pop = scope.querySelector('[data-sb-open]');
    if (pop) pop.setAttribute('href', stage.dataset.app);
  });

  /* The hint is an invitation, and an invitation that stays on screen after
     it has been accepted is just clutter. Any real input inside the guest
     retires it for good. */
  function watchFirstTouch(stage, frame) {
    var d = guestDoc(frame);
    if (!d) return;
    var mark = function () { stage.classList.add('touched'); };
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (t) {
      d.addEventListener(t, mark, { capture: true, once: true, passive: true });
    });
  }
})();
