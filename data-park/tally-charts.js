/* ==============================================================
   ✏️ Data Park → Tally Charts             data-park/tally-charts.js
   🌱 Learn: tap to tally · 🎮 Play: pet parade · 🧩 Practise: read tallies
   🧠 Think · 🚀 Challenge: answer from a tally chart · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const P = window.Park;
  if (!MA || !K || !P) return;
  const { rnd, pick, shuffle, el, button, instruction, say, pulse, nextOrDone, dragMatch, quizRounds, optionsFor, PRAISE } = K;
  const { tallyHTML, tallyTableHTML, sample } = P;
  const MODULE_ID = 'data-park/tally-charts';
  const SETS = [[['🍎', 'apples'], ['🍌', 'bananas'], ['🍇', 'grapes']], [['🐶', 'dogs'], ['🐱', 'cats'], ['🐟', 'fish']], [['⚽', 'football'], ['🏀', 'basketball'], ['🎾', 'tennis']]];

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Tap to tally', render: renderLearn },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Pet parade', render: renderParade },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Read the tallies', render: renderPractise },
    { id: 'think', icon: '🧠', label: 'Think', title: 'True or false?', render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Tally detective', render: renderChallenge },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Tally Tracker', render: renderMaster }
  ];

  /** Tap-to-tally board: each item tapped once adds a mark to its row. */
  function tallyBoard(box, { items, rows, prompt, onDone }) {
    const counts = Object.fromEntries(rows.map(r => [r[0], 0]));
    let left = items.length;
    say(prompt);
    const table = el('div', { class: 'tally-board' });
    const rowEls = {};
    rows.forEach(([emoji, label]) => {
      const marks = el('span', { class: 'tally-board__marks' });
      const num = el('strong', { class: 'tally-board__num' }, '0');
      rowEls[emoji] = { marks, num };
      table.append(el('div', { class: 'tally-board__row' }, el('span', {}, `${emoji} ${label}`), marks, num));
    });
    const field = el('div', { class: 'tally-field', role: 'group', 'aria-label': 'Things to count' });
    items.forEach(emoji => {
      const b = button(emoji, 'tally-item', () => {
        if (b.disabled) return;
        b.disabled = true;
        b.classList.add('is-counted');
        counts[emoji] += 1;
        rowEls[emoji].marks.innerHTML = tallyHTML(counts[emoji]);
        rowEls[emoji].num.textContent = counts[emoji];
        if (counts[emoji] === 5) say('Five! The fifth line goes ACROSS the other four, like a gate.');
        left -= 1;
        if (!left) onDone(counts);
      }, { 'aria-label': `Count ${emoji}`, 'data-correct': 'yes' });
      field.append(b);
    });
    box.append(instruction('👆 Tap each one once. Watch the tally grow!'), field, table);
  }

  function renderLearn(box, done) {
    box.innerHTML = '';
    const rows = SETS[0];
    const items = shuffle(rows.flatMap(([e], i) => Array(3 + i * 2 + rnd(0, 1)).fill(e)));
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    tallyBoard(box, {
      items, rows, prompt: 'A tally is a quick way to count. Tap each fruit to make a tally mark!',
      onDone: counts => {
        MA.launchConfetti(25);
        say('All counted! Tally marks in fives are quick to read: 5, 10…');
        result.append(el('p', { class: 'round-result__text' }, `✏️ ${rows.map(([e]) => `${e} ${counts[e]}`).join('  ·  ')}`));
        done();
      }
    });
    box.append(result);
  }

  function renderParade(box, done) {
    box.innerHTML = '';
    const rows = SETS[1];
    const parade = shuffle(rows.flatMap(([e], i) => Array(2 + i + rnd(1, 3)).fill(e)));
    const counts = Object.fromEntries(rows.map(r => [r[0], 0]));
    let at = 0;
    say('Pets are walking past! For each pet, tap its row to add a tally mark.');
    const stageEl = el('div', { class: 'parade', 'aria-live': 'polite' });
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    const table = el('div', { class: 'tally-board' });
    const rowEls = {};
    rows.forEach(([emoji, label]) => {
      const marks = el('span', { class: 'tally-board__marks' });
      const b = button([el('span', {}, `${emoji} ${label}`), marks], 'tally-board__row tally-board__row--btn', () => {
        if (at >= parade.length) return;
        if (emoji !== parade[at]) { pulse(b, 'is-oops'); say(`That is a ${parade[at]}. Tap its row!`); return; }
        counts[emoji] += 1;
        marks.innerHTML = tallyHTML(counts[emoji]);
        at += 1;
        show();
      }, { 'data-row': emoji });
      rowEls[emoji] = b;
      table.append(b);
    });
    function show() {
      if (at >= parade.length) {
        stageEl.textContent = '🏁';
        MA.launchConfetti(30);
        say('Parade over! Now we can read our tally chart.');
        result.append(el('p', { class: 'round-result__text' }, `🎮 ${rows.map(([e]) => `${e} ${counts[e]}`).join('  ·  ')}`));
        done();
        return;
      }
      stageEl.innerHTML = `<span class="parade__pet">${parade[at]}</span><small>Pet ${at + 1} of ${parade.length}</small>`;
      Object.entries(rowEls).forEach(([e, b]) => { b.dataset.correct = e === parade[at] ? 'yes' : 'no'; });
    }
    show();
    box.append(instruction('👆 Tap the row for the pet you see.'), stageEl, table, result);
  }

  function renderPractise(box, done) {
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const nums = shuffle([3, 4, 6, 7, 8, 9, 11, 12]).slice(0, 3);
      const trick = [nums[0] + 1, nums[0] - 1].find(v => !nums.includes(v));
      say('How many does each tally show? Count the gates in 5s, then the extras.');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        items: nums.map(n => ({ face: el('span', { html: tallyHTML(n) }), value: n, label: 'Tally' })),
        tiles: [...nums, trick],
        hint: 'Almost! Each gate is 5.',
        onComplete: () => { MA.launchConfetti(25); say(pick(PRAISE)); nextOrDone(result, round === 1, 'Next round ▶', () => { round += 1; next(); }, done, '🧩 Tally reader!'); }
      });
      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of 2`), instruction('✋ Drag each number onto its tally.'), cards, bank, result);
    }
  }

  function renderThink(box, done) {
    const st = shuffle([
      () => ({ text: `${tallyHTML(5)}<small>This shows 5.</small>`, truth: true, explain: 'True! 4 lines and 1 across.' }),
      () => ({ text: `${tallyHTML(7)}<small>This shows 12.</small>`, truth: false, explain: 'One gate is 5, then 2 more: 7.', fix: { question: 'How many is it?', options: [7, 12, 5], answer: 7 } }),
      () => ({ text: '✏️<small>The 5th tally mark goes across the other 4.</small>', truth: true, explain: 'True! It makes counting in 5s easy.' }),
      () => ({ text: `${tallyHTML(10)}<small>Two gates make 10.</small>`, truth: true, explain: '5 + 5 = 10' })
    ]);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      say('True or false about tallies?');
      box.append(el('p', { class: 'round-label' }, `Question ${r + 1} of 4`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, st[r](), res => nextOrDone(res, r === 3, 'Next ▶', () => { r += 1; next(); }, done));
    }
  }

  function renderChallenge(box, done) {
    const data = sample(SETS[2], 3, 12);
    const most = data.reduce((a, b) => (b.count > a.count ? b : a));
    const least = data.reduce((a, b) => (b.count < a.count ? b : a));
    const vis = tallyTableHTML(data);
    say('Our class voted for their favourite sport. Read the tally chart!');
    quizRounds(box, done, [
      { icon: '🏆', question: 'Which sport got the most votes?', instruction: 'Most tally marks.', visual: vis, options: data.map(r => ({ value: r.label, label: `${r.emoji} ${r.label}` })), answer: most.label, hint: 'Almost! Count each row.', explain: `${most.label}: ${most.count} votes.` },
      { icon: '🔽', question: 'Which sport got the fewest votes?', instruction: 'Fewest marks.', visual: vis, options: data.map(r => ({ value: r.label, label: `${r.emoji} ${r.label}` })), answer: least.label, hint: 'Almost!', explain: `${least.label}: ${least.count} votes.` },
      { icon: '➖', question: `How many more votes for ${most.label} than ${least.label}?`, instruction: 'Find the difference.', visual: vis, options: optionsFor(most.count - least.count, [most.count, most.count + least.count, most.count - least.count + 1]), answer: most.count - least.count, hint: `Almost! ${most.count} − ${least.count}`, explain: `${most.count} − ${least.count} = ${most.count - least.count}` }
    ], { label: 'Question', finalText: '🚀 Tally detective!' });
  }

  function qRead() { const n = rnd(6, 14); return { icon: '✏️', question: 'How many does this tally show?', instruction: 'Count in 5s.', visual: tallyHTML(n), options: optionsFor(n, [n + 1, n - 1, n + 5]), answer: n, hint: 'Almost! Gates are 5.', explain: String(n) }; }
  function qGate() { return { icon: '🚪', question: 'How many does one tally gate show?', instruction: 'Count the lines.', visual: tallyHTML(5), options: optionsFor(5, [4, 6, 10]), answer: 5, hint: 'Almost!', explain: '5' }; }
  function qMost() { const d = sample(SETS[0], 2, 10); const m = d.reduce((a, b) => (b.count > a.count ? b : a)); return { icon: '🏆', question: 'Which fruit is most popular?', instruction: 'Most marks.', visual: tallyTableHTML(d), options: d.map(r => ({ value: r.label, label: `${r.emoji} ${r.label}` })), answer: m.label, hint: 'Almost!', explain: m.label }; }
  function qTotal() { const d = sample(SETS[1], 2, 6); const t = d.reduce((a, b) => a + b.count, 0); return { icon: '➕', question: 'How many pets altogether?', instruction: 'Add every row.', visual: tallyTableHTML(d), options: optionsFor(t, [t + 1, t - 1, t + 5]), answer: t, hint: 'Almost! Add them up.', explain: String(t) }; }
  function qWhy() { return { icon: '🤔', question: 'Why do we draw tally gates in 5s?', instruction: 'Think.', options: shuffle(['to count quickly', 'to make it pretty', 'to use less paper']).map(v => ({ value: v, label: v })), answer: 'to count quickly', hint: 'Almost!', explain: 'Counting in 5s is quick!' }; }

  function renderMaster(box, done) { K.runMaster(box, done, { makeQuestions: () => [qRead(), qGate(), qMost(), qTotal(), qWhy()], moduleId: MODULE_ID, badgeId: 'tally-tracker', title: 'Tally Tracker' }); }
  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
