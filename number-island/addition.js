/* ==============================================================
   ➕ Number Island → Addition          number-island/addition.js
   --------------------------------------------------------------
   🌱 Learn      ten frames: "make ten" to add across 10 (8 + 5 = 10 + 3)
   🎮 Play       number-bond bubbles: pop pairs that make 10, 20 and 100
   🧩 Practise   drag answers onto sums (ones, tens, 2-digit + 1-digit)
   🧠 Think      true or false? fix Milo's adding mistakes
   🚀 Challenge  pick two cards that hit the target number
   🏆 Master     five mixed questions → Addition Ace badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  if (!MA || !K) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, pulse, makeDraggable, optionsFor, trueFalse, PRAISE } = K;

  const MODULE_ID = 'number-island/addition';

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Make ten to add',      render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Bond bubbles',         render: renderPlay },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Answer drop',          render: renderPractise },
    { id: 'think',     icon: '🧠', label: 'Think',     title: "Milo's sums",          render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Hit the target',       render: renderChallenge },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Addition Ace',         render: renderMaster }
  ];

  /* ------------------------------------------------------------
     🌱 LEARN — make ten with two ten frames
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const pairs = shuffle([[8, 5], [9, 4], [7, 6], [8, 6], [9, 7]]).slice(0, 3);
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const [a, b] = pairs[round];
      const need = 10 - a;
      let moved = 0;
      let finished = false;
      say(round === 0
        ? `${a} + ${b}. Let's fill the first frame to make 10! Tap the blue counters.`
        : `${a} + ${b}. Make ten first!`);

      const frameA = el('div', { class: 'ten-frame', role: 'img', 'aria-label': `First frame: ${a} counters` });
      const frameB = el('div', { class: 'ten-frame', role: 'group', 'aria-label': `Second frame: ${b} blue counters` });
      for (let i = 0; i < 10; i++) {
        frameA.append(el('span', { class: `tf-cell${i < a ? ' has-red' : ''}` }));
      }
      for (let i = 0; i < 10; i++) {
        if (i < b) {
          const counter = button('', 'tf-cell has-blue', () => move(counter), { 'aria-label': 'Blue counter, tap to move' });
          frameB.append(counter);
        } else frameB.append(el('span', { class: 'tf-cell' }));
      }
      const sentence = el('p', { class: 'add-sentence', 'aria-live': 'polite' }, `${a} + ${b} = ?`);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });

      function move(counter) {
        if (finished || !counter.classList.contains('has-blue')) return;
        const empty = frameA.querySelector('.tf-cell:not(.has-red):not(.has-blue)');
        if (!empty) { say('The ten is full!'); return; }
        counter.classList.remove('has-blue');
        counter.disabled = true;
        counter.setAttribute('aria-label', 'Empty');
        empty.classList.add('has-blue');
        pulse(empty, 'is-new');
        moved += 1;
        sentence.textContent = `${a + moved} + ${b - moved} = ?`;
        if (moved === need) {
          finished = true;
          $$('button', frameB).forEach(c => { c.disabled = true; });
          const sum = a + b;
          sentence.innerHTML = `${a} + ${b} = <strong>10 + ${b - need}</strong> = <strong>${sum}</strong>`;
          say(`One full ten and ${b - need} more. ${a} + ${b} = ${sum}!`);
          MA.launchConfetti(25);
          result.append(el('p', { class: 'round-result__tip' }, `${a} needs ${need} more to make 10. Then add the ${b - need} left over.`));
          if (round === pairs.length - 1) done();
          else result.append(el('div', { class: 'stage-actions' }, button('Next sum ▶', 'btn', () => { round += 1; newRound(); })));
        }
      }

      box.append(el('p', { class: 'round-label' }, `Sum ${round + 1} of ${pairs.length}`),
        instruction('👆 Tap blue counters to fill the first frame.'),
        el('div', { class: 'frames' }, frameA, el('span', { class: 'frames__plus', 'aria-hidden': 'true' }, '+'), frameB),
        sentence, result);
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — number-bond bubbles
     ------------------------------------------------------------ */
  function renderPlay(box, done) {
    const ROUNDS = [
      { target: 10, pairs: shuffle([[1, 9], [2, 8], [3, 7], [4, 6], [5, 5]]).slice(0, 4) },
      { target: 100, pairs: shuffle([[10, 90], [20, 80], [30, 70], [40, 60], [50, 50]]).slice(0, 4) },
      { target: 20, pairs: shuffle([[11, 9], [12, 8], [13, 7], [14, 6], [15, 5], [16, 4]]).slice(0, 4) }
    ];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const cfg = ROUNDS[round];
      const values = shuffle(cfg.pairs.flat());
      let selected = null;
      let found = 0;
      say(`Pop two bubbles that make ${cfg.target}!`);

      const score = el('p', { class: 'hop-count', 'aria-live': 'polite' }, `Pairs: 0 of ${cfg.pairs.length}`);
      const pond = el('div', { class: 'bubbles', role: 'group', 'aria-label': 'Number bubbles' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      values.forEach((v, i) => {
        const bubble = button(String(v), 'bubble', () => tap(bubble, v), {
          style: `--d:${(i % 5) * 0.4}s`, 'data-value': v, 'aria-label': `Bubble ${v}`
        });
        pond.append(bubble);
      });

      function tap(bubble, v) {
        if (bubble.classList.contains('is-popped')) return;
        if (!selected) {
          selected = bubble;
          bubble.classList.add('is-selected');
          say(`${v} + ? = ${cfg.target}`);
          return;
        }
        if (selected === bubble) { bubble.classList.remove('is-selected'); selected = null; return; }
        const first = Number(selected.dataset.value);
        if (first + v === cfg.target) {
          [selected, bubble].forEach(b => { b.classList.remove('is-selected'); b.classList.add('is-popped'); b.disabled = true; });
          selected = null;
          found += 1;
          score.textContent = `Pairs: ${found} of ${cfg.pairs.length}`;
          say(`${first} + ${v} = ${cfg.target}! ${pick(PRAISE)}`);
          if (found === cfg.pairs.length) {
            MA.launchConfetti(35);
            result.append(el('p', { class: 'round-result__text' }, `🫧 All pairs that make ${cfg.target}!`));
            if (round === ROUNDS.length - 1) done();
            else result.append(el('div', { class: 'stage-actions' }, button('Next pond ▶', 'btn', () => { round += 1; newRound(); })));
          }
        } else {
          pulse(selected, 'is-oops');
          pulse(bubble, 'is-oops');
          say(`${first} + ${v} = ${first + v}. We need ${cfg.target}. ${first} needs ${cfg.target - first}.`);
          selected.classList.remove('is-selected');
          selected = null;
        }
      }

      box.append(el('p', { class: 'round-label' }, `Pond ${round + 1} of ${ROUNDS.length} · make ${cfg.target}`),
        el('div', { class: 'target-badge' }, el('span', {}, 'Make'), el('strong', {}, String(cfg.target))),
        instruction('👆 Tap two bubbles that add up to the target.'),
        score, pond, result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — drag answers onto sums
     ------------------------------------------------------------ */
  function renderPractise(box, done) {
    const MAKERS = [
      () => { const a = rnd(5, 9); const b = rnd(3, 9); return [`${a} + ${b}`, a + b]; },
      () => { const a = rnd(1, 6) * 10; const b = rnd(1, 9 - a / 10) * 10; return [`${a} + ${b}`, a + b]; },
      () => { const a = rnd(2, 8) * 10 + rnd(1, 4); const b = rnd(1, 5); return [`${a} + ${b}`, a + b]; },
      () => { const a = rnd(2, 8) * 10 + rnd(6, 9); const b = rnd(3, 6); return [`${a} + ${b}`, a + b]; },
      () => { const a = rnd(12, 79); return [`${a} + 10`, a + 10]; }
    ];
    const ROUNDS = [[0, 0, 1, 1], [2, 2, 4, 1], [3, 3, 2, 4]];
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
      const trickBase = sums[sums.length - 1][1];
      const trick = [trickBase + 10, trickBase + 1, trickBase - 1, trickBase + 2].find(v => !sums.some(x => x[1] === v));
      let selected = null;
      let filled = 0;
      say(round === 0 ? 'Work out each sum and drop the answer on it.' : pick(['More sums!', 'Use make-ten when you cross a ten!']));

      const cards = el('div', { class: 'sum-cards' });
      const slots = sums.map(([text, ans]) => {
        const slot = el('div', { class: 'slot sum-slot', role: 'button', tabindex: '0', 'data-value': ans, 'aria-label': `${text} equals, empty` }, '?');
        const activate = () => { if (selected) tryPlace(selected, slot); else say('Pick an answer first.'); };
        slot.addEventListener('click', activate);
        slot.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
        cards.append(el('div', { class: 'sum-card' }, el('span', { class: 'sum-card__text' }, `${text} =`), slot));
        return slot;
      });
      const bank = el('div', { class: 'tile-bank', role: 'group', 'aria-label': 'Answers' });
      shuffle([...sums.map(s => s[1]), trick]).forEach(v => {
        const tile = button(String(v), 'tile', null, { 'data-value': v, 'aria-label': `Answer ${v}` });
        makeDraggable(tile, {
          onDrop: slot => tryPlace(tile, slot && slots.includes(slot) ? slot : null),
          onTap: () => {
            if (tile.disabled) return;
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
        if (!slot || slot.classList.contains('is-filled')) return;
        if (Number(tile.dataset.value) === Number(slot.dataset.value)) {
          slot.textContent = tile.dataset.value;
          slot.classList.add('is-filled');
          tile.remove();
          filled += 1;
          if (filled === sums.length) {
            const spare = $$('.tile', bank)[0];
            if (spare) { spare.classList.add('is-spare'); spare.disabled = true; }
            MA.launchConfetti(25);
            say(spare ? `${pick(PRAISE)} ${spare.dataset.value} was a trick answer!` : pick(PRAISE));
            if (round === ROUNDS.length - 1) { result.append(el('p', { class: 'round-result__text' }, '🧩 All sums done!')); done(); }
            else result.append(el('div', { class: 'stage-actions' }, button('Next round ▶', 'btn', () => { round += 1; newRound(); })));
          } else say(pick(PRAISE));
        } else {
          pulse(slot, 'is-bad');
          pulse(tile, 'is-bounce');
          say('Almost! Add the ones first. Do they make a new ten?');
        }
      }

      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of ${ROUNDS.length}`),
        instruction('✋ Drag each answer onto its sum. Or tap an answer, then a sum.'),
        cards, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK — Milo's sums: true or false?
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const statements = [
      () => { const a = rnd(2, 6) * 10 + rnd(1, 5); const b = rnd(2, 4); const wrong = a + b * 10; return { text: `${a} + ${b} = ${wrong}<small>Milo added ${b} to the tens.</small>`, truth: false, explain: `${a} + ${b} = ${a + b}. Add ones to the ones!`, fix: { question: `What is ${a} + ${b}?`, options: [a + b, wrong, a + b + 1], answer: a + b } }; },
      () => { const a = rnd(2, 6) * 10 + rnd(6, 9); const b = rnd(4, 7); const wrong = a + b - 10; return { text: `${a} + ${b} = ${wrong}<small>Milo forgot something…</small>`, truth: false, explain: `${a} + ${b} = ${a + b}. The ones made a new ten!`, fix: { question: `What is ${a} + ${b}?`, options: [a + b, wrong, a + b + 10], answer: a + b } }; },
      () => { const a = rnd(21, 79); return { text: `${a} + 10 = ${a + 10}`, truth: true, explain: `True! Adding 10 makes the tens digit go up by 1.` }; },
      () => { const a = rnd(2, 5); const b = rnd(21, 48); return { text: `${a} + ${b} = ${b} + ${a}<small>Can you swap the numbers?</small>`, truth: true, explain: `True! Adding in any order gives the same answer: ${a + b}. Start with the bigger number, it's easier!` }; }
    ];
    const order = shuffle(statements);
    let round = 0;
    next();

    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'Milo did some sums. Are they right?' : pick(['True or false?', 'Check Milo’s work!']));
      box.append(el('p', { class: 'round-label' }, `Sum ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      trueFalse(box, order[round](), result => {
        if (round === order.length - 1) done();
        else result.append(el('div', { class: 'stage-actions' }, button('Next ▶', 'btn', () => { round += 1; next(); })));
      });
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — pick two cards that hit the target
     ------------------------------------------------------------ */
  function renderChallenge(box, done) {
    const MAKERS = [
      () => { const a = rnd(2, 5) * 10; const b = rnd(1, 4) * 10; return { pair: [a, b], extras: [a + 10, b + 20, 5, 15] }; },
      () => { const a = rnd(2, 4) * 10 + 5; const b = rnd(1, 3) * 10; return { pair: [a, b], extras: [a - 5, b + 5, 25, 40] }; },
      () => { const a = rnd(21, 34); const b = rnd(11, 25); return { pair: [a, b], extras: [a + 1, b + 10, 9, 30] }; },
      () => { const a = rnd(16, 28); const b = rnd(5, 9); return { pair: [a, b], extras: [a + 10, b + 1, 12, 20] }; }
    ];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const { pair, extras } = MAKERS[round]();
      const target = pair[0] + pair[1];
      const cards = shuffle([...new Set([...pair, ...extras])].filter(v => v > 0 && v !== target).slice(0, 6));
      const picked = [];
      let solved = false;
      say(`Find two cards that add up to ${target}!`);

      const live = el('p', { class: 'add-sentence', 'aria-live': 'polite' }, '? + ? = ?');
      const grid = el('div', { class: 'target-cards', role: 'group', 'aria-label': 'Number cards' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      cards.forEach(v => {
        const card = button(String(v), 'tile target-card', () => {
          if (solved) return;
          const at = picked.indexOf(card);
          if (at >= 0) { picked.splice(at, 1); card.classList.remove('is-selected'); }
          else {
            if (picked.length === 2) picked.shift().classList.remove('is-selected');
            picked.push(card);
            card.classList.add('is-selected');
          }
          const vals = picked.map(c => Number(c.dataset.value));
          live.textContent = vals.length === 2 ? `${vals[0]} + ${vals[1]} = ${vals[0] + vals[1]}` : vals.length === 1 ? `${vals[0]} + ? = ?` : '? + ? = ?';
          result.innerHTML = '';
        }, { 'data-value': v, 'aria-label': `Card ${v}` });
        grid.append(card);
      });

      const checkBtn = button('✓ Check', 'btn btn--big', () => {
        result.innerHTML = '';
        if (picked.length < 2) { say('Pick two cards first.'); return; }
        const sum = picked.reduce((s, c) => s + Number(c.dataset.value), 0);
        if (sum === target) {
          solved = true;
          $$('.target-card', grid).forEach(c => { c.disabled = true; });
          checkBtn.disabled = true;
          MA.launchConfetti(35);
          say(`Bullseye! ${live.textContent}`);
          result.append(el('p', { class: 'round-result__text' }, `🎯 ${live.textContent}`));
          if (round === MAKERS.length - 1) done();
          else result.append(el('div', { class: 'stage-actions' }, button('Next target ▶', 'btn', () => { round += 1; newRound(); })));
        } else {
          const tip = sum > target ? 'Too big! Try a smaller card.' : 'Too small! Try a bigger card.';
          result.append(el('p', { class: 'round-result__tip' }, `💡 ${sum} — ${tip}`));
          say(tip);
        }
      });

      box.append(el('p', { class: 'round-label' }, `Target ${round + 1} of ${MAKERS.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, '🎯'), el('strong', {}, String(target))),
        instruction('👆 Tap two cards, then Check.'),
        grid, live, checkBtn, result);
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  function qBond() {
    const a = rnd(1, 9);
    return { icon: '🔟', question: `${a} + ? = 10`, instruction: 'What makes 10?', options: optionsFor(10 - a, [11 - a, 9 - a, a]), answer: 10 - a, hint: 'Almost! Count on from ' + a + ' to 10.', explain: `${a} + ${10 - a} = 10` };
  }
  function qTens() {
    const a = rnd(2, 5) * 10;
    const b = rnd(1, 4) * 10;
    return { icon: '🧱', question: `${a} + ${b} = ?`, instruction: 'Add the tens.', options: optionsFor(a + b, [a + b + 10, a + b - 10, (a + b) / 10]), answer: a + b, hint: `Almost! ${a / 10} tens + ${b / 10} tens = ? tens`, explain: `${a / 10} tens + ${b / 10} tens = ${(a + b) / 10} tens = ${a + b}` };
  }
  function qOnes() {
    const a = rnd(2, 8) * 10 + rnd(1, 4);
    const b = rnd(2, 5);
    return { icon: '➕', question: `${a} + ${b} = ?`, instruction: 'Add the ones.', options: optionsFor(a + b, [a + b * 10, a + b + 1, a + b - 1]), answer: a + b, hint: 'Almost! Only the ones change.', explain: `${a} + ${b} = ${a + b}` };
  }
  function qBridge() {
    const a = rnd(6, 9);
    const b = rnd(4, 8);
    return { icon: '🔁', question: `${a} + ${b} = ?`, instruction: 'Make ten first!', options: optionsFor(a + b, [a + b - 1, a + b + 1, a + b - 10]), answer: a + b, hint: `Almost! ${a} + ${10 - a} = 10. Then add ${b - (10 - a)} more.`, explain: `${a} + ${b} = 10 + ${a + b - 10} = ${a + b}` };
  }
  function qStory() {
    const a = rnd(13, 45);
    const b = rnd(3, 6);
    const who = pick(['Sam', 'Aisha', 'Ravi', 'Mei', 'Leo']);
    const thing = pick(['stickers', 'marbles', 'shells', 'stars']);
    return { icon: '📖', question: `${who} has ${a} ${thing}. ${who} gets ${b} more. How many now?`, instruction: 'Which sum helps?', options: optionsFor(a + b, [a - b, a + b + 10, a + b - 1]), answer: a + b, hint: `Almost! ${a} + ${b} = ?`, explain: `${a} + ${b} = ${a + b} ${thing}` };
  }

  function renderMaster(box, done) {
    K.runMaster(box, done, {
      makeQuestions: () => [qBond(), qTens(), qOnes(), qBridge(), qStory()],
      moduleId: MODULE_ID,
      badgeId: 'addition-ace',
      title: 'Addition Ace'
    });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
