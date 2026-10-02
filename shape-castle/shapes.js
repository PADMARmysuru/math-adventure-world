/* ==============================================================
   🏰 Shape Castle — shapes.js   (shared shape drawings and facts)
   --------------------------------------------------------------
   window.Shapes.draw2D(name, options)  → <svg> of a flat shape
   window.Shapes.draw3D(name, options)  → <svg> of a solid shape
   window.Shapes.INFO_2D / INFO_3D      → names, sides, corners, faces…
   All drawings are original simple SVG (no copied artwork).
   ============================================================== */
'use strict';

(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const COLOURS = ['#FF8A3D', '#7B61FF', '#22B5A6', '#FF6B8B', '#4D96FF', '#FFC93C', '#3BB273'];

  /** Points of a regular polygon in a 100×100 box. */
  function regular(n, r = 44, cx = 50, cy = 50, start = -90) {
    return Array.from({ length: n }, (_, i) => {
      const a = ((start + (360 / n) * i) * Math.PI) / 180;
      return [+(cx + r * Math.cos(a)).toFixed(1), +(cy + r * Math.sin(a)).toFixed(1)];
    });
  }

  /** Corner points for each straight-sided shape (used for drawing and counting). */
  const POINTS = {
    triangle: regular(3, 46, 50, 58),
    'triangle-right': [[12, 88], [12, 14], [88, 88]],
    'triangle-thin': [[8, 82], [92, 70], [40, 16]],
    square: [[12, 12], [88, 12], [88, 88], [12, 88]],
    rectangle: [[4, 24], [96, 24], [96, 76], [4, 76]],
    pentagon: regular(5, 46, 50, 54),
    hexagon: regular(6, 46, 50, 50, -90),
    octagon: regular(8, 46, 50, 50, -67.5),
    kite: [[50, 6], [80, 40], [50, 94], [20, 40]],
    'rectangle-tall': [[26, 4], [74, 4], [74, 96], [26, 96]]
  };

  const INFO_2D = {
    circle:     { label: 'circle',     sides: 0, corners: 0, curved: true },
    semicircle: { label: 'semi-circle', sides: 2, corners: 2, curved: true, note: '1 curved side and 1 straight side' },
    triangle:   { label: 'triangle',   sides: 3, corners: 3 },
    square:     { label: 'square',     sides: 4, corners: 4 },
    rectangle:  { label: 'rectangle',  sides: 4, corners: 4 },
    pentagon:   { label: 'pentagon',   sides: 5, corners: 5 },
    hexagon:    { label: 'hexagon',    sides: 6, corners: 6 },
    octagon:    { label: 'octagon',    sides: 8, corners: 8 },
    kite:       { label: 'kite',       sides: 4, corners: 4 }
  };
  // Variants count as their family
  const FAMILY = { 'triangle-right': 'triangle', 'triangle-thin': 'triangle', 'rectangle-tall': 'rectangle' };
  const familyOf = name => FAMILY[name] || name;

  const INFO_3D = {
    cube:     { label: 'cube',     flat: 6, curved: 0, rolls: false, stacks: true,  objects: ['🎲', '🧊'] },
    cuboid:   { label: 'cuboid',   flat: 6, curved: 0, rolls: false, stacks: true,  objects: ['📦', '🧱'] },
    sphere:   { label: 'sphere',   flat: 0, curved: 1, rolls: true,  stacks: false, objects: ['⚽', '🏀', '🌍'] },
    cylinder: { label: 'cylinder', flat: 2, curved: 1, rolls: true,  stacks: true,  objects: ['🥫', '🔋'] },
    cone:     { label: 'cone',     flat: 1, curved: 1, rolls: true,  stacks: false, objects: ['🍦', '🎉'] },
    pyramid:  { label: 'pyramid',  flat: 5, curved: 0, rolls: false, stacks: false, objects: ['⛺', '🔺'] }
  };

  function svgEl(tag, attrs = {}) {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  }

  function makeSVG(size, label) {
    const svg = svgEl('svg', { viewBox: '0 0 100 100', width: size, height: size, class: 'shape-svg', role: 'img', 'aria-label': label });
    return svg;
  }

  /**
   * Draw a flat shape.
   * options: size, fill, rotate (deg), label (aria), stroke
   */
  function draw2D(name, { size = 90, fill = '#FF8A3D', rotate = 0, label, stroke = '#2B2D42' } = {}) {
    const svg = makeSVG(size, label || (INFO_2D[familyOf(name)] || { label: name }).label);
    const g = svgEl('g', { transform: `rotate(${rotate} 50 50)` });
    const style = { fill, stroke, 'stroke-width': 3, 'stroke-linejoin': 'round' };
    if (name === 'circle') g.append(svgEl('circle', { cx: 50, cy: 50, r: 44, ...style }));
    else if (name === 'semicircle') g.append(svgEl('path', { d: 'M6 66 A44 44 0 0 1 94 66 Z', ...style }));
    else g.append(svgEl('polygon', { points: POINTS[name].map(p => p.join(',')).join(' '), ...style }));
    svg.append(g);
    return svg;
  }

  /** Draw a solid shape with shaded faces. */
  function draw3D(name, { size = 100, colour = '#7B61FF', label } = {}) {
    const svg = makeSVG(size, label || INFO_3D[name].label);
    const line = { stroke: '#2B2D42', 'stroke-width': 2.5, 'stroke-linejoin': 'round' };
    const light = shade(colour, 40);
    const dark = shade(colour, -30);
    const add = (tag, attrs) => svg.append(svgEl(tag, { ...line, ...attrs }));

    if (name === 'cube' || name === 'cuboid') {
      const w = name === 'cube' ? 44 : 62;
      const h = 44;
      const x = name === 'cube' ? 16 : 8;
      const y = 40;
      const d = 18;
      add('polygon', { points: `${x},${y} ${x + d},${y - d} ${x + w + d},${y - d} ${x + w},${y}`, fill: light });
      add('polygon', { points: `${x + w},${y} ${x + w + d},${y - d} ${x + w + d},${y - d + h} ${x + w},${y + h}`, fill: dark });
      add('rect', { x, y, width: w, height: h, fill: colour });
    } else if (name === 'sphere') {
      add('circle', { cx: 50, cy: 52, r: 40, fill: colour });
      svg.append(svgEl('ellipse', { cx: 50, cy: 52, rx: 40, ry: 12, fill: 'none', stroke: '#2B2D42', 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: 0.6 }));
      svg.append(svgEl('circle', { cx: 36, cy: 36, r: 9, fill: '#fff', opacity: 0.55 }));
    } else if (name === 'cylinder') {
      add('path', { d: 'M18 26 L18 78 A32 11 0 0 0 82 78 L82 26', fill: colour });
      add('ellipse', { cx: 50, cy: 26, rx: 32, ry: 11, fill: light });
    } else if (name === 'cone') {
      add('path', { d: 'M50 8 L16 80 A34 11 0 0 0 84 80 Z', fill: colour });
      svg.append(svgEl('path', { d: 'M16 80 A34 11 0 0 1 84 80', fill: 'none', stroke: '#2B2D42', 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: 0.6 }));
    } else if (name === 'pyramid') {
      add('polygon', { points: '50,8 12,74 56,90', fill: colour });
      add('polygon', { points: '50,8 56,90 90,68', fill: dark });
      svg.append(svgEl('path', { d: 'M12 74 L46 56 L90 68 M46 56 L50 8', fill: 'none', stroke: '#2B2D42', 'stroke-width': 1.5, 'stroke-dasharray': '4 4', opacity: 0.6 }));
    }
    return svg;
  }

  /** Lighten (+) or darken (−) a hex colour. */
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const clamp = v => Math.max(0, Math.min(255, v));
    const r = clamp((n >> 16) + amt);
    const g = clamp(((n >> 8) & 255) + amt);
    const b = clamp((n & 255) + amt);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  window.Shapes = { draw2D, draw3D, INFO_2D, INFO_3D, POINTS, COLOURS, familyOf, regular, svgEl, shade, NAMES_2D: Object.keys(INFO_2D).filter(n => n !== 'kite'), NAMES_3D: Object.keys(INFO_3D) };
})();
