/* ==============================================================
   ➗ Number Island → Division           number-island/division.js
   --------------------------------------------------------------
   🌱 Learn      share sweets fairly between friends, one at a time
   🎮 Play       grouping: animals board boats of 2, 5 or 10
   🧩 Practise   drag answers onto sharing and grouping cards
   🧠 Think      true or false? (fair shares, × and ÷ are partners)
   🚀 Challenge  fix unfair shares by moving items between plates
   🏆 Master     five mixed questions → Division Detective badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  if (!MA || !K) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, pulse, optionsFor, trueFalse, nextOrDone, dragMatch, PRAISE } = K;

  const MODULE_ID = 'number-island/division';
  const FRIENDS = ['🐻', '🐰', '🐸', '🐼', '🦁'];

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Share fairly',         render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Boat groups',          render: renderPlay },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Answer drop',          render: renderPractise },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',       render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Make it fair',         render: renderFair },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Division Detective',   render: renderMaster }
  ];

  /* ------------------------------------------------------------
     🌱 LEARN — deal sweets to friends
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const tasks = [[6, 2], [12, 3], [10, 5]];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const [total, friends] = tasks[round];
      const each = total / friends;
      const plates = Array(friends).fill(0);
      let pile = total;
      let solved = false;
      say(round === 0
        ? `Share ${total} sweets between ${friends} friends. Tap a friend's plate to give them one sweet.`
        : `Share ${total} sweets between ${friends} friends!`);

      const pileEl = el('div', { class: 'share-pile', role: 'img' });
      const row = el('div', { class: 'plates' });
      const sentence = el('p', { class: 'add-sentence', 'aria-live': 'polite' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const plateEls = plates.map((_, i) => {
        const items = el('div', { class: 'plate__items' });
        const plate = el('div', { class: 'plate', role: 'button', tabindex: '0' },
          el('span', { class: 'plate__who', 'aria-hidden': 'true' }, FRIENDS[i]), items, el('span', { class: 'plate__count' }, '0'));
        const give = () => {
          if (solved) return;
          if (!pile) { say('No sweets left in the pile!'); return; }
          pile -= 1;
          plates[i] += 1;
          draw();
        };
        plate.addEventListener('click', e => { if (!e.target.closest('.plate__item')) give(); });
        plate.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); give(); } });
        row.append(plate);
        return { plate, items };
      });

      function draw() {
        pileEl.textContent = '🍬'.repeat(pile) || '—';
        pileEl.setAttribute('aria-label', `${pile} sweets left`);
        plateEls.forEach(({ plate, items }, i) => {
          items.innerHTML = '';
          for (let k = 0; k < plates[i]; k++) {
            items.append(button('🍬', 'plate__item', () => {
              if (solved) return;
              plates[i] -= 1;
              pile += 1;
              draw();
            }, { 'aria-label': 'Put this sweet back' }));
          }
          plate.querySelector('.plate__count').textContent = plates[i];
          plate.setAttribute('aria-label', `Friend ${i + 1} has ${plates[i]} sweets. Tap to give one.`);
        });
        sentence.textContent = `Left in the pile: ${pile}`;
        if (pile === 0) {
          if (plates.every(p => p === each)) win();
          else say('Is that fair? Everyone should have the same. Tap a sweet to put it back.');
        }
      }

      function win() {
        solved = true;
        $$('.plate__item', row).forEach(b => { b.disabled = true; });
        sentence.innerHTML = `${total} shared between ${friends} = <strong>${each} each</strong>`;
        say(`Fair! Everyone gets ${each}. ${total} ÷ ${friends} = ${each}.`);
        MA.launchConfetti(30);
        result.append(el('p', { class: 'round-result__text' }, `➗ ${total} ÷ ${friends} = ${each}`),
          el('p', { class: 'round-result__tip' }, '÷ means sharing into equal parts.'));
        nextOrDone(result, round === tasks.length - 1, 'Next ▶', () => { round += 1; newRound(); }, done);
      }

      draw();
      box.append(el('p', { class: 'round-label' }, `Share ${round + 1} of ${tasks.length}`),
        instruction('👆 Tap a plate to give one sweet. Keep going round!'), pileEl, row, sentence, result);
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — grouping into boats
     ------------------------------------------------------------ */
  function renderPlay(box, done) {
    const tasks = [[10, 2], [20, 5], [30, 10], [15, 5]];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const [total, size] = tasks[round];
      const animal = pick(['🐧', '🐤', '🐢', '🐸']);
      let left = total;
      let boats = 0;
      let solved = false;
      say(`${total} ${animal} want to cross the lake. Each boat takes ${size}. How many boats?`);

      const shore = el('div', { class: 'share-pile shore', role: 'img', 'aria-label': `${total} animals waiting` }, animal.repeat(total));
      const lake = el('div', { class: 'lake' });
      const sentence = el('p', { class: 'add-sentence', 'aria-live': 'polite' }, 'Boats: 0');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const sail = button(`⛵ Fill a boat with ${size}`, 'btn btn--big', () => {
        if (solved || left < size) return;
        left -= size;
        boats += 1;
        shore.textContent = left ? animal.repeat(left) : '—';
        shore.setAttribute('aria-label', `${left} animals waiting`);
        lake.append(el('div', { class: 'boat', role: 'img', 'aria-label': `Boat ${boats} with ${size}` },
          el('span', { class: 'boat__load' }, animal.repeat(size)), el('span', { class: 'boat__hull' }, `⛵ ${boats}`)));
        sentence.textContent = `Boats: ${boats}`;
        if (left === 0) {
          solved = true;
          sail.disabled = true;
          askHowMany();
        } else say(pick(['Off they go!', `${left} still waiting.`, 'Next boat!']));
      });

      function askHowMany() {
        say('Everyone is across! How many boats did we need?');
        const opts = shuffle([boats, boats + 1, boats - 1 || boats + 2]);
        const group = el('div', { class: 'fix-options', role: 'group', 'aria-label': 'How many boats?' });
        opts.forEach(n => {
          const b = button(String(n), 'fix-btn', () => {
            if (n === boats) {
              $$('button', group).forEach(x => { x.disabled = true; });
              b.classList.add('is-right');
              say(`${total} in groups of ${size} makes ${boats} groups. ${total} ÷ ${size} = ${boats}!`);
              MA.launchConfetti(30);
              result.append(el('p', { class: 'round-result__text' }, `➗ ${total} ÷ ${size} = ${boats}`));
              nextOrDone(result, round === tasks.length - 1, 'Next lake ▶', () => { round += 1; newRound(); }, done);
            } else {
              b.classList.add('is-wrong');
              b.disabled = true;
              say('Count the boats on the lake!');
            }
          });
          group.append(b);
        });
        result.append(el('p', { class: 'fix-q' }, '⛵ How many boats?'), group);
      }

      box.append(el('p', { class: 'round-label' }, `Lake ${round + 1} of ${tasks.length}`),
        instruction(`👆 Fill boats with ${size} until nobody is left.`), shore, sail, lake, sentence, result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE
     ------------------------------------------------------------ */
  function renderPractise(box, done) {
    const ROUNDS = ['share', 'group', 'sign'];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const kind = ROUNDS[round];
      const facts = [];
      while (facts.length < 4) {
        const d = kind === 'share' ? pick([2, 5, 10]) : pick([2, 5, 10]);
        const q = rnd(2, kind === 'share' ? 5 : 10);
        if (!facts.some(f => f[2] === q)) facts.push([d * q, d, q]);
      }
      const text = ([total, d]) => (kind === 'share' ? `${total} shared by ${d}` : kind === 'group' ? `${total} in groups of ${d}` : `${total} ÷ ${d}`);
      const answers = facts.map(f => f[2]);
      const trick = [facts[0][0] - facts[0][1], facts[0][2] + 10, facts[0][2] + 1].find(v => v > 0 && !answers.includes(v));
      say(kind === 'share' ? 'How many does each one get?' : kind === 'group' ? 'How many groups?' : 'Use your times tables to help!');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        items: facts.map(f => ({ face: el('span', {}, `${text(f)} =`), value: f[2], label: text(f) })),
        tiles: [...answers, trick],
        hint: 'Almost! Use a times table: how many 2s, 5s or 10s make it?',
        onComplete: spare => {
          MA.launchConfetti(25);
          say(spare ? `${pick(PRAISE)} ${spare.dataset.value} was a trick!` : pick(PRAISE));
          nextOrDone(result, round === ROUNDS.length - 1, 'Next round ▶', () => { round += 1; newRound(); }, done, '🧩 All matched!');
        }
      });
      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of ${ROUNDS.length}`),
        instruction('✋ Drag each answer onto its card. Or tap an answer, then a box.'), cards, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const statements = [
      () => { const e = rnd(3, 6); return { text: `Sharing ${e * 2} between 2:<small>${e - 1} and ${e + 1} is fair.</small>`, truth: false, explain: `Fair means equal: ${e} and ${e}.`, fix: { question: `How many each to be fair?`, options: [e, e - 1, e + 1], answer: e } }; },
      () => { const a = rnd(2, 6); const b = pick([2, 5, 10]); return { text: `${a} × ${b} = ${a * b}, so ${a * b} ÷ ${b} = ${a}`, truth: true, explain: 'True! × and ÷ are partners. Division undoes multiplication.' }; },
      () => { const q = rnd(2, 5); return { text: `${q * 5} ÷ 5 = ${q * 5 - 5}<small>Milo took 5 away.</small>`, truth: false, explain: `${q * 5} ÷ 5 = ${q}. Dividing is sharing or grouping, not taking away once.`, fix: { question: `How many 5s make ${q * 5}?`, options: [q, q * 5 - 5, q + 5], answer: q } }; },
      () => { const q = rnd(2, 9); return { text: `${q * 10} ÷ 10 = ${q}`, truth: true, explain: `True! ${q * 10} is ${q} tens.` }; }
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'Is it fair? Is it true? You decide!' : pick(['True or false?', 'Think carefully!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — make unfair shares fair
     ------------------------------------------------------------ */
  function renderFair(box, done) {
    const puzzles = [[2, 6], [3, 4], [4, 5]];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const [friends, each] = puzzles[round];
      const counts = Array(friends).fill(each);
      // make it unfair by moving some items around
      for (let k = 0; k < friends + 1; k++) {
        const from = rnd(0, friends - 1);
        let to;
        do { to = rnd(0, friends - 1); } while (to === from);
        if (counts[from] > 1) { counts[from] -= 1; counts[to] += 1; }
      }
      if (counts.every(c => c === each)) { counts[0] += 1; counts[1] -= 1; }
      let hand = null;
      let solved = false;
      say('These shares are not fair! Tap a plate to pick up one, then tap another plate to give it.');

      const row = el('div', { class: 'plates' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const sentence = el('p', { class: 'add-sentence', 'aria-live': 'polite' });
      const plateEls = counts.map((_, i) => {
        const plate = el('div', { class: 'plate', role: 'button', tabindex: '0' },
          el('span', { class: 'plate__who', 'aria-hidden': 'true' }, FRIENDS[i]), el('div', { class: 'plate__items' }), el('span', { class: 'plate__count' }));
        const act = () => {
          if (solved) return;
          if (hand === null) {
            if (!counts[i]) { say('That plate is empty.'); return; }
            counts[i] -= 1;
            hand = i;
            say('Now tap the plate that should get it.');
          } else {
            counts[i] += 1;
            hand = null;
          }
          draw();
        };
        plate.addEventListener('click', act);
        plate.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
        row.append(plate);
        return plate;
      });

      function draw() {
        plateEls.forEach((plate, i) => {
          plate.querySelector('.plate__items').textContent = '🍎'.repeat(counts[i]);
          plate.querySelector('.plate__count').textContent = counts[i];
          plate.classList.toggle('is-picked', hand === i);
          plate.setAttribute('aria-label', `Friend ${i + 1} has ${counts[i]} apples${hand === i ? ', picked up from here' : ''}`);
        });
        sentence.textContent = hand !== null ? '🍎 in your hand…' : counts.join(' • ');
        if (hand === null && counts.every(c => c === counts[0])) {
          solved = true;
          const total = friends * each;
          sentence.innerHTML = `${total} ÷ ${friends} = <strong>${each}</strong>`;
          say(`Fair! ${each} each. ${pick(PRAISE)}`);
          MA.launchConfetti(30);
          nextOrDone(result, round === puzzles.length - 1, 'Next puzzle ▶', () => { round += 1; newRound(); }, done, '🚀 Everything is fair now!');
        }
      }
      draw();
      box.append(el('p', { class: 'round-label' }, `Puzzle ${round + 1} of ${puzzles.length}`),
        instruction('👆 Tap a plate to pick up an apple, then tap a plate to give it.'), row, sentence, result);
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  function qShare() { const f = pick([2, 5]); const e = rnd(2, 6); return { icon: '🍬', question: `Share ${f * e} sweets between ${f} friends. How many each?`, instruction: 'Fair shares!', options: optionsFor(e, [e + 1, f * e - f, f]), answer: e, hint: `Almost! ${f} × ? = ${f * e}`, explain: `${f * e} ÷ ${f} = ${e} each` }; }
  function qGroup() { const s = pick([2, 5, 10]); const g = rnd(2, 6); return { icon: '⛵', question: `${s * g} children. ${s} in each boat. How many boats?`, instruction: 'Make groups.', options: optionsFor(g, [g + 1, s, g * 2]), answer: g, hint: `Almost! Count in ${s}s up to ${s * g}.`, explain: `${s * g} ÷ ${s} = ${g} boats` }; }
  function qTen() { const q = rnd(2, 9); return { icon: '🔟', question: `${q * 10} ÷ 10 = ?`, instruction: 'How many tens?', options: optionsFor(q, [q * 10 - 10, q + 10, 10]), answer: q, hint: `Almost! ${q * 10} is how many tens?`, explain: `${q * 10} ÷ 10 = ${q}` }; }
  function qTwo() { const q = rnd(3, 10); return { icon: '✌️', question: `Half of ${q * 2} is…`, instruction: 'Share between 2.', options: optionsFor(q, [q * 2 - 2, q + 1, q * 2]), answer: q, hint: `Almost! ? + ? = ${q * 2}, with both the same.`, explain: `${q * 2} ÷ 2 = ${q}` }; }
  function qPartner() { const a = rnd(2, 8); const b = pick([2, 5, 10]); return { icon: '🤝', question: `${a} × ${b} = ${a * b}. So ${a * b} ÷ ${b} = ?`, instruction: '× and ÷ are partners.', options: optionsFor(a, [b, a * b - b, a + 1]), answer: a, hint: 'Almost! Look at the × fact.', explain: `${a * b} ÷ ${b} = ${a}` }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qShare(), qGroup(), qTen(), qTwo(), qPartner()], moduleId: MODULE_ID, badgeId: 'division-detective', title: 'Division Detective' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
