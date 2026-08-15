/* ==========================================================================
   SANDBOX.JS
   --------------------------------------------------------------------------
   Boots the real build inside a case study, and — where a section is about
   the component set rather than the product — drives that running build from
   a row of chips, so a described component and a shown component are the same
   object rather than two things kept in sync by hand.

   All of it rests on one fact: assets/sandbox/ is served from this origin, so
   the page can reach into the frame's document directly.
   ========================================================================== */
(function () {
  'use strict';

  var conn    = navigator.connection || {};
  var thrifty = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || '');

  /* ----------------------------------------------------------------- utils */

  function guestDoc(frame) {
    try { return frame.contentDocument || null; } catch (e) { return null; }
  }

  /* Find a control in the guest by what it SAYS, not by where it sits. A
     class name or an nth-child path breaks the next time the app is rebuilt;
     the visible label of a tab is the thing least likely to move without
     somebody noticing. Falls back to the accessible name, which is how the
     icon-only layout switches are reachable at all. */
  function findControl(doc, needle) {
    var want = needle.toLowerCase();
    var nodes = doc.querySelectorAll('button, [role="button"], [role="tab"], a');
    var loose = null;
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var text = (el.innerText || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (text === want) return el;
      if (!loose && text.indexOf(want) === 0) loose = el;
    }
    if (loose) return loose;
    var labelled = doc.querySelectorAll('[aria-label], [title]');
    for (var j = 0; j < labelled.length; j++) {
      var name = (labelled[j].getAttribute('aria-label') ||
                  labelled[j].getAttribute('title') || '').toLowerCase();
      if (name.indexOf(want) === 0) return labelled[j];
    }
    return null;
  }

  /* ======================================================================
     1. THE SANDBOX
     ====================================================================== */

  document.querySelectorAll('.sb-stage[data-app]').forEach(function (stage) {
    var frame  = stage.querySelector('iframe');
    var launch = stage.querySelector('.sb-launch');
    var win    = stage.closest('.sb-win');
    if (!frame) return;

    /* An app with a fixed desktop chrome has a width below which it stops
       being the thing that was designed and becomes its own tablet build.
       data-w declares that intended viewport: the frame is laid out at it and
       scaled to fit, rather than handed a narrow box and left to reflow.
       Never scaled above 1 — blowing a 1280px app up to 1900 looks wrong in a
       way that reads as a mistake rather than a choice. */
    function fitStage() {
      var w = parseInt(stage.dataset.w, 10);
      if (!w) return;
      var space = stage.clientWidth;
      if (!space) return;
      var k = Math.min(1, space / w);
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

      var settled = false;
      var finish = function (ok) {
        if (settled) return;
        settled = true;
        stage.classList.remove('booting');
        if (!ok) return;
        stage.classList.add('ready');
        if (win) win.classList.add('ready');
        watchFirstTouch(stage, frame);
      };
      frame.addEventListener('load', function () {
        /* the app mounts a beat after load fires; driving the component index
           any sooner finds a document that is still empty */
        setTimeout(function () { finish(true); }, 700);
      }, { once: true });
      /* a wedged asset leaves the poster and the launch button in place
         rather than an empty frame that reads as broken */
      setTimeout(function () { finish(false); }, 25000);
      frame.src = stage.dataset.app;
    }

    if (launch) launch.addEventListener('click', boot);

    if (!thrifty && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); boot(); } });
      }, { rootMargin: '300px 0px' });
      io.observe(stage);
    }

    var scope = win || stage;
    var reset = scope.querySelector('[data-sb-reset]');
    if (reset) reset.addEventListener('click', function () {
      stage.classList.remove('touched');
      frame.src = stage.dataset.app;
    });
    var pop = scope.querySelector('[data-sb-open]');
    if (pop) pop.setAttribute('href', stage.dataset.app);
  });

  /* The hint is an invitation, and an invitation left on screen after it has
     been accepted is just clutter. Any real input inside the guest retires it
     for good. */
  function watchFirstTouch(stage, frame) {
    var d = guestDoc(frame);
    if (!d) return;
    var mark = function () { stage.classList.add('touched'); };
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (t) {
      d.addEventListener(t, mark, { capture: true, once: true, passive: true });
    });
  }

  /* ======================================================================
     2. THE COMPONENT LIBRARY
     --------------------------------------------------------------------
     Every tile shows an exact 2x crop of its component, captured from the
     build. That image is the default and it is always right: it needs no
     boot, and it survives the case where the page cannot reach into a frame
     at all.

     That case is the common one, not an edge case. Opened straight off disk,
     a file:// document is an opaque origin, so contentDocument is null and
     every crop measurement fails — which is exactly what left eight tiles
     reading "Loading component" forever. The images mean the section is
     correct there too; the live upgrade simply is not offered.

     Where it IS reachable, pointing at a tile and pressing Interact boots
     that one frame, drives it to the component's state, crops to the same
     box and fades it in over the image. One at a time, on demand, so the
     page never spends a minute mounting eight copies of a React app nobody
     asked to run.
     ====================================================================== */

  /* An opaque origin cannot be probed for directly, so this asks the question
     the honest way: mint a frame, look inside it, believe the answer. */
  var canReachFrames = (function () {
    if (location.protocol === 'file:') return false;
    try {
      var t = document.createElement('iframe');
      t.setAttribute('aria-hidden', 'true');
      t.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';
      document.body.appendChild(t);
      var reachable = !!(t.contentDocument && t.contentDocument.body !== undefined);
      document.body.removeChild(t);
      return reachable;
    } catch (e) { return false; }
  })();

  function locate(doc, spec) {
    var el = null, i;
    if (spec.svg) {
      var best = null, area = 0, svgs = doc.querySelectorAll('svg');
      for (i = 0; i < svgs.length; i++) {
        var sr = svgs[i].getBoundingClientRect();
        /* a floor, or this picks up a 20px toolbar icon and calls it the
           organisation network */
        if (sr.width < 240 || sr.height < 200) continue;
        if (sr.width * sr.height > area) { area = sr.width * sr.height; best = svgs[i]; }
      }
      el = best;
    } else if (spec.has) {
      var small = null, least = Infinity;
      var cands = doc.querySelectorAll('div,section,article,aside,header,form,button');
      for (i = 0; i < cands.length; i++) {
        var t = cands[i].innerText || '', all = true;
        for (var k = 0; k < spec.has.length; k++) {
          if (t.indexOf(spec.has[k]) === -1) { all = false; break; }
        }
        if (!all) continue;
        var r = cands[i].getBoundingClientRect();
        if (r.width < 40 || r.height < 20) continue;
        if (r.width * r.height < least) { least = r.width * r.height; small = cands[i]; }
      }
      el = small;
    }
    for (i = 0; el && i < (spec.up || 0); i++) el = el.parentElement;
    if (!el) return null;
    var b = el.getBoundingClientRect();
    return { x: b.left, y: b.top, w: b.width, h: b.height };
  }

  /* ---------- board zoom ----------
     `zoom` rather than `transform: scale` on purpose: zoom is laid out, so
     the board's scroll extents grow and shrink with it. A transform would
     leave the canvas claiming its 100% size and make half the artboard
     unreachable at 150%. */
  document.querySelectorAll('.ds-board').forEach(function (board) {
    var canvas = board.querySelector('.ds-canvas');
    var bar = board.closest('.sb-win');
    if (!canvas || !bar) return;
    var STEPS = [0.5, 0.65, 0.8, 1, 1.25, 1.5];
    var at = 3;
    var pct = bar.querySelector('.ds-pct');
    function apply() {
      canvas.style.setProperty('--z', STEPS[at]);
      if (pct) pct.textContent = Math.round(STEPS[at] * 100) + '%';
    }
    bar.querySelectorAll('[data-zoom]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var d = parseInt(btn.dataset.zoom, 10);
        at = Math.max(0, Math.min(STEPS.length - 1, at + d));
        apply();
      });
    });
    apply();
  });

  var lib = document.querySelectorAll('.ds-spec[data-app]');
  if (lib.length && !canReachFrames) document.body.classList.add('ds-nolive');

  lib.forEach(function (item) {
    var hold  = item.querySelector('.ds-frame');
    var frame = item.querySelector('iframe');
    var go    = item.querySelector('.ds-go');
    var shot  = item.querySelector('.ds-shot');
    if (!hold || !frame || !canReachFrames) return;

    var rect = null;

    /* Size the frame to the component, not the other way round: scale down to
       fit the column, never up past 1:1. Measuring the ITEM rather than the
       frame matters — the frame's width is about to be overwritten, so reading
       it back would ratchet the component smaller on every resize. */
    /* On the board a specimen is already laid out at the component's own
       width, so this is 1:1 in the normal case and only scales down if a
       narrow window has squeezed the tile. Board zoom is applied with `zoom`
       on an ancestor and multiplies through by itself — repeating it here
       would square it. */
    function place() {
      if (!rect || !rect.w) return;
      var space = item.clientWidth;
      if (!space) return;
      var k = Math.min(1, space / rect.w);
      frame.style.transform =
        'scale(' + k.toFixed(5) + ') translate(' + (-rect.x) + 'px,' + (-rect.y) + 'px)';
    }

    var started = false;
    function goLive() {
      if (started) return;
      started = true;
      item.classList.add('booting');
      if (go) go.querySelector('span').textContent = 'Starting\u2026';

      var settled = false;
      var fail = function () {
        if (settled) return;
        settled = true;
        item.classList.remove('booting');
        started = false;
        if (go) go.querySelector('span').textContent = 'Interact';
      };
      setTimeout(fail, 20000);

      frame.addEventListener('load', function () {
        setTimeout(function () {
          var d = guestDoc(frame);
          if (!d) { fail(); return; }
          var steps = [], spec = {};
          try { steps = JSON.parse(item.dataset.go || '[]'); } catch (e) {}
          try { spec  = JSON.parse(item.dataset.target || '{}'); } catch (e) {}
          var i = 0;
          (function next() {
            if (i < steps.length) {
              var el = findControl(d, steps[i++]);
              if (el) { try { el.click(); } catch (e) {} }
              setTimeout(next, 520);
              return;
            }
            /* graph layouts animate into place; measuring mid-flight crops
               the component at a size it never actually is */
            setTimeout(function () {
              rect = locate(d, spec);
              if (!rect) { fail(); return; }
              settled = true;
              place();
              item.classList.remove('booting');
              item.classList.add('live');
            }, 1100);
          })();
        }, 700);
      }, { once: true });

      frame.src = item.dataset.app;
    }

    if (go) go.addEventListener('click', goLive);
    /* a deliberate hover, not a passing one — sweeping the grid should not
       boot every app on the way past */
    var hoverTimer = null;
    item.addEventListener('pointerenter', function (ev) {
      if (ev.pointerType === 'touch') return;
      hoverTimer = setTimeout(goLive, 900);
    });
    item.addEventListener('pointerleave', function () { clearTimeout(hoverTimer); });

    if ('ResizeObserver' in window) new ResizeObserver(place).observe(item);
    else window.addEventListener('resize', place);
  });
})();
