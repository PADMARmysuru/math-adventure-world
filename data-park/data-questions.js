/* ==============================================================
   ❓ Data Park → Data Questions           data-park/data-questions.js
   🌱 Learn: good questions for data · 🎮 Play: spinner experiment
   🧩 Practise: certain, possible, impossible · 🧠 Think · 🚀 Challenge: read a table · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const P = window.Park;
  if (!MA || !K || !P) return;
  const { $, pick, shuffle, el, button, instruction, say, nextOrDone, sortZones, quizRounds, optionsFor, wait, PRAISE } = K;
  const { blockGraphHTML, sample } = P;
  const MODULE_ID = 'data-park/data-questions';

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Asking good questions', render: renderLearn },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Spinner experiment', render: renderSpinner },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Certain or impossible?', render: renderChance },
    { id: 'think', icon: '🧠', label: 'Think', title: 'True or false?', render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Read the table', render: renderTable },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Data Detective', render: renderMaster }
  ];

  function renderLearn(box, done) {
    const d = sample([['🍦', 'ice cream'], ['🍰', 'cake'], ['🍪', 'cookies']], 2, 8);
    const v = blockGraphHTML(d);
    say('Data helps us answer questions. But only questions about what was collected!');
    quizRounds(box, done, [
      { icon: '❓', question: 'Which question can this graph answer?', instruction: 'What does the graph show?', visual: v, options: shuffle(['Which treat is most popular?', 'What time is lunch?', 'How tall is Milo?']).map(x => ({ value: x, label: x })), answer: 'Which treat is most popular?', hint: 'Almost! The graph is about treats.', explain: 'The graph shows favourite treats.' },
      { icon: '📝', question: 'You want to know your class’s favourite colour. What should you do?', instruction: 'How do we collect data?', options: shuffle(['ask everyone and make a tally', 'guess', 'count the windows']).map(x => ({ value: x, label: x })), answer: 'ask everyone and make a tally', hint: 'Almost! Ask and record.', explain: 'Ask everyone, then record the answers.' },
      { icon: '🔍', question: 'Which question does NOT match this graph?', instruction: 'Careful!', visual: v, options: shuffle(['How many like cake?', 'Which treat is least popular?', 'What is the weather today?']).map(x => ({ value: x, label: x })), answer: 'What is the weather today?', hint: 'Almost! Which one is not about treats?', explain: 'The graph says nothing about weather.' }
    ], { label: 'Question' });
  }

  function renderSpinner(box, done) {
    box.innerHTML = '';
    // 4 equal parts: 2 red, 1 blue, 1 yellow → red is most likely
    const parts = ['🔴', '🔴', '🔵', '🟡'];
    const counts = { '🔴': 0, '🔵': 0, '🟡': 0 };
    let spins = 0;
    let predicted = false;
    say('This spinner has 4 equal parts: 2 red, 1 blue and 1 yellow. Which colour do you think will win most?');
    const spinner = el('div', { class: 'spinner', role: 'img', 'aria-label': 'Spinner: red, red, blue, yellow' }, el('span', { class: 'spinner__arrow' }, '⬆️'));
    const graph = el('div', { class: 'spin-graph', 'aria-live': 'polite' });
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    const draw = () => { graph.innerHTML = Object.entries(counts).map(([c, n]) => `<div class="spin-graph__row"><span>${c}</span><span class="spin-graph__bar" style="--n:${n}"></span><strong>${n}</strong></div>`).join(''); };
    draw();
    const guess = el('div', { class: 'fix-options', role: 'group', 'aria-label': 'Prediction' });
    ['🔴', '🔵', '🟡'].forEach(c => guess.append(button(`${c} will win`, 'pattern-btn', () => {
      if (predicted) return;
      predicted = true;
      $$('button', guess).forEach(b => { b.disabled = true; });
      say(c === '🔴' ? 'Good thinking! Red has 2 parts, so it is more likely. Now spin 10 times!' : 'Let’s test it! Spin 10 times and see.');
      spinBtn.disabled = false;
    }, { 'data-correct': c === '🔴' ? 'yes' : 'no' })));
    const spinBtn = button('🌀 Spin!', 'btn btn--big', async () => {
      if (spins >= 10) return;
      spinBtn.disabled = true;
      const k = Math.floor(Math.random() * 4);
      spinner.style.setProperty('--turn', `${720 + k * 90 + 45}deg`);
      spinner.classList.remove('is-spinning'); void spinner.offsetWidth; spinner.classList.add('is-spinning');
      await wait(700);
      counts[parts[k]] += 1;
      spins += 1;
      draw();
      if (spins < 10) { spinBtn.disabled = false; spinBtn.textContent = `🌀 Spin! (${spins}/10)`; return; }
      spinBtn.textContent = '✅ 10 spins done';
      MA.launchConfetti(30);
      const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      say(winner === '🔴' ? 'Red won, just as we predicted! It had more of the spinner.' : `This time ${winner} won! Red is MORE LIKELY, but anything is POSSIBLE.`);
      result.append(el('p', { class: 'round-result__text' }, `🎮 ${Object.entries(counts).map(([c, n]) => `${c} ${n}`).join('  ·  ')}`));
      done();
    }, { disabled: true });
    function $$(s, r) { return Array.from(r.querySelectorAll(s)); }
    box.append(spinner, instruction('👆 First predict, then spin 10 times.'), guess, spinBtn, graph, result);
  }

  function renderChance(box, done) {
    box.innerHTML = '';
    say('Certain means it WILL happen. Impossible means it CANNOT happen. Possible means it might!');
    const items = [
      ['🌙', 'Night will come after day', 'certain'], ['📅', 'Tomorrow is another day', 'certain'],
      ['🐘', 'An elephant will fly to school', 'impossible'], ['🎲', 'You roll a 7 on a 1–6 dice', 'impossible'],
      ['🌧️', 'It will rain tomorrow', 'possible'], ['🎁', 'You get a present today', 'possible']
    ];
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    const { bank, zones } = sortZones({
      zones: [{ id: 'certain', label: '✅ Certain' }, { id: 'possible', label: '🤔 Possible' }, { id: 'impossible', label: '❌ Impossible' }],
      items: items.map(([e, t, c]) => ({ face: el('span', { class: 'chance-card' }, el('span', {}, e), el('small', {}, t)), cat: c, label: t })),
      hint: (item, zone) => `“${item.label}”: will it definitely happen, might it happen, or can it never happen?`,
      onComplete: () => { MA.launchConfetti(30); say(pick(PRAISE)); result.append(el('p', { class: 'round-result__text' }, '🧩 Chance champion!')); done(); }
    });
    box.append(instruction('✋ Drag each card to certain, possible or impossible.'), bank, zones, result);
  }

  function renderThink(box, done) {
    const st = shuffle([
      () => ({ text: '🎲<small>Rolling a 3 on a normal dice is possible.</small>', truth: true, explain: 'True! A dice has 1 to 6.' }),
      () => ({ text: '☀️<small>The sun rising tomorrow is impossible.</small>', truth: false, explain: 'It is certain! The sun rises every day.', fix: { question: 'The sun rising tomorrow is…', options: ['certain', 'possible', 'impossible'], answer: 'certain' } }),
      () => ({ text: '📊<small>A graph about pets can tell you everyone’s favourite food.</small>', truth: false, explain: 'It only tells you about pets!' }),
      () => ({ text: '📝<small>Asking questions and recording answers is collecting data.</small>', truth: true, explain: 'True! That is a survey.' })
    ]);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      say('Data and chance. True or false?');
      box.append(el('p', { class: 'round-label' }, `Question ${r + 1} of 4`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, st[r](), res => nextOrDone(res, r === 3, 'Next ▶', () => { r += 1; next(); }, done));
    }
  }

  function renderTable(box, done) {
    const fruit = ['🍎 Apple', '🍌 Banana', '🍇 Grapes'];
    const a = fruit.map(() => 2 + Math.floor(Math.random() * 8));
    const b = fruit.map(() => 2 + Math.floor(Math.random() * 8));
    const table = `<table class="data-table"><thead><tr><th>Fruit</th><th>Class 1</th><th>Class 2</th></tr></thead><tbody>${fruit.map((f, i) => `<tr><td>${f}</td><td>${a[i]}</td><td>${b[i]}</td></tr>`).join('')}</tbody></table>`;
    const i0 = Math.floor(Math.random() * 3);
    say('Two classes voted for their favourite fruit. Read across the rows and down the columns!');
    quizRounds(box, done, [
      { icon: '📋', question: `How many in Class 2 chose ${fruit[i0]}?`, instruction: 'Find the row, then the column.', visual: table, options: optionsFor(b[i0], [a[i0], b[i0] + 1, b[i0] - 1]), answer: b[i0], hint: 'Almost! Row first, then go across to Class 2.', explain: String(b[i0]) },
      { icon: '➕', question: `How many chose ${fruit[i0]} in both classes?`, instruction: 'Add across the row.', visual: table, options: optionsFor(a[i0] + b[i0], [a[i0], b[i0], a[i0] + b[i0] + 1]), answer: a[i0] + b[i0], hint: `Almost! ${a[i0]} + ${b[i0]}`, explain: String(a[i0] + b[i0]) },
      { icon: '🏫', question: 'How many children voted in Class 1?', instruction: 'Add down the column.', visual: table, options: optionsFor(a.reduce((x, y) => x + y, 0), [a.reduce((x, y) => x + y, 0) + 1, b.reduce((x, y) => x + y, 0), a[0]]), answer: a.reduce((x, y) => x + y, 0), hint: 'Almost! Add the whole Class 1 column.', explain: String(a.reduce((x, y) => x + y, 0)) }
    ], { label: 'Question', finalText: '🚀 Table expert!' });
  }

  function qCertain() { return { icon: '✅', question: '“Tuesday comes after Monday.” This is…', instruction: 'Think.', options: ['certain', 'possible', 'impossible'].map(v => ({ value: v, label: v })), answer: 'certain', hint: 'Almost! Does it always happen?', explain: 'Certain!' }; }
  function qImpossible() { return { icon: '❌', question: '“A cat will drive a bus.” This is…', instruction: 'Think.', options: ['certain', 'possible', 'impossible'].map(v => ({ value: v, label: v })), answer: 'impossible', hint: 'Almost!', explain: 'Impossible!' }; }
  function qPossible() { return { icon: '🤔', question: '“It will be sunny tomorrow.” This is…', instruction: 'Think.', options: ['certain', 'possible', 'impossible'].map(v => ({ value: v, label: v })), answer: 'possible', hint: 'Almost! It might or might not.', explain: 'Possible!' }; }
  function qLikely() { return { icon: '🌀', question: 'A spinner has 3 red parts and 1 blue part. Which is more likely?', instruction: 'More parts = more likely.', options: [{ value: 'red', label: '🔴 red' }, { value: 'blue', label: '🔵 blue' }], answer: 'red', hint: 'Almost!', explain: 'Red has more parts.' }; }
  function qAsk() { return { icon: '📝', question: 'How can you find out the class’s favourite pet?', instruction: 'Collect data.', options: shuffle(['ask everyone and tally', 'guess', 'ask one person']).map(v => ({ value: v, label: v })), answer: 'ask everyone and tally', hint: 'Almost!', explain: 'Ask everyone and record it.' }; }

  function renderMaster(box, done) { K.runMaster(box, done, { makeQuestions: () => [qCertain(), qImpossible(), qPossible(), qLikely(), qAsk()], moduleId: MODULE_ID, badgeId: 'data-detective', title: 'Data Detective' }); }
  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
