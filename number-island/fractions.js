/* ==============================================================
   🍕 Number Island → Fractions          number-island/fractions.js
   --------------------------------------------------------------
   🌱 Learn      colour halves, quarters and three-quarters of shapes
   🎮 Play       give a fraction of the apples to Milo's basket
   🧩 Practise   drag ½ ¼ ¾ onto shapes, then fractions of amounts
   🧠 Think      true or false? (equal parts, 2 quarters = 1 half)
   🚀 Challenge  build a whole bar from half and quarter pieces
   🏆 Master     five mixed questions → Fraction Hero badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  if (!MA || !K) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, pulse, optionsFor, trueFalse, nextOrDone, dragMatch, fractionSVG, PRAISE } = K;

  const MODULE_ID = 'number-island/fractions';
  const NAME = { '½': 'one half', '¼': 'one quarter', '¾': 'three quarters' };

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Colour the fraction',   render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: "Milo's basket",         render: renderPlay },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Fraction match',        render: renderPractise },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',        render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Build a whole',         render: renderBuild },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Fraction Hero',         render: renderMaster }
  ];

  /* ------------------------------------------------------------
     🌱 LEARN — tap parts of a shape to colour them
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    const tasks = [
      { shape: 'circle', parts: 2, want: 1, frac: '½', tip: '2 equal parts. Each part is one half.' },
      { shape: 'square', parts: 4, want: 1, frac: '¼', tip: '4 equal parts. Each part is one quarter.' },
      { shape: 'rect', parts: 4, want: 3, frac: '¾', tip: '3 of the 4 equal parts is three quarters.' },
      { shape: 'circle', parts: 4, want: 2, frac: '½', tip: '2 quarters cover the same as 1 half!' }
    ];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const t = tasks[round];
      let solved = false;
      say(round === 3 ? 'Tricky one! Colour one HALF of a shape cut into quarters.' : `Colour ${NAME[t.frac]} of the shape. Tap the parts!`);
      const svg = fractionSVG({ shape: t.shape, parts: t.parts, size: 200, interactive: true });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const count = el('p', { class: 'hop-count', 'aria-live': 'polite' }, `Coloured: 0 of ${t.parts}`);
      svg.setAttribute('role', 'group');
      svg.setAttribute('aria-label', `Shape cut into ${t.parts} equal parts`);
      $$('.frac-part', svg).forEach(part => {
        part.setAttribute('tabindex', '0');
        part.setAttribute('role', 'button');
        part.setAttribute('aria-label', `Part ${Number(part.dataset.index) + 1}`);
        const toggle = () => {
          if (solved) return;
          part.classList.toggle('is-shaded');
          const n = $$('.frac-part.is-shaded', svg).length;
          count.textContent = `Coloured: ${n} of ${t.parts}`;
          if (n === t.want) {
            solved = true;
            say(`${NAME[t.frac]}! ${t.tip}`);
            MA.launchConfetti(25);
            result.append(el('p', { class: 'round-result__text' }, `🎉 ${t.want} out of ${t.parts} = ${t.frac}`),
              el('p', { class: 'round-result__tip' }, t.tip));
            nextOrDone(result, round === tasks.length - 1, 'Next shape ▶', () => { round += 1; newRound(); }, done);
          } else if (n > t.want) say('Too many! Tap a part again to un-colour it.');
        };
        part.addEventListener('click', toggle);
        part.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
      });
      box.append(el('p', { class: 'round-label' }, `Shape ${round + 1} of ${tasks.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, 'Colour'), el('strong', {}, t.frac)),
        instruction('👆 Tap parts of the shape to colour them.'), el('div', { class: 'frac-stage' }, svg), count, result);
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — fraction of a set of apples
     ------------------------------------------------------------ */
  function renderPlay(box, done) {
    const tasks = [
      { total: 8, frac: '½', want: 4, how: 'Split 8 into 2 equal groups. One group is half.' },
      { total: 12, frac: '¼', want: 3, how: 'Split 12 into 4 equal groups. One group is a quarter.' },
      { total: 10, frac: '½', want: 5, how: 'Half of 10: 5 and 5.' },
      { total: 8, frac: '¾', want: 6, how: '8 in 4 equal groups is 2 each. Three groups is 6.' }
    ];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const t = tasks[round];
      let solved = false;
      say(`Give Milo ${NAME[t.frac]} of the ${t.total} apples. Tap apples to put them in his basket.`);
      const tree = el('div', { class: 'share-pile', role: 'group', 'aria-label': 'Apples' });
      const basket = el('div', { class: 'basket', role: 'group', 'aria-label': "Milo's basket" });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const count = el('p', { class: 'hop-count', 'aria-live': 'polite' }, 'In the basket: 0');
      for (let i = 0; i < t.total; i++) {
        const apple = button('🍎', 'apple', () => {
          if (solved) return;
          (apple.parentElement === tree ? basket : tree).append(apple);
          count.textContent = `In the basket: ${basket.children.length}`;
          result.innerHTML = '';
        }, { 'aria-label': 'Apple, tap to move' });
        tree.append(apple);
      }
      const check = button('✓ Check', 'btn btn--big', () => {
        result.innerHTML = '';
        const n = basket.children.length;
        if (n === t.want) {
          solved = true;
          check.disabled = true;
          $$('.apple', box).forEach(a => { a.disabled = true; });
          say(`Yes! ${NAME[t.frac]} of ${t.total} is ${t.want}.`);
          MA.launchConfetti(30);
          result.append(el('p', { class: 'round-result__text' }, `🍎 ${t.frac} of ${t.total} = ${t.want}`),
            el('p', { class: 'round-result__tip' }, t.how));
          nextOrDone(result, round === tasks.length - 1, 'Next ▶', () => { round += 1; newRound(); }, done);
        } else {
          result.append(el('p', { class: 'round-result__tip' }, `💡 ${n > t.want ? 'Too many.' : 'Not enough.'} ${t.how.split('.')[0]}.`));
          say(n > t.want ? 'Too many in the basket!' : 'Milo needs more!');
        }
      });
      box.append(el('p', { class: 'round-label' }, `Basket ${round + 1} of ${tasks.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, `${t.frac} of`), el('strong', {}, String(t.total))),
        instruction('👆 Tap apples to move them. Then Check.'), tree,
        el('p', { class: 'basket-label' }, '🧺 Milo’s basket'), basket, count, check, result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — match fractions
     ------------------------------------------------------------ */
  function renderPractise(box, done) {
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      let items;
      let tiles;
      if (round === 0) {
        const set = shuffle([
          { shape: 'circle', parts: 2, shaded: [0], v: '½' },
          { shape: 'square', parts: 4, shaded: [0], v: '¼' },
          { shape: 'rect', parts: 4, shaded: [0, 1, 2], v: '¾' },
          { shape: 'circle', parts: 4, shaded: [0, 1, 2, 3], v: '1 whole' }
        ]);
        items = set.map(s => ({ face: fractionSVG({ shape: s.shape, parts: s.parts, shaded: s.shaded, size: 80 }), value: s.v, label: 'Shaded shape' }));
        tiles = [...set.map(s => s.v), '2 wholes'];
        say('How much is coloured? Match the fraction!');
      } else {
        const qs = [];
        const add = (frac, total, ans) => { if (!qs.some(q => q.ans === ans)) qs.push({ text: `${frac} of ${total}`, ans }); };
        while (qs.length < 4) {
          const kind = pick(['½', '¼', '¾']);
          if (kind === '½') { const n = rnd(2, 10) * 2; add('½', n, n / 2); }
          else if (kind === '¼') { const n = rnd(1, 5) * 4; add('¼', n, n / 4); }
          else { const n = rnd(1, 3) * 4; add('¾', n, (n / 4) * 3); }
        }
        items = qs.map(q => ({ face: el('span', {}, `${q.text} =`), value: q.ans, label: q.text }));
        const trick = [qs[0].ans * 2, qs[0].ans + 1].find(v => !qs.some(q => q.ans === v));
        tiles = [...qs.map(q => q.ans), trick];
        say('Now fractions of numbers! Share into equal groups.');
      }
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        items, tiles,
        hint: round === 0 ? 'Almost! Count the equal parts, then count the coloured ones.' : 'Almost! Half: share by 2. Quarter: share by 4.',
        onComplete: spare => {
          MA.launchConfetti(25);
          say(spare ? `${pick(PRAISE)} “${spare.dataset.value}” was a trick!` : pick(PRAISE));
          nextOrDone(result, round === 1, 'Next round ▶', () => { round += 1; newRound(); }, done, '🧩 All matched!');
        }
      });
      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of 2`),
        instruction('✋ Drag each answer onto its card. Or tap an answer, then a box.'), cards, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const svgHTML = opts => fractionSVG({ size: 110, ...opts }).outerHTML;
    const statements = [
      () => ({ text: `${svgHTML({ shape: 'rect', parts: 2, unequal: true, shaded: [1] })}<small>Milo says: “This shows ½.”</small>`, truth: false, explain: 'Halves must be EQUAL parts. These parts are different sizes.' }),
      () => ({ text: `${svgHTML({ shape: 'circle', parts: 4, shaded: [0, 1] })}<small>2 quarters = 1 half</small>`, truth: true, explain: 'True! 2 quarters cover the same amount as 1 half.' }),
      () => { const n = rnd(3, 8) * 2; return { text: `½ of ${n} = 2`, truth: false, explain: `½ of ${n} = ${n / 2}. Share ${n} into 2 equal groups.`, fix: { question: `What is half of ${n}?`, options: [n / 2, 2, n - 2], answer: n / 2 } }; },
      () => ({ text: '¼ is bigger than ½', truth: false, explain: 'A quarter is smaller! Cut into 4 parts, each part is smaller than cutting into 2.' })
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'True or false? Look carefully at the parts!' : pick(['True or false?', 'Think about equal parts!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — build a whole from pieces
     ------------------------------------------------------------ */
  function renderBuild(box, done) {
    const tasks = [
      { target: 4, label: '1 whole', rule: 'quarters', text: 'Make 1 whole using only quarters.' },
      { target: 4, label: '1 whole', rule: 'mixed', text: 'Make 1 whole using a half AND quarters.' },
      { target: 3, label: '¾', rule: 'any', text: 'Make three quarters. Any pieces!' }
    ];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const t = tasks[round];
      const pieces = [];   // 2 = half, 1 = quarter
      let solved = false;
      say(t.text);
      const bar = el('div', { class: 'whole-bar', role: 'img' });
      const marks = el('div', { class: 'whole-bar__target', style: `width:${(t.target / 4) * 100}%` });
      const sentence = el('p', { class: 'add-sentence', 'aria-live': 'polite' }, 'Empty');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const total = () => pieces.reduce((a, b) => a + b, 0);

      const add = size => {
        if (solved) return;
        if (t.rule === 'quarters' && size === 2) { say('Only quarters this time!'); return; }
        if (total() + size > t.target) { say('That piece is too big. It would go past the end!'); pulse(bar, 'is-bad'); return; }
        pieces.push(size);
        draw();
      };
      const undo = () => { if (!solved && pieces.length) { pieces.pop(); draw(); } };
      const pad = el('div', { class: 'stage-actions' },
        button('½ piece', 'piece-btn piece-btn--half', () => add(2), { 'aria-label': 'Add a half piece' }),
        button('¼ piece', 'piece-btn piece-btn--quarter', () => add(1), { 'aria-label': 'Add a quarter piece' }),
        button('↩ Undo', 'btn btn--ghost', undo));

      function draw() {
        bar.innerHTML = '';
        bar.append(marks);
        pieces.forEach(p => bar.append(el('span', { class: `whole-bar__piece whole-bar__piece--${p === 2 ? 'half' : 'quarter'}`, style: `width:${p * 25}%` }, p === 2 ? '½' : '¼')));
        bar.setAttribute('aria-label', `Bar filled with ${pieces.map(p => (p === 2 ? 'a half' : 'a quarter')).join(', ') || 'nothing'}`);
        sentence.textContent = pieces.length ? pieces.map(p => (p === 2 ? '½' : '¼')).join(' + ') : 'Empty';
        if (total() === t.target) {
          if (t.rule === 'mixed' && !pieces.includes(2)) { say('Full! But this time you need a half piece too. Undo and try again.'); return; }
          solved = true;
          $$('button', pad).forEach(b => { b.disabled = true; });
          sentence.textContent += ` = ${t.label}`;
          say(`${sentence.textContent}! ${pick(PRAISE)}`);
          MA.launchConfetti(35);
          nextOrDone(result, round === tasks.length - 1, 'Next build ▶', () => { round += 1; newRound(); }, done, '🚀 Fraction builder!');
        }
      }
      draw();
      box.append(el('p', { class: 'round-label' }, `Build ${round + 1} of ${tasks.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, 'Make'), el('strong', {}, t.label)),
        instruction(`👆 ${t.text}`), bar, sentence, pad, result);
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  const fracChoices = right => shuffle(['½', '¼', '¾']).map(v => ({ value: v, label: v }));
  function qShape() {
    const pick3 = pick([{ parts: 2, shaded: [0], a: '½' }, { parts: 4, shaded: [0], a: '¼' }, { parts: 4, shaded: [0, 1, 2], a: '¾' }]);
    return { icon: '🍕', question: 'How much is coloured?', instruction: 'Count the equal parts.', visual: `<div class="frac-stage">${fractionSVG({ shape: pick(['circle', 'square']), parts: pick3.parts, shaded: pick3.shaded, size: 130 }).outerHTML}</div>`, options: fracChoices(), answer: pick3.a, hint: 'Almost! How many equal parts? How many are coloured?', explain: `${pick3.shaded.length} of ${pick3.parts} equal parts = ${pick3.a}` };
  }
  function qHalf() { const n = rnd(3, 10) * 2; return { icon: '✌️', question: `What is ½ of ${n}?`, instruction: 'Share into 2 equal groups.', options: optionsFor(n / 2, [n - 2, n / 2 + 1, n * 2]), answer: n / 2, hint: `Almost! ? + ? = ${n}, both the same.`, explain: `½ of ${n} = ${n / 2}` }; }
  function qQuarter() { const n = rnd(2, 5) * 4; return { icon: '🍀', question: `What is ¼ of ${n}?`, instruction: 'Share into 4 equal groups.', options: optionsFor(n / 4, [n / 2, n - 4, n / 4 + 1]), answer: n / 4, hint: 'Almost! Halve it, then halve again.', explain: `¼ of ${n} = ${n / 4}` }; }
  function qWhole() { return { icon: '🧩', question: 'How many quarters make one whole?', instruction: 'Think of a pizza in 4 slices.', options: optionsFor(4, [2, 3, 1]), answer: 4, hint: 'Almost! A quarter is one of 4 equal parts.', explain: '4 quarters = 1 whole' }; }
  function qThree() { const n = pick([4, 8]); return { icon: '🍎', question: `What is ¾ of ${n}?`, instruction: 'Find a quarter first.', options: optionsFor((n / 4) * 3, [n / 4, n / 2, n - 1]), answer: (n / 4) * 3, hint: `Almost! ¼ of ${n} is ${n / 4}. Three quarters is 3 of those.`, explain: `¾ of ${n} = ${(n / 4) * 3}` }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qShape(), qHalf(), qQuarter(), qWhole(), qThree()], moduleId: MODULE_ID, badgeId: 'fraction-hero', title: 'Fraction Hero' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
