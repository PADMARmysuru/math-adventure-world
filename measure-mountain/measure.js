/* ==============================================================
   📏 Measure Mountain — measure.js  (shared measuring-tool drawings)
   --------------------------------------------------------------
   window.Measure.ruler({ cm, length, colour, label })   centimetre ruler + object
   window.Measure.dial({ value, max, unit })             round kitchen scale
   window.Measure.jug({ litres, max })                   measuring jug
   window.Measure.thermometer({ value, min, max })       °C thermometer
   All drawings are simple original SVG.
   ============================================================== */
'use strict';

(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs = {}) => {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    return n;
  };
  const text = (x, y, t, attrs = {}) => { const n = svgEl('text', { x, y, 'text-anchor': 'middle', 'font-weight': 800, 'font-size': 12, fill: '#2B2D42', ...attrs }); n.textContent = t; return n; };

  /** Ruler from 0 to `cm`, with an object of `length` cm lying on it from 0. */
  function ruler({ cm = 15, length = 0, colour = '#FF8A3D', label = 'object', start = 0 } = {}) {
    const unit = 26;
    const w = cm * unit + 30;
    const svg = svgEl('svg', { viewBox: `0 0 ${w} 96`, width: '100%', class: 'ruler-svg', role: 'img', 'aria-label': `${label} on a ruler` });
    if (length) {
      const x0 = 15 + start * unit;
      svg.append(svgEl('rect', { x: x0, y: 8, width: length * unit, height: 22, rx: 10, fill: colour, stroke: '#2B2D42', 'stroke-width': 2 }));
      svg.append(svgEl('rect', { x: x0 + 6, y: 13, width: Math.max(0, length * unit - 22), height: 4, rx: 2, fill: '#fff', opacity: 0.5 }));
    }
    svg.append(svgEl('rect', { x: 4, y: 40, width: w - 8, height: 50, rx: 6, fill: '#FFE9A8', stroke: '#C99A3A', 'stroke-width': 2 }));
    for (let i = 0; i <= cm; i++) {
      const x = 15 + i * unit;
      svg.append(svgEl('line', { x1: x, y1: 40, x2: x, y2: 62, stroke: '#2B2D42', 'stroke-width': 2 }));
      svg.append(text(x, 80, String(i)));
      if (i < cm) svg.append(svgEl('line', { x1: x + unit / 2, y1: 40, x2: x + unit / 2, y2: 52, stroke: '#2B2D42', 'stroke-width': 1.2 }));
    }
    svg.append(text(w - 22, 54, 'cm', { 'font-size': 10 }));
    return svg;
  }

  /** Round scale with numbered marks 0..max and a needle at value. */
  function dial({ value = 0, max = 10, unit = 'kg', size = 190 } = {}) {
    const svg = svgEl('svg', { viewBox: '0 0 200 200', width: size, height: size, class: 'dial-svg', role: 'img', 'aria-label': `Scale showing ${value} ${unit}` });
    svg.append(svgEl('rect', { x: 50, y: 150, width: 100, height: 40, rx: 10, fill: '#7B61FF' }));
    svg.append(svgEl('circle', { cx: 100, cy: 100, r: 88, fill: '#fff', stroke: '#2B2D42', 'stroke-width': 5 }));
    const angle = v => -135 + (270 * v) / max;
    for (let i = 0; i <= max; i++) {
      const a = ((angle(i) - 90) * Math.PI) / 180;
      const x1 = 100 + 74 * Math.cos(a); const y1 = 100 + 74 * Math.sin(a);
      const x2 = 100 + 84 * Math.cos(a); const y2 = 100 + 84 * Math.sin(a);
      svg.append(svgEl('line', { x1, y1, x2, y2, stroke: '#2B2D42', 'stroke-width': 3 }));
      svg.append(text(100 + 60 * Math.cos(a), 100 + 60 * Math.sin(a) + 5, String(i), { 'font-size': 15 }));
    }
    svg.append(text(100, 140, unit, { 'font-size': 14, fill: '#565B78' }));
    const needle = svgEl('g', { class: 'dial-needle', style: `transform: rotate(${angle(value)}deg); transform-origin: 100px 100px;` });
    needle.append(svgEl('line', { x1: 100, y1: 100, x2: 100, y2: 30, stroke: '#E04F4F', 'stroke-width': 5, 'stroke-linecap': 'round' }));
    svg.append(needle, svgEl('circle', { cx: 100, cy: 100, r: 8, fill: '#2B2D42' }));
    svg.setNeedle = v => {
      needle.style.transform = `rotate(${angle(v)}deg)`;
      svg.setAttribute('aria-label', `Scale showing ${v} ${unit}`);
    };
    return svg;
  }

  /** Measuring jug marked 0..max litres, filled to `litres`. */
  function jug({ litres = 0, max = 5, size = 200 } = {}) {
    const svg = svgEl('svg', { viewBox: '0 0 160 200', width: size * 0.8, height: size, class: 'jug-svg', role: 'img', 'aria-label': `Jug with ${litres} litres` });
    const top = 20; const bottom = 186; const h = bottom - top;
    const levelY = v => bottom - (h * v) / max;
    const water = svgEl('rect', { x: 22, y: levelY(litres), width: 96, height: bottom - levelY(litres), fill: '#6CC4F5', class: 'jug-water' });
    svg.append(water);
    svg.append(svgEl('path', { d: `M18 ${top} L18 ${bottom} Q18 192 26 192 L114 192 Q122 192 122 ${bottom} L122 ${top}`, fill: 'none', stroke: '#2B2D42', 'stroke-width': 4 }));
    svg.append(svgEl('path', { d: 'M122 50 Q150 52 148 90 Q146 128 122 130', fill: 'none', stroke: '#2B2D42', 'stroke-width': 4 }));
    for (let i = 1; i <= max; i++) {
      svg.append(svgEl('line', { x1: 18, y1: levelY(i), x2: 44, y2: levelY(i), stroke: '#2B2D42', 'stroke-width': 2.5 }));
      svg.append(text(62, levelY(i) + 5, `${i} l`, { 'font-size': 13 }));
    }
    svg.setLevel = v => {
      water.setAttribute('y', levelY(Math.min(v, max)));
      water.setAttribute('height', bottom - levelY(Math.min(v, max)));
      svg.setAttribute('aria-label', `Jug with ${v} litres`);
    };
    return svg;
  }

  /** Thermometer from min to max °C. Marks every 5, numbers every 10. */
  function thermometer({ value = 20, min = 0, max = 40, size = 230 } = {}) {
    const svg = svgEl('svg', { viewBox: '0 0 120 260', width: size * 0.46, height: size, class: 'thermo-svg', role: 'img', 'aria-label': `Thermometer showing ${value} degrees` });
    const top = 18; const bottom = 210;
    const y = v => bottom - ((bottom - top) * (v - min)) / (max - min);
    svg.append(svgEl('rect', { x: 34, y: top - 8, width: 22, height: bottom - top + 20, rx: 11, fill: '#fff', stroke: '#2B2D42', 'stroke-width': 3 }));
    const liquid = svgEl('rect', { x: 39, y: y(value), width: 12, height: 222 - y(value), rx: 6, fill: '#E04F4F', class: 'thermo-liquid' });
    svg.append(liquid, svgEl('circle', { cx: 45, cy: 232, r: 19, fill: '#E04F4F', stroke: '#2B2D42', 'stroke-width': 3 }));
    for (let v = min; v <= max; v += 5) {
      const big = v % 10 === 0;
      svg.append(svgEl('line', { x1: 58, y1: y(v), x2: big ? 72 : 66, y2: y(v), stroke: '#2B2D42', 'stroke-width': big ? 2.5 : 1.5 }));
      if (big) svg.append(text(92, y(v) + 4, String(v), { 'font-size': 14 }));
    }
    svg.append(text(92, 252, '°C', { 'font-size': 14 }));
    svg.setValue = v => {
      liquid.setAttribute('y', y(v));
      liquid.setAttribute('height', 222 - y(v));
      svg.setAttribute('aria-label', `Thermometer showing ${v} degrees`);
    };
    return svg;
  }

  window.Measure = { ruler, dial, jug, thermometer, svgEl };
})();
