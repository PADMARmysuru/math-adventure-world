/* ==============================================================
   🛒 Money Market → Shopping Games        money-market/shopping-games.js
   🌱 Learn: price tags · 🎮 Play: pay exactly · 🧩 Practise: change
   🧠 Think · 🚀 Challenge: spend the budget · 🏆 Master
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const $M = window.Money;
  if (!MA || !K || !$M) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, nextOrDone, quizRounds, makeTotal, optionsFor, PRAISE } = K;
  const { fmt, piece } = $M;
  const MODULE_ID = 'money-market/shopping-games';
  const SHOP = [['🍎', 'apple'], ['🧃', 'juice'], ['🍪', 'cookie'], ['🖍️', 'crayons'], ['⚽', 'ball'], ['🧸', 'teddy'], ['📒', 'notebook'], ['🪁', 'kite'], ['🍌', 'banana'], ['🎈', 'balloon']];

  const STAGES = [
    { id: 'learn', icon: '🌱', label: 'Learn', title: 'Price tags', render: renderLearn },
    { id: 'play', icon: '🎮', label: 'Play', title: 'Pay exactly', render: renderPay },
    { id: 'practise', icon: '🧩', label: 'Practise', title: 'Change please!', render: renderChange },
    { id: 'think', icon: '🧠', label: 'Think', title: 'True or false?', render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Spend the budget', render: renderBudget },
    { id: 'master', icon: '🏆', label: 'Master', title: 'Super Shopper', render: renderMaster }
  ];

  const shelfHTML = items => `<div class="shelf">${items.map(([e, n, p]) => `<span class="shelf__item"><span class="shelf__emoji">${e}</span><span class="price-tag">${fmt(p)}</span><small>${n}</small></span>`).join('')}</div>`;

  function renderLearn(box, done) {
    const items = shuffle(SHOP).slice(0, 4).map(([e, n]) => [e, n, rnd(2, 15)]);
    while (new Set(items.map(i => i[2])).size < 4) items.forEach(i => { i[2] = rnd(2, 15); });
    const dear = items.reduce((a, b) => (b[2] > a[2] ? b : a));
    const cheap = items.reduce((a, b) => (b[2] < a[2] ? b : a));
    const two = items[0];
    say('Welcome to Milo’s shop! A price tag tells you how much something costs.');
    quizRounds(box, done, [
      { icon: '🏷️', question: 'Which costs the MOST?', instruction: 'Compare the price tags.', visual: shelfHTML(items), options: items.map(([e, n, p]) => ({ value: n, label: `${e} ${n}` })), answer: dear[1], hint: 'Almost! Find the biggest price.', explain: `The ${dear[1]} costs ${fmt(dear[2])}.` },
      { icon: '🏷️', question: 'Which costs the LEAST?', instruction: 'Find the smallest price.', visual: shelfHTML(items), options: items.map(([e, n]) => ({ value: n, label: `${e} ${n}` })), answer: cheap[1], hint: 'Almost! Smallest number.', explain: `The ${cheap[1]} costs ${fmt(cheap[2])}.` },
      { icon: '✌️', question: `How much do TWO ${two[1]}s cost?`, instruction: 'Double it!', visual: shelfHTML(items), options: optionsFor(two[2] * 2, [two[2], two[2] * 2 + 1, two[2] + 2]).map(o => ({ ...o, label: fmt(o.value) })), answer: two[2] * 2, hint: `Almost! ${two[2]} + ${two[2]} = ?`, explain: `${fmt(two[2])} + ${fmt(two[2])} = ${fmt(two[2] * 2)}` }
    ], { label: 'Question' });
  }

  function renderPay(box, done) {
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const [e, n] = pick(SHOP);
      const T = pick([8, 13, 17, 24, 35, 42, 56]);
      say(`The ${n} costs ${fmt(T)}. Pay exactly!`);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      box.append(el('p', { class: 'round-label' }, `Customer ${round + 1} of 4`),
        el('div', { class: 'shop-item' }, el('span', { class: 'shelf__emoji' }, e), el('span', { class: 'price-tag price-tag--big' }, fmt(T))),
        instruction('👆 Tap coins and notes to pay.'),
        makeTotal({
          target: T, pieces: [1, 2, 5, 10, 20, 50], render: (v, small) => piece(v, small), fmt,
          onWin: chosen => { MA.launchConfetti(30); say(`Paid ${fmt(T)} exactly! Thank you!`); nextOrDone(result, round === 3, 'Next customer ▶', () => { round += 1; next(); }, done, '🎮 Perfect payer!'); }
        }), result);
    }
  }

  function renderChange(box, done) {
    say('Sometimes you pay too much, so the shop gives you CHANGE. Count on from the price!');
    quizRounds(box, done, [0, 1, 2, 3].map(i => () => {
      const paid = i < 2 ? pick([10, 20]) : pick([20, 50]);
      const price = rnd(Math.max(1, paid - 9), paid - 1);
      const [e, n] = pick(SHOP);
      const ch = paid - price;
      return { icon: '🪙', question: `The ${n} costs ${fmt(price)}. You pay ${fmt(paid)}. How much change?`, instruction: `Count on from ${price} to ${paid}.`, visual: `<div class="shop-item"><span class="shelf__emoji">${e}</span><span class="price-tag price-tag--big">${fmt(price)}</span></div>`, options: optionsFor(ch, [ch + 1, ch - 1, price]).map(o => ({ ...o, label: fmt(o.value) })), answer: ch, hint: `Almost! ${price} + ? = ${paid}`, explain: `${fmt(price)} + ${fmt(ch)} = ${fmt(paid)}` };
    }), { label: 'Customer', finalText: '🧩 Change champion!' });
  }

  function renderThink(box, done) {
    const st = shuffle([
      () => ({ text: '🏷️ ₹ → 🪙<small>If you pay more than the price, you get change.</small>'.replace('₹', $M.CURRENCY.symbol), truth: true, explain: 'True! The change is the extra money given back.' }),
      () => ({ text: `🍎 ${fmt(5)} + 🍌 ${fmt(4)}<small>= ${fmt(8)}</small>`, truth: false, explain: '5 + 4 = 9', fix: { question: 'How much altogether?', options: [fmt(9), fmt(8), fmt(1)], answer: fmt(9) } }),
      () => ({ text: `${fmt(10)} − 🧃 ${fmt(7)}<small>Change: ${fmt(3)}</small>`, truth: true, explain: '7 + 3 = 10' }),
      () => ({ text: `👛 ${fmt(6)} · 🧸 ${fmt(9)}<small>I can buy the teddy.</small>`, truth: false, explain: `${fmt(6)} is not enough. You need ${fmt(3)} more!` })
    ]);
    let r = 0;
    next();
    function next() {
      box.innerHTML = '';
      say('Shop smart! True or false?');
      box.append(el('p', { class: 'round-label' }, `Question ${r + 1} of 4`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, st[r](), res => nextOrDone(res, r === 3, 'Next ▶', () => { r += 1; next(); }, done));
    }
  }

  function renderBudget(box, done) {
    const budgets = [20, 30];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const B = budgets[round];
      const a = rnd(3, B - 8); const b = rnd(2, B - a - 2); const c = B - a - b;
      const goods = shuffle(SHOP).slice(0, 6);
      const prices = shuffle([a, b, c, rnd(2, 9) + 10, rnd(1, 9), rnd(11, 19)]);
      const correctPrices = [a, b, c];
      const picked = new Set();
      say(`You have ${fmt(B)} to spend. Choose 3 things that cost EXACTLY ${fmt(B)} altogether!`);
      const grid = el('div', { class: 'shelf shelf--buttons', role: 'group', 'aria-label': 'Shop' });
      const basket = el('p', { class: 'add-sentence', 'aria-live': 'polite' }, '🧺 empty');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const used = [...correctPrices];
      goods.forEach(([e, n], i) => {
        const p = prices[i];
        const ci = used.indexOf(p);
        const isAnswer = ci >= 0;
        if (isAnswer) used.splice(ci, 1);
        const card = button([el('span', { class: 'shelf__emoji' }, e), el('span', { class: 'price-tag' }, fmt(p)), el('small', {}, n)], 'shelf__item shelf__btn', () => {
          if (picked.has(i)) { picked.delete(i); card.classList.remove('is-selected'); } else { picked.add(i); card.classList.add('is-selected'); }
          const total = [...picked].reduce((s, k) => s + prices[k], 0);
          basket.textContent = picked.size ? `🧺 ${[...picked].map(k => fmt(prices[k])).join(' + ')} = ${fmt(total)}` : '🧺 empty';
          result.innerHTML = '';
        }, { 'aria-label': `${n}, ${fmt(p)}`, 'data-correct': isAnswer ? 'yes' : 'no' });
        grid.append(card);
      });
      const check = button('✓ Check', 'btn btn--big check-btn', () => {
        result.innerHTML = '';
        const total = [...picked].reduce((s, k) => s + prices[k], 0);
        if (picked.size === 3 && total === B) {
          check.disabled = true;
          $$('.shelf__btn', grid).forEach(x => { x.disabled = true; });
          MA.launchConfetti(40);
          say(`Exactly ${fmt(B)}! ${pick(PRAISE)}`);
          nextOrDone(result, round === budgets.length - 1, 'Next budget ▶', () => { round += 1; next(); }, done, '🚀 Budget boss!');
        } else {
          const tip = picked.size !== 3 ? 'Choose exactly 3 things.' : total > B ? `${fmt(total)} is too much! Swap something cheaper.` : `${fmt(total)} is not enough. Swap something dearer.`;
          say(tip);
          result.append(el('p', { class: 'round-result__tip' }, `💡 ${tip}`));
        }
      });
      box.append(el('p', { class: 'round-label' }, `Budget ${round + 1} of ${budgets.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, '👛 Spend exactly'), el('strong', {}, fmt(B))),
        instruction('👆 Tap 3 things, then Check.'), grid, basket, check, result);
    }
  }

  function qChange() { const p = rnd(3, 9); return { icon: '🪙', question: `Pay ${fmt(10)} for a ${fmt(p)} toy. Change?`, instruction: 'Count on to 10.', options: optionsFor(10 - p, [10 - p + 1, p, 10 - p - 1]).map(o => ({ ...o, label: fmt(o.value) })), answer: 10 - p, hint: `Almost! ${p} + ? = 10`, explain: fmt(10 - p) }; }
  function qTotal() { const a = rnd(3, 9); const b = rnd(2, 8); return { icon: '🧺', question: `🍪 ${fmt(a)} and 🧃 ${fmt(b)}. How much altogether?`, instruction: 'Add the prices.', options: optionsFor(a + b, [a + b + 1, a + b - 1, a * b]).map(o => ({ ...o, label: fmt(o.value) })), answer: a + b, hint: `Almost! ${a} + ${b}`, explain: fmt(a + b) }; }
  function qAfford() { const have = rnd(10, 20); const cheap = have - rnd(1, 5); return { icon: '👛', question: `You have ${fmt(have)}. Which can you buy?`, instruction: 'It must cost the same or less.', options: shuffle([cheap, have + rnd(1, 5), have + 10]).map(v => ({ value: v, label: `🪁 ${fmt(v)}` })), answer: cheap, hint: 'Almost! Look for a price smaller than your money.', explain: `${fmt(cheap)} is less than ${fmt(have)}.` }; }
  function qDouble() { const p = rnd(3, 10); return { icon: '✌️', question: `One kite is ${fmt(p)}. How much for two?`, instruction: 'Double!', options: optionsFor(p * 2, [p, p * 2 + 2, p + 2]).map(o => ({ ...o, label: fmt(o.value) })), answer: p * 2, hint: `Almost! ${p} + ${p}`, explain: fmt(p * 2) }; }
  function qEnough() { return { icon: '🤔', question: `You have ${fmt(15)}. A ball costs ${fmt(18)}. How much more do you need?`, instruction: 'Count on.', options: optionsFor(3, [18, 33, 2]).map(o => ({ ...o, label: fmt(o.value) })), answer: 3, hint: 'Almost! 15 + ? = 18', explain: fmt(3) }; }

  function renderMaster(box, done) { K.runMaster(box, done, { makeQuestions: () => [qChange(), qTotal(), qAfford(), qDouble(), qEnough()], moduleId: MODULE_ID, badgeId: 'super-shopper', title: 'Super Shopper' }); }
  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
