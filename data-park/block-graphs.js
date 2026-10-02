/* ==============================================================
   📊 Data Park → Block Graphs                data-park/block-graphs.js
   🌱 Learn: read a block graph · 🎮 Play: build a block graph · 🧩 Practise: compare
   🧠 Think · 🚀 Challenge: fix the wrong bar · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const P = window.Park;
  if (!MA || !K || !P) return;
  const { pick, shuffle, el, button, instruction, say, pulse, nextOrDone, quizRounds, makeSetter, optionsFor, PRAISE } = K;
  const { blockGraphHTML, sample } = P;
  const MODULE_ID = 'data-park/block-graphs';
  const TOYS = [['🚗', 'cars'], ['🧸', 'teddies'], ['🪀', 'yo-yos'], ['🧩', 'puzzles']];
  const WEATHER = [['☀️', 'sunny'], ['🌧️', 'rainy'], ['☁️', 'cloudy']];
  const lab = r => ({ value: r.label, label: `${r.emoji} ${r.label}` });

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Read a block graph', render: renderLearn },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Build a block graph', render: renderBuild },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Graph questions', render: renderPractise },
    { id: 'think', icon: '🧠', label: 'Think', title: 'True or false?', render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Fix the graph', render: renderFix },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Graph Genius', render: renderMaster }
  ];

  /** Interactive block graph: one setter per column. onRight() when every column matches. */
  function builder(data, { onAll, start }) {
    const wrap = el('div', { class: 'bg bg--build', style: '--max:8' });
    const axis = el('div', { class: 'bg__axis' }, Array.from({ length: 8 }, (_, i) => el('span', {}, String(8 - i))));
    const cols = el('div', { class: 'bg__cols' });
    let ok = 0;
    data.forEach((r, i) => {
      const stack = el('div', { class: 'bg__stack' });
      const s = makeSetter({
        value: start ? start[i] : 0, min: 0, max: 8, target: r.count,
        steps: [{ d: -1, label: '−', aria: `One less ${r.label}` }, { d: 1, label: '+', aria: `One more ${r.label}` }],
        onChange: v => {
          stack.innerHTML = '<span class="bg__block"></span>'.repeat(v);
          if (v === r.count && !s.root.classList.contains('is-locked')) { s.lock(); ok += 1; if (ok === data.length) onAll(); }
        }
      });
      stack.innerHTML = '<span class="bg__block"></span>'.repeat(start ? start[i] : 0);
      cols.append(el('div', { class: 'bg__col' }, stack, el('span', { class: 'bg__label' }, r.emoji, el('small', {}, r.label)), s.root));
      if (start && start[i] === r.count) { s.lock(); ok += 1; }
    });
    wrap.append(axis, cols);
    return wrap;
  }

  function renderLearn(box, done) {
    const d = sample(TOYS.slice(0, 3), 1, 8);
    const v = blockGraphHTML(d);
    const r0 = pick(d);
    const most = d.reduce((a, b) => (b.count > a.count ? b : a));
    say('A block graph shows data with blocks. Read the number at the top of each column!');
    quizRounds(box, done, [
      { icon: '📊', question: `How many ${r0.label}?`, instruction: 'Look at the top of the column.', visual: v, options: optionsFor(r0.count, [r0.count + 1, r0.count - 1, r0.count + 2]), answer: r0.count, hint: 'Almost! Read across to the numbers.', explain: `${r0.count} ${r0.label}` },
      { icon: '🏆', question: 'Which toy is the most popular?', instruction: 'Tallest column.', visual: v, options: d.map(lab), answer: most.label, hint: 'Almost!', explain: most.label },
      { icon: '➕', question: 'How many toys altogether?', instruction: 'Add every column.', visual: v, options: optionsFor(d.reduce((a, b) => a + b.count, 0), [d.reduce((a, b) => a + b.count, 0) + 1, most.count, d.reduce((a, b) => a + b.count, 0) - 2]), answer: d.reduce((a, b) => a + b.count, 0), hint: 'Almost!', explain: String(d.reduce((a, b) => a + b.count, 0)) }
    ], { label: 'Question' });
  }

  function renderBuild(box, done) {
    box.innerHTML = '';
    const d = sample(WEATHER, 1, 7);
    say('Here is the weather for two weeks. Build the block graph to match the table!');
    const table = el('table', { class: 'data-table' }, el('thead', {}, el('tr', {}, el('th', {}, 'Weather'), el('th', {}, 'Days'))),
      el('tbody', {}, d.map(r => el('tr', {}, el('td', {}, `${r.emoji} ${r.label}`), el('td', {}, String(r.count))))));
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    box.append(instruction('👆 Use + and − to build each column.'), table,
      builder(d, { onAll: () => { MA.launchConfetti(35); say(`Your graph matches the table! ${pick(PRAISE)}`); result.append(el('p', { class: 'round-result__text' }, '🎮 Graph built!')); done(); } }), result);
  }

  function renderPractise(box, done) {
    const d = sample(TOYS, 1, 8);
    const s = [...d].sort((a, b) => b.count - a.count);
    const v = blockGraphHTML(d);
    say('Use the graph to answer.');
    quizRounds(box, done, [
      { icon: '🔽', question: 'Which toy is the least popular?', instruction: 'Shortest column.', visual: v, options: d.map(lab), answer: s[3].label, hint: 'Almost!', explain: s[3].label },
      { icon: '➖', question: `How many more ${s[0].label} than ${s[3].label}?`, instruction: 'Compare the heights.', visual: v, options: optionsFor(s[0].count - s[3].count, [s[0].count, s[3].count, s[0].count + s[3].count]), answer: s[0].count - s[3].count, hint: 'Almost! Count the extra blocks.', explain: `${s[0].count} − ${s[3].count} = ${s[0].count - s[3].count}` },
      { icon: '🔢', question: `Which toy has exactly ${s[1].count}?`, instruction: 'Read the scale.', visual: v, options: d.map(lab), answer: s[1].label, hint: 'Almost!', explain: s[1].label }
    ], { label: 'Question', finalText: '🧩 Graph reader!' });
  }

  function renderThink(box, done) {
    const st = shuffle([
      () => ({ text: '📊<small>The tallest column shows the most.</small>', truth: true, explain: 'True!' }),
      () => ({ text: `${blockGraphHTML([{ emoji: '🚗', label: 'cars', count: 3 }, { emoji: '🧸', label: 'teddies', count: 6 }], 6)}<small>There are more cars than teddies.</small>`, truth: false, explain: 'Teddies have 6, cars have 3.' }),
      () => ({ text: '🧱<small>Each block stands for one.</small>', truth: true, explain: 'True! In our block graphs, 1 block = 1.' }),
      () => ({ text: `${blockGraphHTML([{ emoji: '☀️', label: 'sunny', count: 4 }], 5)}<small>There were 5 sunny days.</small>`, truth: false, explain: 'Count the blocks: 4.', fix: { question: 'How many sunny days?', options: [4, 5, 3], answer: 4 } })
    ]);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      say('Look at the graphs. True or false?');
      box.append(el('p', { class: 'round-label' }, `Question ${r + 1} of 4`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, st[r](), res => nextOrDone(res, r === 3, 'Next ▶', () => { r += 1; next(); }, done));
    }
  }

  function renderFix(box, done) {
    box.innerHTML = '';
    const d = sample(TOYS.slice(0, 3), 2, 7);
    const bad = Math.floor(Math.random() * 3);
    const start = d.map((r, i) => (i === bad ? (r.count >= 7 ? r.count - 2 : r.count + 1) : r.count));
    let found = false;
    say('Oh no! Milo made a mistake in his graph. Compare it with the table. Which column is wrong?');
    const table = el('table', { class: 'data-table' }, el('thead', {}, el('tr', {}, el('th', {}, 'Toy'), el('th', {}, 'Number'))),
      el('tbody', {}, d.map(r => el('tr', {}, el('td', {}, `${r.emoji} ${r.label}`), el('td', {}, String(r.count))))));
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    const pick1 = el('div', { class: 'fix-options', role: 'group', 'aria-label': 'Which column is wrong?' });
    d.forEach((r, i) => {
      const b = button(`${r.emoji} ${r.label}`, 'pattern-btn', () => {
        if (found) return;
        if (i === bad) {
          found = true;
          b.classList.add('is-right');
          say(`Yes! The ${r.label} column is wrong. Fix it with + and −.`);
          box.append(builder(d, { start, onAll: () => { MA.launchConfetti(35); say(`Fixed! ${pick(PRAISE)}`); result.append(el('p', { class: 'round-result__text' }, '🚀 Graph fixed!')); done(); } }), result);
        } else { b.classList.add('is-wrong'); b.disabled = true; say('That column matches the table. Look again!'); }
      }, { 'data-correct': i === bad ? 'yes' : 'no' });
      pick1.append(b);
    });
    box.append(table, el('div', { html: blockGraphHTML(d.map((r, i) => ({ ...r, count: start[i] }))) }), instruction('👆 Tap the column that is wrong.'), pick1);
  }

  function qRead() { const d = sample(WEATHER, 1, 8); const r = pick(d); return { icon: '📊', question: `How many ${r.label} days?`, instruction: 'Top of the column.', visual: blockGraphHTML(d), options: optionsFor(r.count, [r.count + 1, r.count - 1, r.count + 2]), answer: r.count, hint: 'Almost!', explain: String(r.count) }; }
  function qMost() { const d = sample(TOYS.slice(0, 3), 1, 8); const m = d.reduce((a, b) => (b.count > a.count ? b : a)); return { icon: '🏆', question: 'Which is the most?', instruction: 'Tallest column.', visual: blockGraphHTML(d), options: d.map(lab), answer: m.label, hint: 'Almost!', explain: m.label }; }
  function qLeast() { const d = sample(TOYS.slice(1, 4), 1, 8); const m = d.reduce((a, b) => (b.count < a.count ? b : a)); return { icon: '🔽', question: 'Which is the least?', instruction: 'Shortest column.', visual: blockGraphHTML(d), options: d.map(lab), answer: m.label, hint: 'Almost!', explain: m.label }; }
  function qTotal() { const d = sample(WEATHER, 1, 6); const t = d.reduce((a, b) => a + b.count, 0); return { icon: '➕', question: 'How many days altogether?', instruction: 'Add them.', visual: blockGraphHTML(d), options: optionsFor(t, [t + 1, t - 1, t + 3]), answer: t, hint: 'Almost!', explain: String(t) }; }
  function qWhat() { return { icon: '🤔', question: 'What does each block show in a block graph?', instruction: 'Think.', options: shuffle(['one thing', 'ten things', 'nothing']).map(v => ({ value: v, label: v })), answer: 'one thing', hint: 'Almost!', explain: 'Each block = 1.' }; }

  function renderMaster(box, done) { K.runMaster(box, done, { makeQuestions: () => [qRead(), qMost(), qLeast(), qTotal(), qWhat()], moduleId: MODULE_ID, badgeId: 'graph-genius', title: 'Graph Genius' }); }
  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
