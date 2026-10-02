/* ==============================================================
   🪙 Money Market → Coins                  money-market/coins.js
   🌱 Learn: meet the coins · 🎮 Play: piggy bank · 🧩 Practise: coin totals
   🧠 Think: true or false · 🚀 Challenge: fewest coins · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const $M = window.Money;
  if (!MA || !K || !$M) return;
  const { rnd, pick, shuffle, el, button, instruction, say, nextOrDone, dragMatch, quizRounds, makeTotal, optionsFor, PRAISE } = K;
  const { fmt, coin, groupHTML, groupNode, fewest } = $M;
  const COINS = $M.CURRENCY.coins;
  const MODULE_ID = 'money-market/coins';

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Meet the coins', render: renderLearn },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Piggy bank', render: renderPiggy },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Coin totals', render: renderPractise },
    { id: 'think', icon: '🧠', label: 'Think', title: 'True or false?', render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Fewest coins', render: renderFewest },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Coin Collector', render: renderMaster }
  ];

  function renderLearn(box, done) {
    box.innerHTML = '';
    const seen = new Set();
    say('Coins are money! Each coin has a value written on it. Tap each coin.');
    const grid = el('div', { class: 'coin-grid' });
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    COINS.forEach(v => {
      const b = button(coin(v), 'coin-btn', () => {
        if (seen.has(v)) return;
        seen.add(v);
        b.classList.add('is-seen');
        say(`This coin is worth ${fmt(v)}.`);
        if (seen.size === COINS.length) {
          MA.launchConfetti(20);
          result.append(el('div', { class: 'stage-actions' }, button('Next: which is worth more? ▶', 'btn', more)));
        }
      }, { 'aria-label': `${fmt(v)} coin`, 'data-correct': 'yes' });
      grid.append(b);
    });
    box.append(instruction('👆 Tap every coin.'), grid, result);

    function more() {
      quizRounds(box, done, [0, 1, 2].map(() => () => {
        const [a, b] = shuffle(COINS).slice(0, 2);
        const big = Math.max(a, b);
        return { icon: '🪙', question: 'Which coin is worth more?', instruction: 'Read the number on the coin.', options: shuffle([a, b]).map(v => ({ value: v, label: fmt(v), html: coin(v).outerHTML })), answer: big, hint: 'Almost! Look at the number, not the size.', explain: `${fmt(big)} is worth more.` };
      }), { label: 'Coin' });
    }
  }

  function renderPiggy(box, done) {
    const targets = shuffle([6, 8, 9, 12, 15, 17]).slice(0, 4);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const T = targets[round];
      say(`Put exactly ${fmt(T)} into the piggy bank!`);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      box.append(el('p', { class: 'round-label' }, `Piggy bank ${round + 1} of ${targets.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, '🐷 Save'), el('strong', {}, fmt(T))),
        instruction('👆 Tap coins to drop them in.'),
        makeTotal({
          target: T, pieces: [1, 2, 5, 10], render: (v, small) => coin(v, small), fmt,
          onWin: chosen => {
            MA.launchConfetti(30);
            say(`${chosen.map(fmt).join(' + ')} = ${fmt(T)}! ${pick(PRAISE)}`);
            nextOrDone(result, round === targets.length - 1, 'Next piggy ▶', () => { round += 1; next(); }, done, '🐷 Super saver!');
          }
        }), result);
    }
  }

  function renderPractise(box, done) {
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const sets = [];
      while (sets.length < 3) {
        const s = Array.from({ length: rnd(2, 4) }, () => pick([1, 2, 5, 10])).sort((a, b) => b - a);
        const t = s.reduce((a, b) => a + b, 0);
        if (!sets.some(x => x.t === t)) sets.push({ s, t });
      }
      const trick = [sets[0].t + 1, sets[0].t - 1].find(v => v > 0 && !sets.some(x => x.t === v));
      say('How much money in each group? Start with the biggest coin and count on.');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        items: sets.map(x => ({ face: groupNode(x.s), value: fmt(x.t), label: 'Coins' })),
        tiles: [...sets.map(x => fmt(x.t)), fmt(trick)],
        hint: 'Almost! Count on from the biggest coin.',
        onComplete: () => { MA.launchConfetti(25); say(pick(PRAISE)); nextOrDone(result, round === 1, 'Next round ▶', () => { round += 1; next(); }, done, '🧩 Coin counter!'); }
      });
      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of 2`), instruction('✋ Drag each total onto its coins.'), cards, bank, result);
    }
  }

  function renderThink(box, done) {
    const st = shuffle([
      () => ({ text: `${coin(1).outerHTML} ${coin(10).outerHTML}<small>A bigger coin is always worth more.</small>`, truth: false, explain: 'Not always! Read the number. The value is what matters, not the size.' }),
      () => ({ text: `${groupHTML([2, 2, 1])}<small>${fmt(2)} + ${fmt(2)} + ${fmt(1)} = ${fmt(5)}</small>`, truth: true, explain: `True! 2 + 2 + 1 = 5` }),
      () => ({ text: `${groupHTML([1, 1, 1, 1, 1])} = ${coin(5).outerHTML}<small>Five ${fmt(1)} coins are worth the same as one ${fmt(5)} coin.</small>`, truth: true, explain: 'True! Same value, different coins.' }),
      () => ({ text: `${coin(10).outerHTML} = ${coin(1).outerHTML}<small>A ${fmt(10)} coin is worth ${fmt(1)}.</small>`, truth: false, explain: `A ${fmt(10)} coin is worth ten ${fmt(1)} coins!`, fix: { question: `How many ${fmt(1)} coins make ${fmt(10)}?`, options: [10, 1, 5], answer: 10 } })
    ]);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      say('True or false? Think about value!');
      box.append(el('p', { class: 'round-label' }, `Question ${r + 1} of 4`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, st[r](), res => nextOrDone(res, r === 3, 'Next ▶', () => { r += 1; next(); }, done));
    }
  }

  function renderFewest(box, done) {
    const targets = [7, 13, 18];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const T = targets[round];
      const best = fewest(T, [1, 2, 5, 10]);
      say(`Make ${fmt(T)} using the FEWEST coins you can!`);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      box.append(el('p', { class: 'round-label' }, `Puzzle ${round + 1} of ${targets.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, 'Fewest coins for'), el('strong', {}, fmt(T))),
        instruction('👆 Start with the biggest coin that fits.'),
        makeTotal({
          target: T, pieces: [1, 2, 5, 10], render: (v, small) => coin(v, small), fmt,
          rule: chosen => (chosen.length > best.length ? `That makes ${fmt(T)} with ${chosen.length} coins. Can you do it with ${best.length}? Tap Clear and try bigger coins first.` : ''),
          onWin: chosen => {
            MA.launchConfetti(35);
            say(`Only ${chosen.length} coins! ${pick(PRAISE)}`);
            nextOrDone(result, round === targets.length - 1, 'Next puzzle ▶', () => { round += 1; next(); }, done, '🚀 Coin genius!');
          }
        }), result);
    }
  }

  function qMore() { const [a, b] = shuffle(COINS).slice(0, 2); return { icon: '🪙', question: 'Which is worth more?', instruction: 'Read the coins.', options: shuffle([a, b]).map(v => ({ value: v, label: fmt(v), html: coin(v).outerHTML })), answer: Math.max(a, b), hint: 'Almost! Compare the numbers.', explain: `${fmt(Math.max(a, b))} is more.` }; }
  function qTotal() { const s = [pick([5, 10]), pick([1, 2]), pick([1, 2])]; const t = s.reduce((a, b) => a + b, 0); return { icon: '➕', question: 'How much altogether?', instruction: 'Count on from the biggest.', visual: groupHTML(s), options: optionsFor(t, [t + 1, t - 1, t + 5]).map(o => ({ ...o, label: fmt(o.value) })), answer: t, hint: 'Almost! Start with the biggest coin.', explain: fmt(t) }; }
  function qSame() { return { icon: '🔁', question: `How many ${fmt(2)} coins make ${fmt(10)}?`, instruction: 'Count in 2s.', options: optionsFor(5, [2, 10, 4]), answer: 5, hint: 'Almost! 2, 4, 6, 8, 10…', explain: `5 × ${fmt(2)} = ${fmt(10)}` }; }
  function qFewest() { return { icon: '🎯', question: `Fewest coins to make ${fmt(15)}?`, instruction: 'Biggest first.', options: optionsFor(2, [3, 15, 5]), answer: 2, hint: `Almost! ${fmt(10)} + ${fmt(5)}`, explain: `${fmt(10)} + ${fmt(5)} = 2 coins` }; }
  function qMissing() { const a = pick([5, 10]); const t = a + pick([2, 5]); return { icon: '❓', question: `I have ${fmt(a)}. I need ${fmt(t)}. Which coin do I need?`, instruction: 'Count on.', options: shuffle([t - a, 1, 10].filter((v, i, x) => x.indexOf(v) === i)).map(v => ({ value: v, label: fmt(v), html: coin(v).outerHTML })), answer: t - a, hint: `Almost! ${a} + ? = ${t}`, explain: `${fmt(a)} + ${fmt(t - a)} = ${fmt(t)}` }; }

  function renderMaster(box, done) { K.runMaster(box, done, { makeQuestions: () => [qMore(), qTotal(), qSame(), qFewest(), qMissing()], moduleId: MODULE_ID, badgeId: 'coin-collector', title: 'Coin Collector' }); }
  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
