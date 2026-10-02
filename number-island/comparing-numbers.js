/* ==============================================================
   ⚖️ Number Island → Comparing Numbers   number-island/comparing-numbers.js
   --------------------------------------------------------------
   🌱 Learn      tap the bigger number (tens first!), then meet < > =
   🎮 Play       balance scale: add tens and ones to tip or level it
   🧩 Practise   drag numbers into order, smallest ↔ biggest
   🧠 Think      true or false? fix Milo's comparisons
   🚀 Challenge  missing digits and "numbers between"
   🏆 Master     five mixed questions → Comparing Champ badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  if (!MA || !K) return;
  const { $, $$, rnd, pick, shuffle, el, button, instruction, say, pulse, makeDraggable, choices, digitsHTML, blocksHTML, trueFalse, PRAISE } = K;

  const MODULE_ID = 'number-island/comparing-numbers';

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'More or less?',        render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Balance scale',        render: renderPlay },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Put them in order',    render: renderPractise },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',       render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Digit detective',      render: renderChallenge },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Comparing Champ',      render: renderMaster }
  ];

  const signOf = (a, b) => (a > b ? '>' : a < b ? '<' : '=');
  const signWords = { '>': 'is greater than', '<': 'is less than', '=': 'is equal to' };
  const tensOf = n => Math.floor(n / 10);

  /** Two different 2-digit numbers. kind: 'tens' (different tens), 'swap' (27/72), 'same' (same tens) */
  function makePair(kind) {
    const t = rnd(2, 8);
    if (kind === 'swap') {
      let o;
      do { o = rnd(1, 9); } while (o === t);
      return shuffle([t * 10 + o, o * 10 + t]);
    }
    if (kind === 'same') {
      const [a, b] = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 2);
      return [t * 10 + a, t * 10 + b];
    }
    let t2;
    do { t2 = rnd(1, 9); } while (t2 === t);
    return [t * 10 + rnd(0, 9), t2 * 10 + rnd(0, 9)];
  }

  /** Why one number is bigger, in kid words. */
  function reason(a, b) {
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    if (tensOf(big) !== tensOf(small)) return `${big} has ${tensOf(big)} tens. ${small} has only ${tensOf(small)}.`;
    return `Same tens! Look at the ones: ${big % 10} ones is more than ${small % 10}.`;
  }

  /* ------------------------------------------------------------
     🌱 LEARN — which is more? then the < > = signs
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const KINDS = ['tens', 'swap', 'same'];
    let round = 0;
    whichIsMore();

    function whichIsMore() {
      box.innerHTML = '';
      const [a, b] = makePair(KINDS[round]);
      const big = Math.max(a, b);
      let solved = false;
      say(round === 0 ? 'Which number is more? Look at the tens first!' : pick(['Which one is bigger?', 'Tens first, then ones!']));

      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const cards = el('div', { class: 'cmp-cards' });
      [a, b].forEach(n => {
        const card = button([
          el('span', { class: 'cmp-card__num', html: digitsHTML(n) }),
          el('span', { class: 'cmp-card__blocks', html: blocksHTML(n) })
        ], 'cmp-card', () => {
          if (solved) return;
          if (n === big) {
            solved = true;
            card.classList.add('is-right');
            $$('.cmp-card', cards).forEach(c => { c.disabled = true; });
            say(reason(a, b));
            MA.launchConfetti(20);
            result.append(el('p', { class: 'round-result__text' }, `🎉 ${big} is more!`),
              el('p', { class: 'round-result__tip' }, reason(a, b)),
              el('div', { class: 'stage-actions' }, button(round === KINDS.length - 1 ? 'Next: meet the signs ▶' : 'Next ▶', 'btn', () => {
                round += 1;
                if (round < KINDS.length) whichIsMore(); else { round = 0; signs(); }
              })));
          } else {
            card.classList.add('is-wrong');
            card.disabled = true;
            say(tensOf(a) === tensOf(b) ? 'The tens are the same. Now compare the ones!' : 'Look at the tens first. Which has more rods?');
          }
        }, { 'data-value': n, 'aria-label': String(n) });
        cards.append(card);
      });

      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of ${KINDS.length}`),
        instruction('👆 Tap the number that is MORE.'), cards, result);
    }

    function signs() {
      box.innerHTML = '';
      const kinds = ['>', '<', '='];
      const want = kinds[round];
      let a;
      let b;
      if (want === '=') { a = rnd(21, 89); b = a; } else {
        [a, b] = makePair(pick(['tens', 'swap', 'same']));
        if (signOf(a, b) !== want) [a, b] = [b, a];
      }
      say(round === 0
        ? 'Meet the signs! The wide open side always faces the bigger number.'
        : pick(['Which sign fits?', 'Open side to the bigger number!']));

      const gap = el('span', { class: 'sign-gap', 'aria-label': 'missing sign' }, '?');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const pad = el('div', { class: 'sign-pad', role: 'group', 'aria-label': 'Signs' });
      ['<', '=', '>'].forEach(sign => {
        const b2 = button(sign, 'sign-btn', () => {
          if (sign === want) {
            gap.textContent = sign;
            gap.classList.add('is-filled');
            $$('.sign-btn', pad).forEach(x => { x.disabled = true; });
            b2.classList.add('is-right');
            const sentence = `${a} ${signWords[sign]} ${b}.`;
            say(sentence);
            MA.launchConfetti(20);
            result.append(el('p', { class: 'round-result__text' }, `🎉 ${sentence}`));
            if (round === kinds.length - 1) done();
            else result.append(el('div', { class: 'stage-actions' }, button('Next ▶', 'btn', () => { round += 1; signs(); })));
          } else {
            b2.classList.add('is-wrong');
            b2.disabled = true;
            say(a === b ? 'Look again. Are they the same?' : `Which is bigger, ${a} or ${b}? Point the open side at it!`);
          }
        }, { 'aria-label': signWords[sign] });
        pad.append(b2);
      });

      box.append(
        el('p', { class: 'round-label' }, `Sign ${round + 1} of ${kinds.length}`),
        el('div', { class: 'sign-row' },
          el('span', { class: 'sign-num', html: digitsHTML(a) }), gap, el('span', { class: 'sign-num', html: digitsHTML(b) })),
        pad,
        el('ul', { class: 'sign-key', 'aria-label': 'What the signs mean' },
          el('li', {}, el('strong', {}, '>'), ' greater than'),
          el('li', {}, el('strong', {}, '<'), ' less than'),
          el('li', {}, el('strong', {}, '='), ' equal to')),
        result);
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — balance scale
     ------------------------------------------------------------ */
  function renderPlay(box, done) {
    const ROUNDS = [
      { goal: '=', text: 'Make the scale balance!' },
      { goal: '=', text: 'Balance it again!' },
      { goal: '>', text: 'Make YOUR side heavier, but use the fewest blocks!' },
      { goal: '<', text: 'Make YOUR side lighter, but as close as you can!' }
    ];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const cfg = ROUNDS[round];
      const left = rnd(23, 78);
      let right = 0;
      let solved = false;
      say(cfg.text);

      const beam = el('div', { class: 'beam' });
      const leftPan = el('div', { class: 'pan pan--left' });
      const rightPan = el('div', { class: 'pan pan--right' });
      beam.append(leftPan, rightPan);
      const sign = el('span', { class: 'sign-gap is-filled' }, '>');
      const live = el('p', { class: 'scale-sentence', 'aria-live': 'polite' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const pad = el('div', { class: 'hop-pad', role: 'group', 'aria-label': 'Add or remove blocks' });
      [[-10, '−10'], [-1, '−1'], [1, '+1'], [10, '+10']].forEach(([d, label]) => {
        pad.append(button(label, `hop-btn ${Math.abs(d) === 10 ? 'hop-btn--ten' : 'hop-btn--one'}`, () => change(d), {
          'aria-label': `${d > 0 ? 'Add' : 'Take away'} ${Math.abs(d) === 10 ? 'a ten' : 'a one'}`
        }));
      });
      const checkBtn = cfg.goal === '=' ? null : button('✓ Check', 'btn btn--big', check);

      function change(d) {
        if (solved) return;
        const next = right + d;
        if (next < 0 || next > 99) return;
        right = next;
        draw();
        if (cfg.goal === '=' && right === left) win(`Balanced! ${left} = ${right}`);
      }

      function draw() {
        const diff = right - left;
        const tilt = diff === 0 ? 0 : Math.sign(diff) * Math.min(14, 5 + Math.abs(diff) * 0.25);
        beam.style.setProperty('--tilt', `${tilt}deg`);
        leftPan.innerHTML = `<span class="pan__who">Milo</span><span class="pan__num">${digitsHTML(left)}</span>${blocksHTML(left)}`;
        rightPan.innerHTML = `<span class="pan__who">You</span><span class="pan__num">${right ? digitsHTML(right) : '0'}</span>${blocksHTML(right)}`;
        sign.textContent = signOf(left, right);
        live.textContent = `${left} ${signWords[signOf(left, right)]} ${right}`;
      }

      function check() {
        result.innerHTML = '';
        const ok = cfg.goal === '>' ? right > left : right < left;
        if (!ok) {
          say(cfg.goal === '>' ? 'Your side is not heavier yet. Look at the scale!' : 'Your side is not lighter yet. Take some away!');
          return;
        }
        const best = cfg.goal === '>' ? left + 1 : left - 1;
        if (right === best) win(`Perfect! ${right} is just ${cfg.goal === '>' ? 'one more' : 'one less'} than ${left}.`);
        else {
          result.append(el('p', { class: 'round-result__tip' },
            `✅ ${right} ${signWords[cfg.goal === '>' ? '>' : '<']} ${left}. Can you get even closer to ${left}?`));
          say('Yes! Now can you get even closer?');
        }
      }

      function win(text) {
        solved = true;
        $$('button', pad).forEach(b => { b.disabled = true; });
        if (checkBtn) checkBtn.disabled = true;
        MA.launchConfetti(30);
        say(text);
        result.innerHTML = '';
        result.append(el('p', { class: 'round-result__text' }, `🎉 ${text}`));
        if (round === ROUNDS.length - 1) done();
        else result.append(el('div', { class: 'stage-actions' }, button('Next round ▶', 'btn', () => { round += 1; newRound(); })));
      }

      draw();
      box.append(
        el('p', { class: 'round-label' }, `Round ${round + 1} of ${ROUNDS.length}`),
        instruction(`⚖️ ${cfg.text}`),
        el('div', { class: 'scale' }, beam, el('div', { class: 'scale__post', 'aria-hidden': 'true' }),
          el('div', { class: 'scale__labels' }, sign)),
        live, pad, checkBtn, result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — drag numbers into order
     ------------------------------------------------------------ */
  function renderPractise(box, done) {
    const ROUNDS = [
      { count: 4, dir: 'up' }, { count: 4, dir: 'down' }, { count: 5, dir: 'up' }, { count: 5, dir: 'down' }
    ];
    let round = 0;
    newRound();

    function makeSet(count) {
      const t = rnd(2, 7);
      let o;
      do { o = rnd(1, 9); } while (o === t);
      const set = new Set([t * 10 + o, o * 10 + t]);            // a swapped pair
      set.add(t * 10 + (o === 9 ? o - 2 : o + 1 === t ? o + 2 : o + 1)); // same tens as the first
      while (set.size < count) set.add(rnd(12, 98));
      return [...set];
    }

    function newRound() {
      box.innerHTML = '';
      const cfg = ROUNDS[round];
      const nums = makeSet(cfg.count);
      const order = [...nums].sort((a, b) => (cfg.dir === 'up' ? a - b : b - a));
      let selected = null;
      let filled = 0;
      say(cfg.dir === 'up' ? 'Smallest first! Line them up.' : 'Biggest first this time!');

      const slots = el('ol', { class: 'slots order-slots', 'aria-label': 'Order boxes' });
      order.forEach((value, i) => {
        const slot = button('', 'slot', () => {
          if (selected) tryPlace(selected, slot); else say('Pick a number first, then tap a box.');
        }, { 'data-value': value, 'data-index': i, 'aria-label': `Box ${i + 1}` });
        slots.append(el('li', {}, slot));
      });
      const ends = el('div', { class: 'order-ends', 'aria-hidden': 'true' },
        el('span', {}, cfg.dir === 'up' ? '⬅️ smallest' : '⬅️ biggest'),
        el('span', {}, cfg.dir === 'up' ? 'biggest ➡️' : 'smallest ➡️'));
      const bank = el('div', { class: 'tile-bank', role: 'group', 'aria-label': 'Numbers' });
      shuffle(nums).forEach(value => {
        const tile = button(String(value), 'tile', null, { 'data-value': value, 'aria-label': `Number ${value}` });
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
        if (Number(tile.dataset.value) === Number(slot.dataset.value)) {
          slot.textContent = tile.dataset.value;
          slot.classList.add('is-filled');
          slot.disabled = true;
          tile.remove();
          filled += 1;
          if (filled === order.length) {
            MA.launchConfetti(25);
            say(pick(PRAISE));
            const sym = cfg.dir === 'up' ? ' < ' : ' > ';
            result.append(el('p', { class: 'round-result__text' }, `🎉 ${order.join(sym)}`));
            if (round === ROUNDS.length - 1) done();
            else result.append(el('div', { class: 'stage-actions' }, button('Next round ▶', 'btn', () => { round += 1; newRound(); })));
          } else say(pick(PRAISE));
        } else {
          pulse(slot, 'is-bad');
          pulse(tile, 'is-bounce');
          say('Almost! Compare the tens first. If the tens are the same, look at the ones.');
        }
      }

      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of ${ROUNDS.length} · ${cfg.dir === 'up' ? 'smallest → biggest' : 'biggest → smallest'}`),
        instruction('✋ Drag each number into its box. Or tap a number, then a box.'),
        ends, slots, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK — true or false?
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const statements = [
      () => { const [a, b] = makePair('swap').sort((x, y) => x - y); return { text: `${a} > ${b}`, truth: false, explain: `${a} < ${b}. ${reason(a, b)}`, fix: { question: 'Which sign makes it true?', options: ['<', '=', '>'], answer: '<' } }; },
      () => { const t = rnd(3, 7); const a = (t - 1) * 10 + 9; const b = t * 10 + 1; return { text: `${a} > ${b}<small>Milo says: “9 is bigger than 1!”</small>`, truth: false, explain: `${a} < ${b}. Compare the tens first: ${t - 1} tens is less than ${t} tens.`, fix: { question: 'What should Milo look at first?', options: ['The tens', 'The ones', 'The biggest digit'], answer: 'The tens' } }; },
      () => { const [a, b] = makePair('same').sort((x, y) => x - y); return { text: `${a} < ${b}`, truth: true, explain: `True! ${reason(a, b)}` }; },
      () => { const n = rnd(31, 89); const t = tensOf(n); return { text: `${t * 10} + ${n % 10} = ${n}`, truth: true, explain: `True! ${t} tens and ${n % 10} ones make ${n}.` }; }
    ];
    const order = shuffle(statements);
    let round = 0;
    next();

    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'Is it true or false? Think like a detective!' : pick(['True or false?', 'Check it carefully!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`),
        instruction('👆 Tap True or False.'));
      trueFalse(box, order[round](), result => {
        if (round === order.length - 1) done();
        else result.append(el('div', { class: 'stage-actions' }, button('Next ▶', 'btn', () => { round += 1; next(); })));
      });
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — digit detective (missing digits, numbers between)
     ------------------------------------------------------------ */
  function renderChallenge(box, done) {
    const MAKERS = [
      () => {
        const t = rnd(2, 8); const o = rnd(3, 7);
        const answers = []; for (let d = 0; d <= 9; d++) if (t * 10 + d > t * 10 + o) answers.push(d);
        return { html: `<span class="d-tens">${t}</span><span class="digit-box">?</span> &gt; ${t}${o}`, label: `${t} and a missing digit is greater than ${t * 10 + o}`, choices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], answers, hint: `The tens are the same, so the missing ones digit must be more than ${o}.` };
      },
      () => {
        const T = rnd(4, 6); const o = rnd(1, 9);
        const answers = []; for (let d = 1; d <= 9; d++) if (d * 10 + o < T * 10 + o) answers.push(d);
        return { html: `<span class="digit-box">?</span><span class="d-ones">${o}</span> &lt; ${T}${o}`, label: `A missing digit then ${o} is less than ${T * 10 + o}`, choices: [1, 2, 3, 4, 5, 6, 7, 8, 9], answers, hint: `The ones are the same, so the missing tens digit must be less than ${T}.` };
      },
      () => {
        const a = rnd(31, 80); const b = a + 6;
        const choicesList = []; for (let n = a - 2; n <= b + 2; n++) choicesList.push(n);
        const answers = choicesList.filter(n => n > a && n < b);
        return { html: `Between ${a} and ${b}`, label: `Numbers between ${a} and ${b}`, choices: choicesList, answers, hint: `Between means bigger than ${a} AND smaller than ${b}. Not ${a} or ${b} themselves!` };
      }
    ];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const q = MAKERS[round]();
      const picked = new Set();
      let solved = false;
      say(round === 2 ? 'Find ALL the numbers in between!' : 'Which digits can go in the box? Find them all!');

      const grid = el('div', { class: 'digit-grid', role: 'group', 'aria-label': 'Choices' });
      q.choices.forEach(c => {
        const b = button(String(c), 'digit-btn', () => {
          if (solved) return;
          if (picked.has(c)) { picked.delete(c); b.setAttribute('aria-pressed', 'false'); }
          else { picked.add(c); b.setAttribute('aria-pressed', 'true'); }
          result.innerHTML = '';
        }, { 'aria-pressed': 'false', 'data-value': c });
        grid.append(b);
      });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const checkBtn = button('✓ Check', 'btn btn--big', () => {
        result.innerHTML = '';
        const wrong = [...picked].filter(c => !q.answers.includes(c));
        const missing = q.answers.filter(c => !picked.has(c));
        if (!wrong.length && !missing.length) {
          solved = true;
          $$('button', grid).forEach(b => { b.disabled = true; });
          checkBtn.disabled = true;
          MA.launchConfetti(35);
          say('Brilliant detective work!');
          result.append(el('p', { class: 'round-result__text' }, `🕵️ All found: ${q.answers.join(', ')}`));
          if (round === MAKERS.length - 1) done();
          else result.append(el('div', { class: 'stage-actions' }, button('Next case ▶', 'btn', () => { round += 1; newRound(); })));
        } else if (wrong.length) {
          wrong.forEach(c => pulse($(`.digit-btn[data-value="${c}"]`, grid), 'is-oops'));
          result.append(el('p', { class: 'round-result__tip' }, `💡 ${wrong.join(', ')} ${wrong.length === 1 ? 'does' : 'do'} not work. ${q.hint}`));
          say('Some of those do not work. Try each one!');
        } else {
          result.append(el('p', { class: 'round-result__tip' }, `💡 Good so far! You found ${q.answers.length - missing.length}. There ${missing.length === 1 ? 'is 1 more' : `are ${missing.length} more`}.`));
          say('Nearly! Some are still hiding.');
        }
      });

      box.append(el('p', { class: 'round-label' }, `Case ${round + 1} of ${MAKERS.length}`),
        el('p', { class: 'tf-statement', html: q.html, 'aria-label': q.label }),
        instruction('👆 Tap every one that works, then Check.'),
        grid, checkBtn, result);
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  function qBiggest() {
    const [a, b] = makePair('swap');
    let c;
    do { c = rnd(12, 98); } while (c === a || c === b);
    const big = Math.max(a, b, c);
    return { icon: '⬆️', question: 'Which number is the biggest?', instruction: 'Compare the tens first.', options: choices([a, b, c]), answer: big, hint: 'Almost! Find the number with the most tens.', explain: `${big} is the biggest.` };
  }
  function qSmallest() {
    const [a, b] = makePair('same');
    let c;
    do { c = rnd(12, 98); } while (c === a || c === b);
    const small = Math.min(a, b, c);
    return { icon: '⬇️', question: 'Which number is the smallest?', instruction: 'Fewest tens wins!', options: choices([a, b, c]), answer: small, hint: 'Almost! Look for the fewest tens. Same tens? Check the ones.', explain: `${small} is the smallest.` };
  }
  function qSign() {
    const [a, b] = makePair(pick(['swap', 'same', 'tens']));
    const s = signOf(a, b);
    return { icon: '⚖️', question: `${a}  ?  ${b}`, instruction: 'Which sign fits?', options: ['<', '=', '>'].map(v => ({ value: v, label: v })), answer: s, hint: 'Almost! The open side faces the bigger number.', explain: `${a} ${signWords[s]} ${b}.` };
  }
  function qBetween() {
    const a = rnd(25, 80);
    const b = a + rnd(4, 8);
    const inside = rnd(a + 1, b - 1);
    return { icon: '↔️', question: `Which number is between ${a} and ${b}?`, instruction: 'Bigger than the first, smaller than the second.', options: choices([inside, a - rnd(1, 5), b + rnd(1, 5)]), answer: inside, hint: `Almost! It must be more than ${a} and less than ${b}.`, explain: `${a} < ${inside} < ${b}` };
  }
  function qTrue() {
    const [a, b] = makePair('swap').sort((x, y) => x - y);
    const right = `${a} < ${b}`;
    return { icon: '✅', question: 'Which one is true?', instruction: 'Read each one carefully.', options: choices([right, `${a} > ${b}`, `${a} = ${b}`]), answer: right, hint: 'Almost! Which number has more tens?', explain: `${a} is less than ${b}.` };
  }

  function renderMaster(box, done) {
    K.runMaster(box, done, {
      makeQuestions: () => [qBiggest(), qSign(), qSmallest(), qBetween(), qTrue()],
      moduleId: MODULE_ID,
      badgeId: 'comparing-champ',
      title: 'Comparing Champ'
    });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
