/* ==============================================================
   💵 Money Market → Notes                  money-market/notes.js
   🌱 Learn: meet the notes · 🎮 Play: fill the wallet · 🧩 Practise: note totals
   🧠 Think · 🚀 Challenge: swap shop · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const $M = window.Money;
  if (!MA || !K || !$M) return;
  const { rnd, pick, shuffle, el, button, instruction, say, nextOrDone, dragMatch, quizRounds, makeTotal, optionsFor, PRAISE } = K;
  const { fmt, note, groupHTML, groupNode } = $M;
  const NOTES = $M.CURRENCY.notes;
  const MODULE_ID = 'money-market/notes';

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Meet the notes', render: renderLearn },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Fill the wallet', render: renderWallet },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Note totals', render: renderPractise },
    { id: 'think', icon: '🧠', label: 'Think', title: 'True or false?', render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Swap shop', render: renderSwap },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Note Ninja', render: renderMaster }
  ];

  function renderLearn(box, done) {
    box.innerHTML = '';
    const seen = new Set();
    say('Notes are paper money. They are worth more than most coins! Tap each note.');
    const grid = el('div', { class: 'coin-grid' });
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    NOTES.forEach(v => {
      const b = button(note(v), 'coin-btn', () => {
        if (seen.has(v)) return;
        seen.add(v);
        b.classList.add('is-seen');
        say(`This note is worth ${fmt(v)}. That is ${v / 10} tens!`);
        if (seen.size === NOTES.length) {
          MA.launchConfetti(20);
          result.append(el('div', { class: 'stage-actions' }, button('Next: same value ▶', 'btn', same)));
        }
      }, { 'aria-label': `${fmt(v)} note`, 'data-correct': 'yes' });
      grid.append(b);
    });
    box.append(instruction('👆 Tap every note.'), grid, result);

    function same() {
      quizRounds(box, done, [
        { icon: '💵', question: `How many ${fmt(10)} notes make ${fmt(50)}?`, instruction: 'Count in tens.', visual: groupHTML([50], 'note'), options: optionsFor(5, [10, 50, 4]), answer: 5, hint: 'Almost! 10, 20, 30, 40, 50…', explain: `5 × ${fmt(10)} = ${fmt(50)}` },
        { icon: '💵', question: `How many ${fmt(50)} notes make ${fmt(100)}?`, instruction: 'Half and half!', visual: groupHTML([100], 'note'), options: optionsFor(2, [5, 50, 10]), answer: 2, hint: 'Almost! 50 + 50 = ?', explain: `${fmt(50)} + ${fmt(50)} = ${fmt(100)}` },
        { icon: '💵', question: `Which is worth the same as ${fmt(20)}?`, instruction: 'Think in tens.', options: [{ value: 'two', label: `two ${fmt(10)} notes` }, { value: 'one', label: `one ${fmt(10)} note` }, { value: 'five', label: `five ${fmt(10)} notes` }], answer: 'two', hint: 'Almost! 10 + 10 = ?', explain: `${fmt(10)} + ${fmt(10)} = ${fmt(20)}` }
      ], { label: 'Question' });
    }
  }

  function renderWallet(box, done) {
    const targets = shuffle([30, 40, 60, 70, 80, 90]).slice(0, 4);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const T = targets[round];
      say(`Put exactly ${fmt(T)} in the wallet using notes.`);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      box.append(el('p', { class: 'round-label' }, `Wallet ${round + 1} of ${targets.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, '👛 Make'), el('strong', {}, fmt(T))),
        instruction('👆 Tap notes to add them.'),
        makeTotal({
          target: T, pieces: [10, 20, 50], render: (v, small) => note(v, small), fmt,
          onWin: chosen => { MA.launchConfetti(30); say(`${chosen.map(fmt).join(' + ')} = ${fmt(T)}!`); nextOrDone(result, round === targets.length - 1, 'Next wallet ▶', () => { round += 1; next(); }, done, '👛 Wallet wizard!'); }
        }), result);
    }
  }

  function renderPractise(box, done) {
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const sets = [];
      while (sets.length < 3) {
        const s = Array.from({ length: rnd(2, 3) }, () => pick([10, 20, 50])).sort((a, b) => b - a);
        const t = s.reduce((a, b) => a + b, 0);
        if (t <= 100 && !sets.some(x => x.t === t)) sets.push({ s, t });
      }
      const trick = [sets[0].t + 10, sets[0].t - 10].find(v => v > 0 && !sets.some(x => x.t === v));
      say('Count each bundle of notes. Count on in tens!');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        items: sets.map(x => ({ face: groupNode(x.s, 'note'), value: fmt(x.t), label: 'Notes' })),
        tiles: [...sets.map(x => fmt(x.t)), fmt(trick)],
        hint: 'Almost! Start with the biggest note, then count on.',
        onComplete: () => { MA.launchConfetti(25); say(pick(PRAISE)); nextOrDone(result, round === 1, 'Next round ▶', () => { round += 1; next(); }, done, '🧩 Note counter!'); }
      });
      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of 2`), instruction('✋ Drag each total onto its notes.'), cards, bank, result);
    }
  }

  function renderThink(box, done) {
    const st = shuffle([
      () => ({ text: `${groupHTML([50, 50], 'note')}<small>Two ${fmt(50)} notes make ${fmt(100)}.</small>`, truth: true, explain: '50 + 50 = 100' }),
      () => ({ text: `${groupHTML([20], 'note')}<small>A ${fmt(20)} note is worth less than a ${fmt(10)} note.</small>`, truth: false, explain: '20 is more than 10!' }),
      () => ({ text: `${groupHTML([10, 10, 10], 'note')}<small>Three ${fmt(10)} notes = ${fmt(30)}</small>`, truth: true, explain: '10, 20, 30!' }),
      () => ({ text: `${groupHTML([50, 20], 'note')}<small>= ${fmt(60)}</small>`, truth: false, explain: '50 + 20 = 70', fix: { question: 'How much is it?', options: [fmt(70), fmt(60), fmt(52)], answer: fmt(70) } })
    ]);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      say('True or false? Count the notes!');
      box.append(el('p', { class: 'round-label' }, `Question ${r + 1} of 4`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, st[r](), res => nextOrDone(res, r === 3, 'Next ▶', () => { r += 1; next(); }, done));
    }
  }

  function renderSwap(box, done) {
    say('Welcome to the Swap Shop! Swap notes for the same amount.');
    quizRounds(box, done, [
      () => ({ icon: '🔁', question: `Swap a ${fmt(100)} note for ${fmt(20)} notes. How many do you get?`, instruction: 'Count in 20s.', visual: groupHTML([100], 'note'), options: optionsFor(5, [4, 20, 10]), answer: 5, hint: 'Almost! 20, 40, 60, 80, 100.', explain: `5 × ${fmt(20)} = ${fmt(100)}` }),
      () => ({ icon: '🔁', question: `Swap a ${fmt(50)} note for ${fmt(10)} notes. How many?`, instruction: 'Count in 10s.', visual: groupHTML([50], 'note'), options: optionsFor(5, [10, 50, 4]), answer: 5, hint: 'Almost! 10, 20, 30, 40, 50.', explain: `5 × ${fmt(10)} = ${fmt(50)}` }),
      () => ({ icon: '🔁', question: `${fmt(50)} + ${fmt(20)} + ${fmt(20)} + ? = ${fmt(100)}`, instruction: 'What is missing?', options: [10, 20, 50].map(v => ({ value: v, label: fmt(v), html: note(v, true).outerHTML })), answer: 10, hint: 'Almost! 50 + 20 + 20 = 90.', explain: `${fmt(90)} + ${fmt(10)} = ${fmt(100)}` }),
      () => { const n = rnd(3, 8); return { icon: '🔁', question: `${n} notes of ${fmt(10)}. How much money?`, instruction: 'Count in tens.', options: optionsFor(n * 10, [n, n * 10 + 10, n + 10]).map(o => ({ ...o, label: fmt(o.value) })), answer: n * 10, hint: `Almost! ${n} tens.`, explain: fmt(n * 10) }; }
    ], { label: 'Swap', finalText: '🚀 Swap shop star!' });
  }

  function qTotal() { const s = shuffle([50, 20, 10]).slice(0, 2).sort((a, b) => b - a); const t = s[0] + s[1]; return { icon: '💵', question: 'How much altogether?', instruction: 'Add the notes.', visual: groupHTML(s, 'note'), options: optionsFor(t, [t + 10, t - 10, t + 5]).map(o => ({ ...o, label: fmt(o.value) })), answer: t, hint: 'Almost! Start with the biggest.', explain: fmt(t) }; }
  function qTens() { return { icon: '🔟', question: `How many ${fmt(10)} notes make ${fmt(100)}?`, instruction: 'Count in tens.', options: optionsFor(10, [100, 5, 1]), answer: 10, hint: 'Almost! 10 tens = 100.', explain: `10 × ${fmt(10)}` }; }
  function qMost() { return { icon: '🏆', question: 'Which note is worth the most?', instruction: 'Read the numbers.', options: shuffle(NOTES.slice(0, 3)).map(v => ({ value: v, label: fmt(v), html: note(v, true).outerHTML })), answer: 50, hint: 'Almost! Biggest number.', explain: `${fmt(50)} is the most here.` }; }
  function qMake() { return { icon: '👛', question: `Which makes ${fmt(70)}?`, instruction: 'Add each pair.', options: [{ value: 'a', label: `${fmt(50)} + ${fmt(20)}` }, { value: 'b', label: `${fmt(50)} + ${fmt(10)}` }, { value: 'c', label: `${fmt(20)} + ${fmt(20)}` }], answer: 'a', hint: 'Almost! Add each one.', explain: `${fmt(50)} + ${fmt(20)} = ${fmt(70)}` }; }
  function qHalf() { return { icon: '✌️', question: `Half of ${fmt(100)} is…`, instruction: 'Share into 2.', options: optionsFor(50, [20, 10, 100]).map(o => ({ ...o, label: fmt(o.value) })), answer: 50, hint: 'Almost! 50 + 50 = 100.', explain: fmt(50) }; }

  function renderMaster(box, done) { K.runMaster(box, done, { makeQuestions: () => [qTotal(), qTens(), qMost(), qMake(), qHalf()], moduleId: MODULE_ID, badgeId: 'note-ninja', title: 'Note Ninja' }); }
  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
