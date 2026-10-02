/* ==============================================================
   ⚖️ Measure Mountain → Mass               measure-mountain/mass.js
   --------------------------------------------------------------
   🌱 Learn      heavier or lighter on a balance, then balance with cubes
   🎮 Play       make the weight: add kilogram weights to match a parcel
   🧩 Practise   read the kitchen scales
   🧠 Think      true or false? (bigger is not always heavier)
   🚀 Challenge  mystery boxes: compare on the balance, then order them
   🏆 Master     five mixed questions → Mass Master badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const M = window.Measure;
  if (!MA || !K || !M) return;
  const { $, $$, rnd, pick, shuffle, el, button, instruction, say, pulse, makeDraggable, nextOrDone, dragMatch, quizRounds, optionsFor, PRAISE } = K;

  const MODULE_ID = 'measure-mountain/mass';

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Heavier or lighter?',  render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Make the weight',      render: renderWeights },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Read the scales',      render: renderPractise },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',       render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Mystery boxes',        render: renderBoxes },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Mass Master',          render: renderMaster }
  ];

  /** A balance beam: left and right pans. Call set(leftMass, rightMass). */
  function balance(leftLabel, rightLabel) {
    const beam = el('div', { class: 'mbeam' });
    const left = el('div', { class: 'mpan' }, leftLabel);
    const right = el('div', { class: 'mpan' }, rightLabel);
    beam.append(left, right);
    const wrap = el('div', { class: 'mbalance', role: 'img' }, beam, el('div', { class: 'mbalance__post', 'aria-hidden': 'true' }));
    return {
      wrap, left, right,
      set(a, b) {
        const tilt = a === b ? 0 : (a > b ? -1 : 1) * Math.min(14, 6 + Math.abs(a - b));
        beam.style.setProperty('--tilt', `${tilt}deg`);
        wrap.setAttribute('aria-label', a === b ? 'The balance is level' : `The ${a > b ? 'left' : 'right'} side is lower, so it is heavier`);
      }
    };
  }

  /* ------------------------------------------------------------
     🌱 LEARN
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const pairs = [
      { a: ['🍉', 'watermelon', 9], b: ['🍓', 'strawberry', 1] },
      { a: ['🎈', 'balloon', 1], b: ['🧱', 'brick', 8], note: 'The balloon is bigger, but the brick is heavier!' },
      { a: ['✏️', 'pencil', 1], b: ['📚', 'pile of books', 7] }
    ];
    let round = 0;
    compare();

    function compare() {
      box.innerHTML = '';
      const p = pairs[round];
      let solved = false;
      say(round === 0 ? 'On a balance, the heavier side goes DOWN. Which is heavier? Tap it, then watch!' : 'Which is heavier? Think, then tap!');
      const bal = balance(el('span', { class: 'mpan__item' }, p.a[0]), el('span', { class: 'mpan__item' }, p.b[0]));
      bal.set(0, 0);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const group = el('div', { class: 'fix-options', role: 'group', 'aria-label': 'Which is heavier?' });
      [p.a, p.b].forEach(([emoji, name, mass]) => {
        const b = button(`${emoji} ${name}`, 'pattern-btn', () => {
          if (solved) return;
          const heavy = p.a[2] > p.b[2] ? p.a : p.b;
          bal.set(p.a[2], p.b[2]);
          if (name === heavy[1]) {
            solved = true;
            b.classList.add('is-right');
            MA.launchConfetti(20);
            const line = `The ${heavy[1]} is heavier. Its side goes down! ${p.note || ''}`;
            say(line);
            result.append(el('p', { class: 'round-result__text' }, `⚖️ ${line}`));
            result.append(el('div', { class: 'stage-actions' }, button(round === pairs.length - 1 ? 'Next: balance it ▶' : 'Next ▶', 'btn', () => {
              round += 1;
              if (round < pairs.length) compare(); else { round = 0; cubes(); }
            })));
          } else {
            b.classList.add('is-wrong');
            b.disabled = true;
            say('Look! The other side went down. That side is heavier.');
          }
        });
        group.append(b);
      });
      box.append(el('p', { class: 'round-label' }, `Compare ${round + 1} of ${pairs.length}`), bal.wrap,
        instruction('👆 Which one is heavier?'), group, result);
    }

    function cubes() {
      const objects = [['🍎', 'apple', rnd(4, 7)], ['👟', 'shoe', rnd(8, 11)]];
      box.innerHTML = '';
      const [emoji, name, mass] = objects[round];
      let n = 0;
      let solved = false;
      say(`How heavy is the ${name}? Add cubes to the other side until the balance is level.`);
      const cubePan = el('span', { class: 'mpan__cubes' });
      const bal = balance(el('span', { class: 'mpan__item' }, emoji), cubePan);
      bal.set(mass, 0);
      const counter = el('p', { class: 'hop-count', 'aria-live': 'polite' }, 'Cubes: 0');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const change = d => {
        if (solved) return;
        n = Math.max(0, Math.min(15, n + d));
        cubePan.textContent = '🟧'.repeat(n);
        counter.textContent = `Cubes: ${n}`;
        bal.set(mass, n);
        if (n === mass) {
          solved = true;
          MA.launchConfetti(25);
          say(`Level! The ${name} weighs the same as ${mass} cubes.`);
          result.append(el('p', { class: 'round-result__text' }, `⚖️ ${emoji} = ${mass} cubes`));
          nextOrDone(result, round === objects.length - 1, 'Next ▶', () => { round += 1; cubes(); }, done);
        } else if (n > mass) say('Too many! The cubes side went down. Take one off.');
      };
      box.append(el('p', { class: 'round-label' }, `Balance ${round + 1} of ${objects.length}`), bal.wrap, counter,
        el('div', { class: 'pv-controls' },
          button('−', 'pv-btn pv-btn--minus', () => change(-1), { 'aria-label': 'Take a cube off' }),
          button('+ cube', 'pv-btn pv-btn--ten', () => change(1), { 'aria-label': 'Add a cube' })),
        result);
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — make the weight
     ------------------------------------------------------------ */
  function renderWeights(box, done) {
    const targets = shuffle([3, 4, 6, 7, 8, 9]).slice(0, 4);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const T = targets[round];
      const used = [];
      let solved = false;
      say(`This parcel weighs ${T} kilograms. Put weights on the scale to make ${T} kg!`);
      const scale = M.dial({ value: 0, max: 10, unit: 'kg' });
      const tray = el('div', { class: 'weight-tray', 'aria-live': 'polite' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const total = () => used.reduce((a, b) => a + b, 0);
      const draw = () => {
        scale.setNeedle(Math.min(total(), 10));
        tray.innerHTML = '';
        used.forEach(w => tray.append(el('span', { class: `weight weight--${w}` }, `${w} kg`)));
        if (!used.length) tray.append(el('span', { class: 'weight-tray__empty' }, 'No weights yet'));
      };
      const add = w => {
        if (solved) return;
        if (total() + w > 10) { say('That would go past 10 kg on this scale!'); return; }
        used.push(w);
        draw();
        result.innerHTML = '';
        if (total() === T) {
          solved = true;
          MA.launchConfetti(30);
          say(`${used.join(' kg + ')} kg = ${T} kg. ${pick(PRAISE)}`);
          result.append(el('p', { class: 'round-result__text' }, `📦 ${used.join(' + ')} = ${T} kg`));
          if (used.length > 2) result.append(el('p', { class: 'round-result__tip' }, 'Can you do it with fewer weights next time?'));
          nextOrDone(result, round === targets.length - 1, 'Next parcel ▶', () => { round += 1; next(); }, done, '🎮 Weight wizard!');
        } else if (total() > T) {
          say('Too heavy! Take a weight off.');
        }
      };
      draw();
      box.append(el('p', { class: 'round-label' }, `Parcel ${round + 1} of ${targets.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, '📦 Make'), el('strong', {}, `${T} kg`)),
        el('div', { class: 'frac-stage' }, scale), tray,
        el('div', { class: 'stage-actions' },
          ...[1, 2, 5].map(w => button(`+ ${w} kg`, `weight-btn weight--${w}`, () => add(w), { 'aria-label': `Add ${w} kilogram weight`, 'data-w': w })),
          button('↩ Undo', 'btn btn--ghost', () => { if (!solved) { used.pop(); draw(); result.innerHTML = ''; } })),
        result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — read the scales
     ------------------------------------------------------------ */
  function renderPractise(box, done) {
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const vals = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
      const trick = [vals[0] + 1, vals[0] - 1].find(v => v > 0 && v < 11 && !vals.includes(v));
      say('Where is the red needle pointing? Drag the weight onto each scale.');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        items: vals.map(v => ({ face: M.dial({ value: v, max: 10, unit: 'kg', size: 120 }), value: `${v} kg`, label: 'Kitchen scale' })),
        tiles: [...vals.map(v => `${v} kg`), `${trick} kg`],
        hint: 'Almost! Follow the needle to the number it points at.',
        onComplete: spare => {
          MA.launchConfetti(25);
          say(spare ? `${pick(PRAISE)} ${spare.dataset.value} was a trick!` : pick(PRAISE));
          nextOrDone(result, round === 1, 'Next round ▶', () => { round += 1; next(); }, done, '🧩 Scale reader!');
        }
      });
      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of 2`),
        instruction('✋ Drag each weight onto its scale. Or tap a weight, then a box.'), cards, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const statements = [
      () => ({ text: '🎈 vs 🪨<small>Bigger things are always heavier.</small>', truth: false, explain: 'Not always! A big balloon is lighter than a small stone.' }),
      () => ({ text: '1 kg 🪶 = 1 kg 🧱<small>1 kg of feathers weighs the same as 1 kg of bricks.</small>', truth: true, explain: 'True! 1 kilogram is 1 kilogram, whatever it is made of.' }),
      () => ({ text: '⚖️<small>We measure mass in metres.</small>', truth: false, explain: 'Metres are for length. Mass is measured in kilograms (kg).', fix: { question: 'Which unit measures mass?', options: ['kg', 'm', 'cm'], answer: 'kg' } }),
      () => ({ text: '⚖️⬇️<small>On a balance, the heavier side goes down.</small>', truth: true, explain: 'True! Heavy things pull their side down.' })
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'Heavy thinking time! True or false?' : pick(['True or false?', 'Think it through!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — mystery boxes
     ------------------------------------------------------------ */
  function renderBoxes(box, done) {
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const names = ['🟥 A', '🟦 B', '🟩 C'];
      const masses = shuffle([2, 5, 8]);
      const boxes = names.map((n, i) => ({ name: n, mass: masses[i] }));
      const picked = [];
      let selected = null;
      let placed = 0;
      say('Three boxes look the same size. Put two on the balance to compare. Then line them up from lightest to heaviest!');
      const bal = balance(el('span', { class: 'mpan__item' }, '?'), el('span', { class: 'mpan__item' }, '?'));
      bal.set(0, 0);
      const weighBtns = el('div', { class: 'stage-actions', role: 'group', 'aria-label': 'Put a box on the balance' });
      boxes.forEach(b => {
        weighBtns.append(button(`⚖️ ${b.name}`, 'pattern-btn', () => {
          picked.push(b);
          if (picked.length > 2) picked.shift();
          bal.left.firstChild.textContent = picked[0] ? picked[0].name : '?';
          bal.right.firstChild.textContent = picked[1] ? picked[1].name : '?';
          if (picked.length === 2) {
            bal.set(picked[0].mass, picked[1].mass);
            const heavy = picked[0].mass > picked[1].mass ? picked[0] : picked[1];
            say(`${heavy.name} is heavier!`);
          } else bal.set(0, 0);
        }, { 'data-box': b.name }));
      });
      const order = [...boxes].sort((a, b) => a.mass - b.mass);
      const slots = el('ol', { class: 'slots box-order', 'aria-label': 'Lightest to heaviest' });
      order.forEach((b, i) => {
        const slot = button('', 'slot', () => { if (selected) tryPlace(selected, slot); else say('Pick a box first.'); }, { 'data-value': b.name, 'aria-label': i === 0 ? 'Lightest place' : i === 2 ? 'Heaviest place' : 'Middle place' });
        slots.append(el('li', {}, slot));
      });
      const bank = el('div', { class: 'tile-bank', role: 'group', 'aria-label': 'Boxes' });
      shuffle(boxes).forEach(b => {
        const tile = button(b.name, 'tile tile--wide', null, { 'data-value': b.name, 'aria-label': `Box ${b.name}` });
        makeDraggable(tile, {
          onDrop: slot => tryPlace(tile, slot),
          onTap: () => {
            if (selected) selected.classList.remove('is-selected');
            if (selected === tile) { selected = null; return; }
            selected = tile;
            tile.classList.add('is-selected');
          }
        });
        bank.append(tile);
      });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      function tryPlace(tile, slot) {
        if (selected) selected.classList.remove('is-selected');
        selected = null;
        if (!slot || slot.disabled || !slots.contains(slot)) return;
        if (tile.dataset.value === slot.dataset.value) {
          slot.textContent = tile.dataset.value;
          slot.disabled = true;
          slot.classList.add('is-filled');
          tile.remove();
          placed += 1;
          if (placed === 3) {
            MA.launchConfetti(35);
            say(`Perfect order! ${pick(PRAISE)}`);
            nextOrDone(result, round === 1, 'Next boxes ▶', () => { round += 1; next(); }, done, '🚀 Balance detective!');
          } else say(pick(PRAISE));
        } else {
          pulse(slot, 'is-bad');
          pulse(tile, 'is-bounce');
          say('Not there yet. Use the balance to check which is heavier!');
        }
      }
      box.append(el('p', { class: 'round-label' }, `Boxes ${round + 1} of 2`), bal.wrap,
        instruction('👆 Tap two boxes to weigh them.'), weighBtns,
        el('div', { class: 'order-ends', 'aria-hidden': 'true' }, el('span', {}, '⬅️ lightest'), el('span', {}, 'heaviest ➡️')),
        slots, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  function qRead() { const v = rnd(2, 9); return { icon: '⚖️', question: 'How heavy is it?', instruction: 'Follow the needle.', visual: `<div class="frac-stage">${M.dial({ value: v, max: 10, size: 150 }).outerHTML}</div>`, options: shuffle([v, v + 1, v - 1]).map(x => ({ value: x, label: `${x} kg` })), answer: v, hint: 'Almost! Which number is the needle on?', explain: `${v} kg` }; }
  function qHeavier() { return { icon: '⬇️', question: 'On a balance, the heavier side…', instruction: 'Picture a see-saw.', options: shuffle(['goes down', 'goes up', 'stays still']).map(v => ({ value: v, label: v })), answer: 'goes down', hint: 'Almost! Heavy things pull down.', explain: 'The heavier side goes down.' }; }
  function qUnit() { return { icon: '📦', question: 'Which unit do we use for mass?', instruction: 'How heavy?', options: shuffle(['kg', 'cm', 'litres']).map(v => ({ value: v, label: v })), answer: 'kg', hint: 'Almost! Kilograms measure how heavy.', explain: 'Mass is measured in kilograms (kg).' }; }
  function qCubes() { const a = rnd(3, 6); const b = a + rnd(2, 4); return { icon: '🟧', question: `A pear balances ${a} cubes. A mango balances ${b} cubes. Which is heavier?`, instruction: 'More cubes = heavier.', options: [{ value: 'mango', label: '🥭 mango' }, { value: 'pear', label: '🍐 pear' }], answer: 'mango', hint: 'Almost! Which needs more cubes?', explain: `${b} cubes is heavier than ${a}.` }; }
  function qAdd() { const a = rnd(2, 5); const b = rnd(1, 4); return { icon: '➕', question: `A ${a} kg bag and a ${b} kg bag. How much altogether?`, instruction: 'Add the masses.', options: optionsFor(a + b, [a + b + 1, a * b, a - b]).map(o => ({ ...o, label: `${o.value} kg` })), answer: a + b, hint: `Almost! ${a} + ${b} = ?`, explain: `${a} + ${b} = ${a + b} kg` }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qRead(), qHeavier(), qUnit(), qCubes(), qAdd()], moduleId: MODULE_ID, badgeId: 'mass-master', title: 'Mass Master' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
