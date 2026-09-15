(function () {
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/buchnerdigital/WhereInTheZman@8fa5372e10dc5e87ee0afd2ee4a5d9f67afa8518/js/app.js';
  s.onload = function () {
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
      svg.querySelectorAll('path.zman-lane').forEach(function (p) {
        p.setAttribute('stroke-width', '3.6');
      });
      if (typeof LANE_W !== 'undefined') { LANE_W = 3.6; LANE_W_SEL = 5.8; }
    };
  };
  document.head.appendChild(s);
})();
