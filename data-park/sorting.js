/* ==============================================================
   🗂️ Data Park → Sorting                        data-park/sorting.js
   🌱 Learn: sort by one rule · 🎮 Play: Venn diagram · 🧩 Practise: Carroll diagram
   🧠 Think · 🚀 Challenge: what's my rule? · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  if (!MA || !K) return;
  const { rnd, pick, shuffle, el, button, instruction, say, nextOrDone, sortZones, quizRounds, PRAISE } = K;
  const MODULE_ID = 'data-park/sorting';
  const THINGS = [
    ['🍎', 'apple', { red: true, fruit: true }], ['🍓', 'strawberry', { red: true, fruit: true }], ['🍒', 'cherries', { red: true, fruit: true }],
    ['🚒', 'fire engine', { red: true, fruit: false }], ['🎈', 'balloon', { red: true, fruit: false }],
    ['🍌', 'banana', { red: false, fruit: true }], ['🍇', 'grapes', { red: false, fruit: true }],
    ['⚽', 'ball', { red: false, fruit: false }], ['🚙', 'jeep', { red: false, fruit: false }]
  ];

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Sort it out', render: renderLearn },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Venn diagram', render: renderVenn },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Carroll diagram', render: renderCarroll },
    { id: 'think', icon: '🧠', label: 'Think', title: 'True or false?', render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: "What's my rule?", render: renderRule },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Sorting Star', render: renderMaster }
  ];

  function renderLearn(box, done) {
    const rounds = [
      { zones: [{ id: 'yes', label: '🔴 Red' }, { id: 'no', label: '⚪ Not red' }], test: p => p.red, intro: 'Sorting means putting things in groups. Sort by colour: red or not red?' },
      { zones: [{ id: 'yes', label: '🍽️ Fruit' }, { id: 'no', label: '🧸 Not fruit' }], test: p => p.fruit, intro: 'Same things, NEW rule! Is it a fruit?' }
    ];
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      const cfg = rounds[r];
      say(cfg.intro);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { bank, zones } = sortZones({
        zones: cfg.zones, items: THINGS.map(([e, n, p]) => ({ face: e, cat: cfg.test(p) ? 'yes' : 'no', label: n })),
        hint: () => 'Look carefully. Does it fit the rule?',
        onComplete: () => { MA.launchConfetti(25); say(r === 0 ? 'Sorted by colour!' : 'Same things, different groups. The rule matters!'); nextOrDone(result, r === 1, 'New rule ▶', () => { r += 1; next(); }, done); }
      });
      box.append(el('p', { class: 'round-label' }, `Rule ${r + 1} of 2`), instruction('✋ Drag each thing into a group.'), bank, zones, result);
    }
  }

  function renderVenn(box, done) {
    box.innerHTML = '';
    say('A Venn diagram has two circles. Things that fit BOTH rules go in the middle where they overlap!');
    const cat = p => (p.red && p.fruit ? 'both' : p.red ? 'red' : p.fruit ? 'fruit' : 'neither');
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    const { bank, zones } = sortZones({
      zones: [{ id: 'red', label: '🔴 Red only' }, { id: 'both', label: '🔴🍽️ Red AND fruit' }, { id: 'fruit', label: '🍽️ Fruit only' }, { id: 'neither', label: '❌ Neither' }],
      items: THINGS.map(([e, n, p]) => ({ face: e, cat: cat(p), label: n })),
      hint: item => `Ask two questions: is the ${item.label} red? Is it a fruit?`,
      onComplete: () => { MA.launchConfetti(35); say(`Venn diagram done! ${pick(PRAISE)}`); result.append(el('p', { class: 'round-result__text' }, '🎮 The middle is for BOTH!')); done(); }
    });
    zones.classList.add('venn');
    box.append(instruction('✋ Drag each thing to the right part of the Venn diagram.'), bank, zones, result);
  }

  function renderCarroll(box, done) {
    box.innerHTML = '';
    const nums = shuffle([2, 3, 4, 7, 8, 9, 12, 13, 16, 15, 18, 11]).slice(0, 8);
    say('A Carroll diagram is a grid. Numbers go in by two rules: odd or even, and less than 10 or not!');
    const cat = n => `${n % 2 ? 'odd' : 'even'}-${n < 10 ? 'small' : 'big'}`;
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    const { bank, zones } = sortZones({
      zones: [{ id: 'even-small', label: 'Even · less than 10' }, { id: 'odd-small', label: 'Odd · less than 10' }, { id: 'even-big', label: 'Even · 10 or more' }, { id: 'odd-big', label: 'Odd · 10 or more' }],
      items: nums.map(n => ({ face: String(n), cat: cat(n), label: String(n) })),
      hint: item => `${item.label} is ${Number(item.label) % 2 ? 'odd' : 'even'} and ${Number(item.label) < 10 ? 'less than 10' : '10 or more'}.`,
      onComplete: () => { MA.launchConfetti(35); say(`Carroll diagram done! ${pick(PRAISE)}`); result.append(el('p', { class: 'round-result__text' }, '🧩 Two rules, four boxes!')); done(); }
    });
    zones.classList.add('carroll');
    box.append(instruction('✋ Drag each number into its box.'), bank, zones, result);
  }

  function renderThink(box, done) {
    const st = shuffle([
      () => ({ text: '🍎<small>An apple can go in “red” AND “fruit”.</small>', truth: true, explain: 'True! It fits both rules, so it goes in the middle of a Venn diagram.' }),
      () => ({ text: '🗂️<small>There is only one way to sort a set of things.</small>', truth: false, explain: 'You can sort by colour, shape, size… many rules!' }),
      () => ({ text: '7<small>7 goes in the “even” box.</small>', truth: false, explain: '7 is odd!', fix: { question: '7 is…', options: ['odd', 'even'], answer: 'odd' } }),
      () => ({ text: '⚽<small>A ball goes in “neither” for red and fruit.</small>', truth: true, explain: 'True! It is not red and not a fruit.' })
    ]);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      say('Sorting thinking! True or false?');
      box.append(el('p', { class: 'round-label' }, `Question ${r + 1} of 4`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, st[r](), res => nextOrDone(res, r === 3, 'Next ▶', () => { r += 1; next(); }, done));
    }
  }

  function renderRule(box, done) {
    say('Milo sorted some things. Can you work out his secret rule?');
    const group = (a, b) => `<div class="rule-groups"><div class="rule-group"><strong>✅ In</strong><span>${a}</span></div><div class="rule-group"><strong>❌ Out</strong><span>${b}</span></div></div>`;
    quizRounds(box, done, [
      { icon: '🕵️', question: "What's my rule?", instruction: 'Look at what is IN.', visual: group('🍎 🍓 🚒 🎈', '🍌 ⚽ 🚙'), options: shuffle(['red things', 'fruit', 'toys']).map(v => ({ value: v, label: v })), answer: 'red things', hint: 'Almost! What do all the IN things share?', explain: 'Everything IN is red.' },
      { icon: '🕵️', question: "What's my rule?", instruction: 'Look at the numbers.', visual: group('2 · 6 · 10 · 14', '3 · 7 · 11'), options: shuffle(['even numbers', 'odd numbers', 'numbers less than 5']).map(v => ({ value: v, label: v })), answer: 'even numbers', hint: 'Almost! Make pairs.', explain: 'Even numbers are IN.' },
      { icon: '🕵️', question: "What's my rule?", instruction: 'Count the sides.', visual: group('🔺 triangle · 🔻 triangle', '🟥 square · ⭕ circle'), options: shuffle(['3 sides', '4 sides', 'round']).map(v => ({ value: v, label: v })), answer: '3 sides', hint: 'Almost! Count the sides.', explain: 'Shapes with 3 sides are IN.' }
    ], { label: 'Rule', finalText: '🚀 Rule finder!' });
  }

  function qVenn() { return { icon: '⭕', question: 'In a Venn diagram, where does something go if it fits BOTH rules?', instruction: 'Think about the circles.', options: shuffle(['in the middle', 'outside', 'in one circle only']).map(v => ({ value: v, label: v })), answer: 'in the middle', hint: 'Almost! Where the circles overlap.', explain: 'In the middle overlap.' }; }
  function qOdd() { const n = 2 * rnd(2, 9) + 1; return { icon: '🔢', question: `Where does ${n} go?`, instruction: 'Odd or even?', options: ['odd', 'even'].map(v => ({ value: v, label: v })), answer: 'odd', hint: 'Almost! Look at the ones digit.', explain: `${n} is odd.` }; }
  function qFit() { return { icon: '🍌', question: 'Which group does a banana go in: “red” or “not red”?', instruction: 'Colour!', options: ['red', 'not red'].map(v => ({ value: v, label: v })), answer: 'not red', hint: 'Almost! Bananas are yellow.', explain: 'Not red.' }; }
  function qRule() { return { icon: '🕵️', question: 'IN: 🐶 🐱 🐰  OUT: 🚗 🍎. What is the rule?', instruction: 'What do the IN things share?', options: shuffle(['animals', 'food', 'red things']).map(v => ({ value: v, label: v })), answer: 'animals', hint: 'Almost!', explain: 'Animals are IN.' }; }
  function qCarroll() { return { icon: '🗂️', question: 'Which number is even AND less than 10?', instruction: 'Both rules.', options: shuffle([8, 12, 7]).map(v => ({ value: v, label: String(v) })), answer: 8, hint: 'Almost! Even and small.', explain: '8 is even and less than 10.' }; }

  function renderMaster(box, done) { K.runMaster(box, done, { makeQuestions: () => [qVenn(), qOdd(), qFit(), qRule(), qCarroll()], moduleId: MODULE_ID, badgeId: 'sorting-star', title: 'Sorting Star' }); }
  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
