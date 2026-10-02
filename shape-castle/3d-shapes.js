/* ==============================================================
   🧊 Shape Castle → 3D Shapes           shape-castle/3d-shapes.js
   --------------------------------------------------------------
   🌱 Learn      meet solid shapes and the everyday things they look like
   🎮 Play       sort: does it roll? can it stack?
   🧩 Practise   drag shape names onto everyday objects
   🧠 Think      true or false? (faces, curved surfaces, cube vs cuboid)
   🚀 Challenge  count the flat faces, then solve shape clues
   🏆 Master     five mixed questions → 3D Shape Expert badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  const S = window.Shapes;
  if (!MA || !K || !S) return;
  const { rnd, pick, shuffle, el, button, instruction, say, pulse, nextOrDone, dragMatch, sortZones, optionsFor, PRAISE } = K;

  const MODULE_ID = 'shape-castle/3d-shapes';
  const NAMES = S.NAMES_3D;
  const info = n => S.INFO_3D[n];
  const COLOUR = { cube: '#FF8A3D', cuboid: '#4D96FF', sphere: '#FF6B8B', cylinder: '#22B5A6', cone: '#FFC93C', pyramid: '#7B61FF' };
  const draw = (n, size = 90) => S.draw3D(n, { size, colour: COLOUR[n] });
  const facts = n => {
    const i = info(n);
    const parts = [];
    if (i.flat) parts.push(`${i.flat} flat face${i.flat === 1 ? '' : 's'}`);
    if (i.curved) parts.push('a curved surface');
    return parts.join(' and ');
  };

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Meet the solids',     render: renderLearn },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Roll or stack?',      render: renderPlay },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Shapes all around',   render: renderPractise },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',      render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Face detective',      render: renderFaces },
    { id: 'master',    icon: '🏆', label: 'Master',    title: '3D Shape Expert',     render: renderMaster }
  ];

  /* ------------------------------------------------------------
     🌱 LEARN — flip each solid to see its name and a real-life twin
     ------------------------------------------------------------ */
  function renderLearn(box, done) {
    meet();
    function meet() {
      box.innerHTML = '';
      const seen = new Set();
      say('These shapes are solid. You can hold them! Tap each one.');
      const grid = el('div', { class: 'shape-cards shape-cards--3d' });
      const progress = el('p', { class: 'hop-count', 'aria-live': 'polite' }, `Met: 0 of ${NAMES.length}`);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      NAMES.forEach((n, i) => {
        const back = el('span', { class: 'shape-card__back' }, el('strong', {}, info(n).label), el('span', { class: 'shape-card__objects' }, info(n).objects.join(' ')), el('small', {}, facts(n)));
        const card = button([draw(n, 84), back], 'shape-card', () => {
          card.classList.toggle('is-flipped');
          if (!seen.has(n)) {
            seen.add(n);
            say(`A ${info(n).label}, like ${info(n).objects[0]}. It has ${facts(n)}.`);
            progress.textContent = `Met: ${seen.size} of ${NAMES.length}`;
            if (seen.size === NAMES.length) {
              MA.launchConfetti(25);
              result.append(el('p', { class: 'round-result__text' }, '🎉 You met all 6 solids!'),
                el('div', { class: 'stage-actions' }, button('Next: spot them! ▶', 'btn', spot)));
            }
          }
        }, { 'aria-label': `Solid shape card ${i + 1}`, 'data-shape': n });
        grid.append(card);
      });
      box.append(instruction('👆 Tap every card.'), progress, grid, result);
    }

    function spot() {
      const targets = shuffle(NAMES).slice(0, 3);
      let round = 0;
      next();
      function next() {
        box.innerHTML = '';
        const want = targets[round];
        const obj = pick(info(want).objects);
        let solved = false;
        say(`${obj} Which solid shape does this look like?`);
        const grid = el('div', { class: 'shape-cards shape-cards--four' });
        const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
        shuffle([want, ...shuffle(NAMES.filter(n => n !== want)).slice(0, 3)]).forEach((n, i) => {
          const b = button(draw(n, 76), 'shape-card', () => {
            if (solved) return;
            if (n === want) {
              solved = true;
              b.classList.add('is-right');
              say(`Yes! ${obj} is shaped like a ${info(n).label}.`);
              MA.launchConfetti(20);
              result.append(el('p', { class: 'round-result__text' }, `🎉 A ${info(n).label}!`));
              nextOrDone(result, round === targets.length - 1, 'Next ▶', () => { round += 1; next(); }, done);
            } else {
              b.classList.add('is-wrong');
              b.disabled = true;
              say(`That is a ${info(n).label}. Look at the shape of ${obj} again.`);
            }
          }, { 'aria-label': `Shape option ${i + 1}`, 'data-shape': n });
          grid.append(b);
        });
        box.append(el('p', { class: 'round-label' }, `Spot ${round + 1} of ${targets.length}`),
          el('div', { class: 'big-object', 'aria-hidden': 'true' }, obj), instruction('👆 Tap the matching shape.'), grid, result);
      }
    }
  }

  /* ------------------------------------------------------------
     🎮 PLAY — sort by rolling and stacking
     ------------------------------------------------------------ */
  function renderPlay(box, done) {
    const ROUNDS = [
      { key: 'rolls', yes: '🛝 Rolls', no: '🧱 Does not roll', intro: 'Will it roll down the slide? Shapes with a curved surface can roll!' },
      { key: 'stacks', yes: '🗼 Stacks', no: '🙅 Will not stack', intro: 'Can you build a tower with it? You need flat faces on top and bottom!' }
    ];
    let round = 0;
    newRound();
    function newRound() {
      box.innerHTML = '';
      const cfg = ROUNDS[round];
      say(cfg.intro);
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { bank, zones } = sortZones({
        zones: [{ id: 'yes', label: cfg.yes }, { id: 'no', label: cfg.no }],
        items: NAMES.map(n => ({ face: draw(n, 70), cat: info(n)[cfg.key] ? 'yes' : 'no', label: info(n).label, name: n })),
        hint: (item) => {
          const i = info(item.name);
          if (cfg.key === 'rolls') return i.curved ? `A ${i.label} has a curved surface, so it rolls!` : `A ${i.label} has only flat faces. It slides, not rolls.`;
          return i.stacks ? `A ${i.label} has flat faces top and bottom. It stacks!` : `A ${i.label} has a ${i.curved && !i.flat ? 'round' : 'pointy'} top. Nothing sits on it.`;
        },
        onComplete: () => {
          MA.launchConfetti(30);
          say(cfg.key === 'rolls' ? 'Curved surfaces roll. Flat faces slide!' : 'Flat faces on top and bottom make good towers!');
          nextOrDone(result, round === ROUNDS.length - 1, 'Next sort ▶', () => { round += 1; newRound(); }, done, '🎮 All sorted!');
        }
      });
      box.append(el('p', { class: 'round-label' }, `Sort ${round + 1} of ${ROUNDS.length}`),
        instruction('✋ Drag each shape to a group. Or tap a shape, then a group.'), bank, zones, result);
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — name the shape of everyday things
     ------------------------------------------------------------ */
  function renderPractise(box, done) {
    const sets = [shuffle(['sphere', 'cube', 'cylinder', 'cone']), shuffle(['cuboid', 'pyramid', 'sphere', 'cylinder'])];
    let round = 0;
    newRound();
    function newRound() {
      box.innerHTML = '';
      const names = sets[round];
      const spare = NAMES.find(n => !names.includes(n));
      say('What shape is each thing? Drag the name on.');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const { cards, bank } = dragMatch({
        items: names.map(n => ({ face: el('span', { class: 'big-object big-object--small' }, pick(info(n).objects)), value: info(n).label, label: 'Everyday object' })),
        tiles: [...names.map(n => info(n).label), info(spare).label],
        hint: 'Almost! Is it round all over, a box shape, or a tube?',
        onComplete: sp => {
          MA.launchConfetti(25);
          say(sp ? `${pick(PRAISE)} We did not need ${sp.dataset.value}.` : pick(PRAISE));
          nextOrDone(result, round === sets.length - 1, 'Next round ▶', () => { round += 1; newRound(); }, done, '🧩 Shape spotter!');
        }
      });
      box.append(el('p', { class: 'round-label' }, `Round ${round + 1} of ${sets.length}`),
        instruction('✋ Drag each name onto its object. Or tap a name, then a box.'), cards, bank, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const pic = n => draw(n, 110).outerHTML;
    const statements = [
      () => ({ text: `${pic('cube')}<small>A cube has 6 flat faces.</small>`, truth: true, explain: 'True! Like a dice: 6 square faces.' }),
      () => ({ text: `${pic('sphere')}<small>A sphere has flat faces.</small>`, truth: false, explain: 'A sphere has no flat faces. It is curved all over, so it rolls any way.' }),
      () => ({ text: `${pic('cylinder')}<small>A cylinder has 2 flat faces and 1 curved surface.</small>`, truth: true, explain: 'True! Flat circles at each end, curved around the middle.' }),
      () => ({ text: `${pic('cuboid')}<small>Milo says: “This is a cube.”</small>`, truth: false, explain: 'It is a cuboid. A cube has all square faces. A cuboid has some rectangle faces.', fix: { question: 'What is it really?', options: ['cuboid', 'cylinder', 'pyramid'], answer: 'cuboid' } })
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'Look at each solid. True or false?' : pick(['True or false?', 'Count the faces!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — count flat faces, then shape clues
     ------------------------------------------------------------ */
  function renderFaces(box, done) {
    const counts = shuffle(['cylinder', 'cone', 'cube', 'pyramid']).slice(0, 3);
    const clues = shuffle([
      { clue: 'I have 1 flat face and a point at the top.', answer: 'cone' },
      { clue: 'I have no flat faces. I roll any way.', answer: 'sphere' },
      { clue: 'I have 6 flat faces. They are all squares.', answer: 'cube' },
      { clue: 'I have 2 flat circle faces and I can roll.', answer: 'cylinder' }
    ]).slice(0, 2);
    const total = counts.length + clues.length;
    let round = 0;
    const finish = result => nextOrDone(result, round === total - 1, 'Next ▶', () => { round += 1; next(); }, done, '🚀 Face detective!');
    next();

    function next() {
      box.innerHTML = '';
      if (round < counts.length) countRound(counts[round]); else clueRound(clues[round - counts.length]);
    }

    function countRound(n) {
      let guess = 0;
      let solved = false;
      say(`How many FLAT faces does a ${info(n).label} have? Imagine touching each flat side.`);
      const value = el('span', { class: 'spin__val' }, '0');
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const step = d => { if (!solved) { guess = Math.max(0, Math.min(8, guess + d)); value.textContent = guess; result.innerHTML = ''; } };
      const check = button('✓ Check', 'btn btn--big', () => {
        result.innerHTML = '';
        if (guess === info(n).flat) {
          solved = true;
          check.disabled = true;
          MA.launchConfetti(25);
          say(`Yes! A ${info(n).label} has ${facts(n)}.`);
          result.append(el('p', { class: 'round-result__text' }, `🎉 ${guess} flat face${guess === 1 ? '' : 's'}!`));
          finish(result);
        } else {
          say(guess > info(n).flat ? 'Too many! Curved parts are not flat faces.' : 'Look again. Count the bottom too!');
          result.append(el('p', { class: 'round-result__tip' }, '💡 Count the top, bottom and all the sides. Curved parts do not count.'));
        }
      });
      box.append(el('p', { class: 'round-label' }, `Case ${round + 1} of ${total}`),
        el('div', { class: 'frac-stage' }, draw(n, 140)),
        el('div', { class: 'spin spin--face' }, el('p', { class: 'spin__label' }, 'Flat faces'),
          button('▲', 'spin__btn', () => step(1), { 'aria-label': 'More faces' }), value, button('▼', 'spin__btn', () => step(-1), { 'aria-label': 'Fewer faces' })),
        check, result);
    }

    function clueRound(c) {
      let solved = false;
      say('Read the clue. Which solid am I?');
      const grid = el('div', { class: 'shape-cards' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      shuffle(NAMES).forEach((n, i) => {
        const b = button(draw(n, 64), 'shape-card shape-card--small', () => {
          if (solved) return;
          if (n === c.answer) {
            solved = true;
            b.classList.add('is-right');
            MA.launchConfetti(25);
            say(`A ${info(n).label}! ${pick(PRAISE)}`);
            result.append(el('p', { class: 'round-result__text' }, `🕵️ A ${info(n).label}!`));
            finish(result);
          } else {
            b.classList.add('is-wrong');
            b.disabled = true;
            say(`That is a ${info(n).label}. It has ${facts(n)}.`);
          }
        }, { 'aria-label': `Solid option ${i + 1}`, 'data-shape': n });
        grid.append(b);
      });
      box.append(el('p', { class: 'round-label' }, `Case ${round + 1} of ${total}`),
        el('div', { class: 'riddle-card' }, el('span', { 'aria-hidden': 'true' }, '🕵️'), el('p', {}, c.clue)), grid, result);
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  const nameOpts = right => shuffle([right, ...shuffle(NAMES.filter(n => n !== right)).slice(0, 2)]).map(n => ({ value: info(n).label, label: info(n).label }));
  const picture = n => `<div class="frac-stage">${draw(n, 120).outerHTML}</div>`;
  function qName() { const n = pick(NAMES); return { icon: '🧊', question: 'What is this solid called?', instruction: 'Look at its faces.', visual: picture(n), options: nameOpts(n), answer: info(n).label, hint: 'Almost! Is it curved, pointy or box-shaped?', explain: `A ${info(n).label} has ${facts(n)}.` }; }
  function qObject() { const n = pick(['sphere', 'cylinder', 'cuboid', 'cone']); const o = pick(info(n).objects); return { icon: '🔍', question: `${o} is shaped like a…`, instruction: 'Think of its shape.', options: nameOpts(n), answer: info(n).label, hint: 'Almost! Picture holding it.', explain: `${o} is like a ${info(n).label}.` }; }
  function qFaces() { const n = pick(['cube', 'cylinder', 'cone', 'cuboid']); const f = info(n).flat; return { icon: '✋', question: `How many flat faces does a ${info(n).label} have?`, instruction: 'Curved parts do not count.', visual: picture(n), options: optionsFor(f, [f + 1, f - 1, f + 2]), answer: f, hint: 'Almost! Count the top, the bottom and the sides.', explain: `A ${info(n).label} has ${facts(n)}.` }; }
  function qRoll() { const right = pick(['sphere', 'cylinder']); return { icon: '🛝', question: 'Which shape can roll?', instruction: 'Look for a curved surface.', options: shuffle([right, 'cube', 'pyramid']).map(n => ({ value: info(n).label, label: info(n).label })), answer: info(right).label, hint: 'Almost! Only curved surfaces roll.', explain: `A ${info(right).label} has a curved surface, so it rolls.` }; }
  function qStack() { return { icon: '🗼', question: 'Which shape is best for building a tower?', instruction: 'It needs flat faces top and bottom.', options: shuffle(['cube', 'sphere', 'cone']).map(n => ({ value: info(n).label, label: info(n).label })), answer: 'cube', hint: 'Almost! Which has flat faces on top and bottom?', explain: 'A cube stacks well because its faces are flat.' }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qName(), qObject(), qFaces(), qRoll(), qStack()], moduleId: MODULE_ID, badgeId: 'solid-shape-expert', title: '3D Shape Expert' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
