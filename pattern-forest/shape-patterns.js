/* ==============================================================
   🔷 Pattern Forest → Shape Patterns     pattern-forest/shape-patterns.js
   --------------------------------------------------------------
   🌱 Learn      patterns that change shape, colour, size or turn
   🎮 Play       growing towers: build the next tower
   🧩 Practise   drag shapes into the gaps
   🧠 Think      true or false? about what changes
   🚀 Challenge  two rules at once (shape AND colour)
   🏆 Master     five mixed questions → Shape Pattern Pro badge
   Uses the shape drawings from ../shape-castle/shapes.js
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const S = window.Shapes;
  if (!MA || !K || !S) return;
  const { $, $$, rnd, pick, shuffle, el, button, instruction, say, pulse, makeDraggable, nextOrDone, optionsFor, PRAISE } = K;

  const MODULE_ID = 'pattern-forest/shape-patterns';
  const COL = { red: '#E04F4F', blue: '#4D96FF', yellow: '#FFC93C', green: '#3BB273', purple: '#7B61FF' };
  const SHAPE_WORD = { circle: 'circle', square: 'square', triangle: 'triangle', 'triangle-right': 'triangle', hexagon: 'hexagon', rectangle: 'rectangle', pentagon: 'pentagon' };

  /* An item is { s: shape, c: colour name, z: 'big' | 'small', r: turn in degrees } */
  const item = (s, c, z = 'big', r = 0) => ({ s, c, z, r });
  const key = it => `${it.s}|${it.c}|${it.z}|${it.r}`;
  const describe = it => `${it.z === 'small' ? 'small ' : ''}${it.c} ${SHAPE_WORD[it.s]}${it.r ? `, turned ${it.r} degrees` : ''}`;
  const draw = (it, box = 64) => {
    const wrap = el('span', { class: 'sp-item', style: `--box:${box}px`, role: 'img', 'aria-label': describe(it) });
    wrap.append(S.draw2D(it.s, { size: it.z === 'small' ? Math.round(box * 0.55) : box, fill: COL[it.c], rotate: it.r }));
    return wrap;
  };
  const drawHTML = (it, box = 56) => draw(it, box).outerHTML;
  const repeatTo = (unit, len) => Array.from({ length: len }, (_, i) => unit[i % unit.length]);
  const seqRow = (items, box = 56, gapAt = -1) => el('div', { class: 'pat-row' }, items.map((it, i) => (i === gapAt ? el('span', { class: 'sp-item sp-item--ask', style: `--box:${box}px` }, '?') : draw(it, box))));

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'What changes?',        render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Growing towers',       render: renderTowers },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Shape gaps',           render: renderGaps },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',       render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Two rules at once',    render: renderTwoRules },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Shape Pattern Pro',    render: renderMaster }
  ];

  /** Pick-the-next-item question used by Learn and Challenge. */
  function pickNext(box, { seq, answer, distractors, prompt, onRight, wrongHint }) {
    let solved = false;
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    const group = el('div', { class: 'sp-options', role: 'group', 'aria-label': 'Which comes next?' });
    shuffle([answer, ...distractors]).forEach(opt => {
      const b = button(draw(opt, 64), 'shape-card sp-option', () => {
        if (solved) return;
        if (key(opt) === key(answer)) {
          solved = true;
          b.classList.add('is-right');
          const gap = $('.sp-item--ask', box);
          if (gap) gap.replaceWith(draw(answer, 56));
          MA.launchConfetti(20);
          onRight(result);
        } else {
          b.classList.add('is-wrong');
          b.disabled = true;
          say(wrongHint(opt));
        }
      }, { 'aria-label': describe(opt), 'data-key': key(opt), 'data-right': key(opt) === key(answer) ? 'yes' : 'no' });
      group.append(b);
    });
    box.append(seqRow([...seq, answer], 56, seq.length), instruction(prompt), group, result);
    return result;
  }

  /* ------------------------------------------------------------
     🌱 LEARN — one thing changes
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const tasks = [
      { what: 'shape', unit: [item('circle', 'red'), item('square', 'red')], decoy: item('triangle', 'red') },
      { what: 'colour', unit: [item('triangle', 'red'), item('triangle', 'yellow'), item('triangle', 'blue')], decoy: item('triangle', 'green') },
      { what: 'size', unit: [item('square', 'blue', 'big'), item('square', 'blue', 'small'), item('square', 'blue', 'small')], decoy: item('circle', 'blue') },
      { what: 'turn', unit: [0, 90, 180, 270].map(r => item('triangle-right', 'green', 'big', r)), decoy: item('triangle-right', 'red') }
    ];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const t = tasks[round];
      const len = t.unit.length * 2;
      const seq = repeatTo(t.unit, len);
      const answer = t.unit[len % t.unit.length];
      const others = t.unit.filter(u => key(u) !== key(answer));
      const distractors = [others[0], t.decoy].filter(Boolean).slice(0, 2);
      say({ shape: 'Look! The SHAPE changes. What comes next?', colour: 'This time the COLOUR changes.', size: 'Now the SIZE changes. Big or small?', turn: 'Tricky! The shape TURNS each time.' }[t.what]);
      box.append(el('p', { class: 'round-label' }, `Pattern ${round + 1} of ${tasks.length} · the ${t.what} changes`));
      pickNext(box, {
        seq, answer, distractors, prompt: '👆 Which comes next?',
        wrongHint: () => (t.what === 'turn' ? 'Watch the corner. It turns a quarter turn each time ↻.' : `Look at the ${t.what}. What repeats?`),
        onRight: result => {
          say(`Yes! The ${t.what} makes the pattern.`);
          nextOrDone(result, round === tasks.length - 1, 'Next pattern ▶', () => { round += 1; next(); }, done);
        }
      });
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — growing towers
     ------------------------------------------------------------ */
  function renderTowers(box, done) {
    const patterns = [[1, 2, 3], [2, 4, 6], [1, 3, 5]];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const p = patterns[round];
      const step = p[1] - p[0];
      const want = p[2] + step;
      let height = 0;
      let solved = false;
      say('These towers grow! How many blocks will the next tower need? Build it!');
      const tower = n => el('div', { class: 'tower' }, Array.from({ length: n }, () => el('span', { class: 'tower__block' })), el('span', { class: 'tower__count' }, String(n)));
      const mine = el('div', { class: 'tower tower--mine' });
      const draw = () => {
        mine.innerHTML = '';
        for (let i = 0; i < height; i++) mine.append(el('span', { class: 'tower__block tower__block--mine' }));
        mine.append(el('span', { class: 'tower__count' }, height ? String(height) : '?'));
      };
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const change = d => { if (!solved) { height = Math.max(0, Math.min(12, height + d)); draw(); result.innerHTML = ''; } };
      const check = button('✓ Check', 'btn btn--big', () => {
        result.innerHTML = '';
        if (height === want) {
          solved = true;
          check.disabled = true;
          MA.launchConfetti(30);
          say(`Yes! Each tower grows by ${step}. ${p[2]} + ${step} = ${want}.`);
          result.append(el('p', { class: 'round-result__text' }, `🏗️ ${[...p, want].join(', ')}: +${step} each time`));
          nextOrDone(result, round === patterns.length - 1, 'Next towers ▶', () => { round += 1; next(); }, done, '🎮 Master builder!');
        } else {
          say(height > want ? 'Too tall! How many more blocks does each tower get?' : 'Not tall enough yet. Look at how much each tower grows.');
        }
      });
      draw();
      box.append(el('p', { class: 'round-label' }, `Towers ${round + 1} of ${patterns.length}`),
        el('div', { class: 'towers', role: 'img', 'aria-label': `Towers of ${p.join(', ')} blocks, then yours` }, ...p.map(tower), mine),
        instruction('👆 Add blocks to build the next tower.'),
        el('div', { class: 'pv-controls' },
          button('−', 'pv-btn pv-btn--minus', () => change(-1), { 'aria-label': 'Take a block away' }),
          button('+ block', 'pv-btn pv-btn--ten', () => change(1), { 'aria-label': 'Add a block' })),
        check, result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — drag shapes into the gaps
     ------------------------------------------------------------ */
  function renderGaps(box, done) {
    const units = [
      [item('circle', 'blue'), item('square', 'yellow')],
      [item('triangle', 'red'), item('triangle', 'red'), item('hexagon', 'purple')],
      [item('square', 'green', 'big'), item('square', 'green', 'small'), item('circle', 'red', 'small')]
    ];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const unit = units[round];
      const seq = repeatTo(unit, 8);
      const gaps = shuffle(seq.map((_, i) => i).filter(i => i >= unit.length)).slice(0, 2);
      const spare = item('pentagon', 'blue');
      let selected = null;
      let filled = 0;
      say('Two shapes are missing. Drag them into the gaps!');
      const slots = el('ol', { class: 'slots pat-slots', 'aria-label': 'Shape pattern with gaps' });
      seq.forEach((it, i) => {
        const gap = gaps.includes(i);
        const slot = button(gap ? '' : draw(it, 44), `slot pat-slot${gap ? '' : ' is-given'}`, () => {
          if (selected) tryPlace(selected, slot); else say('Pick a shape first.');
        }, { 'data-value': key(it), 'aria-label': gap ? `Gap ${i + 1}` : describe(it), disabled: !gap });
        slots.append(el('li', {}, slot));
      });
      const bank = el('div', { class: 'tile-bank', role: 'group', 'aria-label': 'Shapes' });
      shuffle([...gaps.map(i => seq[i]), spare]).forEach(it => {
        const tile = button(draw(it, 52), 'tile pat-tile', null, { 'data-value': key(it), 'aria-label': describe(it) });
        tile._item = it;
        makeDraggable(tile, {
          onDrop: slot => tryPlace(tile, slot),
          onTap: () => {
            if (tile.disabled) return;
            if (selected) selected.classList.remove('is-selected');
            if (selected === tile) { selected = null; return; }
            selected = tile;
            tile.classList.add('is-selected');
          }
        });
        bank.append(tile);
      });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      function tryPlace(tile, slot) {
        if (selected) selected.classList.remove('is-selected');
        selected = null;
        if (!slot || slot.disabled || !slots.contains(slot)) return;
        if (tile.dataset.value === slot.dataset.value) {
          slot.textContent = '';
          slot.append(draw(tile._item, 44));
          slot.disabled = true;
          slot.classList.add('is-filled');
          tile.remove();
          filled += 1;
          if (filled === gaps.length) {
            const left = $('.tile', bank);
            if (left) { left.classList.add('is-spare'); left.disabled = true; }
            MA.launchConfetti(25);
            say(pick(PRAISE));
            nextOrDone(result, round === units.length - 1, 'Next pattern ▶', () => { round += 1; next(); }, done, '🧩 All gaps filled!');
          } else say(pick(PRAISE));
        } else {
          pulse(slot, 'is-bad');
          pulse(tile, 'is-bounce');
          say('Look at the shape, colour AND size of its neighbours.');
        }
      }
      box.append(el('p', { class: 'round-label' }, `Pattern ${round + 1} of ${units.length}`),
        instruction('✋ Drag shapes into the gaps. Or tap a shape, then a gap.'), slots, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const html = items => `<div class="pat-row">${items.map(it => (it === '?' ? '<span class="sp-item sp-item--ask" style="--box:48px">?</span>' : drawHTML(it, 48))).join('')}</div>`;
    const towers = ns => `<div class="towers towers--mini">${ns.map(n => `<div class="tower">${'<span class="tower__block"></span>'.repeat(n)}<span class="tower__count">${n}</span></div>`).join('')}</div>`;
    const statements = [
      () => ({ text: `${html([item('circle', 'red'), item('square', 'red'), item('circle', 'red'), item('square', 'red'), '?'])}<small>Next is a circle.</small>`, truth: true, explain: 'True! Circle, square, circle, square… circle!' }),
      () => ({ text: `${towers([2, 4, 6])}<small>The next tower has 7 blocks.</small>`, truth: false, explain: 'The towers grow by 2 each time: 2, 4, 6, 8.', fix: { question: 'How many blocks?', options: [8, 7, 10], answer: 8 } }),
      () => ({ text: `${html([item('square', 'red'), item('square', 'blue'), item('square', 'red'), item('square', 'blue')])}<small>This pattern changes shape.</small>`, truth: false, explain: 'The shape stays the same. The COLOUR changes!', fix: { question: 'What changes?', options: ['colour', 'shape', 'size'], answer: 'colour' } }),
      () => ({ text: `${html([item('circle', 'blue', 'big'), item('circle', 'blue', 'small'), item('circle', 'blue', 'big'), item('circle', 'blue', 'small')])}<small>This pattern changes size.</small>`, truth: true, explain: 'True! Big, small, big, small.' })
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'Look closely. True or false?' : pick(['True or false?', 'What really changes?']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — two rules at once
     ------------------------------------------------------------ */
  function renderTwoRules(box, done) {
    const tasks = [
      { shapes: ['circle', 'square', 'triangle'], colours: ['red', 'blue'], len: 6 },
      { shapes: ['hexagon', 'circle'], colours: ['yellow', 'green', 'purple'], len: 6 },
      { shapes: ['triangle-right'], colours: ['red', 'blue'], turns: [0, 90, 180, 270], len: 5 }
    ];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const t = tasks[round];
      const at = i => item(t.shapes[i % t.shapes.length], t.colours[i % t.colours.length], 'big', t.turns ? t.turns[i % t.turns.length] : 0);
      const seq = Array.from({ length: t.len }, (_, i) => at(i));
      const answer = at(t.len);
      const altColour = t.colours.find(c => c !== answer.c);
      const altShape = t.shapes.find(s => s !== answer.s);
      const distractors = [
        item(answer.s, altColour, 'big', answer.r),
        altShape ? item(altShape, answer.c) : item(answer.s, answer.c, 'big', (answer.r + 180) % 360)
      ];
      say(t.turns ? 'The shape turns AND the colour changes!' : 'Two rules! The shape follows one pattern, the colour follows another.');
      box.append(el('p', { class: 'round-label' }, `Puzzle ${round + 1} of ${tasks.length}`));
      pickNext(box, {
        seq, answer, distractors, prompt: '👆 Check the shape AND the colour. What comes next?',
        wrongHint: opt => (opt.c !== answer.c ? 'Look at the colours on their own. Which colour is next?' : 'Now look at the shapes on their own. Which shape is next?'),
        onRight: result => {
          say(`Brilliant! Both rules worked. ${pick(PRAISE)}`);
          nextOrDone(result, round === tasks.length - 1, 'Next puzzle ▶', () => { round += 1; next(); }, done, '🚀 Double-rule detective!');
        }
      });
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  const optOf = it => ({ value: key(it), label: describe(it), html: drawHTML(it, 60) });
  const rowHTML = items => `<div class="pat-row">${items.map(it => (it === '?' ? '<span class="sp-item sp-item--ask" style="--box:48px">?</span>' : drawHTML(it, 48))).join('')}</div>`;
  function qShape() { const unit = [item('square', 'purple'), item('circle', 'purple'), item('circle', 'purple')]; const seq = repeatTo(unit, 5); const ans = unit[5 % 3]; return { icon: '🔷', question: 'What comes next?', instruction: 'Say the shapes.', visual: rowHTML([...seq, '?']), options: shuffle([optOf(ans), optOf(unit[0]), optOf(item('triangle', 'purple'))]), answer: key(ans), hint: 'Almost! Square, circle, circle…', explain: 'Square, circle, circle repeats.' }; }
  function qWhat() { const c = pick([['red', 'blue'], ['yellow', 'green']]); const seq = repeatTo([item('hexagon', c[0]), item('hexagon', c[1])], 4); return { icon: '🎨', question: 'What changes in this pattern?', instruction: 'Look carefully.', visual: rowHTML(seq), options: shuffle(['colour', 'shape', 'size']).map(v => ({ value: v, label: v })), answer: 'colour', hint: 'Almost! Are the shapes the same?', explain: 'The colour changes. The shape stays the same.' }; }
  function qTower() { const s = pick([2, 3]); const ns = [s, s * 2, s * 3]; return { icon: '🏗️', question: `Towers have ${ns.join(', ')} blocks. How many next?`, instruction: 'How much does each one grow?', options: optionsFor(s * 4, [s * 3 + 1, s * 4 + 1, s * 5]), answer: s * 4, hint: `Almost! Each tower grows by ${s}.`, explain: `${s * 3} + ${s} = ${s * 4}` }; }
  function qTwo() { const at = i => item(['circle', 'triangle'][i % 2], ['red', 'yellow', 'blue'][i % 3]); const seq = Array.from({ length: 5 }, (_, i) => at(i)); const ans = at(5); return { icon: '🧠', question: 'Shape AND colour: what comes next?', instruction: 'Two rules!', visual: rowHTML([...seq, '?']), options: shuffle([optOf(ans), optOf(item(ans.s, 'red')), optOf(item(ans.s === 'circle' ? 'triangle' : 'circle', ans.c))]), answer: key(ans), hint: 'Almost! Check the shapes, then the colours.', explain: `Next is a ${describe(ans)}.` }; }
  function qTurn() { const unit = [0, 90, 180, 270].map(r => item('triangle-right', 'blue', 'big', r)); const seq = unit.slice(0, 3); const ans = unit[3]; return { icon: '↻', question: 'The shape turns. What comes next?', instruction: 'A quarter turn each time.', visual: rowHTML([...seq, '?']), options: shuffle([optOf(ans), optOf(unit[1]), optOf(unit[0])]), answer: key(ans), hint: 'Almost! Follow the corner as it turns ↻.', explain: 'It keeps turning a quarter turn clockwise.' }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qShape(), qWhat(), qTower(), qTwo(), qTurn()], moduleId: MODULE_ID, badgeId: 'shape-pattern-pro', title: 'Shape Pattern Pro' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
