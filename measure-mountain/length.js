/* ==============================================================
   📏 Measure Mountain → Length            measure-mountain/length.js
   --------------------------------------------------------------
   🌱 Learn      measure with paperclips, then read a centimetre ruler
   🎮 Play       ribbon cutter: cut ribbon to the exact length
   🧩 Practise   drag lengths onto objects on rulers
   🧠 Think      true or false? (start at 0, cm or m?)
   🚀 Challenge  cm or m? then compare lengths
   🏆 Master     five mixed questions → Length Legend badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const M = window.Measure;
  if (!MA || !K || !M) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, pulse, nextOrDone, dragMatch, sortZones, quizRounds, optionsFor, PRAISE } = K;

  const MODULE_ID = 'measure-mountain/length';
  const THINGS = [['pencil', '#FF8A3D'], ['crayon', '#7B61FF'], ['ribbon', '#FF6B8B'], ['straw', '#22B5A6'], ['stick', '#C99A66']];

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'How long is it?',     render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Ribbon cutter',       render: renderRibbon },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Ruler match',         render: renderPractise },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',      render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Centimetres or metres?', render: renderUnits },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Length Legend',       render: renderMaster }
  ];

  /* ------------------------------------------------------------
     🌱 LEARN — paperclips, then a ruler
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const objects = shuffle([3, 4, 5, 6, 7]).slice(0, 3);
    let round = 0;
    clips();

    function clips() {
      box.innerHTML = '';
      const n = objects[round];
      const [name, colour] = THINGS[round % THINGS.length];
      let count = 0;
      let finished = false;
      say(round === 0 ? `How long is the ${name}? Lay paperclips end to end underneath it, with no gaps.` : `Measure the ${name} with paperclips!`);
      const obj = el('div', { class: 'clip-object', style: `--n:${n}; --c:${colour}`, role: 'img', 'aria-label': name });
      const row = el('div', { class: 'clip-row', style: `--n:${n}`, 'aria-live': 'polite' });
      const counter = el('p', { class: 'hop-count', 'aria-live': 'polite' }, 'Paperclips: 0');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const add = button('+ 📎 Add a paperclip', 'btn btn--big', () => {
        if (finished) return;
        count += 1;
        row.append(el('span', { class: 'clip' }, '📎'));
        counter.textContent = `Paperclips: ${count}`;
        if (count === n) {
          finished = true;
          add.disabled = true;
          say(`The ${name} is ${n} paperclips long!`);
          MA.launchConfetti(20);
          result.append(el('p', { class: 'round-result__text' }, `📎 ${n} paperclips long`));
          result.append(el('div', { class: 'stage-actions' }, button(round === objects.length - 1 ? 'Next: use a ruler ▶' : 'Next ▶', 'btn', () => {
            round += 1;
            if (round < objects.length) clips(); else { round = 0; rulerRounds(); }
          })));
        }
      });
      box.append(el('p', { class: 'round-label' }, `Object ${round + 1} of ${objects.length}`),
        instruction('👆 Add paperclips until they reach the end.'),
        el('div', { class: 'clip-stage' }, obj, row), counter, add, result);
    }

    function rulerRounds() {
      const lens = shuffle([5, 7, 8, 9, 11]).slice(0, 2);
      quizRounds(box, done, lens.map((L, i) => () => {
        const [name, colour] = THINGS[(i + 2) % THINGS.length];
        return {
          icon: '📏', question: `How long is the ${name}?`, instruction: 'Start at 0. Read the number at the end.',
          say: i === 0 ? 'Paperclips can be different sizes. A ruler uses centimetres, so everyone gets the same answer! Start at 0.' : 'Read the ruler!',
          visual: `<div class="ruler-wrap">${M.ruler({ cm: 12, length: L, colour, label: name }).outerHTML}</div>`,
          options: shuffle([L - 1, L, L + 1]).map(v => ({ value: v, label: `${v} cm` })),
          answer: L, hint: 'Almost! Find where the end of the object lines up.', explain: `The ${name} is ${L} cm long.`
        };
      }), { label: 'Ruler' });
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — ribbon cutter
     ------------------------------------------------------------ */
  function renderRibbon(box, done) {
    const targets = shuffle([4, 6, 7, 9, 10, 12]).slice(0, 4);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const T = targets[round];
      let len = 0;
      let solved = false;
      say(`A customer wants ${T} cm of ribbon. Pull it out to the right length, then cut!`);
      const wrap = el('div', { class: 'ruler-wrap' });
      const draw = () => { wrap.innerHTML = ''; wrap.append(M.ruler({ cm: 14, length: len, colour: '#FF6B8B', label: 'ribbon' })); readout.textContent = `Ribbon: ${len} cm`; };
      const readout = el('p', { class: 'hop-count', 'aria-live': 'polite' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const change = d => { if (!solved) { len = Math.max(0, Math.min(14, len + d)); draw(); result.innerHTML = ''; } };
      const cut = button('✂️ Cut!', 'btn btn--big', () => {
        result.innerHTML = '';
        if (len === T) {
          solved = true;
          cut.disabled = true;
          MA.launchConfetti(30);
          say(`Perfect! ${T} cm of ribbon. ${pick(PRAISE)}`);
          result.append(el('p', { class: 'round-result__text' }, `🎀 Exactly ${T} cm!`));
          nextOrDone(result, round === targets.length - 1, 'Next customer ▶', () => { round += 1; next(); }, done, '🎮 Ribbon pro!');
        } else {
          say(len > T ? `Too long! That is ${len} cm. We need ${T} cm.` : `Too short! That is ${len} cm. We need ${T} cm.`);
          result.append(el('p', { class: 'round-result__tip' }, `💡 Look at the ruler: the ribbon must end at ${T}.`));
        }
      });
      draw();
      box.append(el('p', { class: 'round-label' }, `Customer ${round + 1} of ${targets.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, 'Cut'), el('strong', {}, `${T} cm`)),
        wrap, readout,
        el('div', { class: 'pv-controls' },
          button('− 1 cm', 'pv-btn pv-btn--minus', () => change(-1), { 'aria-label': 'Shorter by 1 centimetre' }),
          button('+ 1 cm', 'pv-btn pv-btn--ten', () => change(1), { 'aria-label': 'Longer by 1 centimetre' })),
        cut, result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — ruler match
     ------------------------------------------------------------ */
  function renderPractise(box, done) {
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const lens = shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).slice(0, 3);
      const trick = [lens[0] + 1, lens[0] - 1].find(v => v > 0 && !lens.includes(v));
      say('Read each ruler. Drag the right length onto it.');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        cardClass: 'match-grid--wide',
        items: lens.map((L, i) => ({ face: el('div', { class: 'ruler-wrap ruler-wrap--small' }, M.ruler({ cm: 12, length: L, colour: THINGS[i][1], label: THINGS[i][0] })), value: `${L} cm`, label: `${THINGS[i][0]} on a ruler` })),
        tiles: [...lens.map(L => `${L} cm`), `${trick} cm`],
        hint: 'Almost! Find the number where the object ends.',
        onComplete: spare => {
          MA.launchConfetti(25);
          say(spare ? `${pick(PRAISE)} ${spare.dataset.value} was a trick!` : pick(PRAISE));
          nextOrDone(result, round === 1, 'Next round ▶', () => { round += 1; next(); }, done, '🧩 Ruler reader!');
        }
      });
      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of 2`),
        instruction('✋ Drag each length onto its ruler. Or tap a length, then a box.'), cards, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const statements = [
      () => ({ text: '📏<small>Start measuring from the 1 on a ruler.</small>', truth: false, explain: 'Start at 0! Starting at 1 adds an extra centimetre.', fix: { question: 'Where should you start?', options: [0, 1, 2], answer: 0 } }),
      () => ({ text: '🚪<small>A door is about 2 metres tall.</small>', truth: true, explain: 'True! Big things like doors are measured in metres.' }),
      () => ({ text: '✏️<small>A pencil is about 15 metres long.</small>', truth: false, explain: 'A pencil is about 15 CENTIMETRES. 15 metres is longer than a bus!', fix: { question: 'Which unit is right?', options: ['cm', 'm', 'kg'], answer: 'cm' } }),
      () => ({ text: '✋✋<small>A big hand and a small hand measure the same table with different numbers of hand spans.</small>', truth: true, explain: 'True! That is why we use rulers: centimetres are always the same size.' })
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'Think about measuring. True or false?' : pick(['True or false?', 'Think about the units!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — cm or m, then compare
     ------------------------------------------------------------ */
  function renderUnits(box, done) {
    sortRound();
    function sortRound() {
      box.innerHTML = '';
      say('Would you measure it in centimetres (small things) or metres (big things)?');
      const items = [
        ['✏️', 'pencil', 'cm'], ['📕', 'book', 'cm'], ['🥄', 'spoon', 'cm'], ['🖍️', 'crayon', 'cm'],
        ['🚌', 'bus', 'm'], ['🦒', 'giraffe', 'm'], ['🏫', 'school hall', 'm'], ['🏊', 'swimming pool', 'm']
      ];
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { bank, zones } = sortZones({
        zones: [{ id: 'cm', label: '📏 centimetres (cm)' }, { id: 'm', label: '🏃 metres (m)' }],
        items: items.map(([emoji, name, unit]) => ({ face: emoji, cat: unit, label: name })),
        hint: (item, zone) => (zone === 'm' ? `A ${item.label} is small. Use centimetres!` : `A ${item.label} is big. Use metres!`),
        onComplete: () => {
          MA.launchConfetti(30);
          say('Small things in centimetres, big things in metres!');
          result.append(el('div', { class: 'stage-actions' }, button('Next: compare lengths ▶', 'btn', compare)));
        }
      });
      box.append(el('p', { class: 'round-label' }, 'Part 1 of 2'), instruction('✋ Drag each thing to the right unit.'), bank, zones, result);
    }
    function compare() {
      const a = rnd(21, 48); const swapped = (a % 10) * 10 + Math.floor(a / 10);
      const b = swapped > 99 || swapped === a ? a + 7 : swapped;
      const c = rnd(5, 9);
      const d = c + rnd(2, 5);
      quizRounds(box, done, [
        () => ({ icon: '🐍', question: `Which snake is the longest? ${a} cm, ${b} cm or ${a - 10} cm`, instruction: 'Compare the tens first.', options: shuffle([a, b, a - 10]).map(v => ({ value: v, label: `${v} cm` })), answer: Math.max(a, b, a - 10), hint: 'Almost! Which has the most tens?', explain: 'The biggest number is the longest.' }),
        () => ({ icon: '📐', question: `A crayon is ${c} cm. A pencil is ${d} cm. How much longer is the pencil?`, instruction: 'Find the difference.', options: optionsFor(d - c, [d + c, d - c + 1, d]).map(o => ({ ...o, label: `${o.value} cm` })), answer: d - c, hint: `Almost! Count on from ${c} to ${d}.`, explain: `${d} − ${c} = ${d - c} cm longer` })
      ], { label: 'Part 2 · question' });
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  function qRuler() { const L = rnd(3, 11); return { icon: '📏', question: 'How long is it?', instruction: 'Read the ruler from 0.', visual: `<div class="ruler-wrap">${M.ruler({ cm: 12, length: L, colour: '#22B5A6', label: 'straw' }).outerHTML}</div>`, options: shuffle([L, L + 1, L - 1]).map(v => ({ value: v, label: `${v} cm` })), answer: L, hint: 'Almost! Where does it end?', explain: `${L} cm` }; }
  function qUnit() { const [e, n, u] = pick([['🦒', 'a giraffe', 'm'], ['🚌', 'a bus', 'm'], ['🥄', 'a spoon', 'cm'], ['📕', 'a book', 'cm']]); return { icon: e, question: `Would you measure ${n} in cm or m?`, instruction: 'Small or big?', options: [{ value: 'cm', label: 'cm' }, { value: 'm', label: 'm' }], answer: u, hint: 'Almost! Metres are for big things.', explain: `${n} → ${u}` }; }
  function qClips() { const n = rnd(4, 8); return { icon: '📎', question: `A book is ${n} paperclips long. Another book is ${n + 2} paperclips long. Which is longer?`, instruction: 'More paperclips = longer.', options: [{ value: 'first', label: 'the first book' }, { value: 'second', label: 'the second book' }], answer: 'second', hint: 'Almost! Which needs more paperclips?', explain: `${n + 2} paperclips is longer.` }; }
  function qDiff() { const a = rnd(8, 15); const b = rnd(3, 7); return { icon: '➖', question: `${a} cm and ${b} cm. What is the difference?`, instruction: 'Take away or count on.', options: optionsFor(a - b, [a + b, a - b + 1, a - b - 1]).map(o => ({ ...o, label: `${o.value} cm` })), answer: a - b, hint: `Almost! ${a} − ${b} = ?`, explain: `${a} − ${b} = ${a - b} cm` }; }
  function qStart() { return { icon: '0️⃣', question: 'Which number do you line the end of the object up with?', instruction: 'Look at a ruler.', options: optionsFor(0, [1, 10, 5]), answer: 0, hint: 'Almost! Rulers start before the 1.', explain: 'Always start measuring at 0.' }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qRuler(), qUnit(), qClips(), qDiff(), qStart()], moduleId: MODULE_ID, badgeId: 'length-legend', title: 'Length Legend' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
