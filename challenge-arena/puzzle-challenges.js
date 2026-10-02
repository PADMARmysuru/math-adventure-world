/* ==============================================================
   🧩 Challenge Arena → Puzzle Challenges   challenge-arena/puzzle-challenges.js
   🌱 Number pyramids · 🎮 Build pyramids · 🧩 Number machines
   🧠 Always, sometimes, never · 🚀 Three to the target · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const A = window.Arena;
  if (!MA || !K || !A) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, pulse, nextOrDone, quizRounds, optionsFor, PRAISE } = K;
  const MODULE_ID = 'challenge-arena/puzzle-challenges';

  /** Pyramid HTML: rows from top; null = unknown, 'ask' = highlighted unknown. */
  const pyramidHTML = rows => `<div class="pyramid">${rows.map(r => `<div class="pyramid__row">${r.map(v => `<span class="brick${v === '?' ? ' brick--ask' : ''}">${v === null ? '' : v}</span>`).join('')}</div>`).join('')}</div>`;

  function renderLearn(box, done) {
    say('In a number pyramid, two bricks next to each other ADD UP to the brick on top of them.');
    quizRounds(box, done, [0, 1, 2].map(() => () => {
      const a = rnd(2, 9); const b = rnd(2, 9);
      return { icon: '🔺', question: 'What goes on top?', instruction: 'Add the two bricks below.', visual: pyramidHTML([['?'], [a, b]]), options: optionsFor(a + b, [a + b + 1, a + b - 1, a * b]), answer: a + b, hint: `Almost! ${a} + ${b}`, explain: `${a} + ${b} = ${a + b}` };
    }), { label: 'Pyramid' });
  }

  function renderBuild(box, done) {
    const puzzles = [0, 1].map(() => [rnd(1, 6), rnd(1, 6), rnd(1, 6)]);
    let p = 0;
    let step = 0;
    next();
    function next() {
      const [a, b, c] = puzzles[p];
      const mid = [a + b, b + c];
      const top = mid[0] + mid[1];
      const known = [step > 0 ? mid[0] : null, step > 1 ? mid[1] : null];
      const rows = [[step === 2 ? '?' : null], [step === 0 ? '?' : known[0], step === 1 ? '?' : known[1]], [a, b, c]];
      const answer = [mid[0], mid[1], top][step];
      const hint = ['Add the two bricks under it.', 'Add the two bricks under it.', 'Add the two middle bricks.'][step];
      box.innerHTML = '';
      say(step === 0 ? 'Build the whole pyramid, one brick at a time!' : 'Next brick!');
      const area = el('div', { class: 'challenge' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      box.append(el('p', { class: 'round-label' }, `Pyramid ${p + 1} of ${puzzles.length} · brick ${step + 1} of 3`), area, result);
      MA.renderChallenge(area, { icon: '🧱', question: 'What goes in the yellow brick?', instruction: hint, visual: pyramidHTML(rows), options: optionsFor(answer, [answer + 1, answer - 1, answer + 2]), answer, hint: `Almost! ${hint}`, explain: String(answer) }, {
        onCorrect: () => {
          step += 1;
          if (step < 3) { setTimeout(next, 500); return; }
          MA.launchConfetti(35);
          say(`Pyramid complete! The top is ${top}. ${pick(PRAISE)}`);
          box.querySelector('.challenge__visual').innerHTML = pyramidHTML([[top], mid, [a, b, c]]);
          step = 0;
          nextOrDone(result, p === puzzles.length - 1, 'Next pyramid ▶', () => { p += 1; next(); }, done, '🎮 Pyramid builder!');
        }
      });
    }
  }

  function renderMachines(box, done) {
    const machine = (rule, input) => `<div class="machine"><span class="machine__in">${input}</span><span class="machine__box">⚙️ ${rule}</span><span class="machine__out">?</span></div>`;
    say('Number machines change numbers! Put a number IN, and the rule makes the number that comes OUT.');
    quizRounds(box, done, [
      () => { const n = rnd(3, 15); return { icon: '⚙️', question: 'What comes out?', instruction: 'Use the rule.', visual: machine('+ 5', n), options: optionsFor(n + 5, [n + 4, n + 6, n - 5]), answer: n + 5, hint: 'Almost! Add 5.', explain: `${n} + 5 = ${n + 5}` }; },
      () => { const n = rnd(12, 40); return { icon: '⚙️', question: 'What comes out?', instruction: 'Use the rule.', visual: machine('− 10', n), options: optionsFor(n - 10, [n + 10, n - 1, n - 9]), answer: n - 10, hint: 'Almost! Take away 1 ten.', explain: `${n} − 10 = ${n - 10}` }; },
      () => { const n = rnd(2, 9); return { icon: '⚙️', question: 'What comes out?', instruction: 'Use the rule.', visual: machine('× 2', n), options: optionsFor(n * 2, [n + 2, n * 2 + 1, n]), answer: n * 2, hint: 'Almost! Double it.', explain: `${n} × 2 = ${n * 2}` }; },
      () => { const n = rnd(3, 12); return { icon: '🔁', question: `A +10 machine gave out ${n + 10}. What went IN?`, instruction: 'Work backwards!', options: optionsFor(n, [n + 20, n + 10, n + 1]), answer: n, hint: 'Almost! Do the opposite: take away 10.', explain: `${n + 10} − 10 = ${n}` }; }
    ], { label: 'Machine', finalText: '🧩 Machine master!' });
  }

  function renderASN(box, done) {
    const st = shuffle([
      { text: 'If you add two numbers, the answer is bigger than both.', answer: 'Sometimes', explain: 'Sometimes! 3 + 4 = 7 is bigger, but 5 + 0 = 5 is not bigger than 5.' },
      { text: 'A number multiplied by 10 ends in 0.', answer: 'Always', explain: 'Always! 3 × 10 = 30, 7 × 10 = 70…' },
      { text: 'An odd number plus an odd number is odd.', answer: 'Never', explain: 'Never! 3 + 5 = 8, which is even.' }
    ]);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      const s = st[r];
      let solved = false;
      say('Always true, sometimes true, or never true? Test some examples!');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const group = el('div', { class: 'fix-options', role: 'group', 'aria-label': 'Always, sometimes or never' });
      [['Always', '✅'], ['Sometimes', '🤔'], ['Never', '❌']].forEach(([w, i]) => {
        const b = button(`${i} ${w}`, 'tf-btn', () => {
          if (solved) return;
          if (w === s.answer) { solved = true; b.classList.add('is-right'); MA.launchConfetti(25); say(s.explain); result.append(el('p', { class: 'round-result__text' }, `🌟 ${s.explain}`)); nextOrDone(result, r === st.length - 1, 'Next ▶', () => { r += 1; next(); }, done); }
          else { b.classList.add('is-wrong'); b.disabled = true; say('Try some numbers and see what happens!'); }
        });
        group.append(b);
      });
      box.append(el('p', { class: 'round-label' }, `Statement ${r + 1} of ${st.length}`), el('p', { class: 'tf-statement' }, s.text), group, result);
    }
  }

  function renderThree(box, done) {
    const rounds = [15, 20, 30];
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      const T = rounds[r];
      const a = rnd(2, Math.floor(T / 2)); const b = rnd(1, T - a - 1); const c = T - a - b;
      const cards = shuffle([a, b, c, rnd(1, 9), rnd(10, 15), rnd(2, 8)]);
      const answerIdx = [];
      [a, b, c].forEach(v => { const i = cards.findIndex((x, k) => x === v && !answerIdx.includes(k)); answerIdx.push(i); });
      const picked = [];
      say(`Pick THREE cards that add up to exactly ${T}.`);
      const grid = el('div', { class: 'target-cards', role: 'group', 'aria-label': 'Number cards' });
      const live = el('p', { class: 'add-sentence', 'aria-live': 'polite' }, '? + ? + ? = ?');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      cards.forEach((v, i) => {
        const b = button(String(v), 'tile target-card', () => {
          const at = picked.indexOf(i);
          if (at >= 0) { picked.splice(at, 1); b.classList.remove('is-selected'); } else if (picked.length < 3) { picked.push(i); b.classList.add('is-selected'); }
          const vals = picked.map(k => cards[k]);
          live.textContent = vals.length ? `${vals.join(' + ')} = ${vals.reduce((s, x) => s + x, 0)}` : '? + ? + ? = ?';
          result.innerHTML = '';
        }, { 'data-correct': answerIdx.includes(i) ? 'yes' : 'no' });
        grid.append(b);
      });
      const check = button('✓ Check', 'btn btn--big check-btn', () => {
        result.innerHTML = '';
        const sum = picked.reduce((s, k) => s + cards[k], 0);
        if (picked.length === 3 && sum === T) {
          check.disabled = true;
          $$('.target-card', grid).forEach(x => { x.disabled = true; });
          MA.launchConfetti(40);
          say(`Bullseye! ${pick(PRAISE)}`);
          nextOrDone(result, r === rounds.length - 1, 'Next target ▶', () => { r += 1; next(); }, done, '🚀 Puzzle master!');
        } else {
          const tip = picked.length !== 3 ? 'Pick exactly 3 cards.' : sum > T ? `${sum} is too big!` : `${sum} is too small!`;
          say(tip);
          result.append(el('p', { class: 'round-result__tip' }, `💡 ${tip}`));
        }
      });
      box.append(el('p', { class: 'round-label' }, `Target ${r + 1} of ${rounds.length}`), el('div', { class: 'target-badge' }, el('span', {}, '🎯'), el('strong', {}, String(T))),
        instruction('👆 Tap 3 cards, then Check.'), grid, live, check, result);
    }
  }

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Number pyramids', render: renderLearn },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Build a pyramid', render: renderBuild },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Number machines', render: renderMachines },
    { id: 'think', icon: '🧠', label: 'Think', title: 'Always, sometimes, never', render: renderASN },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Three to the target', render: renderThree },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Puzzle Master', render: (box, done) => K.runMaster(box, done, { makeQuestions: () => [{ icon: '🔺', question: 'Bottom bricks 6 and 7. What is on top?', instruction: 'Add them.', options: optionsFor(13, [12, 14, 42]), answer: 13, hint: 'Almost! 6 + 7', explain: '13' }, ...A.mixed(4, 3).map(f => f())], moduleId: MODULE_ID, badgeId: 'puzzle-master', title: 'Puzzle Master' }) }
  ];

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
