/* ==============================================================
   🧮 Money Market → Counting Money        money-market/counting-money.js
   🌱 Learn: count on from the biggest · 🎮 Play: which bag has more?
   🧩 Practise: totals · 🧠 Think · 🚀 Challenge: two different ways · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const $M = window.Money;
  if (!MA || !K || !$M) return;
  const { rnd, pick, shuffle, el, button, instruction, say, pulse, nextOrDone, dragMatch, quizRounds, makeTotal, optionsFor, PRAISE } = K;
  const { fmt, piece, groupHTML, groupNode } = $M;
  const MODULE_ID = 'money-market/counting-money';
  const sum = list => list.reduce((a, b) => a + b, 0);

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Biggest first', render: renderLearn },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Which bag has more?', render: renderBags },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Money totals', render: renderPractise },
    { id: 'think', icon: '🧠', label: 'Think', title: 'True or false?', render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Two different ways', render: renderTwoWays },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Money Counter', render: renderMaster }
  ];

  function renderLearn(box, done) {
    const sets = [[10, 5, 2, 1], [20, 10, 5, 2, 2], [50, 10, 5, 1]];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const order = [...sets[round]].sort((a, b) => b - a);
      let at = 0;
      let running = 0;
      say(round === 0 ? 'To count money, start with the BIGGEST and count on. Tap the biggest first!' : 'Biggest first, then count on!');
      const grid = el('div', { class: 'coin-grid', role: 'group', 'aria-label': 'Money to count' });
      const total = el('div', { class: 'big-count big-count--small', 'aria-live': 'polite' }, fmt(0));
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      shuffle(order.map((v, i) => ({ v, i }))).forEach(({ v, i }) => {
        const b = button(piece(v), 'coin-btn', () => {
          if (b.classList.contains('is-seen')) return;
          if (v !== order[at]) { pulse(b, 'is-oops'); say(`Look for a bigger one first! Next is ${fmt(order[at])}.`); return; }
          at += 1;
          running += v;
          b.classList.add('is-seen');
          total.textContent = fmt(running);
          say(fmt(running));
          if (at === order.length) {
            MA.launchConfetti(25);
            say(`${order.map(fmt).join(' + ')} = ${fmt(running)}!`);
            result.append(el('p', { class: 'round-result__text' }, `🧮 ${fmt(running)} altogether`));
            nextOrDone(result, round === sets.length - 1, 'Next ▶', () => { round += 1; next(); }, done);
          }
        }, { 'aria-label': fmt(v), 'data-order': i });
        grid.append(b);
      });
      box.append(el('p', { class: 'round-label' }, `Count ${round + 1} of ${sets.length}`), instruction('👆 Tap the biggest first, then the next biggest…'), grid, total, result);
    }
  }

  function renderBags(box, done) {
    const make = () => Array.from({ length: rnd(2, 4) }, () => pick([1, 2, 5, 10, 20])).sort((a, b) => b - a);
    say('Two money bags! Count each one. Which has more?');
    quizRounds(box, done, [0, 1, 2, 3].map(() => () => {
      let a; let b;
      do { a = make(); b = make(); } while (sum(a) === sum(b));
      const win = sum(a) > sum(b) ? 'A' : 'B';
      return { icon: '💰', question: 'Which bag has more money?', instruction: 'Count both bags.', visual: `<div class="bags"><div class="bag"><strong>👜 Bag A</strong>${groupHTML(a)}</div><div class="bag"><strong>🎒 Bag B</strong>${groupHTML(b)}</div></div>`, options: [{ value: 'A', label: '👜 Bag A' }, { value: 'B', label: '🎒 Bag B' }], answer: win, hint: 'Almost! Count each bag, biggest coin first.', explain: `Bag A: ${fmt(sum(a))}, Bag B: ${fmt(sum(b))}.` };
    }), { label: 'Bags', finalText: '🎮 Sharp counting!' });
  }

  function renderPractise(box, done) {
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const sets = [];
      while (sets.length < 3) {
        const s = Array.from({ length: rnd(3, 4) }, () => pick([1, 2, 5, 10, 20, 50])).sort((a, b) => b - a);
        if (sum(s) <= 100 && !sets.some(x => x.t === sum(s))) sets.push({ s, t: sum(s) });
      }
      const trick = [sets[0].t + 10, sets[0].t + 1].find(v => !sets.some(x => x.t === v));
      say('Count each group of money. Biggest first!');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        items: sets.map(x => ({ face: groupNode(x.s), value: fmt(x.t), label: 'Money' })),
        tiles: [...sets.map(x => fmt(x.t)), fmt(trick)],
        hint: 'Almost! Count on from the biggest.',
        onComplete: () => { MA.launchConfetti(25); say(pick(PRAISE)); nextOrDone(result, round === 1, 'Next round ▶', () => { round += 1; next(); }, done, '🧩 Money counter!'); }
      });
      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of 2`), instruction('✋ Drag each total onto its money.'), cards, bank, result);
    }
  }

  function renderThink(box, done) {
    const st = shuffle([
      () => ({ text: `${groupHTML([1, 1, 1, 1, 1, 1])} vs ${groupHTML([10])}<small>More coins always means more money.</small>`, truth: false, explain: `Six ${fmt(1)} coins make ${fmt(6)}. One ${fmt(10)} coin is worth more!` }),
      () => ({ text: `${groupHTML([20, 5, 1])}<small>= ${fmt(26)}</small>`, truth: true, explain: '20 + 5 + 1 = 26' }),
      () => ({ text: `<small>Start counting money with the biggest value.</small>`, truth: true, explain: 'True! It makes counting on easier.' }),
      () => ({ text: `${groupHTML([10, 10, 5])}<small>= ${fmt(20)}</small>`, truth: false, explain: '10 + 10 + 5 = 25', fix: { question: 'How much is it?', options: [fmt(25), fmt(20), fmt(15)], answer: fmt(25) } })
    ]);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      say('Count carefully. True or false?');
      box.append(el('p', { class: 'round-label' }, `Question ${r + 1} of 4`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, st[r](), res => nextOrDone(res, r === 3, 'Next ▶', () => { r += 1; next(); }, done));
    }
  }

  function renderTwoWays(box, done) {
    const targets = [15, 20];
    let round = 0;
    let first = null;
    next();
    function next() {
      box.innerHTML = '';
      const T = targets[round];
      const second = first !== null;
      say(second ? `Now make ${fmt(T)} a DIFFERENT way!` : `Make ${fmt(T)} any way you like.`);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const key = list => [...list].sort((a, b) => a - b).join(',');
      box.append(el('p', { class: 'round-label' }, `${fmt(T)} · way ${second ? 2 : 1} of 2`),
        el('div', { class: 'target-badge' }, el('span', {}, second ? 'Another way to make' : 'Make'), el('strong', {}, fmt(T))),
        second ? el('p', { class: 'round-result__tip' }, `Your first way: ${first.map(fmt).join(' + ')}`) : null,
        makeTotal({
          target: T, pieces: [1, 2, 5, 10], render: (v, small) => piece(v, small), fmt,
          rule: chosen => (second && key(chosen) === key(first) ? 'That is the same as your first way! Clear and try different coins.' : ''),
          onWin: chosen => {
            MA.launchConfetti(30);
            if (!second) { first = chosen; say('Great! Now find another way.'); result.append(el('div', { class: 'stage-actions' }, button('Find another way ▶', 'btn', next))); return; }
            say(`Two different ways to make ${fmt(T)}! ${pick(PRAISE)}`);
            first = null;
            nextOrDone(result, round === targets.length - 1, 'Next amount ▶', () => { round += 1; next(); }, done, '🚀 Money thinker!');
          }
        }), result);
    }
  }

  function qCount() { const s = [20, 10, 5, 2].slice(0, rnd(2, 4)); const t = sum(s); return { icon: '🧮', question: 'How much money?', instruction: 'Biggest first.', visual: groupHTML(s), options: optionsFor(t, [t + 1, t - 2, t + 10]).map(o => ({ ...o, label: fmt(o.value) })), answer: t, hint: 'Almost! Count on.', explain: fmt(t) }; }
  function qFirst() { return { icon: '1️⃣', question: 'Which should you count first?', instruction: 'Biggest first!', options: shuffle([2, 20, 5]).map(v => ({ value: v, label: fmt(v), html: piece(v, true).outerHTML })), answer: 20, hint: 'Almost! Start with the biggest.', explain: `Start with ${fmt(20)}.` }; }
  function qMore() { return { icon: '⚖️', question: `Which is more: ${fmt(10)} + ${fmt(5)} or ${fmt(20)}?`, instruction: 'Work out each.', options: [{ value: 'b', label: fmt(20) }, { value: 'a', label: `${fmt(10)} + ${fmt(5)}` }], answer: 'b', hint: 'Almost! 10 + 5 = 15.', explain: `${fmt(20)} is more than ${fmt(15)}.` }; }
  function qMissing() { return { icon: '❓', question: `${fmt(20)} + ${fmt(10)} + ? = ${fmt(35)}`, instruction: 'Count on.', options: [5, 2, 10].map(v => ({ value: v, label: fmt(v), html: piece(v, true).outerHTML })), answer: 5, hint: 'Almost! 30 + ? = 35.', explain: `${fmt(5)}` }; }
  function qTotal() { const n = rnd(3, 6); return { icon: '🔟', question: `${n} coins of ${fmt(5)}. How much?`, instruction: 'Count in 5s.', options: optionsFor(n * 5, [n * 5 + 5, n + 5, n * 10]).map(o => ({ ...o, label: fmt(o.value) })), answer: n * 5, hint: 'Almost! 5, 10, 15…', explain: fmt(n * 5) }; }

  function renderMaster(box, done) { K.runMaster(box, done, { makeQuestions: () => [qCount(), qFirst(), qMore(), qMissing(), qTotal()], moduleId: MODULE_ID, badgeId: 'money-counter', title: 'Money Counter' }); }
  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
