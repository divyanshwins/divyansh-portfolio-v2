/* ==========================================================================
   Shared behaviour + micro-interactions for every page.
   Everything here is a progressive enhancement: the site is fully usable
   with JS off, and every motion effect is skipped for pointer-less devices
   and for prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';

  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fancy    = canHover && !reduce;

  /* ---------------------------------------------------------------- reveal */
  var nodes = document.querySelectorAll('[data-r]');
  if (nodes.length && 'IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -5% 0px' });
    nodes.forEach(function (n) { io.observe(n); });
  } else {
    nodes.forEach(function (n) { n.classList.add('in'); });
  }

  /* ------------------------------------------------------ word-by-word reveal
     Splits a heading into words and lifts each one out from behind a mask on
     a stagger. Two things make it read as motion design rather than a CSS
     fade: every word carries a blur that resolves as it settles, and the
     stagger is eased — later words follow more quickly than the first few, so
     the line arrives as one gesture instead of a metronome.

     The split is done on a clone measured against the live layout, so the
     wrapping is whatever the browser chose; nothing is hard-coded. Each word
     also keeps its trailing space as a real text node, so selecting and
     copying the heading still yields normal text. */
  document.querySelectorAll('[data-words]').forEach(function (el) {
    if (el.dataset.split === '1') return;
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;

    el.dataset.split = '1';
    el.textContent = '';
    var words = text.split(' ');

    words.forEach(function (word, i) {
      var mask = document.createElement('span');
      mask.className = 'w';
      var inner = document.createElement('span');
      inner.className = 'wi';
      inner.textContent = word;
      /* eased stagger: the gap between words shrinks as the line fills */
      inner.style.transitionDelay = Math.round(Math.pow(i, 0.82) * 62) + 'ms';
      mask.appendChild(inner);
      el.appendChild(mask);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });

    if (reduce) { el.classList.add('lit'); return; }

    var light = function () {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { el.classList.add('lit'); });
      });
    };
    /* a heading below the fold waits until it is actually looked at */
    if ('IntersectionObserver' in window) {
      var wo = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { light(); wo.disconnect(); } });
      }, { threshold: 0.2 });
      wo.observe(el);
    } else { light(); }
  });

  /* --------------------------------------------------- hero wordmark reveal
     The same lift as a case-study heading, run on the hero name at page load.

     It needs its own pass rather than just borrowing [data-words], for two
     reasons. First, the wordmark's markup is structural — .ln lines wrapping
     .fit spans that the fit-to-width code below measures — and [data-words]
     flattens an element to its textContent, which would destroy that. So the
     split happens INSIDE each .fit instead, leaving the scaffolding intact.
     Second, the mask/inner pair has to exist before the fitter measures,
     which is why this block sits above it: the transforms live on .wi, and a
     child's transform never feeds back into its parent's layout box, so the
     width the fitter reads is the same one it read before the split.

     Each .fit line is one word here, so the line index IS the stagger index —
     same eased curve as the heading split, so the two read as one system. */
  document.querySelectorAll('[data-words-fit]').forEach(function (el) {
    if (el.dataset.split === '1') return;
    var fitLines = el.querySelectorAll('.fit');
    if (!fitLines.length) return;
    el.dataset.split = '1';

    fitLines.forEach(function (line, i) {
      var text = line.textContent.replace(/\s+/g, ' ').trim();
      if (!text) return;
      line.textContent = '';
      var mask = document.createElement('span');
      mask.className = 'w';
      var inner = document.createElement('span');
      inner.className = 'wi';
      inner.textContent = text;
      inner.style.transitionDelay = Math.round(Math.pow(i, 0.82) * 62) + 'ms';
      mask.appendChild(inner);
      line.appendChild(mask);
    });

    if (reduce) { el.classList.add('lit'); return; }

    var isLit = false;
    var lightUp = function () {
      if (isLit) return;
      isLit = true;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { el.classList.add('lit'); });
      });
    };

    /* Hold the reveal until the type has landed at its FINAL size. The fitter
       re-measures on fonts.ready, and a word that resizes halfway through the
       lift reads as a glitch rather than a gesture. The setTimeout(…, 0) is
       load-bearing: it defers past every fonts.ready microtask — including the
       refit registered below — instead of racing it. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { setTimeout(lightUp, 0); });
      setTimeout(lightUp, 1400);   // font never resolves → show the name anyway
    } else {
      lightUp();
    }
  });

  /* ------------------------------------------------------- fit-to-width name
     Sets every line of a [data-fit] block to ONE size — the size at which its
     LONGEST line spans exactly `--name-span × page width`. The span is a
     fraction, not 1: the hero composition depends on the long line stopping
     short of the full measure so the two words stagger. Measuring beats
     guessing in vw, because the character advance depends on the loaded
     font — until it arrives the browser is measuring the fallback face, so
     this re-fits on fonts.ready. */
  document.querySelectorAll('[data-fit]').forEach(function (block) {
    var lines = block.querySelectorAll('.fit');
    if (!lines.length) return;

    var lastW = -1;

    var fit = function (force) {
      var box = block.clientWidth;
      if (!box) return;
      // resizing the type changes the block's HEIGHT, which re-fires the
      // observer — bail unless the WIDTH actually moved
      if (!force && box === lastW) return;
      lastW = box;

      // read the span back off CSS so the breakpoints stay in the stylesheet
      var span = parseFloat(
        getComputedStyle(block).getPropertyValue('--name-span')
      );
      if (!(span > 0 && span <= 1)) span = 1;
      var avail = box * span;

      // measure at a fixed probe size, then scale by the widest line's ratio
      var probe = 100, ratio = Infinity;
      lines.forEach(function (l) { l.style.fontSize = probe + 'px'; });
      lines.forEach(function (l) {
        var w = l.getBoundingClientRect().width;
        if (w > 0) ratio = Math.min(ratio, avail / w);
      });
      if (!isFinite(ratio)) return;

      var size = probe * ratio;
      lines.forEach(function (l) { l.style.fontSize = size.toFixed(2) + 'px'; });

      // sub-pixel rounding can leave the long line a hair over; nudge it back
      var over = 0;
      lines.forEach(function (l) {
        over = Math.max(over, l.getBoundingClientRect().width - avail);
      });
      if (over > 0.5) {
        size *= avail / (avail + over);
        lines.forEach(function (l) { l.style.fontSize = size.toFixed(2) + 'px'; });
      }
    };

    fit(true);
    // the font swaps in after first paint — remeasure against the real face
    document.fonts && document.fonts.ready.then(function () { fit(true); });
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { fit(false); }).observe(block);
    } else {
      window.addEventListener('resize', function () { fit(true); });
    }
  });

  /* --------------------------------------------------- tall capture plates
     A full-page screen capture can be 1500x5377. Run at the full plate width
     it renders four thousand pixels tall and stops being readable — so the
     taller the shot's natural ratio, the narrower its plate, holding rendered
     height to ~3000px. Everything normally-proportioned is untouched. */
  var MAX_PLATE_H = 3000;
  document.querySelectorAll('figure.fig > .frame > img').forEach(function (img) {
    var size = function () {
      if (!img.naturalWidth) return;
      var ratio = img.naturalHeight / img.naturalWidth;
      var fig = img.closest('figure.fig');
      var cap = Math.round(MAX_PLATE_H / ratio);
      // only ever narrows: the CSS cap still wins when this is wider
      fig.style.setProperty('--plate', 'min(' + cap + 'px, var(--fig-max))');
    };
    if (img.complete) size();
    else img.addEventListener('load', size, { once: true });
  });

  /* ------------------------------------------------------------- résumé */
  /* `download` alone suppresses navigation, so a single link can't both
     open and save. Navigate in a new tab, then fire a hidden download. */
  document.querySelectorAll('[data-resume]').forEach(function (link) {
    link.addEventListener('click', function (ev) {
      ev.preventDefault();
      var href = link.getAttribute('href');
      window.open(href, '_blank', 'noopener');
      var a = document.createElement('a');
      a.href = href;
      a.download = 'Divyansh-Srivastava-Resume.pdf';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  });

  /* -------------------------------------------------- nav slide indicator */
  var pill = document.querySelector('.nav-pill');
  if (pill && fancy) {
    var active = pill.querySelector('a.on');
    if (active) {
      pill.classList.add('js');
      var ind = document.createElement('span');
      ind.className = 'nav-ind';
      pill.insertBefore(ind, pill.firstChild);

      var links = pill.querySelectorAll('a');

      /* the indicator and the white label have to move together, otherwise
         the item under the black pill reads as black-on-black */
      var move = function (el) {
        ind.style.width = el.offsetWidth + 'px';
        ind.style.transform = 'translateX(' + el.offsetLeft + 'px)';
        links.forEach(function (a) { a.classList.toggle('lit', a === el); });
      };
      var settle = function () { move(active); };

      // no transition on the very first placement
      ind.style.transition = 'none';
      settle();
      requestAnimationFrame(function () { ind.style.transition = ''; });

      links.forEach(function (a) {
        a.addEventListener('mouseenter', function () { move(a); });
        a.addEventListener('focus', function () { move(a); });
        a.addEventListener('blur', settle);
      });
      pill.addEventListener('mouseleave', settle);
      window.addEventListener('resize', settle);
      document.fonts && document.fonts.ready.then(settle);
    }
  }

  /* ------------------------------------------- "View project" cursor bubble */
  var cards = document.querySelectorAll('.card[href]');
  if (cards.length && fancy) {
    var peek = document.createElement('div');
    peek.className = 'peek';
    peek.setAttribute('aria-hidden', 'true');
    document.body.appendChild(peek);

    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null, live = false;

    function loop() {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      peek.style.left = cx.toFixed(1) + 'px';
      peek.style.top  = cy.toFixed(1) + 'px';
      if (live || Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4) {
        raf = requestAnimationFrame(loop);
      } else { raf = null; }
    }

    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function (e) {
        peek.textContent = card.dataset.peek || 'View project';
        cx = tx = e.clientX; cy = ty = e.clientY;
        live = true;
        peek.classList.add('on');
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener('mousemove', function (e) {
        tx = e.clientX; ty = e.clientY;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener('mouseleave', function () {
        live = false;
        peek.classList.remove('on');
      });
    });
  }

  /* ------------------------------------------------------ magnetic buttons */
  if (fancy) {
    document.querySelectorAll('.pill, .pill-solid, .pill-dark, .resume')
      .forEach(function (btn) {
        var r = null;
        btn.addEventListener('mouseenter', function () {
          r = btn.getBoundingClientRect();
          btn.style.transition = 'transform .18s ease-out, background .35s, color .35s, border-color .35s';
        });
        btn.addEventListener('mousemove', function (e) {
          if (!r) return;
          var dx = (e.clientX - (r.left + r.width  / 2)) * 0.22;
          var dy = (e.clientY - (r.top  + r.height / 2)) * 0.3;
          btn.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
        });
        btn.addEventListener('mouseleave', function () {
          btn.style.transition = '';
          btn.style.transform = '';
          r = null;
        });
      });
  }
})();
