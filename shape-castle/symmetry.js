/* ==============================================================
   🦋 Shape Castle → Symmetry              shape-castle/symmetry.js
   --------------------------------------------------------------
   🌱 Learn      predict, then FOLD: do both halves match?
   🎮 Play       mirror painter: copy the pattern across the mirror line
   🧩 Practise   tap every line of symmetry on a shape
   🧠 Think      true or false? (a diagonal halves a rectangle but is not a mirror line)
   🚀 Challenge  two-colour mirror pictures
   🏆 Master     five mixed questions → Symmetry Star badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const S = window.Shapes;
  if (!MA || !K || !S) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, pulse, nextOrDone, optionsFor, PRAISE } = K;

  const MODULE_ID = 'shape-castle/symmetry';

  /* Original simple pictures (100×100). sym = has a vertical mirror line. */
  const PICS = {
    butterfly: { sym: true, label: 'butterfly', svg: '<ellipse cx="32" cy="38" rx="18" ry="21" fill="#FF6B8B"/><ellipse cx="68" cy="38" rx="18" ry="21" fill="#FF6B8B"/><ellipse cx="35" cy="69" rx="13" ry="15" fill="#FFC93C"/><ellipse cx="65" cy="69" rx="13" ry="15" fill="#FFC93C"/><circle cx="32" cy="38" r="6" fill="#fff"/><circle cx="68" cy="38" r="6" fill="#fff"/><rect x="47" y="22" width="6" height="62" rx="3" fill="#2B2D42"/>' },
    house: { sym: true, label: 'house', svg: '<rect x="25" y="45" width="50" height="45" fill="#FFC93C" stroke="#2B2D42" stroke-width="2"/><polygon points="18,47 50,14 82,47" fill="#E04F4F" stroke="#2B2D42" stroke-width="2"/><rect x="43" y="64" width="14" height="26" fill="#7B61FF"/><rect x="30" y="52" width="10" height="10" fill="#9FD8F7"/><rect x="60" y="52" width="10" height="10" fill="#9FD8F7"/>' },
    houseOdd: { sym: false, label: 'house', svg: '<rect x="25" y="45" width="50" height="45" fill="#FFC93C" stroke="#2B2D42" stroke-width="2"/><polygon points="18,47 50,14 82,47" fill="#E04F4F" stroke="#2B2D42" stroke-width="2"/><rect x="29" y="64" width="14" height="26" fill="#7B61FF"/><rect x="58" y="52" width="12" height="12" fill="#9FD8F7"/><rect x="64" y="20" width="8" height="18" fill="#8A5A2B"/>' },
    heart: { sym: true, label: 'heart', svg: '<path d="M50 88 C 10 60, 8 30, 30 22 C 42 18, 50 28, 50 34 C 50 28, 58 18, 70 22 C 92 30, 90 60, 50 88 Z" fill="#FF6B8B" stroke="#2B2D42" stroke-width="2"/>' },
    letterF: { sym: false, label: 'letter F', svg: '<polygon points="30,12 74,12 74,24 42,24 42,44 64,44 64,56 42,56 42,88 30,88" fill="#22B5A6" stroke="#2B2D42" stroke-width="2"/>' },
    letterA: { sym: true, label: 'letter A', svg: '<polygon points="44,12 56,12 82,88 69,88 63,68 37,68 31,88 18,88" fill="#4D96FF" stroke="#2B2D42" stroke-width="2"/><polygon points="41,57 59,57 50,30" fill="#fff"/>' },
    flag: { sym: false, label: 'flag', svg: '<rect x="20" y="10" width="6" height="82" fill="#8A5A2B"/><polygon points="26,12 82,26 26,42" fill="#E04F4F" stroke="#2B2D42" stroke-width="2"/>' }
  };
  const picSVG = (key, size = 180, extra = '') => `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="pic-svg" role="img" aria-label="${PICS[key].label}">${PICS[key].svg}${extra}</svg>`;
  const MIRROR = '<line x1="50" y1="2" x2="50" y2="98" class="mirror-line"/>';

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Fold and check',        render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Mirror painter',        render: renderPainter },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Find the mirror lines', render: renderLines },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',        render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Rainbow mirror',        render: renderRainbow },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Symmetry Star',         render: renderMaster }
  ];

  /* ------------------------------------------------------------
     🌱 LEARN — predict, then fold
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const order = ['butterfly', 'houseOdd', 'heart', 'letterF'];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const key = order[round];
      const pic = PICS[key];
      let answered = false;
      say(round === 0 ? 'Imagine folding along the dotted line. Will both halves match exactly?' : 'Fold it in your head. Do the halves match?');
      const wrap = el('div', { class: 'fold-wrap', html: `${picSVG(key, 200, MIRROR)}<div class="fold-half">${picSVG(key, 200)}</div>` });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const group = el('div', { class: 'fix-options', role: 'group', 'aria-label': 'Will the halves match?' });
      [['✅ They match', true], ['❌ They do not match', false]].forEach(([label, value]) => {
        const b = button(label, 'tf-btn', () => {
          if (answered) return;
          answered = true;
          $$('button', group).forEach(x => { x.disabled = true; });
          const right = value === pic.sym;
          b.classList.add(right ? 'is-right' : 'is-wrong');
          wrap.classList.add('is-folded');
          setTimeout(() => {
            const fact = pic.sym
              ? `The halves match exactly. The dotted line is a line of symmetry!`
              : 'The halves do NOT match. No line of symmetry here.';
            say(`${right ? pick(PRAISE) : 'Look at the fold!'} ${fact}`);
            if (right) MA.launchConfetti(20);
            result.append(el('p', { class: 'round-result__text' }, `${pic.sym ? '🦋' : '🙅'} ${fact}`));
            nextOrDone(result, round === order.length - 1, 'Next picture ▶', () => { round += 1; next(); }, done);
          }, 1100);
        });
        group.append(b);
      });
      box.append(el('p', { class: 'round-label' }, `Picture ${round + 1} of ${order.length}`),
        instruction('👆 Predict first. Then watch it fold!'), wrap, group, result);
    }
  }

  /* ------------------------------------------------------------
     Mirror painter (used by Play and Challenge)
     ------------------------------------------------------------ */
  function painter(box, { cols, rows, count, colours, onDone, label }) {
    const half = cols / 2;
    const target = {};
    const keys = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < half; c++) keys.push(`${r}-${c}`);
    shuffle(keys).slice(0, count).forEach((k, i) => { target[k] = colours[i % colours.length]; });
    const mine = {};
    let brush = colours[0];
    let solved = false;

    const palette = colours.length > 1 ? el('div', { class: 'palette', role: 'group', 'aria-label': 'Colours' }) : null;
    if (palette) {
      colours.forEach((c, i) => {
        const b = button('', `palette__swatch${i === 0 ? ' is-selected' : ''}`, () => {
          brush = c;
          $$('.palette__swatch', palette).forEach(x => x.classList.remove('is-selected'));
          b.classList.add('is-selected');
        }, { style: `--c:${c}`, 'aria-label': `Colour ${i + 1}` });
        palette.append(b);
      });
    }

    const grid = el('div', { class: 'mirror-grid', style: `--cols:${cols}`, role: 'group', 'aria-label': label });
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (c < half) {
          const k = `${r}-${c}`;
          grid.append(el('span', { class: `mg-cell mg-cell--given${target[k] ? ' is-on' : ''}${c === half - 1 ? ' mg-edge' : ''}`, style: target[k] ? `--c:${target[k]}` : '' }));
        } else {
          const mirrorKey = `${r}-${cols - 1 - c}`;
          const cell = button('', `mg-cell${c === half ? ' mg-edge-right' : ''}`, () => {
            if (solved) return;
            const current = mine[mirrorKey];
            if (current === brush) { delete mine[mirrorKey]; cell.classList.remove('is-on'); cell.style.removeProperty('--c'); }
            else { mine[mirrorKey] = brush; cell.classList.add('is-on'); cell.style.setProperty('--c', brush); }
            check();
          }, { 'data-mirror': mirrorKey, 'aria-label': `Row ${r + 1}, square ${c - half + 1} right of the mirror` });
          grid.append(cell);
        }
      }
    }

    function check() {
      const a = Object.keys(target);
      const b = Object.keys(mine);
      if (a.length === b.length && a.every(k => mine[k] === target[k])) {
        solved = true;
        grid.classList.add('is-done');
        onDone();
      }
    }

    // test hook + teacher help: data-target lists the answer keys
    grid.dataset.target = Object.entries(target).map(([k, v]) => `${k}:${v}`).join(',');
    box.append(...[palette, grid].filter(Boolean));
  }

  /* ------------------------------------------------------------
     🎮 PLAY — mirror painter, one colour
     ------------------------------------------------------------ */
  function renderPainter(box, done) {
    const levels = [{ count: 4 }, { count: 6 }, { count: 8 }];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'The dark line is a mirror. Paint the squares on the right so they mirror the left!' : 'Bigger pattern! Count the squares from the mirror line.');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      box.append(el('p', { class: 'round-label' }, `Picture ${round + 1} of ${levels.length}`),
        instruction('👆 Tap squares on the right side. Tap again to clear one.'));
      painter(box, {
        cols: 8, rows: 6, count: levels[round].count, colours: ['#7B61FF'], label: 'Mirror grid',
        onDone: () => {
          MA.launchConfetti(30);
          say(`A perfect mirror! ${pick(PRAISE)}`);
          nextOrDone(result, round === levels.length - 1, 'Next picture ▶', () => { round += 1; next(); }, done, '🎨 Mirror master!');
        }
      });
      box.append(result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — tap all lines of symmetry
     ------------------------------------------------------------ */
  function renderLines(box, done) {
    const LINES = { V: [50, 4, 50, 96], H: [4, 50, 96, 50], D1: [8, 8, 92, 92], D2: [92, 8, 8, 92] };
    const NICE = { V: 'up and down', H: 'across', D1: 'corner to corner', D2: 'corner to corner' };
    const tasks = [
      { shape: 'rectangle', lines: ['V', 'H'] },
      { shape: 'square', lines: ['V', 'H', 'D1', 'D2'] },
      { shape: 'triangle', lines: ['V'] },
      { shape: 'kite', lines: ['V'] }
    ];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const t = tasks[round];
      const chosen = new Set();
      let solved = false;
      say(`Which lines fold the ${S.INFO_2D[t.shape].label} into two matching halves? Tap ALL of them.`);
      const svg = S.draw2D(t.shape, { size: 230, fill: '#EFEBFF' });
      svg.setAttribute('class', 'shape-svg lines-svg');
      Object.entries(LINES).forEach(([id, [x1, y1, x2, y2]]) => {
        const line = S.svgEl('line', { x1, y1, x2, y2, class: 'sym-line', tabindex: '0', role: 'button', 'aria-pressed': 'false', 'aria-label': `Line ${NICE[id]}`, 'data-line': id });
        const toggle = () => {
          if (solved) return;
          if (chosen.has(id)) chosen.delete(id); else chosen.add(id);
          line.classList.toggle('is-chosen', chosen.has(id));
          line.setAttribute('aria-pressed', String(chosen.has(id)));
          result.innerHTML = '';
        };
        line.addEventListener('click', toggle);
        line.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
        svg.append(line);
      });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const checkBtn = button('✓ Check', 'btn btn--big', () => {
        result.innerHTML = '';
        const wrong = [...chosen].filter(id => !t.lines.includes(id));
        const missing = t.lines.filter(id => !chosen.has(id));
        if (!wrong.length && !missing.length) {
          solved = true;
          checkBtn.disabled = true;
          MA.launchConfetti(30);
          say(`${t.lines.length} line${t.lines.length === 1 ? '' : 's'} of symmetry! ${pick(PRAISE)}`);
          result.append(el('p', { class: 'round-result__text' }, `🦋 A ${S.INFO_2D[t.shape].label} has ${t.lines.length} line${t.lines.length === 1 ? '' : 's'} of symmetry.`));
          nextOrDone(result, round === tasks.length - 1, 'Next shape ▶', () => { round += 1; next(); }, done);
        } else if (wrong.length) {
          wrong.forEach(id => pulse(svg.querySelector(`[data-line="${id}"]`), 'is-oops'));
          say(wrong.some(id => id.startsWith('D')) && t.shape === 'rectangle'
            ? 'Careful! Corner to corner cuts a rectangle in half, but the halves do not match when folded.'
            : 'One of those lines does not make matching halves. Fold it in your head!');
          result.append(el('p', { class: 'round-result__tip' }, '💡 A mirror line must make two halves that fit exactly on top of each other.'));
        } else {
          say(`Good! But there ${missing.length === 1 ? 'is 1 more line' : `are ${missing.length} more lines`} to find.`);
          result.append(el('p', { class: 'round-result__tip' }, `💡 ${missing.length} more to find.`));
        }
      });
      box.append(el('p', { class: 'round-label' }, `Shape ${round + 1} of ${tasks.length}`),
        instruction('👆 Tap every line of symmetry, then Check.'), el('div', { class: 'frac-stage' }, svg), checkBtn, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const rectDiag = (() => { const s = S.draw2D('rectangle', { size: 130, fill: '#EFEBFF' }); s.append(S.svgEl('line', { x1: 4, y1: 24, x2: 96, y2: 76, class: 'mirror-line' })); return s.outerHTML; })();
    const squareLines = (() => { const s = S.draw2D('square', { size: 120, fill: '#EFEBFF' }); [[50, 4, 50, 96], [4, 50, 96, 50], [8, 8, 92, 92], [92, 8, 8, 92]].forEach(([a, b, c, d]) => s.append(S.svgEl('line', { x1: a, y1: b, x2: c, y2: d, class: 'mirror-line' }))); return s.outerHTML; })();
    const statements = [
      () => ({ text: `${rectDiag}<small>This line is a line of symmetry.</small>`, truth: false, explain: 'It cuts the rectangle in half, but fold it and the halves do not match. Not a mirror line!' }),
      () => ({ text: `${squareLines}<small>A square has 4 lines of symmetry.</small>`, truth: true, explain: 'True! Up and down, across, and both corner-to-corner lines.' }),
      () => ({ text: `${picSVG('letterA', 120, MIRROR)}<small>This line is a line of symmetry.</small>`, truth: true, explain: 'True! Both sides of the A match exactly.' }),
      () => ({ text: `${picSVG('flag', 120)}<small>Every shape has a line of symmetry.</small>`, truth: false, explain: 'No! This flag has no line of symmetry. Some shapes have none.' })
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'Fold each one in your head. True or false?' : pick(['True or false?', 'Imagine the fold!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — two-colour mirror pictures
     ------------------------------------------------------------ */
  function renderRainbow(box, done) {
    const levels = [{ cols: 8, rows: 6, count: 7 }, { cols: 10, rows: 7, count: 10 }];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const lvl = levels[round];
      say('Two colours now! Pick a colour, then paint its mirror square.');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      box.append(el('p', { class: 'round-label' }, `Picture ${round + 1} of ${levels.length}`),
        instruction('👆 Pick a colour. Tap squares on the right to paint.'));
      painter(box, {
        ...lvl, colours: ['#FF6B8B', '#22B5A6'], label: 'Two-colour mirror grid',
        onDone: () => {
          MA.launchConfetti(40);
          say(`Beautiful symmetry! ${pick(PRAISE)}`);
          nextOrDone(result, round === levels.length - 1, 'Next picture ▶', () => { round += 1; next(); }, done, '🌈 Rainbow mirror complete!');
        }
      });
      box.append(result);
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  const yesNo = () => shuffle(['Yes', 'No']).map(v => ({ value: v, label: v === 'Yes' ? '✅ Yes' : '❌ No' }));
  function qFold() { const key = pick(['butterfly', 'house', 'houseOdd', 'flag', 'heart']); const ans = PICS[key].sym ? 'Yes' : 'No'; return { icon: '🦋', question: 'Is the dotted line a line of symmetry?', instruction: 'Fold it in your head.', visual: `<div class="frac-stage">${picSVG(key, 140, MIRROR)}</div>`, options: yesNo(), answer: ans, hint: 'Almost! Do both halves match exactly?', explain: PICS[key].sym ? 'Yes, the halves match.' : 'No, the halves are different.' }; }
  function qRect() { return { icon: '▭', question: 'How many lines of symmetry does a rectangle have?', instruction: 'Not corner to corner!', options: optionsFor(2, [4, 1, 0]), answer: 2, hint: 'Almost! Try up-and-down and across.', explain: 'A rectangle has 2 lines of symmetry.' }; }
  function qSquare() { return { icon: '🟪', question: 'How many lines of symmetry does a square have?', instruction: 'Remember the corners!', options: optionsFor(4, [2, 1, 3]), answer: 4, hint: 'Almost! A square folds 4 ways.', explain: 'A square has 4 lines of symmetry.' }; }
  function qLetter() { return { icon: '🔤', question: 'Which letter has an up-and-down line of symmetry?', instruction: 'Picture a mirror down the middle.', options: shuffle(['A', 'F', 'R']).map(v => ({ value: v, label: v })), answer: 'A', hint: 'Almost! Which letter looks the same on both sides?', explain: 'A has a line of symmetry down the middle.' }; }
  function qMirror() { const n = rnd(1, 3); return { icon: '🪞', question: `A square is ${n} square${n === 1 ? '' : 's'} to the LEFT of the mirror line. Where is its mirror square?`, instruction: 'Same distance, other side.', options: shuffle([`${n} to the right`, `${n + 1} to the right`, `${n} to the left`]).map(v => ({ value: v, label: v })), answer: `${n} to the right`, hint: 'Almost! A mirror keeps the same distance from the line.', explain: `${n} to the left mirrors to ${n} to the right.` }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qFold(), qRect(), qSquare(), qLetter(), qMirror()], moduleId: MODULE_ID, badgeId: 'symmetry-star', title: 'Symmetry Star' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
