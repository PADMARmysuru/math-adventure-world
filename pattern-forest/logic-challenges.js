/* ==============================================================
   🧩 Pattern Forest → Logic Challenges   pattern-forest/logic-challenges.js
   --------------------------------------------------------------
   🌱 Learn      clue puzzles: who lives in which house?
   🎮 Play       picture sudoku (4 × 4)
   🧩 Practise   balance puzzles: 🍎 + 🍎 = 10, so 🍎 = ?
   🧠 Think      always, sometimes or never?
   🚀 Challenge  number-path puzzles: follow the counting trail
   🏆 Master     five mixed questions → Logic Legend badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  if (!MA || !K) return;
  const { $, $$, rnd, pick, shuffle, el, button, instruction, say, pulse, makeDraggable, nextOrDone, optionsFor, PRAISE } = K;

  const MODULE_ID = 'pattern-forest/logic-challenges';

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Clue houses',          render: renderClues },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Picture sudoku',       render: renderSudoku },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Balance puzzles',      render: renderBalance },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'Always, sometimes, never', render: renderASN },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Number trails',        render: renderTrails },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Logic Legend',         render: renderMaster }
  ];

  /* ------------------------------------------------------------
     🌱 LEARN — clue houses
     ------------------------------------------------------------ */
  const PUZZLES = [
    { houses: ['🟥 Red', '🟦 Blue', '🟩 Green'], animals: ['🐶', '🐱', '🐰'],
      clues: [{ text: '🐱 lives in the Blue house.', test: s => s['🐱'] === 1 }, { text: '🐶 does NOT live in the Red house.', test: s => s['🐶'] !== 0 }],
      answer: { '🐱': 1, '🐶': 2, '🐰': 0 } },
    { houses: ['⬅️ Left', '⏺️ Middle', '➡️ Right'], animals: ['🦊', '🐼', '🐸'],
      clues: [{ text: '🐼 lives in the middle.', test: s => s['🐼'] === 1 }, { text: '🐸 does NOT live on the left.', test: s => s['🐸'] !== 0 }],
      answer: { '🐼': 1, '🐸': 2, '🦊': 0 } },
    { houses: ['⬅️ Left', '⏺️ Middle', '➡️ Right'], animals: ['🐵', '🐯', '🐘'],
      clues: [{ text: '🐯 lives on the right.', test: s => s['🐯'] === 2 }, { text: '🐘 does NOT live in the middle.', test: s => s['🐘'] !== 1 }],
      answer: { '🐯': 2, '🐘': 0, '🐵': 1 } }
  ];

  function renderClues(box, done) {
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const p = PUZZLES[round];
      let selected = null;
      say(round === 0 ? 'Read the clues like a detective. Put each animal in the right house!' : 'New clues! Use one clue at a time.');
      const clueList = el('ul', { class: 'clue-list' }, p.clues.map(c => el('li', {}, `🔎 ${c.text}`)));
      const bank = el('div', { class: 'tile-bank', role: 'group', 'aria-label': 'Animals' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const homes = p.houses.map((h, i) => {
        const house = el('div', { class: 'slot clue-house', role: 'button', tabindex: '0', 'data-house': i, 'aria-label': `${h} house` },
          el('span', { class: 'clue-house__roof', 'aria-hidden': 'true' }, '🏠'), el('p', { class: 'clue-house__label' }, h), el('div', { class: 'clue-house__spot' }));
        const activate = () => { if (selected) place(selected, house); else say('Pick an animal first.'); };
        house.addEventListener('click', e => { if (!e.target.closest('.clue-animal')) activate(); });
        house.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
        return house;
      });
      p.animals.forEach(a => {
        const tile = button(a, 'tile clue-animal', null, { 'data-animal': a, 'aria-label': `Animal ${a}` });
        makeDraggable(tile, {
          onDrop: house => place(tile, house && homes.includes(house) ? house : null),
          onTap: () => {
            const home = tile.closest('.clue-house');
            if (selected && selected !== tile && home) { place(selected, home); return; }   // swap into this house
            if (selected) selected.classList.remove('is-selected');
            if (selected === tile) { selected = null; return; }
            selected = tile;
            tile.classList.add('is-selected');
          }
        });
        bank.append(tile);
      });
      function place(tile, house) {
        if (selected) selected.classList.remove('is-selected');
        selected = null;
        if (!house) return;
        const spot = $('.clue-house__spot', house);
        const occupant = $('.clue-animal', spot);
        if (occupant && occupant !== tile) {                       // one animal per house: swap places
          const from = tile.closest('.clue-house__spot');
          (from || bank).append(occupant);
        }
        spot.append(tile);
        result.innerHTML = '';
      }
      const check = button('✓ Check', 'btn btn--big', () => {
        result.innerHTML = '';
        const where = {};
        homes.forEach((h, i) => { const a = $('.clue-animal', h); if (a) where[a.dataset.animal] = i; });
        if (Object.keys(where).length < p.animals.length) { say('Every animal needs a house first!'); return; }
        const broken = p.clues.find(c => !c.test(where));
        if (broken) {
          say(`Check this clue: ${broken.text}`);
          result.append(el('p', { class: 'round-result__tip' }, `💡 This clue is not true yet: ${broken.text}`));
          return;
        }
        check.disabled = true;
        MA.launchConfetti(30);
        say(`Case closed! Every clue is true. ${pick(PRAISE)}`);
        result.append(el('p', { class: 'round-result__text' }, '🕵️ All clues are true!'));
        nextOrDone(result, round === PUZZLES.length - 1, 'Next case ▶', () => { round += 1; next(); }, done);
      });
      box.append(el('p', { class: 'round-label' }, `Case ${round + 1} of ${PUZZLES.length}`), clueList,
        instruction('✋ Drag each animal into a house. Or tap an animal, then a house.'),
        bank, el('div', { class: 'clue-houses' }, homes), check, result);
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — picture sudoku 4 × 4
     ------------------------------------------------------------ */
  function makeSudoku() {
    const base = [[0, 1, 2, 3], [2, 3, 0, 1], [1, 0, 3, 2], [3, 2, 1, 0]];
    const sym = shuffle([0, 1, 2, 3]);
    const bandSwap = Math.random() < 0.5;
    const rows = bandSwap ? [1, 0, 3, 2] : [0, 1, 2, 3];
    const cols = Math.random() < 0.5 ? [1, 0, 2, 3] : [0, 1, 3, 2];
    return rows.map(r => cols.map(c => sym[base[r][c]]));
  }

  function renderSudoku(box, done) {
    const FRUIT = ['🍎', '🍌', '🍇', '🍊'];
    const blanksPerRound = [5, 8];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const grid = makeSudoku();
      const blanks = new Set(shuffle([...Array(16).keys()]).slice(0, blanksPerRound[round]));
      let brush = null;
      let left = blanks.size;
      say(round === 0
        ? 'Every row, every column and every small square needs one of each fruit. Pick a fruit, then tap an empty box!'
        : 'More empty boxes this time. Look for a row with only one gap!');
      const palette = el('div', { class: 'palette', role: 'group', 'aria-label': 'Fruits' });
      FRUIT.forEach((f, i) => {
        const b = button(f, 'fruit-btn', () => {
          brush = i;
          $$('.fruit-btn', palette).forEach(x => x.classList.remove('is-selected'));
          b.classList.add('is-selected');
        }, { 'aria-label': `Use ${f}`, 'data-fruit': i });
        palette.append(b);
      });
      const board = el('div', { class: 'sudoku', role: 'group', 'aria-label': 'Picture sudoku' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const value = (r, c) => grid[r][c];
      for (let i = 0; i < 16; i++) {
        const r = Math.floor(i / 4);
        const c = i % 4;
        const blank = blanks.has(i);
        const cell = button(blank ? '' : FRUIT[value(r, c)], `sudoku__cell${blank ? '' : ' is-given'}${c === 1 ? ' edge-r' : ''}${r === 1 ? ' edge-b' : ''}`, () => {
          if (!blank || cell.classList.contains('is-filled')) return;
          if (brush === null) { say('Pick a fruit first.'); return; }
          if (brush === value(r, c)) {
            cell.textContent = FRUIT[brush];
            cell.classList.add('is-filled');
            cell.setAttribute('aria-label', `${FRUIT[brush]}, correct`);
            left -= 1;
            if (!left) {
              MA.launchConfetti(40);
              say(`Sudoku solved! ${pick(PRAISE)}`);
              nextOrDone(result, round === blanksPerRound.length - 1, 'Bigger puzzle ▶', () => { round += 1; next(); }, done, '🎮 Sudoku star!');
            } else say(pick(PRAISE));
          } else {
            pulse(cell, 'is-oops');
            const inRow = grid[r].includes(brush) && [...Array(4).keys()].some(cc => cc !== c && grid[r][cc] === brush && !blanks.has(r * 4 + cc));
            const inCol = [...Array(4).keys()].some(rr => rr !== r && grid[rr][c] === brush && !blanks.has(rr * 4 + c));
            say(inRow ? `There is already a ${FRUIT[brush]} in this row!` : inCol ? `There is already a ${FRUIT[brush]} in this column!` : 'Not here. Check the small square too!');
          }
        }, { 'aria-label': blank ? `Empty box, row ${r + 1}, column ${c + 1}` : `${FRUIT[value(r, c)]}`, 'data-answer': value(r, c), 'data-blank': blank ? 'yes' : 'no' });
        board.append(cell);
      }
      box.append(el('p', { class: 'round-label' }, `Puzzle ${round + 1} of ${blanksPerRound.length}`),
        instruction('👆 Pick a fruit, then tap where it goes.'), palette, board, result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — balance puzzles
     ------------------------------------------------------------ */
  function renderBalance(box, done) {
    const makers = [
      () => { const a = rnd(2, 9); return { lines: [`🍎 + 🍎 = ${a * 2}`], ask: '🍎', answer: a, hint: 'Two apples are the same. Half of it!', explain: `${a} + ${a} = ${a * 2}` }; },
      () => { const a = rnd(2, 5); return { lines: [`🍌 + 🍌 + 🍌 = ${a * 3}`], ask: '🍌', answer: a, hint: 'Three bananas, all the same. Try counting in that number.', explain: `${a} + ${a} + ${a} = ${a * 3}` }; },
      () => { const a = rnd(2, 6); const b = rnd(3, 9); return { lines: [`🍎 = ${a}`, `🍎 + 🍇 = ${a + b}`], ask: '🍇', answer: b, hint: `You know 🍎 is ${a}. What adds to it?`, explain: `${a} + ${b} = ${a + b}` }; },
      () => { const g = rnd(2, 5); return { lines: [`🍇 + 🍇 = 🍊`, `🍊 = ${g * 2}`], ask: '🍇', answer: g, hint: 'Two grapes make an orange. Share the orange into 2.', explain: `🍇 = ${g} because ${g} + ${g} = ${g * 2}` }; }
    ];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const q = makers[round]();
      let solved = false;
      say(round === 0 ? 'Each fruit is worth a number. Same fruit, same number! What is it worth?' : 'Use what you know to find what you don’t!');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const group = el('div', { class: 'fix-options', role: 'group', 'aria-label': `What is ${q.ask} worth?` });
      optionsFor(q.answer, [q.answer + 1, q.answer * 2, q.answer - 1]).forEach(opt => {
        const b = button(String(opt.value), 'fix-btn', () => {
          if (solved) return;
          if (opt.value === q.answer) {
            solved = true;
            b.classList.add('is-right');
            MA.launchConfetti(25);
            say(`${q.ask} = ${q.answer}! ${q.explain}`);
            result.append(el('p', { class: 'round-result__text' }, `⚖️ ${q.ask} = ${q.answer}`));
            nextOrDone(result, round === makers.length - 1, 'Next puzzle ▶', () => { round += 1; next(); }, done, '🧩 Balance boss!');
          } else {
            b.classList.add('is-wrong');
            b.disabled = true;
            say(q.hint);
          }
        });
        group.append(b);
      });
      box.append(el('p', { class: 'round-label' }, `Puzzle ${round + 1} of ${makers.length}`),
        el('div', { class: 'equations' }, q.lines.map(l => el('p', { class: 'equation' }, l))),
        el('p', { class: 'fix-q' }, `${q.ask} = ?`), group, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK — always, sometimes or never?
     ------------------------------------------------------------ */
  function renderASN(box, done) {
    const statements = shuffle([
      { text: 'An even number + 2 is even.', answer: 'Always', explain: 'Always! 4 + 2 = 6, 10 + 2 = 12… evens stay even.' },
      { text: 'A shape with 4 sides is a square.', answer: 'Sometimes', explain: 'Sometimes! It could be a rectangle or a kite instead.' },
      { text: 'Adding 10 makes a number smaller.', answer: 'Never', explain: 'Never! Adding always makes it bigger.' },
      { text: 'A number ending in 5 is odd.', answer: 'Always', explain: 'Always! 5, 15, 25… all odd.' }
    ]);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const s = statements[round];
      let solved = false;
      say('Is it ALWAYS true, SOMETIMES true, or NEVER true? Try some examples!');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const group = el('div', { class: 'fix-options', role: 'group', 'aria-label': 'Always, sometimes or never?' });
      [['Always', '✅'], ['Sometimes', '🤔'], ['Never', '❌']].forEach(([word, icon]) => {
        const b = button(`${icon} ${word}`, 'tf-btn', () => {
          if (solved) return;
          if (word === s.answer) {
            solved = true;
            b.classList.add('is-right');
            MA.launchConfetti(25);
            say(s.explain);
            result.append(el('p', { class: 'round-result__text' }, `🌟 ${s.explain}`));
            nextOrDone(result, round === statements.length - 1, 'Next ▶', () => { round += 1; next(); }, done);
          } else {
            b.classList.add('is-wrong');
            b.disabled = true;
            say('Test it! Try a few examples and see what happens.');
          }
        }, { 'data-word': word });
        group.append(b);
      });
      box.append(el('p', { class: 'round-label' }, `Statement ${round + 1} of ${statements.length}`),
        el('p', { class: 'tf-statement' }, s.text), group, result);
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — number trails
     ------------------------------------------------------------ */
  function walk(len) {
    for (let tries = 0; tries < 200; tries++) {
      const path = [[0, 0]];
      while (path.length < len) {
        const [r, c] = path[path.length - 1];
        const options = [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]
          .filter(([a, b]) => a >= 0 && a < 4 && b >= 0 && b < 4 && !path.some(p => p[0] === a && p[1] === b));
        if (!options.length) break;
        path.push(pick(options));
      }
      if (path.length === len) return path;
    }
    return [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [1, 2], [1, 1], [1, 0]];
  }

  function renderTrails(box, done) {
    const tasks = [{ start: 2, step: 2 }, { start: 5, step: 5 }, { start: 10, step: 10 }];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const t = tasks[round];
      const path = walk(8);
      const values = Array(16).fill(null);
      path.forEach(([r, c], i) => { values[r * 4 + c] = t.start + t.step * i; });
      const trail = new Set(values.filter(v => v !== null));
      for (let i = 0; i < 16; i++) {
        if (values[i] === null) {
          let v;
          do { v = t.start + t.step * rnd(0, 9) + pick([1, -1, 3]); } while (v <= 0 || trail.has(v));
          values[i] = v;
        }
      }
      let at = 0;
      say(`Follow the trail! Start at ${t.start} and count in ${t.step}s. Each step goes up, down, left or right.`);
      const grid = el('div', { class: 'trail-grid', role: 'group', 'aria-label': 'Number trail' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const progress = el('p', { class: 'hop-count', 'aria-live': 'polite' }, `Trail: 1 of ${path.length}`);
      values.forEach((v, i) => {
        const r = Math.floor(i / 4);
        const c = i % 4;
        const isStart = r === 0 && c === 0;
        const cell = button(String(v), `trail-cell${isStart ? ' is-on' : ''}`, () => {
          if (at >= path.length - 1 || cell.classList.contains('is-on')) return;
          const [pr, pc] = path[at];
          const want = t.start + t.step * (at + 1);
          const nextTo = Math.abs(pr - r) + Math.abs(pc - c) === 1;
          if (v === want && nextTo) {
            at += 1;
            cell.classList.add('is-on');
            progress.textContent = `Trail: ${at + 1} of ${path.length}`;
            if (at === path.length - 1) {
              MA.launchConfetti(40);
              say(`You followed the whole trail! ${pick(PRAISE)}`);
              nextOrDone(result, round === tasks.length - 1, 'Next trail ▶', () => { round += 1; next(); }, done, '🚀 Trail blazer!');
            } else say(pick(PRAISE));
          } else {
            pulse(cell, 'is-oops');
            say(v === want ? 'Right number, but it must be next to your last square!' : `Count on ${t.step} from ${want - t.step}. What comes next?`);
          }
        }, { 'data-rc': `${r}-${c}`, 'aria-label': `${v}${isStart ? ', start' : ''}` });
        grid.append(cell);
      });
      grid.dataset.path = path.map(p => p.join('-')).join(',');
      box.append(el('p', { class: 'round-label' }, `Trail ${round + 1} of ${tasks.length} · count in ${t.step}s`),
        instruction(`👆 Start at ${t.start} (top left). Tap the next number in the trail.`), progress, grid, result);
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  function qBalance() { const a = rnd(3, 9); return { icon: '⚖️', question: `🍓 + 🍓 = ${a * 2}. What is 🍓?`, instruction: 'Both strawberries are worth the same.', options: optionsFor(a, [a * 2, a + 1, a - 1]), answer: a, hint: 'Almost! Find half.', explain: `${a} + ${a} = ${a * 2}` }; }
  function qTwoStep() { const a = rnd(2, 6); const b = rnd(2, 7); return { icon: '🧮', question: `⭐ = ${a}. ⭐ + 🌙 = ${a + b}. What is 🌙?`, instruction: 'Use what you know.', options: optionsFor(b, [a + b, a, b + 1]), answer: b, hint: `Almost! ${a} + ? = ${a + b}`, explain: `${a} + ${b} = ${a + b}` }; }
  function qSudoku() { const f = shuffle(['🍎', '🍌', '🍇', '🍊']); const missing = f[3]; return { icon: '🍎', question: 'Which fruit is missing from this row?', instruction: 'Each row has one of each.', visual: `<div class="pat-row"><span class="pat-item">${f[0]}</span><span class="pat-item">${f[1]}</span><span class="pat-item">?</span><span class="pat-item">${f[2]}</span></div>`, options: shuffle([missing, f[0], f[1]]).map(v => ({ value: v, label: v })), answer: missing, hint: 'Almost! Which one is not in the row yet?', explain: `${missing} was missing.` }; }
  function qASN() { return { icon: '🤔', question: '“An odd number + 1 is even.” Is this…', instruction: 'Try 3 + 1, 7 + 1…', options: shuffle(['Always', 'Sometimes', 'Never']).map(v => ({ value: v, label: v })), answer: 'Always', hint: 'Almost! Try a few examples.', explain: 'Always: 3 + 1 = 4, 7 + 1 = 8…' }; }
  function qClue() { return { icon: '🕵️', question: '🐻 is not first. 🐻 is not last. Where is 🐻 in a line of 3?', instruction: 'Think about the places left.', options: shuffle(['first', 'middle', 'last']).map(v => ({ value: v, label: v })), answer: 'middle', hint: 'Almost! If not first and not last…', explain: 'The only place left is the middle.' }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qBalance(), qTwoStep(), qSudoku(), qASN(), qClue()], moduleId: MODULE_ID, badgeId: 'logic-legend', title: 'Logic Legend' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
