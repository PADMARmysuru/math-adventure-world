/* ==============================================================
   🖼️ Data Park → Pictograms                 data-park/pictograms.js
   🌱 Learn: read a pictogram · 🎮 Play: build a pictogram · 🧩 Practise: compare
   🧠 Think · 🚀 Challenge: when 1 picture = 2 · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const P = window.Park;
  if (!MA || !K || !P) return;
  const { pick, shuffle, el, instruction, say, nextOrDone, quizRounds, makeSetter, optionsFor, PRAISE } = K;
  const { pictogramHTML, sample } = P;
  const MODULE_ID = 'data-park/pictograms';
  const FRUIT = [['🍎', 'apple'], ['🍌', 'banana'], ['🍓', 'strawberry'], ['🍇', 'grapes']];
  const PETS = [['🐶', 'dog'], ['🐱', 'cat'], ['🐰', 'rabbit']];
  const lab = r => ({ value: r.label, label: `${r.emoji} ${r.label}` });

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Read a pictogram', render: renderLearn },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Build a pictogram', render: renderBuild },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Compare the rows', render: renderCompare },
    { id: 'think', icon: '🧠', label: 'Think', title: 'True or false?', render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: '1 picture = 2', render: renderKey2 },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Picture Pro', render: renderMaster }
  ];

  function renderLearn(box, done) {
    const d = sample(FRUIT.slice(0, 3), 2, 7);
    const v = pictogramHTML(d);
    const r0 = pick(d);
    const most = d.reduce((a, b) => (b.count > a.count ? b : a));
    say('A pictogram uses pictures to show data. Each picture stands for 1 child’s favourite fruit.');
    quizRounds(box, done, [
      { icon: '🖼️', question: `How many children chose ${r0.label}?`, instruction: 'Count the pictures in that row.', visual: v, options: optionsFor(r0.count, [r0.count + 1, r0.count - 1, r0.count + 2]), answer: r0.count, hint: 'Almost! Count carefully along the row.', explain: `${r0.count} children chose ${r0.label}.` },
      { icon: '🏆', question: 'Which fruit is the favourite?', instruction: 'The longest row.', visual: v, options: d.map(lab), answer: most.label, hint: 'Almost! Most pictures wins.', explain: `${most.label} has the most.` },
      { icon: '➕', question: 'How many children voted altogether?', instruction: 'Add all the rows.', visual: v, options: optionsFor(d.reduce((a, b) => a + b.count, 0), [d.reduce((a, b) => a + b.count, 0) + 1, d.length, most.count]), answer: d.reduce((a, b) => a + b.count, 0), hint: 'Almost! Add every row.', explain: `${d.reduce((a, b) => a + b.count, 0)} children.` }
    ], { label: 'Question' });
  }

  function renderBuild(box, done) {
    box.innerHTML = '';
    const d = sample(PETS, 1, 6);
    let built = 0;
    say('Here is the survey list. Build the pictogram: add one picture for each pet!');
    const table = el('table', { class: 'data-table' }, el('thead', {}, el('tr', {}, el('th', {}, 'Pet'), el('th', {}, 'How many'))),
      el('tbody', {}, d.map(r => el('tr', {}, el('td', {}, `${r.emoji} ${r.label}`), el('td', {}, String(r.count))))));
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    const picto = el('div', { class: 'picto picto--build' });
    d.forEach(r => {
      const pics = el('span', { class: 'picto__pics' });
      const s = makeSetter({
        value: 0, min: 0, max: 9, target: r.count,
        steps: [{ d: -1, label: '−', aria: `Remove a ${r.label}` }, { d: 1, label: `+ ${r.emoji}`, aria: `Add a ${r.label}` }],
        onChange: v => {
          pics.innerHTML = `<span>${r.emoji}</span>`.repeat(v);
          if (v === r.count && !s.root.classList.contains('is-locked')) {
            s.lock();
            built += 1;
            say(`${r.label} row done!`);
            if (built === d.length) { MA.launchConfetti(35); say(`A perfect pictogram! ${pick(PRAISE)}`); result.append(el('p', { class: 'round-result__text' }, '🎮 Pictogram complete!')); done(); }
          }
        }
      });
      picto.append(el('div', { class: 'picto__row' }, el('span', { class: 'picto__label' }, r.label), pics, s.root));
    });
    box.append(instruction('👆 Add pictures to match the table.'), table, picto, result);
  }

  function renderCompare(box, done) {
    const d = sample(FRUIT, 2, 8);
    const sorted = [...d].sort((a, b) => b.count - a.count);
    const [a, b] = [sorted[0], sorted[sorted.length - 1]];
    const v = pictogramHTML(d);
    say('Compare the rows!');
    quizRounds(box, done, [
      { icon: '➖', question: `How many more chose ${a.label} than ${b.label}?`, instruction: 'Find the difference.', visual: v, options: optionsFor(a.count - b.count, [a.count, a.count + b.count, a.count - b.count + 1]), answer: a.count - b.count, hint: `Almost! ${a.count} − ${b.count}`, explain: `${a.count} − ${b.count} = ${a.count - b.count}` },
      { icon: '🔽', question: 'Which fruit is the least popular?', instruction: 'Shortest row.', visual: v, options: d.map(lab), answer: b.label, hint: 'Almost!', explain: `${b.label} has the fewest.` },
      { icon: '🔢', question: `How many chose ${sorted[1].label} and ${sorted[2].label} together?`, instruction: 'Add the two rows.', visual: v, options: optionsFor(sorted[1].count + sorted[2].count, [sorted[1].count, sorted[1].count + sorted[2].count + 1, sorted[2].count]), answer: sorted[1].count + sorted[2].count, hint: 'Almost! Add them.', explain: `${sorted[1].count} + ${sorted[2].count} = ${sorted[1].count + sorted[2].count}` }
    ], { label: 'Question', finalText: '🧩 Comparing pro!' });
  }

  function renderThink(box, done) {
    const st = shuffle([
      () => ({ text: '🖼️<small>In a pictogram, pictures stand for data.</small>', truth: true, explain: 'True! Count the pictures to read it.' }),
      () => ({ text: `${pictogramHTML([{ emoji: '🍎', label: 'apple', count: 3 }, { emoji: '🍌', label: 'banana', count: 5 }])}<small>More children chose apple.</small>`, truth: false, explain: 'Banana has 5, apple has 3. Banana wins!' }),
      () => ({ text: '🔑<small>The key tells you what each picture is worth.</small>', truth: true, explain: 'True! Always check the key.' }),
      () => ({ text: `${pictogramHTML([{ emoji: '🐶', label: 'dog', count: 4 }])}<small>4 children chose dog.</small>`, truth: true, explain: '4 pictures = 4 children.' })
    ]);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      say('Picture puzzles! True or false?');
      box.append(el('p', { class: 'round-label' }, `Question ${r + 1} of 4`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, st[r](), res => nextOrDone(res, r === 3, 'Next ▶', () => { r += 1; next(); }, done));
    }
  }

  function renderKey2(box, done) {
    const d = [2, 4, 6, 8].sort(() => Math.random() - 0.5).slice(0, 3).map((c, i) => ({ emoji: '⭐', label: ['Class A', 'Class B', 'Class C'][i], count: c }));
    const v = pictogramHTML(d, { key: 2, pic: '⭐' });
    const r0 = d[0];
    say('Careful! In this pictogram, each ⭐ stands for 2 stars won. Count in 2s!');
    quizRounds(box, done, [
      { icon: '⭐', question: `How many stars did ${r0.label} win?`, instruction: 'Each ⭐ = 2.', visual: v, options: optionsFor(r0.count, [r0.count / 2, r0.count + 2, r0.count + 1]), answer: r0.count, hint: 'Almost! Count the pictures in 2s.', explain: `${r0.count / 2} pictures × 2 = ${r0.count}` },
      { icon: '🏆', question: 'Which class won the most stars?', instruction: 'Longest row.', visual: v, options: d.map(r => ({ value: r.label, label: r.label })), answer: d.reduce((a, b) => (b.count > a.count ? b : a)).label, hint: 'Almost!', explain: 'The longest row wins.' },
      { icon: '🔢', question: 'How many pictures would show 10 stars?', instruction: 'Each picture = 2.', options: optionsFor(5, [10, 2, 8]), answer: 5, hint: 'Almost! 2, 4, 6, 8, 10…', explain: '5 pictures' }
    ], { label: 'Question', finalText: '🚀 Key master!' });
  }

  function qCount() { const d = sample(PETS, 2, 7); const r = pick(d); return { icon: '🖼️', question: `How many chose ${r.label}?`, instruction: 'Count the pictures.', visual: pictogramHTML(d), options: optionsFor(r.count, [r.count + 1, r.count - 1, r.count + 2]), answer: r.count, hint: 'Almost!', explain: String(r.count) }; }
  function qMost() { const d = sample(FRUIT.slice(0, 3), 2, 7); const m = d.reduce((a, b) => (b.count > a.count ? b : a)); return { icon: '🏆', question: 'Which is the most popular?', instruction: 'Longest row.', visual: pictogramHTML(d), options: d.map(lab), answer: m.label, hint: 'Almost!', explain: m.label }; }
  function qKey() { return { icon: '🔑', question: 'If each picture means 2, how much do 3 pictures show?', instruction: 'Count in 2s.', options: optionsFor(6, [3, 5, 2]), answer: 6, hint: 'Almost! 2, 4, 6.', explain: '6' }; }
  function qDiff() { const d = sample(PETS.slice(0, 2), 2, 8); const [a, b] = [...d].sort((x, y) => y.count - x.count); return { icon: '➖', question: `How many more ${a.label}s than ${b.label}s?`, instruction: 'Compare.', visual: pictogramHTML(d), options: optionsFor(a.count - b.count, [a.count, b.count, a.count + b.count]), answer: a.count - b.count, hint: 'Almost! Take away.', explain: String(a.count - b.count) }; }
  function qWhat() { return { icon: '🤔', question: 'What does a pictogram use to show data?', instruction: 'Think.', options: shuffle(['pictures', 'tally marks', 'clocks']).map(v => ({ value: v, label: v })), answer: 'pictures', hint: 'Almost! Picto-gram.', explain: 'Pictures!' }; }

  function renderMaster(box, done) { K.runMaster(box, done, { makeQuestions: () => [qCount(), qMost(), qKey(), qDiff(), qWhat()], moduleId: MODULE_ID, badgeId: 'picture-pro', title: 'Picture Pro' }); }
  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
