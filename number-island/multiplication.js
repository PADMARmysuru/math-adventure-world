/* ==============================================================
   ✖️ Number Island → Multiplication   number-island/multiplication.js
   --------------------------------------------------------------
   🌱 Learn      make equal groups on plates (3 groups of 4 = 4 + 4 + 4 = 3 × 4)
   🎮 Play       array builder: rows and columns that make the target
   🧩 Practise   drag answers onto groups, repeated addition and × facts
   🧠 Think      true or false? (3 × 5 = 5 × 3, groups vs adding)
   🚀 Challenge  times-table bingo (2s, 5s and 10s)
   🏆 Master     five mixed questions → Multiplication Master badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  if (!MA || !K) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, pulse, optionsFor, trueFalse, nextOrDone, dragMatch, PRAISE } = K;

  const MODULE_ID = 'number-island/multiplication';
  const ITEMS = ['🍪', '🍓', '⚽', '🐞', '🌸'];

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Equal groups',           render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Array builder',          render: renderPlay },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Answer drop',            render: renderPractise },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',         render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Times table bingo',      render: renderBingo },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Multiplication Master',  render: renderMaster }
  ];

  const repeated = (groups, size) => Array(groups).fill(size).join(' + ');

  /* ------------------------------------------------------------
     🌱 LEARN — fill plates with equal groups
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const tasks = [[3, 2], [2, 5], [4, 3]];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const [groups, size] = tasks[round];
      const item = ITEMS[round % ITEMS.length];
      const counts = Array(groups).fill(0);
      let solved = false;
      say(round === 0
        ? `Make ${groups} groups of ${size}. Tap a plate to add one. Tap a ${item} to take it off.`
        : `Now make ${groups} groups of ${size}!`);

      const plates = el('div', { class: 'plates' });
      const sentence = el('p', { class: 'add-sentence', 'aria-live': 'polite' }, '?');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const plateEls = counts.map((_, i) => {
        const items = el('div', { class: 'plate__items' });
        const plate = el('div', { class: 'plate', role: 'button', tabindex: '0', 'aria-label': `Plate ${i + 1}, 0 ${item}` }, items,
          el('span', { class: 'plate__count' }, '0'));
        const add = () => {
          if (solved) return;
          if (counts[i] >= 10) { say('That plate is full!'); return; }
          counts[i] += 1;
          draw();
        };
        plate.addEventListener('click', e => { if (!e.target.closest('.plate__item')) add(); });
        plate.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(); } });
        plates.append(plate);
        return { plate, items };
      });

      function draw() {
        plateEls.forEach(({ plate, items }, i) => {
          items.innerHTML = '';
          for (let k = 0; k < counts[i]; k++) {
            items.append(button(item, 'plate__item', () => {
              if (solved) return;
              counts[i] -= 1;
              draw();
            }, { 'aria-label': `Take one ${item} off plate ${i + 1}` }));
          }
          plate.querySelector('.plate__count').textContent = counts[i];
          plate.setAttribute('aria-label', `Plate ${i + 1}, ${counts[i]} ${item}`);
          plate.classList.toggle('is-right', counts[i] === size);
          plate.classList.toggle('is-over', counts[i] > size);
        });
        sentence.textContent = counts.join(' + ') + ` = ${counts.reduce((a, b) => a + b, 0)}`;
        if (counts.every(c => c === size)) win();
        else if (counts.some(c => c > size)) say(`Too many on a plate! Each plate needs ${size}.`);
      }

      function win() {
        solved = true;
        $$('.plate__item', plates).forEach(b => { b.disabled = true; });
        const total = groups * size;
        sentence.innerHTML = `${groups} groups of ${size} = ${repeated(groups, size)} = <strong>${total}</strong>`;
        say(`Equal groups! ${groups} × ${size} = ${total}.`);
        MA.launchConfetti(30);
        result.append(el('p', { class: 'round-result__text' }, `✖️ ${groups} × ${size} = ${total}`),
          el('p', { class: 'round-result__tip' }, '× means “groups of”.'));
        nextOrDone(result, round === tasks.length - 1, 'Next ▶', () => { round += 1; newRound(); }, done);
      }

      box.append(el('p', { class: 'round-label' }, `Groups ${round + 1} of ${tasks.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, `${groups} groups of`), el('strong', {}, String(size))),
        instruction('👆 Tap a plate to add. Tap an item to take it off.'), plates, sentence, result);
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — array builder
     ------------------------------------------------------------ */
  function renderPlay(box, done) {
    const TARGETS = [10, 20, 15, 30];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const target = TARGETS[round];
      let rows = 1;
      let cols = 1;
      let solved = false;
      say(`Build an array with exactly ${target} stars. Use rows of 2, 5 or 10!`);

      const grid = el('div', { class: 'array-grid', role: 'img' });
      const sentence = el('p', { class: 'add-sentence', 'aria-live': 'polite' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const control = (label, get, set, max) => el('div', { class: 'array-ctrl' },
        el('span', { class: 'array-ctrl__label' }, label),
        button('−', 'pv-btn pv-btn--minus', () => { if (!solved && get() > 1) { set(get() - 1); draw(); } }, { 'aria-label': `Fewer ${label}` }),
        button('+', 'pv-btn pv-btn--ten', () => { if (!solved && get() < max) { set(get() + 1); draw(); } }, { 'aria-label': `More ${label}` }));
      const ctrls = el('div', { class: 'array-ctrls' },
        control('Rows', () => rows, v => { rows = v; }, 10),
        control('In each row', () => cols, v => { cols = v; }, 10));

      function draw() {
        grid.style.setProperty('--cols', cols);
        grid.innerHTML = '<span class="array-dot">⭐</span>'.repeat(rows * cols);
        grid.setAttribute('aria-label', `${rows} rows of ${cols} stars`);
        const total = rows * cols;
        sentence.textContent = `${rows} rows of ${cols} = ${rows} × ${cols} = ${total}`;
        if (total === target && [2, 5, 10].some(n => n === cols || n === rows)) win(total);
        else if (total === target) say('That makes it! Can you use rows of 2, 5 or 10?');
        else if (total > target) say(`Too many! We need ${target}.`);
      }

      function win(total) {
        solved = true;
        $$('button', ctrls).forEach(b => { b.disabled = true; });
        say(`${rows} rows of ${cols} make ${total}! ${pick(PRAISE)}`);
        MA.launchConfetti(30);
        result.append(el('p', { class: 'round-result__text' }, `⭐ ${rows} × ${cols} = ${total}`),
          el('p', { class: 'round-result__tip' }, `Turn it around: ${cols} × ${rows} = ${total} too!`));
        nextOrDone(result, round === TARGETS.length - 1, 'Next target ▶', () => { round += 1; newRound(); }, done);
      }

      draw();
      box.append(el('p', { class: 'round-label' }, `Array ${round + 1} of ${TARGETS.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, 'Make'), el('strong', {}, String(target))),
        instruction('👆 Change the rows and how many in each row.'), ctrls, grid, sentence, result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — answers onto groups and facts
     ------------------------------------------------------------ */
  function renderPractise(box, done) {
    const fact = () => { const t = pick([2, 5, 10]); const n = rnd(2, 10); return [t, n]; };
    const ROUNDS = ['groups', 'repeat', 'facts'];
    let round = 0;
    newRound();

    function face(kind, t, n) {
      if (kind === 'groups') {
        const item = pick(ITEMS);
        return el('span', { class: 'mini-groups', role: 'img', 'aria-label': `${n} groups of ${t}` },
          Array.from({ length: n }, () => el('span', { class: 'mini-group' }, item.repeat(t))));
      }
      if (kind === 'repeat') return el('span', {}, `${repeated(n, t)} =`);
      return el('span', {}, `${n} × ${t} =`);
    }

    function newRound() {
      box.innerHTML = '';
      const kind = ROUNDS[round];
      const facts = [];
      while (facts.length < 4) {
        let [t, n] = fact();
        if (kind === 'groups') { t = pick([2, 5]); n = rnd(2, 4); }
        if (kind === 'repeat') n = rnd(2, 5);
        if (!facts.some(f => f[0] * f[1] === t * n)) facts.push([t, n]);
      }
      const answers = facts.map(([t, n]) => t * n);
      const [t0, n0] = facts[0];
      const trick = [t0 + n0, t0 * n0 + t0, t0 * n0 + 1].find(v => !answers.includes(v));
      say(kind === 'groups' ? 'How many altogether? Count in groups!' : pick(['Match each answer!', 'Skip count to help!']));
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        items: facts.map(([t, n]) => ({ face: face(kind, t, n), value: t * n, label: `${n} times ${t}` })),
        tiles: [...answers, trick],
        hint: 'Almost! Skip count: 2, 4, 6… or 5, 10, 15… or 10, 20, 30…',
        onComplete: spare => {
          MA.launchConfetti(25);
          say(spare ? `${pick(PRAISE)} ${spare.dataset.value} was a trick!` : pick(PRAISE));
          nextOrDone(result, round === ROUNDS.length - 1, 'Next round ▶', () => { round += 1; newRound(); }, done, '🧩 All matched!');
        }
      });
      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of ${ROUNDS.length}`),
        instruction('✋ Drag each answer onto its card. Or tap an answer, then a box.'), cards, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const statements = [
      () => { const a = pick([2, 5, 10]); const b = rnd(3, 6); return { text: `${b} × ${a} = ${a} × ${b}`, truth: true, explain: `True! ${b} rows of ${a} or ${a} rows of ${b}: both make ${a * b}.` }; },
      () => { const g = rnd(3, 5); const s = 2; return { text: `${g} groups of ${s} = ${g} + ${s}<small>Milo added the numbers.</small>`, truth: false, explain: `${g} groups of ${s} = ${repeated(g, s)} = ${g * s}.`, fix: { question: `What is ${g} groups of ${s}?`, options: [g * s, g + s, g * s + s], answer: g * s } }; },
      () => { const n = rnd(3, 8); return { text: `${n} × 10 = ${n + 10}`, truth: false, explain: `${n} × 10 = ${n * 10}. ${n} tens!`, fix: { question: `What is ${n} × 10?`, options: [n * 10, n + 10, n * 10 + n], answer: n * 10 } }; },
      () => { const n = rnd(3, 6); return { text: `${repeated(n, 5)} = ${n} × 5`, truth: true, explain: `True! ${n} fives make ${n * 5}.` }; }
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'True or false? Think about groups!' : pick(['True or false?', 'Check carefully!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — times-table bingo
     ------------------------------------------------------------ */
  function renderBingo(box, done) {
    const pool = [];
    [2, 5, 10].forEach(t => { for (let n = 1; n <= 10; n++) pool.push([n, t]); });
    const products = [...new Set(pool.map(([n, t]) => n * t))];
    const card = shuffle(products).slice(0, 9);
    const calls = shuffle(card).slice(0, 6).map(p => shuffle(pool.filter(([n, t]) => n * t === p))[0]);
    let call = 0;
    say('Bingo! I call a fact. You find the answer on your card.');

    const caller = el('div', { class: 'bingo-call', 'aria-live': 'polite' });
    const grid = el('div', { class: 'bingo', role: 'group', 'aria-label': 'Bingo card' });
    const progress = el('p', { class: 'hop-count', 'aria-live': 'polite' });
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    card.forEach(p => {
      const cell = button(String(p), 'bingo__cell', () => {
        if (call >= calls.length || cell.classList.contains('is-hit')) return;
        const [n, t] = calls[call];
        if (p === n * t) {
          cell.classList.add('is-hit');
          cell.setAttribute('aria-label', `${p}, marked`);
          call += 1;
          say(`${n} × ${t} = ${p}! ${pick(PRAISE)}`);
          showCall();
        } else {
          pulse(cell, 'is-oops');
          say(`Not ${p}. Count in ${t}s, ${n} times: ${Array.from({ length: Math.min(n, 3) }, (_, k) => (k + 1) * t).join(', ')}…`);
        }
      }, { 'data-value': p });
      grid.append(cell);
    });

    function showCall() {
      if (call === calls.length) {
        caller.innerHTML = '<span class="bingo-call__fact">🎉 BINGO!</span>';
        progress.textContent = `Marked: ${calls.length} of ${calls.length}`;
        MA.launchConfetti(50);
        say('BINGO! You know your 2s, 5s and 10s!');
        result.append(el('p', { class: 'round-result__text' }, '🚀 Bingo card complete!'));
        done();
        return;
      }
      const [n, t] = calls[call];
      caller.innerHTML = `<span class="bingo-call__label">Find</span><span class="bingo-call__fact">${n} × ${t}</span>`;
      progress.textContent = `Marked: ${call} of ${calls.length}`;
    }
    showCall();
    box.append(instruction('👆 Tap the answer to each fact on your card.'), caller, progress, grid, result);
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  function qGroups() { const g = rnd(2, 4); const s = pick([2, 5]); const item = pick(ITEMS); return { icon: '🍽️', question: 'How many altogether?', instruction: `${g} groups of ${s}`, visual: `<div class="mini-groups" role="img" aria-label="${g} groups of ${s}">${Array.from({ length: g }, () => `<span class="mini-group">${item.repeat(s)}</span>`).join('')}</div>`, options: optionsFor(g * s, [g + s, g * s + s, g * s - 1]), answer: g * s, hint: `Almost! Count in ${s}s.`, explain: `${g} × ${s} = ${g * s}` }; }
  function qFive() { const n = rnd(3, 10); return { icon: '✋', question: `${n} × 5 = ?`, instruction: 'Count in 5s.', options: optionsFor(n * 5, [n + 5, n * 5 + 5, n * 5 - 5]), answer: n * 5, hint: `Almost! Count ${n} fives: 5, 10, 15…`, explain: `${n} × 5 = ${n * 5}` }; }
  function qTen() { const n = rnd(2, 9); return { icon: '🔟', question: `${n} × 10 = ?`, instruction: 'Count in 10s.', options: optionsFor(n * 10, [n + 10, n * 10 + 10, n]), answer: n * 10, hint: `Almost! ${n} tens.`, explain: `${n} × 10 = ${n * 10}` }; }
  function qRepeat() { const n = rnd(3, 5); return { icon: '➕', question: `${repeated(n, 2)} = ? × 2`, instruction: 'How many 2s?', options: optionsFor(n, [n * 2, 2, n + 1]), answer: n, hint: 'Almost! Count the 2s.', explain: `${repeated(n, 2)} = ${n} × 2 = ${n * 2}` }; }
  function qStory() { const b = rnd(2, 5); const per = pick([2, 5, 10]); const thing = pick(['apples', 'pencils', 'cars', 'buttons']); return { icon: '📖', question: `There are ${b} bags. Each bag has ${per} ${thing}. How many ${thing}?`, instruction: 'Equal groups!', options: optionsFor(b * per, [b + per, b * per + per, b * per - 1]), answer: b * per, hint: `Almost! ${b} groups of ${per}.`, explain: `${b} × ${per} = ${b * per} ${thing}` }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qGroups(), qFive(), qTen(), qRepeat(), qStory()], moduleId: MODULE_ID, badgeId: 'multiplication-master', title: 'Multiplication Master' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
