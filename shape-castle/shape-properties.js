/* ==============================================================
   📐 Shape Castle → Shape Properties   shape-castle/shape-properties.js
   --------------------------------------------------------------
   🌱 Learn      tap each side, then each corner, to count them
   🎮 Play       geoboard: tap pegs to build shapes with a set number of sides
   🧩 Practise   sort shapes by their properties
   🧠 Think      true or false? (not every 4-sided shape is a square)
   🚀 Challenge  odd one out — and say why
   🏆 Master     five mixed questions → Property Pro badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const S = window.Shapes;
  if (!MA || !K || !S) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, pulse, nextOrDone, sortZones, optionsFor, PRAISE } = K;

  const MODULE_ID = 'shape-castle/shape-properties';
  const info = n => S.INFO_2D[S.familyOf(n)];

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Sides and corners',  render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Geoboard builder',   render: renderGeoboard },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Sort by property',   render: renderSort },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',     render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Odd one out',        render: renderOddOne },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Property Pro',       render: renderMaster }
  ];

  /* ------------------------------------------------------------
     🌱 LEARN — tap sides, then corners
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const shapes = ['triangle', 'rectangle', 'pentagon', 'hexagon'];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const name = shapes[round];
      const pts = S.POINTS[name];
      const n = pts.length;
      let phase = 'sides';
      let counted = 0;
      say(`Tap each SIDE of the ${info(name).label} to count it.`);
      const svg = S.svgEl('svg', { viewBox: '-6 -6 112 112', width: 230, height: 230, class: 'count-svg', role: 'group', 'aria-label': `A ${info(name).label}` });
      svg.append(S.svgEl('polygon', { points: pts.map(p => p.join(',')).join(' '), fill: '#EFEBFF', stroke: 'none' }));
      const counter = el('div', { class: 'big-count big-count--small', 'aria-live': 'polite' }, '0');
      const label = el('p', { class: 'hop-count' }, 'Sides');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });

      pts.forEach((p, i) => {
        const q = pts[(i + 1) % n];
        const side = S.svgEl('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], class: 'count-side', tabindex: '0', role: 'button', 'aria-label': `Side ${i + 1}` });
        const hit = () => {
          if (phase !== 'sides' || side.classList.contains('is-counted')) return;
          side.classList.add('is-counted');
          counted += 1;
          counter.textContent = counted;
          if (counted === n) {
            say(`${n} sides! Now tap each CORNER. A corner is where two sides meet.`);
            phase = 'corners';
            counted = 0;
            setTimeout(() => { counter.textContent = '0'; label.textContent = 'Corners'; svg.classList.add('show-corners'); }, 500);
          }
        };
        side.addEventListener('click', hit);
        side.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hit(); } });
        svg.append(side);
      });
      pts.forEach((p, i) => {
        const corner = S.svgEl('circle', { cx: p[0], cy: p[1], r: 7, class: 'count-corner', tabindex: '0', role: 'button', 'aria-label': `Corner ${i + 1}` });
        const hit = () => {
          if (phase !== 'corners' || corner.classList.contains('is-counted')) return;
          corner.classList.add('is-counted');
          counted += 1;
          counter.textContent = counted;
          if (counted === n) {
            phase = 'done';
            say(`${n} sides and ${n} corners. The numbers match!`);
            MA.launchConfetti(25);
            result.append(el('p', { class: 'round-result__text' }, `🎉 ${info(name).label}: ${n} sides, ${n} corners`));
            nextOrDone(result, round === shapes.length - 1, 'Next shape ▶', () => { round += 1; newRound(); }, done);
          }
        };
        corner.addEventListener('click', hit);
        corner.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hit(); } });
        svg.append(corner);
      });

      box.append(el('p', { class: 'round-label' }, `Shape ${round + 1} of ${shapes.length}`),
        instruction('👆 Tap every side. Then tap every corner.'),
        el('div', { class: 'count-row' }, el('div', { class: 'frac-stage' }, svg), el('div', { class: 'count-panel' }, label, counter)), result);
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — geoboard
     ------------------------------------------------------------ */
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  function segmentsCross(p1, p2, p3, p4) {
    const d1 = cross(p3, p4, p1); const d2 = cross(p3, p4, p2);
    const d3 = cross(p1, p2, p3); const d4 = cross(p1, p2, p4);
    return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
  }
  /** Remove corners that sit on a straight line, then count. Returns -1 if the shape crosses itself. */
  function countSides(pts) {
    const clean = pts.filter((p, i) => cross(pts[(i - 1 + pts.length) % pts.length], p, pts[(i + 1) % pts.length]) !== 0);
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(i - j) <= 1 || (i === 0 && j === n - 1)) continue;
        if (segmentsCross(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n])) return -1;
      }
    }
    return clean.length;
  }

  function renderGeoboard(box, done) {
    const tasks = [
      { sides: 3, text: 'Make a triangle (3 sides).' },
      { sides: 4, text: 'Make any shape with 4 sides.' },
      { sides: 5, text: 'Make a pentagon (5 sides).' },
      { sides: 6, text: 'Challenge: make a hexagon (6 sides)!' }
    ];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const t = tasks[round];
      const pts = [];
      let closed = false;
      say(`${t.text} Tap pegs to stretch the band. Tap the first peg again to close it.`);
      const G = 5;
      const pos = i => 12 + i * 19;
      const svg = S.svgEl('svg', { viewBox: '0 0 100 100', class: 'geoboard', role: 'group', 'aria-label': 'Geoboard with 25 pegs' });
      const shape = S.svgEl('polygon', { class: 'geo-shape', points: '' });
      const band = S.svgEl('polyline', { class: 'geo-band', points: '' });
      svg.append(shape, band);
      const status = el('p', { class: 'hop-count', 'aria-live': 'polite' }, 'Corners: 0');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      for (let r = 0; r < G; r++) {
        for (let c = 0; c < G; c++) {
          const p = [pos(c), pos(r)];
          const peg = S.svgEl('circle', { cx: p[0], cy: p[1], r: 4.2, class: 'geo-peg', tabindex: '0', role: 'button', 'aria-label': `Peg row ${r + 1} column ${c + 1}`, 'data-peg': `${r}-${c}` });
          const tap = () => {
            if (closed) return;
            if (pts.length >= 3 && p[0] === pts[0][0] && p[1] === pts[0][1]) { close(); return; }
            if (pts.some(q => q[0] === p[0] && q[1] === p[1])) { say('You already used that peg.'); return; }
            pts.push(p);
            peg.classList.add('is-used');
            draw();
          };
          peg.addEventListener('click', tap);
          peg.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); } });
          svg.append(peg);
        }
      }

      function draw() {
        band.setAttribute('points', pts.map(p => p.join(',')).join(' '));
        status.textContent = `Corners: ${pts.length}`;
      }

      function close() {
        const sides = countSides(pts);
        if (sides === -1) { say('Oops, the band crosses over itself! Undo and try another way.'); return; }
        closed = true;
        shape.setAttribute('points', pts.map(p => p.join(',')).join(' '));
        band.setAttribute('points', [...pts, pts[0]].map(p => p.join(',')).join(' '));
        if (sides === t.sides) {
          svg.classList.add('is-right');
          say(`${sides} sides! ${pick(PRAISE)}`);
          MA.launchConfetti(30);
          $$('button', tools).forEach(b => { b.disabled = true; });
          result.append(el('p', { class: 'round-result__text' }, `📐 ${sides} sides and ${sides} corners!`));
          nextOrDone(result, round === tasks.length - 1, 'Next shape ▶', () => { round += 1; newRound(); }, done, '🎮 Geoboard genius!');
        } else {
          say(sides < pts.length
            ? `Some pegs are in a straight line, so your shape has ${sides} sides, not ${pts.length}. Try again!`
            : `Your shape has ${sides} sides. We need ${t.sides}. Tap Clear to try again.`);
          closed = false;
          shape.setAttribute('points', '');
          draw();
        }
      }

      const tools = el('div', { class: 'stage-actions' },
        button('↩ Undo', 'btn btn--ghost', () => {
          if (closed || !pts.length) return;
          const p = pts.pop();
          const r = Math.round((p[1] - 12) / 19);
          const c = Math.round((p[0] - 12) / 19);
          svg.querySelector(`[data-peg="${r}-${c}"]`).classList.remove('is-used');
          draw();
        }),
        button('🧹 Clear', 'btn btn--ghost', () => {
          if (closed) return;
          pts.length = 0;
          $$('.geo-peg', svg).forEach(g => g.classList.remove('is-used'));
          draw();
        }),
        button('🔒 Close shape', 'btn', () => { if (pts.length >= 3) close(); else say('Tap at least 3 pegs first.'); }));

      box.append(el('p', { class: 'round-label' }, `Shape ${round + 1} of ${tasks.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, 'Sides:'), el('strong', {}, String(t.sides))),
        instruction(`👆 ${t.text}`), el('div', { class: 'frac-stage' }, svg), status, tools, result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — sort by property
     ------------------------------------------------------------ */
  function renderSort(box, done) {
    const ROUNDS = [
      { yes: '4 sides', no: 'Not 4 sides', test: n => info(n).sides === 4 && !info(n).curved, pool: ['square', 'rectangle', 'rectangle-tall', 'kite', 'triangle', 'pentagon', 'hexagon', 'circle'] },
      { yes: 'Has a curved side', no: 'Only straight sides', test: n => !!info(n).curved, pool: ['circle', 'semicircle', 'triangle', 'square', 'hexagon', 'octagon'] }
    ];
    let round = 0;
    newRound();
    function newRound() {
      box.innerHTML = '';
      const cfg = ROUNDS[round];
      say(round === 0 ? 'Count the sides. Which shapes have exactly 4?' : 'Look for curved edges!');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { bank, zones } = sortZones({
        zones: [{ id: 'yes', label: `✅ ${cfg.yes}` }, { id: 'no', label: `❌ ${cfg.no}` }],
        items: cfg.pool.map((n, i) => ({ face: S.draw2D(n, { size: 64, fill: S.COLOURS[i % S.COLOURS.length], rotate: rnd(-20, 20) }), cat: cfg.test(n) ? 'yes' : 'no', label: 'Shape', name: n })),
        hint: item => (round === 0
          ? `Count again: this shape has ${info(item.name).curved ? 'a curved side' : `${info(item.name).sides} sides`}.`
          : (info(item.name).curved ? 'Look at the edges. One is curved!' : 'Run your finger round it. All the sides are straight.')),
        onComplete: () => {
          MA.launchConfetti(30);
          say(round === 0 ? 'Squares, rectangles and kites all have 4 sides!' : pick(PRAISE));
          nextOrDone(result, round === ROUNDS.length - 1, 'Next sort ▶', () => { round += 1; newRound(); }, done, '🧩 Sorted!');
        }
      });
      box.append(el('p', { class: 'round-label' }, `Sort ${round + 1} of ${ROUNDS.length}`),
        instruction('✋ Drag each shape to a group. Or tap a shape, then a group.'), bank, zones, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const pic = (n, rotate = 0) => S.draw2D(n, { size: 110, rotate, fill: '#22B5A6' }).outerHTML;
    const statements = [
      () => ({ text: `${pic('rectangle')}<small>All shapes with 4 sides are squares.</small>`, truth: false, explain: 'No! Rectangles and kites have 4 sides too. A square needs 4 EQUAL sides.' }),
      () => ({ text: `${pic('hexagon')}<small>6 sides means 6 corners.</small>`, truth: true, explain: 'True! For straight-sided shapes, sides and corners always match.' }),
      () => ({ text: `${pic('semicircle')}<small>This shape has 1 curved side and 1 straight side.</small>`, truth: true, explain: 'True! It is a semi-circle: half of a circle.' }),
      () => ({ text: `${pic('pentagon', 36)}<small>Turning it upside down makes it a new shape.</small>`, truth: false, explain: 'Turning never changes a shape. It still has 5 sides and 5 corners.', fix: { question: 'What is it still?', options: ['pentagon', 'hexagon', 'triangle'], answer: 'pentagon' } })
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'Think like a shape scientist. True or false?' : pick(['True or false?', 'Think about the properties!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — odd one out
     ------------------------------------------------------------ */
  function renderOddOne(box, done) {
    const puzzles = shuffle([
      { shapes: ['square', 'rectangle', 'kite', 'triangle'], odd: 'triangle', reason: 'It has 3 sides. The others have 4.', wrong: ['It is the biggest.', 'It is a different colour.'] },
      { shapes: ['circle', 'semicircle', 'hexagon', 'circle'], odd: 'hexagon', reason: 'It has no curved side.', wrong: ['It has 3 corners.', 'It is round.'] },
      { shapes: ['triangle', 'triangle-right', 'triangle-thin', 'pentagon'], odd: 'pentagon', reason: 'It has 5 sides. The others have 3.', wrong: ['It has a curved side.', 'It is a triangle.'] }
    ]);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const p = puzzles[round];
      let phase = 'pick';
      say('Which one does not belong? Then tell me why!');
      const grid = el('div', { class: 'shape-cards shape-cards--four' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      shuffle(p.shapes.map((n, i) => ({ n, i }))).forEach(({ n }, k) => {
        const b = button(S.draw2D(n, { size: 70, fill: S.COLOURS[k % S.COLOURS.length], rotate: rnd(-25, 25) }), 'shape-card', () => {
          if (phase !== 'pick') return;
          if (n === p.odd) {
            phase = 'why';
            b.classList.add('is-right');
            say('Yes! Now, why is it the odd one out?');
            askWhy();
          } else {
            pulse(b, 'is-oops');
            say('That one has a partner. Look at the sides!');
          }
        }, { 'aria-label': `Shape ${k + 1}`, 'data-shape': n });
        grid.append(b);
      });
      function askWhy() {
        const group = el('div', { class: 'fix-options fix-options--wide', role: 'group', 'aria-label': 'Why?' });
        shuffle([p.reason, ...p.wrong]).forEach(text => {
          const b = button(text, 'pattern-btn', () => {
            if (text === p.reason) {
              K.$$('button', group).forEach(x => { x.disabled = true; });
              b.classList.add('is-right');
              MA.launchConfetti(30);
              say(`${p.reason} ${pick(PRAISE)}`);
              nextOrDone(result, round === puzzles.length - 1, 'Next puzzle ▶', () => { round += 1; next(); }, done, '🚀 Sharp thinking!');
            } else {
              b.classList.add('is-wrong');
              b.disabled = true;
              say('Hmm, think about sides, corners or curves.');
            }
          });
          group.append(b);
        });
        result.append(el('p', { class: 'fix-q' }, '🤔 Why?'), group);
      }
      box.append(el('p', { class: 'round-label' }, `Puzzle ${round + 1} of ${puzzles.length}`),
        instruction('👆 Tap the odd one out.'), grid, result);
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  const picture = (n, rotate = 0) => `<div class="frac-stage">${S.draw2D(n, { size: 120, rotate, fill: pick(S.COLOURS) }).outerHTML}</div>`;
  function qSides() { const n = pick(['pentagon', 'hexagon', 'octagon', 'triangle-right']); const s = info(n).sides; return { icon: '✏️', question: 'How many sides?', instruction: 'Tap each side in your head.', visual: picture(n, rnd(-20, 20)), options: optionsFor(s, [s + 1, s - 1, s + 2]), answer: s, hint: 'Almost! Start at the top and count round.', explain: `${s} sides.` }; }
  function qCorners() { const n = pick(['pentagon', 'hexagon', 'rectangle']); const c = info(n).corners; return { icon: '📍', question: 'How many corners?', instruction: 'Corners are where sides meet.', visual: picture(n), options: optionsFor(c, [c + 1, c - 1, c + 2]), answer: c, hint: 'Almost! Sides and corners match.', explain: `${c} corners.` }; }
  function qFour() { return { icon: '🟦', question: 'Which shape does NOT have 4 sides?', instruction: 'Count each one.', options: shuffle(['square', 'rectangle', 'pentagon']).map(n => ({ value: info(n).label, label: info(n).label })), answer: 'pentagon', hint: 'Almost! Penta means 5.', explain: 'A pentagon has 5 sides.' }; }
  function qCurve() { return { icon: '🌗', question: 'Which shape has a curved side AND a straight side?', instruction: 'Look for both.', options: shuffle(['semicircle', 'circle', 'square']).map(n => ({ value: info(n).label, label: info(n).label })), answer: 'semi-circle', hint: 'Almost! Half a circle has a flat edge.', explain: 'A semi-circle has 1 curved and 1 straight side.' }; }
  function qMatch() { const s = pick([5, 6, 8]); return { icon: '🔁', question: `A shape has ${s} sides. How many corners does it have?`, instruction: 'Think about the pattern.', options: optionsFor(s, [s - 1, s + 1, s * 2]), answer: s, hint: 'Almost! Sides and corners always match on straight-sided shapes.', explain: `${s} sides → ${s} corners.` }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qSides(), qCorners(), qFour(), qCurve(), qMatch()], moduleId: MODULE_ID, badgeId: 'property-pro', title: 'Property Pro' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
