/* ==============================================================
   🔺 Shape Castle → 2D Shapes          shape-castle/2d-shapes.js
   --------------------------------------------------------------
   🌱 Learn      tap shape cards to meet each shape, then find named ones
   🎮 Play       shape hunt: tap every triangle (circle, hexagon…) in the scene
   🧩 Practise   drag names onto shapes
   🧠 Think      true or false? (a turned square is still a square)
   🚀 Challenge  mystery-shape riddles
   🏆 Master     five mixed questions → Shape Spotter badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const S = window.Shapes;
  if (!MA || !K || !S) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, pulse, trueFalse, nextOrDone, dragMatch, PRAISE } = K;

  const MODULE_ID = 'shape-castle/2d-shapes';
  const MAIN = ['circle', 'semicircle', 'triangle', 'square', 'rectangle', 'pentagon', 'hexagon', 'octagon'];
  const info = name => S.INFO_2D[S.familyOf(name)];
  const factLine = name => {
    const i = info(name);
    if (i.note) return i.note;
    return i.curved ? '1 curved side, no corners' : `${i.sides} straight sides, ${i.corners} corners`;
  };

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Meet the shapes',  render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Shape hunt',       render: renderHunt },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Name the shapes',  render: renderPractise },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',   render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Mystery shapes',   render: renderMystery },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Shape Spotter',    render: renderMaster }
  ];

  /* ------------------------------------------------------------
     🌱 LEARN — flip every card, then find named shapes
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    meet();

    function meet() {
      box.innerHTML = '';
      const seen = new Set();
      say('Tap each shape card to find out its name!');
      const grid = el('div', { class: 'shape-cards' });
      const progress = el('p', { class: 'hop-count', 'aria-live': 'polite' }, `Met: 0 of ${MAIN.length}`);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      MAIN.forEach((name, i) => {
        const back = el('span', { class: 'shape-card__back' }, el('strong', {}, info(name).label), el('small', {}, factLine(name)));
        const card = button([S.draw2D(name, { size: 74, fill: S.COLOURS[i % S.COLOURS.length] }), back], 'shape-card', () => {
          card.classList.toggle('is-flipped');
          if (!seen.has(name)) {
            seen.add(name);
            say(`This is a ${info(name).label}. ${factLine(name)}.`);
            progress.textContent = `Met: ${seen.size} of ${MAIN.length}`;
            if (seen.size === MAIN.length) {
              MA.launchConfetti(25);
              result.append(el('p', { class: 'round-result__text' }, '🎉 You met all 8 shapes!'),
                el('div', { class: 'stage-actions' }, button('Next: find them! ▶', 'btn', findIt)));
            }
          }
        }, { 'aria-label': `Shape card ${i + 1}, tap to see its name`, 'data-shape': name });
        grid.append(card);
      });
      box.append(instruction('👆 Tap every card.'), progress, grid, result);
    }

    function findIt() {
      const targets = shuffle(['triangle', 'hexagon', 'pentagon', 'rectangle', 'octagon', 'circle']).slice(0, 3);
      let round = 0;
      next();
      function next() {
        box.innerHTML = '';
        const want = targets[round];
        const options = shuffle([want, ...shuffle(MAIN.filter(n => n !== want)).slice(0, 3)]);
        let solved = false;
        say(`Can you find the ${info(want).label}?`);
        const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
        const grid = el('div', { class: 'shape-cards shape-cards--four' });
        options.forEach((name, i) => {
          const b = button(S.draw2D(name, { size: 74, fill: S.COLOURS[(i + 2) % S.COLOURS.length], rotate: rnd(-20, 20) }), 'shape-card', () => {
            if (solved) return;
            if (name === want) {
              solved = true;
              b.classList.add('is-right');
              say(`Yes! ${factLine(name)}.`);
              MA.launchConfetti(20);
              result.append(el('p', { class: 'round-result__text' }, `🎉 That is the ${info(name).label}!`));
              nextOrDone(result, round === targets.length - 1, 'Next ▶', () => { round += 1; next(); }, done);
            } else {
              b.classList.add('is-wrong');
              b.disabled = true;
              say(`That is a ${info(name).label}. A ${info(want).label} has ${info(want).curved ? 'a curved side' : `${info(want).sides} sides`}.`);
            }
          }, { 'aria-label': `Shape option ${i + 1}`, 'data-shape': name });
          grid.append(b);
        });
        box.append(el('p', { class: 'round-label' }, `Find ${round + 1} of ${targets.length}`),
          el('div', { class: 'target-badge' }, el('span', {}, 'Find the'), el('strong', {}, info(want).label)), grid, result);
      }
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — shape hunt in a castle scene
     ------------------------------------------------------------ */
  function renderHunt(box, done) {
    const targets = ['triangle', 'circle', 'hexagon'];
    let round = 0;
    newRound();

    function newRound() {
      box.innerHTML = '';
      const want = targets[round];
      const wantCount = rnd(3, 5);
      const variants = { triangle: ['triangle', 'triangle-right', 'triangle-thin'], circle: ['circle'], hexagon: ['hexagon'] };
      const others = MAIN.filter(n => n !== want && !(want === 'circle' && n === 'semicircle'));
      const pieces = shuffle([
        ...Array.from({ length: wantCount }, () => pick(variants[want])),
        ...Array.from({ length: 9 - wantCount }, () => pick(others))
      ]);
      let found = 0;
      say(`Shape hunt! Tap every ${info(want).label} you can see.`);
      const scene = el('div', { class: 'hunt', role: 'group', 'aria-label': 'Shape scene' });
      const progress = el('p', { class: 'hop-count', 'aria-live': 'polite' }, `Found: 0 of ${wantCount}`);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      pieces.forEach((name, i) => {
        const b = button(S.draw2D(name, { size: rnd(52, 76), fill: S.COLOURS[rnd(0, S.COLOURS.length - 1)], rotate: rnd(-40, 40) }), 'hunt__piece', () => {
          if (b.classList.contains('is-found')) return;
          if (S.familyOf(name) === want) {
            b.classList.add('is-found');
            b.setAttribute('aria-label', `${info(name).label}, found`);
            found += 1;
            progress.textContent = `Found: ${found} of ${wantCount}`;
            if (found === wantCount) {
              MA.launchConfetti(35);
              say(`You found all ${wantCount}! ${pick(PRAISE)}`);
              nextOrDone(result, round === targets.length - 1, 'Next hunt ▶', () => { round += 1; newRound(); }, done, '🔍 Super shape hunter!');
            } else say(pick(PRAISE));
          } else {
            pulse(b, 'is-oops');
            say(`That is a ${info(name).label}. Look for ${info(want).curved ? 'a round shape' : `${info(want).sides} straight sides`}.`);
          }
        }, { 'aria-label': `Shape ${i + 1}`, 'data-shape': name });
        scene.append(b);
      });
      box.append(el('p', { class: 'round-label' }, `Hunt ${round + 1} of ${targets.length}`),
        el('div', { class: 'target-badge' }, el('span', {}, 'Find every'), el('strong', {}, info(want).label)),
        progress, scene, result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — drag names onto shapes
     ------------------------------------------------------------ */
  function renderPractise(box, done) {
    const sets = [shuffle(['triangle', 'square', 'circle', 'rectangle']), shuffle(['pentagon', 'hexagon', 'octagon', 'semicircle'])];
    let round = 0;
    newRound();
    function newRound() {
      box.innerHTML = '';
      const names = sets[round];
      const spare = round === 0 ? 'hexagon' : 'square';
      say(round === 0 ? 'Drag each name onto its shape.' : 'Trickier shapes! Count the sides.');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        items: names.map((n, i) => ({ face: S.draw2D(n, { size: 70, fill: S.COLOURS[i], rotate: rnd(-15, 15) }), value: info(n).label, label: 'Shape' })),
        tiles: [...names.map(n => info(n).label), info(spare).label],
        hint: (tile) => `Almost! A ${tile} has ${info(MAIN.find(n => info(n).label === tile)).curved ? 'a curved side' : `${info(MAIN.find(n => info(n).label === tile)).sides} sides`}.`,
        onComplete: sp => {
          MA.launchConfetti(25);
          say(sp ? `${pick(PRAISE)} The ${sp.dataset.value} was not needed!` : pick(PRAISE));
          nextOrDone(result, round === sets.length - 1, 'Next round ▶', () => { round += 1; newRound(); }, done, '🧩 All named!');
        }
      });
      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of ${sets.length}`),
        instruction('✋ Drag each name onto its shape. Or tap a name, then a box.'), cards, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const pic = (name, rotate = 0) => S.draw2D(name, { size: 110, rotate, fill: '#7B61FF' }).outerHTML;
    const statements = [
      () => ({ text: `${pic('square', 45)}<small>Milo says: “This is NOT a square. It is a diamond.”</small>`, truth: false, explain: 'It is still a square! Turning a shape does not change it: 4 equal sides, 4 corners.' }),
      () => ({ text: `${pic('triangle-thin')}<small>This is a triangle.</small>`, truth: true, explain: 'True! Any shape with 3 straight sides and 3 corners is a triangle.' }),
      () => ({ text: `${pic('circle')}<small>A circle has 1 corner.</small>`, truth: false, explain: 'A circle has no corners at all. It has one curved side.', fix: { question: 'How many corners does a circle have?', options: [0, 1, 4], answer: 0 } }),
      () => ({ text: `${pic('hexagon', 30)}<small>This shape has 6 sides.</small>`, truth: true, explain: 'True! It is a hexagon: 6 sides and 6 corners.' })
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'True or false? Look closely at each shape.' : pick(['True or false?', 'Count the sides!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — mystery shapes
     ------------------------------------------------------------ */
  function renderMystery(box, done) {
    const riddles = shuffle([
      { clue: 'I have 5 straight sides and 5 corners.', answer: 'pentagon' },
      { clue: 'I have 4 sides. Two are long and two are short.', answer: 'rectangle' },
      { clue: 'I have no corners. I am perfectly round.', answer: 'circle' },
      { clue: 'I have 8 sides. Look for me on a STOP sign.', answer: 'octagon' },
      { clue: 'I have 1 curved side and 1 straight side.', answer: 'semicircle' },
      { clue: 'I have 6 sides, like a honeycomb cell.', answer: 'hexagon' }
    ]).slice(0, 4);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const r = riddles[round];
      let solved = false;
      say('Read the clue. Which shape am I?');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const grid = el('div', { class: 'shape-cards' });
      const options = shuffle([r.answer, ...shuffle(MAIN.filter(n => n !== r.answer)).slice(0, 5)]);
      options.forEach((name, i) => {
        const b = button(S.draw2D(name, { size: 64, fill: S.COLOURS[i % S.COLOURS.length] }), 'shape-card shape-card--small', () => {
          if (solved) return;
          if (name === r.answer) {
            solved = true;
            b.classList.add('is-right');
            say(`I am a ${info(name).label}! ${pick(PRAISE)}`);
            MA.launchConfetti(25);
            result.append(el('p', { class: 'round-result__text' }, `🕵️ A ${info(name).label}!`));
            nextOrDone(result, round === riddles.length - 1, 'Next riddle ▶', () => { round += 1; next(); }, done);
          } else {
            b.classList.add('is-wrong');
            b.disabled = true;
            say(`Not the ${info(name).label}. Read the clue again.`);
          }
        }, { 'aria-label': `Shape option ${i + 1}`, 'data-shape': name });
        grid.append(b);
      });
      box.append(el('p', { class: 'round-label' }, `Riddle ${round + 1} of ${riddles.length}`),
        el('div', { class: 'riddle-card' }, el('span', { 'aria-hidden': 'true' }, '🕵️'), el('p', {}, r.clue)),
        instruction('👆 Tap the mystery shape.'), grid, result);
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  const nameChoices = (right, pool) => shuffle([right, ...shuffle(pool.filter(n => n !== right)).slice(0, 2)]).map(n => ({ value: info(n).label, label: info(n).label }));
  const picture = (name, rotate = 0) => `<div class="frac-stage">${S.draw2D(name, { size: 120, rotate, fill: pick(S.COLOURS) }).outerHTML}</div>`;
  function qName() { const n = pick(['pentagon', 'hexagon', 'octagon', 'rectangle', 'triangle']); return { icon: '🔺', question: 'What is this shape called?', instruction: 'Count the sides.', visual: picture(n, rnd(-25, 25)), options: nameChoices(n, ['pentagon', 'hexagon', 'octagon', 'rectangle', 'triangle', 'square']), answer: info(n).label, hint: 'Almost! Count the straight sides.', explain: `A ${info(n).label}: ${factLine(n)}.` }; }
  function qSides() { const n = pick(['pentagon', 'hexagon', 'octagon', 'triangle', 'square']); const s = info(n).sides; return { icon: '✏️', question: `How many sides does a ${info(n).label} have?`, instruction: 'Picture it in your head.', options: K.optionsFor(s, [s + 1, s - 1, s + 2]), answer: s, hint: 'Almost! Draw it with your finger and count.', explain: `A ${info(n).label} has ${s} sides.` }; }
  function qCorners() { return { icon: '📍', question: 'Which shape has 6 corners?', instruction: 'Corners are where two sides meet.', options: nameChoices('hexagon', ['pentagon', 'octagon', 'hexagon']), answer: 'hexagon', hint: 'Almost! A shape with 6 corners has 6 sides too.', explain: 'A hexagon has 6 sides and 6 corners.' }; }
  function qTurned() { return { icon: '🔄', question: 'What is this shape?', instruction: 'Turning does not change a shape!', visual: picture('square', 45), options: nameChoices('square', ['square', 'triangle', 'pentagon']), answer: 'square', hint: 'Almost! Count the sides. Are they all the same length?', explain: 'A turned square is still a square.' }; }
  function qCurved() { return { icon: '⭕', question: 'Which shape has a curved side?', instruction: 'Look for round edges.', options: nameChoices('circle', ['circle', 'square', 'hexagon']), answer: 'circle', hint: 'Almost! Which one is round?', explain: 'A circle has one curved side and no corners.' }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qName(), qSides(), qTurned(), qCorners(), qCurved()], moduleId: MODULE_ID, badgeId: 'shape-spotter', title: 'Shape Spotter' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
