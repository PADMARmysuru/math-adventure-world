/* ==============================================================
   🧱 Number Island → Place Value      number-island/place-value.js
   --------------------------------------------------------------
   🌱 Learn      build numbers with ten rods and one cubes; swap 10 ones for a ten
   🎮 Play       digit cards: make the biggest / smallest number
   🧩 Practise   drag numbers onto pictures, words and 40 + 7 cards
   🧠 Think      same number, another way (2 tens 15 ones = 35)
   🚀 Challenge  number riddles answered with tens/ones spinners
   🏆 Master     five mixed questions → Place Value Pro badge

   Rewards/saving: ../script.js   Step bar, drag-and-drop: ../module.js
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  if (!MA || !K) return;
  const { $, $$, rnd, pick, shuffle, el, button, instruction, say, pulse, makeDraggable, optionsFor, PRAISE } = K;

  const MODULE_ID = 'number-island/place-value';

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Build with tens and ones', render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Biggest or smallest?',     render: renderPlay },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Match the number',         render: renderPractise },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'Another way to make it',   render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Number riddles',           render: renderRiddles },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Place Value Pro',          render: renderMaster }
  ];

  /* ------------------------------------------------------------
     Shared pieces for this module
     ------------------------------------------------------------ */

  /** Number with a blue tens digit and an orange ones digit. */
  const digitsHTML = n => (n >= 10 && n <= 99
    ? `<span class="d-tens">${Math.floor(n / 10)}</span><span class="d-ones">${n % 10}</span>`
    : String(n));

  /** Small rods-and-cubes picture (uses .b10 styles from style.css). */
  const blocksHTML = (tens, ones) => `<span class="b10" aria-hidden="true">
      <span class="b10__tens">${'<i class="rod"></i>'.repeat(tens)}</span>
      <span class="b10__ones">${'<i class="cube"></i>'.repeat(ones)}</span></span>`;

  /**
   * Place-value mat with ten rods and one cubes.
   * options: tens, ones, maxOnes, lockTens, allowSwap, onChange({ tens, ones, value })
   */
  function createBuilder(options = {}) {
    const { maxTens = 9, maxOnes = 19, lockTens = false, allowSwap = true, onChange } = options;
    let tens = options.tens || 0;
    let ones = options.ones || 0;

    const rods = el('div', { class: 'pv-rods', 'aria-hidden': 'true' });
    const cubes = el('div', { class: 'pv-cubes', 'aria-hidden': 'true' });
    const readout = el('p', { class: 'pv-readout', 'aria-live': 'polite' });
    const swapBtn = button('🔁 Swap 10 ones for 1 ten', 'btn btn--sun', () => {
      if (ones < 10 || tens >= maxTens) return;
      ones -= 10;
      tens += 1;
      update('swap');
    }, { hidden: true });

    const tenControls = el('div', { class: 'pv-controls' },
      button('−', 'pv-btn pv-btn--minus', () => change(-1, 0), { 'aria-label': 'Take away a ten' }),
      button('+ ten', 'pv-btn pv-btn--ten', () => change(1, 0), { 'aria-label': 'Add a ten' }));
    const oneControls = el('div', { class: 'pv-controls' },
      button('−', 'pv-btn pv-btn--minus', () => change(0, -1), { 'aria-label': 'Take away a one' }),
      button('+ one', 'pv-btn pv-btn--one', () => change(0, 1), { 'aria-label': 'Add a one' }));

    const root = el('div', { class: 'pv-builder' },
      el('div', { class: 'pv-mat' },
        el('div', { class: 'pv-col pv-col--tens' },
          el('p', { class: 'pv-col__head' }, lockTens ? 'Tens 🔒' : 'Tens'), rods, lockTens ? null : tenControls),
        el('div', { class: 'pv-col pv-col--ones' },
          el('p', { class: 'pv-col__head' }, 'Ones'), cubes, oneControls)),
      readout,
      el('div', { class: 'stage-actions' }, swapBtn));

    function change(dt, dOnes) {
      const t = tens + dt;
      const o = ones + dOnes;
      if (t < 0 || o < 0) return;
      if (t > maxTens) { say('The mat only fits 9 tens.'); return; }
      if (o > maxOnes) { say(allowSwap ? 'Lots of ones! Can you swap 10 of them for a ten?' : 'That is too many ones.'); return; }
      tens = t;
      ones = o;
      update('change');
    }

    function update(reason) {
      rods.innerHTML = '<span class="rod-lg"></span>'.repeat(tens);
      cubes.innerHTML = '<span class="cube-lg"></span>'.repeat(ones);
      const value = tens * 10 + ones;
      readout.innerHTML = `<span class="d-tens">${tens}</span> ${tens === 1 ? 'ten' : 'tens'} and `
        + `<span class="d-ones">${ones}</span> ${ones === 1 ? 'one' : 'ones'} = <strong class="pv-value">${value}</strong>`;
      swapBtn.hidden = !allowSwap || ones < 10 || tens >= maxTens;
      if (reason === 'swap') pulse(rods.lastElementChild || rods, 'is-new');
      if (onChange) onChange({ tens, ones, value, reason });
    }

    update('init');
    return {
      root,
      get value() { return tens * 10 + ones; },
      get tens() { return tens; },
      get ones() { return ones; },
      lock() { $$('button', root).forEach(b => { b.disabled = true; }); }
    };
  }

  /* ------------------------------------------------------------
     🌱 LEARN — build three numbers, then swap 10 ones for a ten
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const targets = [rnd(21, 39), rnd(4, 8) * 10, rnd(51, 89)].map(n => (n % 10 === 0 && n < 40 ? n + 3 : n));
    let index = 0;
    buildTarget();

    function buildTarget() {
      box.innerHTML = '';
      const target = targets[index];
      let finished = false;
      say(index === 0
        ? 'Each rod is 10. Each cube is 1. Can you build this number?'
        : pick(['Build this one!', 'Tens first, then ones!', 'You are getting good at this!']));

      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const builder = createBuilder({
        onChange: ({ tens, ones, value }) => {
          if (finished) return;
          if (value === target && ones < 10) {
            finished = true;
            builder.lock();
            MA.launchConfetti(25);
            say(`${Math.floor(target / 10)} tens and ${target % 10} ones make ${target}!`);
            const isLast = index === targets.length - 1;
            result.append(
              el('p', { class: 'round-result__text' }, `🎉 You built ${target}!`),
              el('div', { class: 'stage-actions' }, button(isLast ? 'Next: too many ones! ▶' : 'Next number ▶', 'btn', () => {
                if (isLast) swapLesson(); else { index += 1; buildTarget(); }
              })));
          } else if (value === target) {
            say('That is the right amount! Now swap 10 ones for a ten.');
          } else if (tens > Math.floor(target / 10) && ones === 0) {
            say('Too many tens! Take one away.');
          }
        }
      });

      box.append(
        el('p', { class: 'round-label' }, `Number ${index + 1} of ${targets.length}`),
        el('div', { class: 'pv-target' }, el('span', { class: 'pv-target__label' }, 'Build'),
          el('span', { class: 'pv-target__num', html: digitsHTML(target) })),
        builder.root,
        result
      );
    }

    // The big idea: 10 ones are the same as 1 ten
    function swapLesson() {
      box.innerHTML = '';
      const startTens = rnd(1, 3);
      const startOnes = rnd(12, 16);
      const value = startTens * 10 + startOnes;
      let swapped = false;
      say(`Look! ${startOnes} ones. That is more than 10! Swap 10 ones for 1 ten.`);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });

      const builder = createBuilder({
        tens: startTens,
        ones: startOnes,
        onChange: ({ tens, ones, reason }) => {
          if (reason === 'swap' && !swapped) {
            swapped = true;
            builder.lock();
            say(`Still ${value}! Now it is ${tens} tens and ${ones} ones.`);
            MA.launchConfetti(40);
            result.append(
              el('p', { class: 'round-result__text' }, `🎉 ${startTens} tens ${startOnes} ones = ${tens} tens ${ones} ones = ${value}`),
              el('p', { class: 'round-result__tip' }, '10 ones make 1 ten. The number stays the same!'));
            done();
          } else if (reason === 'change' && !swapped) {
            say('Tap the yellow Swap button!');
          }
        }
      });

      box.append(instruction('👆 Tap “Swap 10 ones for 1 ten”.'), builder.root, result);
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — digit cards: make the biggest or smallest number
     ------------------------------------------------------------ */
  function renderPlay(box, done) {
    const ROUNDS = [
      { goal: 'biggest', cards: 2 },
      { goal: 'smallest', cards: 2 },
      { goal: 'biggest', cards: 3 },
      { goal: 'smallest', cards: 3 }
    ];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const cfg = ROUNDS[round];
      const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, cfg.cards);
      const sorted = [...digits].sort((a, b) => a - b);
      const best = cfg.goal === 'biggest'
        ? sorted[sorted.length - 1] * 10 + sorted[sorted.length - 2]
        : sorted[0] * 10 + sorted[1];
      let selected = null;
      let solved = false;
      say(cfg.cards === 3
        ? `Use 2 of these 3 cards. Make the ${cfg.goal.toUpperCase()} number!`
        : `Make the ${cfg.goal.toUpperCase()} number you can!`);

      const bank = el('div', { class: 'tile-bank', role: 'group', 'aria-label': 'Digit cards' });
      const makeSlot = place => {
        const slot = el('div', {
          class: `slot pv-slot pv-slot--${place}`, role: 'button', tabindex: '0',
          'data-place': place, 'aria-label': `${place} box, empty`
        });
        const activate = () => {
          if (selected) placeCard(selected, slot);
          else say('Pick a card first, then tap a box.');
        };
        slot.addEventListener('click', event => { if (event.target === slot) activate(); });
        slot.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
        });
        return slot;
      };
      const tensSlot = makeSlot('tens');
      const onesSlot = makeSlot('ones');
      const preview = el('div', { class: 'pv-preview', 'aria-live': 'polite' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const checkBtn = button('✓ Check', 'btn btn--big', check, { disabled: true });

      digits.forEach(d => {
        const card = button(String(d), 'tile pv-card', null, { 'data-value': d, 'aria-label': `Card ${d}` });
        makeDraggable(card, {
          onDrop: slot => placeCard(card, slot && (slot === tensSlot || slot === onesSlot) ? slot : null),
          onTap: () => {
            if (solved) return;
            if (selected === card) {                       // tap the same card again: put it back
              card.classList.remove('is-selected');
              selected = null;
              if (card.parentElement !== bank) returnCard(card);
              return;
            }
            if (selected && card.parentElement !== bank) {   // tapped a card sitting in a box: move the chosen card there (swap)
              placeCard(selected, card.parentElement);
              return;
            }
            if (selected) selected.classList.remove('is-selected');
            selected = card;
            card.classList.add('is-selected');
            say('Now tap the Tens box or the Ones box.');
          }
        });
        bank.append(card);
      });

      function placeCard(card, slot) {
        if (selected) selected.classList.remove('is-selected');
        selected = null;
        if (!slot || solved) return;
        const from = card.parentElement;
        const occupant = $('.pv-card', slot);
        if (occupant && occupant !== card) {
          // swap: the card already in the box goes where the moving card came from
          if (from === tensSlot || from === onesSlot) from.append(occupant);
          else bank.append(occupant);
        }
        slot.append(card);
        refresh();
      }

      function returnCard(card) {
        bank.append(card);
        refresh();
      }

      function refresh() {
        const t = $('.pv-card', tensSlot);
        const o = $('.pv-card', onesSlot);
        tensSlot.setAttribute('aria-label', `Tens box, ${t ? t.dataset.value : 'empty'}`);
        onesSlot.setAttribute('aria-label', `Ones box, ${o ? o.dataset.value : 'empty'}`);
        checkBtn.disabled = !(t && o);
        preview.innerHTML = '';
        result.innerHTML = '';
        if (t && o) {
          const n = Number(t.dataset.value) * 10 + Number(o.dataset.value);
          preview.innerHTML = `<span class="pv-preview__num">${digitsHTML(n)}</span>${blocksHTML(Number(t.dataset.value), Number(o.dataset.value))}`;
        }
      }

      function check() {
        const t = Number($('.pv-card', tensSlot).dataset.value);
        const o = Number($('.pv-card', onesSlot).dataset.value);
        const n = t * 10 + o;
        result.innerHTML = '';
        if (n === best) {
          solved = true;
          checkBtn.disabled = true;
          $$('.pv-card', box).forEach(c => { c.disabled = true; });
          MA.launchConfetti(30);
          const why = cfg.goal === 'biggest'
            ? `The biggest card goes in the tens. ${t} tens is a lot!`
            : `The smallest card goes in the tens. Only ${t} ${t === 1 ? 'ten' : 'tens'}!`;
          say(why);
          const isLast = round === ROUNDS.length - 1;
          result.append(el('p', { class: 'round-result__text' }, `🎉 ${n} is the ${cfg.goal}!`),
            el('p', { class: 'round-result__tip' }, why));
          if (isLast) done();
          else result.append(el('div', { class: 'stage-actions' }, button('Next round ▶', 'btn', () => { round += 1; newRound(); })));
        } else {
          const hint = cfg.goal === 'biggest'
            ? 'Almost! Which card should be in the TENS box to make it bigger?'
            : 'Almost! Which card should be in the TENS box to make it smaller?';
          result.append(el('p', { class: 'round-result__tip' }, `💡 ${hint}`));
          say(hint);
        }
      }

      box.append(
        el('p', { class: 'round-label' }, `Round ${round + 1} of ${ROUNDS.length} · Make the ${cfg.goal}`),
        instruction('✋ Drag cards into the boxes. Or tap a card, then tap a box.'),
        bank,
        el('div', { class: 'pv-slots' },
          el('div', { class: 'pv-slot-wrap' }, el('p', { class: 'pv-slot-label pv-slot-label--tens' }, 'Tens'), tensSlot),
          el('div', { class: 'pv-slot-wrap' }, el('p', { class: 'pv-slot-label pv-slot-label--ones' }, 'Ones'), onesSlot)),
        preview, checkBtn, result
      );
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — drag each number onto the card that shows it
     ------------------------------------------------------------ */
  function renderPractise(box, done) {
    const KINDS = ['blocks', 'words', 'expanded'];
    let round = 0;
    newRound();

    function makeNumbers() {
      const list = [];
      while (list.length < 3) {
        const t = rnd(1, 9);
        const o = rnd(1, 9);
        const n = t * 10 + o;
        if (t !== o && !list.includes(n) && !list.includes(o * 10 + t)) list.push(n);
      }
      return list;
    }

    function cardFace(n, kind) {
      const t = Math.floor(n / 10);
      const o = n % 10;
      if (kind === 'blocks') return el('div', { class: 'match-face', html: blocksHTML(t, o), role: 'img', 'aria-label': `${t} tens and ${o} ones blocks` });
      if (kind === 'words') return el('div', { class: 'match-face match-face--words' }, `${t} ${t === 1 ? 'ten' : 'tens'} and ${o} ${o === 1 ? 'one' : 'ones'}`);
      return el('div', { class: 'match-face match-face--expanded' }, `${t * 10} + ${o}`);
    }

    function newRound() {
      box.innerHTML = '';
      const numbers = makeNumbers();
      const trick = numbers[0] % 10 * 10 + Math.floor(numbers[0] / 10);   // digits swapped
      const kinds = round < KINDS.length ? numbers.map(() => KINDS[round]) : shuffle(KINDS);
      let selected = null;
      let filled = 0;
      say(round === 0 ? 'Count the tens and ones. Which number is it?' : pick(['Match them up!', 'Look carefully at the tens!']));

      const cards = el('div', { class: 'match-cards' });
      const slots = numbers.map((n, i) => {
        const slot = el('div', {
          class: 'slot match-slot', role: 'button', tabindex: '0', 'data-value': n, 'aria-label': 'Empty answer box'
        }, '?');
        const activate = () => { if (selected) tryPlace(selected, slot); else say('Pick a number first.'); };
        slot.addEventListener('click', activate);
        slot.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
        cards.append(el('div', { class: 'match-card' }, cardFace(n, kinds[i]), slot));
        return slot;
      });

      const bank = el('div', { class: 'tile-bank', role: 'group', 'aria-label': 'Number tiles' });
      shuffle([...numbers, trick]).forEach(n => {
        const tile = button(String(n), 'tile', null, { 'data-value': n, 'aria-label': `Number ${n}` });
        makeDraggable(tile, {
          onDrop: slot => tryPlace(tile, slot && slots.includes(slot) ? slot : null),
          onTap: () => {
            if (tile.disabled) return;
            if (selected) selected.classList.remove('is-selected');
            if (selected === tile) { selected = null; return; }
            selected = tile;
            tile.classList.add('is-selected');
            say(`Where does ${n} go?`);
          }
        });
        bank.append(tile);
      });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });

      function tryPlace(tile, slot) {
        if (selected) selected.classList.remove('is-selected');
        selected = null;
        if (!slot || slot.classList.contains('is-filled')) return;
        const n = Number(tile.dataset.value);
        if (n === Number(slot.dataset.value)) {
          slot.textContent = n;
          slot.classList.add('is-filled');
          slot.setAttribute('aria-label', `${n}, correct`);
          tile.remove();
          filled += 1;
          if (filled === numbers.length) roundDone();
          else say(pick(PRAISE));
        } else {
          pulse(slot, 'is-bad');
          pulse(tile, 'is-bounce');
          const swappedDigits = n % 10 * 10 + Math.floor(n / 10) === Number(slot.dataset.value);
          say(swappedDigits
            ? `Almost! ${n} has ${Math.floor(n / 10)} tens. Count the tens again.`
            : 'Almost! Count the tens first, then the ones.');
        }
      }

      function roundDone() {
        const spare = $('.tile', bank);
        if (spare) { spare.classList.add('is-spare'); spare.disabled = true; }
        MA.launchConfetti(25);
        say(spare ? `${pick(PRAISE)} ${spare.dataset.value} was a trick number!` : pick(PRAISE));
        if (round === 3) { result.append(el('p', { class: 'round-result__text' }, '🧩 All matched!')); done(); return; }
        result.append(el('div', { class: 'stage-actions' }, button('Next round ▶', 'btn', () => { round += 1; newRound(); })));
      }

      box.append(
        el('p', { class: 'round-label' }, `Round ${round + 1} of 4`),
        instruction('✋ Drag each number onto its card. Or tap a number, then tap a card.'),
        cards, bank, result
      );
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK — same number, a different way
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const rounds = [
      (() => { const n = rnd(31, 49); return n % 10 === 0 ? n + 2 : n; })(),
      (() => { const n = rnd(52, 78); return n % 10 === 0 ? n + 4 : n; })(),
      rnd(4, 8) * 10
    ];
    let round = 0;
    newRound();

    function newRound() {
      if (round === rounds.length) { finalQuestion(); return; }
      box.innerHTML = '';
      const n = rounds[round];
      const T = Math.floor(n / 10);
      const O = n % 10;
      const tensAllowed = T - 1;
      let solved = false;
      say(`Usually ${n} is ${T} tens and ${O} ones. Can you make ${n} with only ${tensAllowed} ${tensAllowed === 1 ? 'ten' : 'tens'}?`);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });

      const builder = createBuilder({
        tens: tensAllowed, ones: 0, lockTens: true, allowSwap: false, maxOnes: 19,
        onChange: ({ tens, ones, value }) => {
          if (solved) return;
          if (value === n) {
            solved = true;
            builder.lock();
            MA.launchConfetti(25);
            say('Same number, different way! Great thinking!');
            result.append(
              el('p', { class: 'round-result__text' }, `🎉 ${n} = ${T * 10} + ${O}`),
              el('p', { class: 'round-result__text' }, `and ${n} = ${tens * 10} + ${ones}`),
              el('div', { class: 'stage-actions' }, button(round === rounds.length - 1 ? 'One last question ▶' : 'Next number ▶', 'btn', () => { round += 1; newRound(); })));
          } else if (value > n) {
            say('Too many! Take some ones away.');
          }
        }
      });

      box.append(
        el('p', { class: 'round-label' }, `Puzzle ${round + 1} of ${rounds.length + 1}`),
        el('div', { class: 'pv-target' }, el('span', { class: 'pv-target__label' }, 'Make'),
          el('span', { class: 'pv-target__num', html: digitsHTML(n) }),
          el('span', { class: 'pv-target__rule' }, `with ${tensAllowed} ${tensAllowed === 1 ? 'ten' : 'tens'} 🔒`)),
        instruction('👆 Add ones until you reach the number.'),
        builder.root, result
      );
    }

    function finalQuestion() {
      box.innerHTML = '';
      const n = rnd(3, 7) * 10 + rnd(2, 8);
      const T = Math.floor(n / 10);
      const O = n % 10;
      const right = `${T - 1} tens and ${O + 10} ones`;
      const options = shuffle([right, `${T} tens and ${O + 10} ones`, `${T + 1} tens and ${O} ones`]);
      say(`Which one is ALSO ${n}? Think carefully!`);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const group = el('div', { class: 'fix-options fix-options--wide', role: 'group', 'aria-label': `Which is the same as ${n}?` });
      options.forEach(text => {
        const opt = button(text, 'pattern-btn', () => {
          if (text === right) {
            $$('.pattern-btn', group).forEach(b => { b.disabled = true; });
            opt.classList.add('is-right');
            say('Yes! Break one ten into 10 ones and the number stays the same.');
            MA.launchConfetti(30);
            result.append(el('p', { class: 'round-result__text' }, `🧠 ${T - 1} tens + ${O + 10} ones = ${(T - 1) * 10} + ${O + 10} = ${n}`));
            done();
          } else {
            opt.classList.add('is-wrong');
            opt.disabled = true;
            say(`Almost! Work it out: tens make ${T - 1}0, ${T}0 or ${T + 1}0. Then add the ones.`);
          }
        });
        group.append(opt);
      });
      box.append(
        el('p', { class: 'round-label' }, `Puzzle ${rounds.length + 1} of ${rounds.length + 1}`),
        el('div', { class: 'pv-target' }, el('span', { class: 'pv-target__label' }, 'Which is also'),
          el('span', { class: 'pv-target__num', html: digitsHTML(n) })),
        group, result
      );
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — number riddles with tens/ones spinners
     ------------------------------------------------------------ */
  function renderRiddles(box, done) {
    const MAKERS = [
      () => { const t = rnd(2, 8); const o = rnd(1, 9); return { text: `I have ${t} tens and ${o} ones. What number am I?`, answer: t * 10 + o, hint: `Put ${t} in the tens and ${o} in the ones.` }; },
      () => { const n = rnd(21, 79); return { text: `I am 10 more than ${n}.`, answer: n + 10, hint: '10 more: the tens digit goes up by 1. The ones stay the same.' }; },
      () => { const t = rnd(3, 9) * 10; return { text: `I am 1 less than ${t}.`, answer: t - 1, hint: `Count back 1 from ${t}.` }; },
      () => { const t = rnd(2, 6); return { text: `My tens digit is ${t}. My ones digit is 3 more than my tens digit.`, answer: t * 10 + t + 3, hint: `${t} + 3 = ${t + 3}. Put that in the ones.` }; },
      () => { const t = rnd(3, 8); return { text: `I am between ${t}0 and ${t + 1}0. My ones digit is 5.`, answer: t * 10 + 5, hint: `Numbers between ${t}0 and ${t + 1}0 have ${t} tens.` }; }
    ];
    let index = 0;
    newRiddle();

    function newRiddle() {
      box.innerHTML = '';
      const riddle = MAKERS[index]();
      let tens = 0;
      let ones = 0;
      let solved = false;
      say(index === 0 ? 'Riddle time! Turn the spinners to make the number.' : pick(['Here is another riddle!', 'Think like a detective!']));

      const tensVal = el('span', { class: 'spin__val d-tens' }, '0');
      const onesVal = el('span', { class: 'spin__val d-ones' }, '0');
      const blocks = el('div', { class: 'pv-preview' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const spinner = (label, valEl, getSet) => el('div', { class: `spin spin--${label.toLowerCase()}` },
        el('p', { class: 'spin__label' }, label),
        button('▲', 'spin__btn', () => step(getSet, 1), { 'aria-label': `${label} up` }),
        valEl,
        button('▼', 'spin__btn', () => step(getSet, -1), { 'aria-label': `${label} down` }));

      function step(which, d) {
        if (solved) return;
        if (which === 'tens') tens = (tens + d + 10) % 10;
        else ones = (ones + d + 10) % 10;
        tensVal.textContent = tens;
        onesVal.textContent = ones;
        blocks.innerHTML = blocksHTML(tens, ones);
        result.innerHTML = '';
      }

      const checkBtn = button('✓ Check', 'btn btn--big', () => {
        const n = tens * 10 + ones;
        result.innerHTML = '';
        if (n === riddle.answer) {
          solved = true;
          $$('button', box).forEach(b => { b.disabled = true; });
          MA.launchConfetti(30);
          say(pick(PRAISE));
          result.append(el('p', { class: 'round-result__text' }, `🎉 Yes! I am ${n}!`));
          if (index === MAKERS.length - 1) { result.append(el('p', { class: 'round-result__tip' }, '🚀 All riddles solved!')); done(); }
          else result.append(el('div', { class: 'stage-actions' }, button('Next riddle ▶', 'btn', () => { index += 1; newRiddle(); })));
        } else {
          result.append(el('p', { class: 'round-result__tip' }, `💡 ${riddle.hint}`));
          say(`Not ${n}. ${riddle.hint}`);
        }
      });

      box.append(
        el('p', { class: 'round-label' }, `Riddle ${index + 1} of ${MAKERS.length}`),
        el('div', { class: 'riddle' }, el('span', { class: 'riddle__icon', 'aria-hidden': 'true' }, '🕵️'), el('p', { class: 'riddle__text' }, riddle.text)),
        el('div', { class: 'spinners' }, spinner('Tens', tensVal, 'tens'), spinner('Ones', onesVal, 'ones')),
        blocks, checkBtn, result
      );
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER — five mixed questions
     ------------------------------------------------------------ */
  function twoDigits() {
    const t = rnd(2, 9);
    let o;
    do { o = rnd(1, 9); } while (o === t);
    return { n: t * 10 + o, t, o };
  }

  function qDigitValue() {
    const { n, t } = twoDigits();
    return {
      icon: '🔍', question: `What is the ${t} worth in ${n}?`, instruction: 'Look at where the digit sits.',
      visual: `<div class="pv-preview"><span class="pv-preview__num">${digitsHTML(n)}</span></div>`,
      options: optionsFor(t * 10, [t, n, t * 10 + 10]),
      answer: t * 10,
      hint: `Almost! The ${t} is in the tens place. How much are ${t} tens?`,
      explain: `${t} is in the tens place, so it is worth ${t * 10}.`
    };
  }

  function qPartition() {
    const { n, t, o } = twoDigits();
    return {
      icon: '✂️', question: `${n} = ${t * 10} + ?`, instruction: 'Split the number into tens and ones.',
      options: optionsFor(o, [o * 10, t, o + 1]),
      answer: o,
      hint: `Almost! ${t * 10} is the tens part. What is left in the ones?`,
      explain: `${n} = ${t * 10} + ${o}`
    };
  }

  function qBlocks() {
    const { n, t, o } = twoDigits();
    return {
      icon: '🧱', question: 'What number is this?', instruction: 'Rods are tens. Cubes are ones.',
      visual: `<div class="pv-preview pv-preview--big" role="img" aria-label="${t} rods and ${o} cubes">${blocksHTML(t, o)}</div>`,
      options: optionsFor(n, [o * 10 + t, n + 10, n - 1]),
      answer: n,
      hint: 'Almost! Count the rods in tens first: 10, 20, 30…',
      explain: `${t} tens and ${o} ones make ${n}.`
    };
  }

  function qWhichHasTens() {
    const { n, t, o } = twoDigits();
    return {
      icon: '🎯', question: `Which number has ${t} tens?`, instruction: 'Look at the tens digit.',
      options: optionsFor(n, [o * 10 + t, (t + 1) * 10 + o > 99 ? (t - 1) * 10 + o : (t + 1) * 10 + o]),
      answer: n,
      hint: 'Almost! The tens digit is the first digit.',
      explain: `${n} has ${t} tens and ${o} ones.`
    };
  }

  function qTenMore() {
    const n = rnd(21, 79);
    return {
      icon: '➕', question: `What is 10 more than ${n}?`, instruction: 'Only one digit changes!',
      options: optionsFor(n + 10, [n + 1, n + 20, n - 10]),
      answer: n + 10,
      hint: 'Almost! Add one more ten. The ones digit stays the same.',
      explain: `${n} + 10 = ${n + 10}`
    };
  }

  function renderMaster(box, done) {
    K.runMaster(box, done, {
      makeQuestions: () => [qBlocks(), qDigitValue(), qPartition(), qWhichHasTens(), qTenMore()],
      moduleId: MODULE_ID,
      badgeId: 'place-value-pro',
      title: 'Place Value Pro'
    });
  }

  /* ------------------------------------------------------------
     Start
     ------------------------------------------------------------ */
  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
