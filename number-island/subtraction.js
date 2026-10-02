/* ==============================================================
   ➖ Number Island → Subtraction       number-island/subtraction.js
   --------------------------------------------------------------
   🌱 Learn      take away counters; back to ten first (13 − 5 = 13 − 3 − 2)
   🎮 Play       bar model: grow the missing part until the bar is full
   🧩 Practise   drag answers onto subtractions
   🧠 Think      true or false? (order matters, adding undoes subtracting)
   🚀 Challenge  fact families: fill all four sentences
   🏆 Master     five mixed questions → Subtraction Star badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  if (!MA || !K) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, pulse, optionsFor, trueFalse, nextOrDone, dragMatch, PRAISE } = K;

  const MODULE_ID = 'number-island/subtraction';

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Take away',          render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Fill the bar',       render: renderPlay },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Answer drop',        render: renderPractise },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',     render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Fact families',      render: renderFamilies },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Subtraction Star',   render: renderMaster }
  ];

  /* ------------------------------------------------------------
     🌱 LEARN — take away counters from two ten frames
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const sums = shuffle([[13, 5], [14, 6], [12, 4], [15, 7], [16, 8]]).slice(0, 3);
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const [whole, take] = sums[round];
      const extra = whole - 10;
      let taken = 0;
      let finished = false;
      say(round === 0
        ? `${whole} − ${take}. Tap counters to take away ${take}. Start with the loose ones!`
        : `${whole} − ${take}. Take away ${take}!`);

      const frames = el('div', { class: 'frames' });
      const counters = [];
      [10, extra].forEach((count, f) => {
        const frame = el('div', { class: 'ten-frame', role: 'group', 'aria-label': f === 0 ? 'Full ten frame' : 'Second frame' });
        for (let i = 0; i < 10; i++) {
          if (i < count) {
            const c = button('', 'tf-cell has-red', () => tap(c, f), { 'aria-label': 'Counter, tap to take away' });
            counters.push(c);
            frame.append(c);
          } else frame.append(el('span', { class: 'tf-cell' }));
        }
        frames.append(frame);
      });
      const sentence = el('p', { class: 'add-sentence', 'aria-live': 'polite' }, `${whole} − ${take} = ?`);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });

      function tap(counter) {
        if (finished || counter.classList.contains('is-gone')) return;
        counter.classList.add('is-gone');
        counter.disabled = true;
        taken += 1;
        sentence.textContent = `Taken ${taken} of ${take}`;
        if (taken === extra && take > extra) say(`Back to 10! Now take ${take - extra} more.`);
        if (taken === take) {
          finished = true;
          counters.forEach(c => { c.disabled = true; });
          const answer = whole - take;
          sentence.innerHTML = take > extra
            ? `${whole} − ${extra} = 10, &nbsp;10 − ${take - extra} = <strong>${answer}</strong>`
            : `${whole} − ${take} = <strong>${answer}</strong>`;
          say(`${whole} − ${take} = ${answer}! ${pick(PRAISE)}`);
          MA.launchConfetti(25);
          result.append(el('p', { class: 'round-result__tip' }, `Take ${extra} to get back to 10, then ${take - extra} more.`));
          nextOrDone(result, round === sums.length - 1, 'Next one ▶', () => { round += 1; newRound(); }, done);
        }
      }

      box.append(el('p', { class: 'round-label' }, `Take away ${round + 1} of ${sums.length}`),
        instruction(`👆 Tap ${take} counters to take them away.`), frames, sentence, result);
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — bar model: find the missing part
     ------------------------------------------------------------ */
  function renderPlay(box, done) {
    const ROUNDS = [
      () => { const w = rnd(12, 18); return [w, rnd(4, w - 4)]; },
      () => { const w = rnd(5, 9) * 10; return [w, rnd(1, w / 10 - 1) * 10]; },
      () => { const w = rnd(35, 68); return [w, rnd(12, w - 12)]; },
      () => { const w = rnd(41, 89); return [w, rnd(15, w - 10)]; }
    ];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const [whole, part] = ROUNDS[round]();
      const missing = whole - part;
      let guess = 0;
      let solved = false;
      say(`The whole bar is ${whole}. One part is ${part}. Grow the other part to fill the bar!`);

      const known = el('div', { class: 'bar-part bar-part--known', style: `width:${(part / whole) * 100}%` }, String(part));
      const grow = el('div', { class: 'bar-part bar-part--grow' }, '?');
      const over = el('div', { class: 'bar-over' });
      const bar = el('div', { class: 'bar-model', role: 'img', 'aria-label': `Bar of ${whole}, with a part of ${part}` }, known, grow, over);
      const sentence = el('p', { class: 'add-sentence', 'aria-live': 'polite' }, `${part} + ? = ${whole}`);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const pad = el('div', { class: 'hop-pad', role: 'group', 'aria-label': 'Grow or shrink the part' });
      [[-10, '−10'], [-1, '−1'], [1, '+1'], [10, '+10']].forEach(([d, label]) => {
        pad.append(button(label, `hop-btn ${Math.abs(d) === 10 ? 'hop-btn--ten' : 'hop-btn--one'}`, () => change(d), {
          'aria-label': `${d > 0 ? 'Grow' : 'Shrink'} by ${Math.abs(d)}`
        }));
      });

      function change(d) {
        if (solved) return;
        const next = guess + d;
        if (next < 0 || next > whole) return;
        guess = next;
        const fits = Math.min(guess, missing);
        grow.style.width = `${(fits / whole) * 100}%`;
        grow.textContent = guess ? String(guess) : '?';
        bar.classList.toggle('is-over', guess > missing);
        sentence.textContent = `${part} + ${guess} = ${part + guess}`;
        if (guess > missing) say('Too long! It spills over the end. Shrink it.');
        if (guess === missing) {
          solved = true;
          $$('button', pad).forEach(b => { b.disabled = true; });
          bar.classList.add('is-full');
          sentence.innerHTML = `${whole} − ${part} = <strong>${missing}</strong>`;
          say(`The bar is full! ${whole} − ${part} = ${missing}.`);
          MA.launchConfetti(25);
          result.append(el('p', { class: 'round-result__tip' }, `${part} + ${missing} = ${whole}, so ${whole} − ${part} = ${missing}.`));
          nextOrDone(result, round === ROUNDS.length - 1, 'Next bar ▶', () => { round += 1; newRound(); }, done);
        }
      }

      box.append(el('p', { class: 'round-label' }, `Bar ${round + 1} of ${ROUNDS.length}`),
        el('div', { class: 'bar-whole' }, el('span', {}, `Whole: ${whole}`)), bar, sentence,
        instruction('👆 Tap the buttons to grow the orange part.'), pad, result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — drag answers onto subtractions
     ------------------------------------------------------------ */
  function renderPractise(box, done) {
    const MAKERS = [
      () => { const a = rnd(11, 18); const b = rnd(a - 9, 9); return [`${a} − ${b}`, a - b]; },
      () => { const a = rnd(5, 9) * 10; const b = rnd(1, a / 10 - 1) * 10; return [`${a} − ${b}`, a - b]; },
      () => { const a = rnd(2, 9) * 10 + rnd(5, 9); const b = rnd(1, 4); return [`${a} − ${b}`, a - b]; },
      () => { const a = rnd(25, 99); return [`${a} − 10`, a - 10]; },
      () => { const a = rnd(3, 8) * 10 + rnd(1, 4); const b = rnd(5, 8); return [`${a} − ${b}`, a - b]; }
    ];
    const ROUNDS = [[0, 0, 1, 1], [2, 3, 2, 1], [4, 4, 3, 2]];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const sums = [];
      ROUNDS[round].forEach(k => {
        let s;
        do { s = MAKERS[k](); } while (sums.some(x => x[1] === s[1]));
        sums.push(s);
      });
      const base = sums[sums.length - 1][1];
      const trick = [base + 10, base - 1, base + 1, base + 2].find(v => v >= 0 && !sums.some(x => x[1] === v));
      say(round === 0 ? 'Work out each one and drop the answer on it.' : pick(['More to solve!', 'Count back to 10 first if you need to!']));
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        items: sums.map(([text, ans]) => ({ face: el('span', {}, `${text} =`), value: ans, label: text })),
        tiles: [...sums.map(s => s[1]), trick],
        hint: 'Almost! Take away the ones first. Do you need to go back past a ten?',
        onComplete: spare => {
          MA.launchConfetti(25);
          say(spare ? `${pick(PRAISE)} ${spare.dataset.value} was a trick answer!` : pick(PRAISE));
          nextOrDone(result, round === ROUNDS.length - 1, 'Next round ▶', () => { round += 1; newRound(); }, done, '🧩 All done!');
        }
      });
      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of ${ROUNDS.length}`),
        instruction('✋ Drag each answer onto its sum. Or tap an answer, then a box.'), cards, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK — true or false?
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const statements = [
      () => { const a = rnd(3, 7) * 10 + rnd(5, 9); const b = rnd(2, 4); const wrong = a - b * 10; return { text: `${a} − ${b} = ${wrong}<small>Milo took ${b} from the tens.</small>`, truth: false, explain: `${a} − ${b} = ${a - b}. Take ones from the ones!`, fix: { question: `What is ${a} − ${b}?`, options: [a - b, wrong, a - b - 1], answer: a - b } }; },
      () => { const a = rnd(3, 6); const b = rnd(8, 12); return { text: `${b} − ${a} = ${a} − ${b}<small>Can we swap them?</small>`, truth: false, explain: `No! ${b} − ${a} = ${b - a}, but you can't take ${b} from ${a}. Order matters in subtraction.` }; },
      () => { const a = rnd(5, 9); const b = rnd(4, 9); return { text: `${a} + ${b} = ${a + b}, so ${a + b} − ${b} = ${a}`, truth: true, explain: 'True! Subtraction undoes addition.' }; },
      () => { const t = rnd(3, 8) * 10; const b = rnd(2, 8); return { text: `${t} − ${b} = ${t - b}`, truth: true, explain: `True! ${t} − ${b}: count back from ${t}, past the ten, to ${t - b}.` }; }
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'Is Milo right? True or false?' : pick(['True or false?', 'Check carefully!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — fact families
     ------------------------------------------------------------ */
  function renderFamilies(box, done) {
    const distinct = (makeA, makeB) => { let a; let b; do { a = makeA(); b = makeB(); } while (a === b); return [a, b, a + b]; };
    const families = [
      distinct(() => rnd(6, 9), () => rnd(3, 8)),
      distinct(() => rnd(2, 5) * 10, () => rnd(1, 4) * 10)
    ];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const [a, b, whole] = families[round];
      const sentences = [
        { parts: [a, '+', b, '=', whole], blank: rnd(0, 1) ? 2 : 4 },
        { parts: [b, '+', a, '=', whole], blank: 0 },
        { parts: [whole, '−', a, '=', b], blank: 4 },
        { parts: [whole, '−', b, '=', a], blank: 2 }
      ];
      let selected = null;
      let filled = 0;
      say('These three numbers are a family! Fill in all four sentences.');

      const tri = el('div', { class: 'family', role: 'group', 'aria-label': 'Family numbers' });
      [whole, a, b].forEach((n, i) => {
        const chip = button(String(n), `family__num${i === 0 ? ' family__num--top' : ''}`, () => {
          $$('.family__num', tri).forEach(c => c.classList.remove('is-selected'));
          selected = n;
          chip.classList.add('is-selected');
          say(`Now tap a box where ${n} goes.`);
        }, { 'aria-label': `Number ${n}` });
        tri.append(chip);
      });
      const list = el('ol', { class: 'family-list' });
      sentences.forEach(sen => {
        const row = el('li', { class: 'family-row' });
        sen.parts.forEach((p, i) => {
          if (i === sen.blank) {
            const blank = button('?', 'family-blank', () => {
              if (blank.disabled) return;
              if (selected === null) { say('Pick a number from the family first.'); return; }
              if (selected === p) {
                blank.textContent = p;
                blank.disabled = true;
                blank.classList.add('is-filled');
                filled += 1;
                if (filled === sentences.length) finish();
                else say(pick(PRAISE));
              } else {
                pulse(blank, 'is-bad');
                say(sen.parts[1] === '+' ? 'Almost! Two parts add up to the whole.' : 'Almost! Whole take away one part leaves the other part.');
              }
            }, { 'aria-label': 'Missing number' });
            row.append(blank);
          } else row.append(el('span', { class: 'family-text' }, String(p)));
        });
        list.append(row);
      });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      function finish() {
        MA.launchConfetti(35);
        say('A whole family of facts from three numbers!');
        nextOrDone(result, round === families.length - 1, 'Next family ▶', () => { round += 1; newRound(); }, done, '🚀 Two families complete!');
      }
      box.append(el('p', { class: 'round-label' }, `Family ${round + 1} of ${families.length}`),
        instruction('👆 Tap a family number, then tap the ? where it goes.'), tri, list, result);
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  function qBridge() { const a = rnd(11, 17); const b = rnd(a - 9, 9); return { icon: '🔟', question: `${a} − ${b} = ?`, instruction: 'Go back to 10 first.', options: optionsFor(a - b, [a - b + 1, a - b - 1, a + b]), answer: a - b, hint: `Almost! ${a} − ${a - 10} = 10. Then take ${b - (a - 10)} more.`, explain: `${a} − ${b} = ${a - b}` }; }
  function qTens() { const a = rnd(5, 9) * 10; const b = rnd(1, 4) * 10; return { icon: '🧱', question: `${a} − ${b} = ?`, instruction: 'Take away tens.', options: optionsFor(a - b, [a - b + 10, a - b - 10, a + b]), answer: a - b, hint: `Almost! ${a / 10} tens − ${b / 10} tens = ? tens`, explain: `${a / 10 - b / 10} tens = ${a - b}` }; }
  function qOnes() { const a = rnd(3, 9) * 10 + rnd(5, 9); const b = rnd(2, 4); return { icon: '➖', question: `${a} − ${b} = ?`, instruction: 'Only the ones change.', options: optionsFor(a - b, [a - b * 10, a - b + 1, a - b - 1]), answer: a - b, hint: 'Almost! Take ones away from the ones.', explain: `${a} − ${b} = ${a - b}` }; }
  function qMissing() { const a = rnd(4, 9); const b = rnd(4, 9); return { icon: '❓', question: `${a + b} − ? = ${a}`, instruction: 'What was taken away?', options: optionsFor(b, [b + 1, a, a + b]), answer: b, hint: `Almost! ${a} + ? = ${a + b}`, explain: `${a + b} − ${b} = ${a}` }; }
  function qStory() { const a = rnd(21, 48); const b = rnd(3, 7); const who = pick(['Sam', 'Aisha', 'Ravi', 'Mei', 'Leo']); const thing = pick(['balloons', 'stickers', 'crayons', 'shells']); return { icon: '📖', question: `${who} had ${a} ${thing} and gave away ${b}. How many are left?`, instruction: 'Which sum helps?', options: optionsFor(a - b, [a + b, a - b + 1, a - b - 10]), answer: a - b, hint: `Almost! ${a} − ${b} = ?`, explain: `${a} − ${b} = ${a - b} ${thing}` }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qBridge(), qTens(), qOnes(), qMissing(), qStory()], moduleId: MODULE_ID, badgeId: 'subtraction-star', title: 'Subtraction Star' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
