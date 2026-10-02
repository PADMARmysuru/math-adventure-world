/* ==============================================================
   🥛 Measure Mountain → Capacity           measure-mountain/capacity.js
   --------------------------------------------------------------
   🌱 Learn      full, half full, empty — then fill a jug to half
   🎮 Play       how many cups? pour cups to fill containers, compare
   🧩 Practise   read measuring jugs (litres)
   🧠 Think      true or false? (tall is not always more)
   🚀 Challenge  fill the fish tank with 1, 2 and 5 litre jugs
   🏆 Master     five mixed questions → Capacity Captain badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const M = window.Measure;
  if (!MA || !K || !M) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, pulse, nextOrDone, dragMatch, quizRounds, optionsFor, PRAISE } = K;

  const MODULE_ID = 'measure-mountain/capacity';

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Full, half, empty',   render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'How many cups?',      render: renderCups },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Read the jugs',       render: renderPractise },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',      render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Fill the fish tank',  render: renderTank },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Capacity Captain',    render: renderMaster }
  ];

  const glass = (fill, label) => el('span', { class: 'glass', style: `--fill:${fill}%`, role: 'img', 'aria-label': label }, el('span', { class: 'glass__water' }));
  const glassHTML = fill => `<span class="glass" style="--fill:${fill}%"><span class="glass__water"></span></span>`;

  /* ------------------------------------------------------------
     🌱 LEARN
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const asks = shuffle([['full', 100], ['half full', 50], ['empty', 0], ['nearly empty', 15]]).slice(0, 3);
    let round = 0;
    pickOne();

    function pickOne() {
      box.innerHTML = '';
      const [word, level] = asks[round];
      let solved = false;
      say(round === 0 ? `Capacity is how much a container can hold. Which glass is ${word.toUpperCase()}?` : `Which glass is ${word.toUpperCase()}?`);
      const row = el('div', { class: 'glass-row', role: 'group', 'aria-label': 'Glasses' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      shuffle([[100, 'full'], [50, 'half full'], [0, 'empty'], [15, 'nearly empty']]).forEach(([lvl, name]) => {
        const b = button(glass(lvl, name), 'glass-btn', () => {
          if (solved) return;
          if (lvl === level) {
            solved = true;
            b.classList.add('is-right');
            MA.launchConfetti(20);
            say(`Yes! That glass is ${word}.`);
            result.append(el('p', { class: 'round-result__text' }, `🥛 ${word}!`));
            result.append(el('div', { class: 'stage-actions' }, button(round === asks.length - 1 ? 'Next: fill a jug ▶' : 'Next ▶', 'btn', () => {
              round += 1;
              if (round < asks.length) pickOne(); else halfJug();
            })));
          } else {
            pulse(b, 'is-oops');
            say(`That one is ${name}. Look again!`);
          }
        }, { 'aria-label': `${name} glass`, 'data-level': lvl });
        row.append(b);
      });
      box.append(el('p', { class: 'round-label' }, `Glass ${round + 1} of ${asks.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, 'Find'), el('strong', {}, word)), row, result);
    }

    function halfJug() {
      box.innerHTML = '';
      let level = 0;
      let solved = false;
      say('This jug holds 4 litres when it is full. Fill it to HALF full!');
      const j = M.jug({ litres: 0, max: 4 });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const readout = el('p', { class: 'hop-count', 'aria-live': 'polite' }, '0 litres');
      const change = d => {
        if (solved) return;
        level = Math.max(0, Math.min(4, level + d));
        j.setLevel(level);
        readout.textContent = `${level} litre${level === 1 ? '' : 's'}`;
        if (level === 2) {
          solved = true;
          MA.launchConfetti(25);
          say('Half full! 2 litres is half of 4 litres.');
          result.append(el('p', { class: 'round-result__text' }, '🥛 2 l is half of 4 l'));
          done();
        } else if (level > 2) say('Too much! Half is the middle mark.');
      };
      box.append(el('p', { class: 'round-label' }, 'Fill to half'), el('div', { class: 'frac-stage' }, j), readout,
        el('div', { class: 'pv-controls' },
          button('− 1 l', 'pv-btn pv-btn--minus', () => change(-1), { 'aria-label': 'Pour out 1 litre' }),
          button('+ 1 l', 'pv-btn pv-btn--ten', () => change(1), { 'aria-label': 'Pour in 1 litre' })),
        result);
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — how many cups?
     ------------------------------------------------------------ */
  function renderCups(box, done) {
    const sets = [
      [['🫖', 'teapot', 4], ['🪣', 'bucket', 9], ['🍶', 'bottle', 3]],
      [['🥣', 'bowl', 2], ['🫙', 'jar', 5], ['🛁', 'baby bath', 10]]
    ];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const set = sets[round];
      const counts = set.map(() => 0);
      let filled = 0;
      say('Pour cups of water into each container until it is full. Count the cups!');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const grid = el('div', { class: 'cup-grid' });
      set.forEach(([emoji, name, cap], i) => {
        const bar = el('span', { class: 'cup-bar__fill' });
        const count = el('strong', {}, '0 cups');
        const pour = button('☕ Pour a cup', 'btn', () => {
          if (counts[i] >= cap) return;
          counts[i] += 1;
          bar.style.width = `${(counts[i] / cap) * 100}%`;
          count.textContent = `${counts[i]} cup${counts[i] === 1 ? '' : 's'}`;
          if (counts[i] === cap) {
            pour.disabled = true;
            pour.textContent = '✅ Full!';
            filled += 1;
            say(`The ${name} is full. It holds ${cap} cups.`);
            if (filled === set.length) ask();
          }
        }, { 'aria-label': `Pour a cup into the ${name}`, 'data-pour': i });
        grid.append(el('div', { class: 'cup-card' }, el('span', { class: 'cup-card__emoji', 'aria-hidden': 'true' }, emoji), el('p', { class: 'cup-card__name' }, name),
          el('span', { class: 'cup-bar', 'aria-hidden': 'true' }, bar), count, pour));
      });
      function ask() {
        const most = set.reduce((a, b) => (b[2] > a[2] ? b : a));
        const group = el('div', { class: 'fix-options', role: 'group', 'aria-label': 'Which holds the most?' });
        say('Which one holds the MOST?');
        set.forEach(([emoji, name]) => {
          const b = button(`${emoji} ${name}`, 'pattern-btn', () => {
            if (name === most[1]) {
              $$('button', group).forEach(x => { x.disabled = true; });
              b.classList.add('is-right');
              MA.launchConfetti(30);
              say(`The ${name} holds the most: ${most[2]} cups!`);
              nextOrDone(result, round === sets.length - 1, 'More containers ▶', () => { round += 1; next(); }, done, '🎮 Cup counter!');
            } else {
              b.classList.add('is-wrong');
              b.disabled = true;
              say('Look at the number of cups. Which is biggest?');
            }
          });
          group.append(b);
        });
        result.append(el('p', { class: 'fix-q' }, '🏆 Which holds the most?'), group);
      }
      box.append(el('p', { class: 'round-label' }, `Set ${round + 1} of ${sets.length}`), instruction('👆 Pour until each one is full.'), grid, result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — read the jugs
     ------------------------------------------------------------ */
  function renderPractise(box, done) {
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const vals = shuffle([1, 2, 3, 4, 5]).slice(0, 3);
      const trick = [1, 2, 3, 4, 5].find(v => !vals.includes(v));
      say('How much water is in each jug? Look at the top of the water.');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        items: vals.map(v => ({ face: M.jug({ litres: v, max: 5, size: 130 }), value: `${v} litre${v === 1 ? '' : 's'}`, label: 'Measuring jug' })),
        tiles: [...vals.map(v => `${v} litre${v === 1 ? '' : 's'}`), `${trick} litre${trick === 1 ? '' : 's'}`],
        hint: 'Almost! Find the mark at the top of the water.',
        onComplete: spare => {
          MA.launchConfetti(25);
          say(spare ? `${pick(PRAISE)} ${spare.dataset.value} was a trick!` : pick(PRAISE));
          nextOrDone(result, round === 1, 'Next round ▶', () => { round += 1; next(); }, done, '🧩 Jug reader!');
        }
      });
      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of 2`),
        instruction('✋ Drag each amount onto its jug. Or tap an amount, then a box.'), cards, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const statements = [
      () => ({ text: '🥂 vs 🥣<small>A tall thin glass always holds more than a short wide bowl.</small>', truth: false, explain: 'Not always! Wide containers can hold a lot even if they are short. Pour to check!' }),
      () => ({ text: '🫙<small>Capacity means how much a container can hold.</small>', truth: true, explain: 'True! That is what capacity means.' }),
      () => ({ text: '🥛<small>We measure capacity in kilograms.</small>', truth: false, explain: 'Kilograms measure mass. Capacity is measured in litres.', fix: { question: 'Which unit is for capacity?', options: ['litres', 'kg', 'cm'], answer: 'litres' } }),
      () => ({ text: `${glassHTML(50)}<small>Half full is the same as half empty.</small>`, truth: true, explain: 'True! Half is half, whichever way you say it.' })
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'Splash! True or false?' : pick(['True or false?', 'Think about the shape!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — fill the fish tank exactly
     ------------------------------------------------------------ */
  function renderTank(box, done) {
    const targets = [7, 9, 4];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const T = targets[round];
      const pours = [];
      let solved = false;
      say(`The fish need exactly ${T} litres. Use the 1, 2 and 5 litre jugs. Do not overflow!`);
      const tank = M.jug({ litres: 0, max: 10 });
      const sentence = el('p', { class: 'add-sentence', 'aria-live': 'polite' }, 'Empty');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const total = () => pours.reduce((a, b) => a + b, 0);
      const draw = () => { tank.setLevel(total()); sentence.textContent = pours.length ? `${pours.join(' + ')} = ${total()} litres` : 'Empty'; };
      const pour = n => {
        if (solved) return;
        if (total() + n > T) { say(`That would be ${total() + n} litres: too much for the fish!`); return; }
        pours.push(n);
        draw();
        if (total() === T) {
          solved = true;
          MA.launchConfetti(35);
          const best = Math.floor(T / 5) + Math.floor((T % 5) / 2) + (T % 5) % 2;
          say(pours.length === best ? `Exactly ${T} litres with the fewest pours!` : `Exactly ${T} litres! Could you use fewer pours?`);
          result.append(el('p', { class: 'round-result__text' }, `🐠 ${pours.join(' + ')} = ${T} litres`));
          nextOrDone(result, round === targets.length - 1, 'Next tank ▶', () => { round += 1; next(); }, done, '🚀 Tank captain!');
        }
      };
      draw();
      box.append(el('p', { class: 'round-label' }, `Tank ${round + 1} of ${targets.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, '🐠 Exactly'), el('strong', {}, `${T} l`)),
        el('div', { class: 'frac-stage' }, tank), sentence,
        el('div', { class: 'stage-actions' },
          ...[1, 2, 5].map(n => button(`🫗 ${n} l`, `weight-btn weight--${n}`, () => pour(n), { 'aria-label': `Pour ${n} litre jug`, 'data-l': n })),
          button('↩ Undo', 'btn btn--ghost', () => { if (!solved) { pours.pop(); draw(); } })),
        result);
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  function qRead() { const v = rnd(1, 5); return { icon: '🥛', question: 'How much water is in the jug?', instruction: 'Read the mark at the top.', visual: `<div class="frac-stage">${M.jug({ litres: v, max: 5, size: 150 }).outerHTML}</div>`, options: shuffle([v, v === 5 ? 4 : v + 1, v === 1 ? 3 : v - 1]).map(x => ({ value: x, label: `${x} l` })), answer: v, hint: 'Almost! Which mark is the water at?', explain: `${v} litre${v === 1 ? '' : 's'}` }; }
  function qHalf() { return { icon: '🌗', question: 'Which glass is half full?', instruction: 'Water up to the middle.', options: shuffle([[50, 'half'], [100, 'full'], [10, 'nearly empty']]).map(([v, n]) => ({ value: n, label: n, html: glassHTML(v) })), answer: 'half', hint: 'Almost! Look for water up to the middle.', explain: 'Half full: water to the middle.' }; }
  function qUnit() { return { icon: '🧪', question: 'Which unit measures capacity?', instruction: 'How much it holds.', options: shuffle(['litres', 'kilograms', 'metres']).map(v => ({ value: v, label: v })), answer: 'litres', hint: 'Almost! Milk is sold in…', explain: 'Capacity is measured in litres.' }; }
  function qCups() { const a = rnd(3, 6); const b = a + rnd(2, 4); return { icon: '☕', question: `A jug holds ${a} cups. A bucket holds ${b} cups. Which holds more?`, instruction: 'More cups = more capacity.', options: [{ value: 'bucket', label: '🪣 bucket' }, { value: 'jug', label: '🫗 jug' }], answer: 'bucket', hint: 'Almost! Which number is bigger?', explain: `${b} cups is more than ${a}.` }; }
  function qAdd() { const a = rnd(2, 5); const b = rnd(1, 4); return { icon: '➕', question: `Pour ${a} litres and then ${b} litres into a tank. How much?`, instruction: 'Add them.', options: optionsFor(a + b, [a + b + 1, a + b - 1, a * b + 1]).map(o => ({ ...o, label: `${o.value} l` })), answer: a + b, hint: `Almost! ${a} + ${b} = ?`, explain: `${a} + ${b} = ${a + b} litres` }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qRead(), qHalf(), qUnit(), qCups(), qAdd()], moduleId: MODULE_ID, badgeId: 'capacity-captain', title: 'Capacity Captain' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
