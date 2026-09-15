(function () {
  var PAL = ['#5003C0', '#AB03A9', '#FF467A', '#FFD51E'];
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/buchnerdigital/WhereInTheZman@8fa5372e10dc5e87ee0afd2ee4a5d9f67afa8518/js/app.js';
  s.onload = function () {
    if (typeof WINDOW_DEFS !== 'undefined') {
      WINDOW_DEFS.forEach(function (z, i) { z.color = PAL[i % 4]; });
    }
    var orig = window.render;
    if (typeof orig !== 'function') return;
    window.render = function () {
      var realMin = Math.min, realMax = Math.max;
      Math.min = function (a, b) {
        if (arguments.length === 2 && a === 560) return realMin(880, b);
        return realMin.apply(Math, arguments);
      };
      Math.max = function (a, b) {
        if (arguments.length === 2 && a === 340) return realMax(560, b);
        if (arguments.length === 2 && a === 180) return realMax(260, b);
        return realMax.apply(Math, arguments);
      };
      try { orig.apply(this, arguments); }
      finally { Math.min = realMin; Math.max = realMax; }

      var svg = document.getElementById('chart');
      if (!svg) return;
      svg.querySelectorAll('text').forEach(function (t) {
        var fs = Number(t.getAttribute('font-size') || 0);
        if (fs && fs <= 10) t.setAttribute('font-size', '14');
      });
      if (typeof ZMANIM_WINDOWS !== 'undefined') {
        ZMANIM_WINDOWS.forEach(function (z) {
          if (z.id === 'candles') z.color = PAL[3];
          else if (typeof WINDOW_DEFS !== 'undefined') {
            var def = WINDOW_DEFS.find(function (d) { return d.id === z.id; });
            if (def) z.color = def.color;
          }
        });
        svg.querySelectorAll('path.zman-lane').forEach(function (p, i) {
          var z = ZMANIM_WINDOWS[i];
          if (z) p.setAttribute('stroke', z.color);
          p.setAttribute('stroke-width', '3.6');
        });
      }
      if (typeof LANE_W !== 'undefined') { LANE_W = 3.6; LANE_W_SEL = 5.8; }
      attachSegmentMagnets(svg);
      var nowLs = document.querySelector('.li[data-id="now"] .ls');
      if (nowLs) {
        nowLs.style.background = 'var(--now)';
        nowLs.style.border = '1px dashed var(--now)';
      }
    };
  };
  document.head.appendChild(s);

  function attachSegmentMagnets(svg) {
    if (typeof ZMANIM_WINDOWS === 'undefined' || typeof xS_global !== 'function') return;
    var xS = xS_global, iW = iW_global;
    var magnetPts = [];
    ZMANIM_WINDOWS.forEach(function (z) {
      if (Number.isFinite(z.start)) magnetPts.push({ x: xS(z.start), ms: z.start });
      if (Number.isFinite(z.end)) magnetPts.push({ x: xS(z.end), ms: z.end });
    });
    var MAGNET_PX = Math.max(12, Math.min(22, iW * 0.018));
    function magnetize(cx) {
      var best = null, bestD = MAGNET_PX;
      for (var i = 0; i < magnetPts.length; i++) {
        var d = Math.abs(cx - magnetPts[i].x);
        if (d < bestD) { bestD = d; best = magnetPts[i]; }
      }
      if (!best) return { x: cx, ms: DAY_START_MS + (cx / iW) * DAY_SPAN_MS, snap: false };
      return { x: best.x, ms: best.ms, snap: true };
    }
    var g = svg.querySelector('g');
    if (!g) return;
    var chartBg = g.querySelector('rect');
    if (!chartBg) return;
    var cursor = g.querySelector('line');
    var fresh = chartBg.cloneNode(true);
    chartBg.parentNode.replaceChild(fresh, chartBg);
    function chartPos(evt) {
      var svgRect = svg.getBoundingClientRect();
      var W = Math.max(280, svg.clientWidth || 1096);
      var left = 48;
      try { left = g.transform.baseVal.getItem(0).matrix.e || 48; } catch (e) {}
      return (evt.clientX - svgRect.left) / svgRect.width * W - left;
    }
    function setCursor(cx, snapped) {
      if (!cursor) return;
      cursor.setAttribute('x1', cx);
      cursor.setAttribute('x2', cx);
      cursor.setAttribute('display', '');
      var root = getComputedStyle(document.documentElement);
      cursor.setAttribute('stroke', snapped ? (root.getPropertyValue('--now').trim() || '#FF467A') : (root.getPropertyValue('--axis').trim() || '#f3d9ff'));
      cursor.setAttribute('stroke-width', snapped ? '2.2' : '1.5');
    }
    if (typeof IS_COARSE !== 'undefined' && IS_COARSE) return;
    fresh.addEventListener('mousemove', function (evt) {
      var raw = chartPos(evt);
      if (raw < 0 || raw > iW) {
        if (cursor) cursor.setAttribute('display', 'none');
        if (typeof hideHover === 'function') hideHover();
        return;
      }
      var m = magnetize(raw);
      setCursor(m.x, m.snap);
      if (typeof showHoverTt === 'function') showHoverTt(m.ms, evt.clientX, evt.clientY);
    });
    fresh.addEventListener('mouseleave', function () {
      if (cursor) cursor.setAttribute('display', 'none');
      if (typeof hideHover === 'function') hideHover();
    });
    fresh.addEventListener('click', function (evt) {
      var raw = chartPos(evt);
      if (raw < 0 || raw > iW) return;
      var m = magnetize(raw);
      if (typeof deselectAll === 'function') deselectAll();
      if (typeof openPin === 'function' && typeof hoverBodyAt === 'function') openPin(hoverBodyAt(m.ms));
    });
  }
})();
