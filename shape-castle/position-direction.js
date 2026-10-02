/* ==============================================================
   🧭 Shape Castle → Position & Direction   shape-castle/position-direction.js
   --------------------------------------------------------------
   🌱 Learn      left, right, above, below, between in a picture grid
   🎮 Play       robot route: program arrow moves to reach the crown
   🧩 Practise   quarter, half and whole turns, clockwise and anticlockwise
   🧠 Think      true or false? about turns
   🚀 Challenge  robot with turns: forward, turn left, turn right
   🏆 Master     five mixed questions → Super Navigator badge
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  const K = window.ModuleKit;
  if (!MA || !K) return;
  const { $$, rnd, pick, shuffle, el, button, instruction, say, pulse, wait, nextOrDone, PRAISE } = K;

  const MODULE_ID = 'shape-castle/position-direction';
  const THINGS = ['🌳', '🏠', '🚗', '🐶', '🎈', '⭐', '🍎', '🐱', '🚀', '🌸', '⚽', '🦆'];
  const DIRS = ['up', 'right', 'down', 'left'];             // clockwise order
  const ARROW = { up: '⬆️', right: '➡️', down: '⬇️', left: '⬅️' };
  const DELTA = { up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1] };
  const DEG = { up: 0, right: 90, down: 180, left: 270 };

  const STAGES = [
    { id: 'learn',     icon: '🌱', label: 'Learn',     title: 'Where is it?',        render: renderWhere },
    { id: 'play',      icon: '🎮', label: 'Play',      title: 'Robot route',         render: renderRobot },
    { id: 'practise',  icon: '🧩', label: 'Practise',  title: 'Turn, Milo, turn!',   render: renderTurns },
    { id: 'think',     icon: '🧠', label: 'Think',     title: 'True or false?',      render: renderThink },
    { id: 'challenge', icon: '🚀', label: 'Challenge', title: 'Turning robot',       render: renderTurnRobot },
    { id: 'master',    icon: '🏆', label: 'Master',    title: 'Super Navigator',     render: renderMaster }
  ];

  /* ------------------------------------------------------------
     🌱 LEARN — position words in a 3 × 3 picture grid
     ------------------------------------------------------------ */
  function makeQuestion(type) {
    if (type === 'left') { const r = rnd(0, 2); const c = rnd(1, 2); return { type, ref: [r, c], answer: [r, c - 1] }; }
    if (type === 'right') { const r = rnd(0, 2); const c = rnd(0, 1); return { type, ref: [r, c], answer: [r, c + 1] }; }
    if (type === 'above') { const r = rnd(1, 2); const c = rnd(0, 2); return { type, ref: [r, c], answer: [r - 1, c] }; }
    if (type === 'below') { const r = rnd(0, 1); const c = rnd(0, 2); return { type, ref: [r, c], answer: [r + 1, c] }; }
    const r = rnd(0, 2);
    return { type: 'between', ref: [r, 0], ref2: [r, 2], answer: [r, 1] };
  }
  const WORD = { left: 'to the LEFT of', right: 'to the RIGHT of', above: 'ABOVE', below: 'BELOW', between: 'BETWEEN' };
  const HELP = { left: 'Left is this way ⬅️.', right: 'Right is this way ➡️.', above: 'Above means higher up ⬆️.', below: 'Below means lower down ⬇️.', between: 'Between means in the middle of the two.' };

  function renderWhere(box, done) {
    const types = shuffle(['left', 'right', 'above', 'below', 'between', pick(['left', 'right'])]);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      const items = shuffle(THINGS).slice(0, 9);
      const q = makeQuestion(types[round]);
      const at = ([r, c]) => items[r * 3 + c];
      const question = q.type === 'between'
        ? `What is BETWEEN the ${at(q.ref)} and the ${at(q.ref2)}?`
        : `What is ${WORD[q.type]} the ${at(q.ref)}?`;
      let solved = false;
      say(question);
      const grid = el('div', { class: 'pos-grid', role: 'group', 'aria-label': 'Picture grid' });
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      items.forEach((item, i) => {
        const r = Math.floor(i / 3);
        const c = i % 3;
        const isRef = (r === q.ref[0] && c === q.ref[1]) || (q.ref2 && r === q.ref2[0] && c === q.ref2[1]);
        const b = button(item, `pos-cell${isRef ? ' is-ref' : ''}`, () => {
          if (solved) return;
          if (r === q.answer[0] && c === q.answer[1]) {
            solved = true;
            b.classList.add('is-right');
            MA.launchConfetti(20);
            const sentence = q.type === 'between' ? `The ${item} is between the ${at(q.ref)} and the ${at(q.ref2)}.` : `The ${item} is ${WORD[q.type].toLowerCase()} the ${at(q.ref)}.`;
            say(`${sentence} ${pick(PRAISE)}`);
            result.append(el('p', { class: 'round-result__text' }, `🎉 ${sentence}`));
            nextOrDone(result, round === types.length - 1, 'Next ▶', () => { round += 1; next(); }, done);
          } else {
            pulse(b, 'is-oops');
            say(HELP[q.type]);
          }
        }, { 'aria-label': `${item}, row ${r + 1}, column ${c + 1}`, 'data-rc': `${r}-${c}` });
        grid.append(b);
      });
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${types.length}`),
        el('p', { class: 'pos-question' }, question),
        el('div', { class: 'compass-key', 'aria-hidden': 'true' }, '⬆️ above · ⬇️ below · ⬅️ left · ➡️ right'), grid, result);
    }
  }

  /* ------------------------------------------------------------
     Robot board (used by Play and Challenge)
     ------------------------------------------------------------ */
  function board(level) {
    const grid = el('div', { class: 'robot-grid', role: 'img', 'aria-label': 'Robot grid' });
    const cells = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const wall = level.walls.some(w => w[0] === r && w[1] === c);
        const goal = level.goal[0] === r && level.goal[1] === c;
        const cell = el('span', { class: `robot-cell${wall ? ' is-wall' : ''}${goal ? ' is-goal' : ''}` }, wall ? '🪨' : goal ? '👑' : '');
        cells.push(cell);
        grid.append(cell);
      }
    }
    const bot = el('span', { class: 'robot', 'aria-hidden': 'true' }, el('span', { class: 'robot__face' }, '🤖'), el('span', { class: 'robot__dir' }, '▲'));
    grid.append(bot);
    const place = (pos, dir) => {
      bot.style.setProperty('--r', pos[0]);
      bot.style.setProperty('--c', pos[1]);
      bot.style.setProperty('--deg', `${DEG[dir || 'up']}deg`);
      bot.classList.toggle('show-dir', !!dir);
    };
    const blocked = ([r, c]) => r < 0 || r > 4 || c < 0 || c > 4 || level.walls.some(w => w[0] === r && w[1] === c);
    return { grid, cells, bot, place, blocked };
  }

  /** Program strip + run loop shared by both robot games. */
  function robotGame(box, { level, commands, label, onWin, intro }) {
    const b = board(level);
    let pos = [...level.start];
    let dir = level.dir;
    let running = false;
    const program = [];
    b.place(pos, dir);
    say(intro);
    const strip = el('ol', { class: 'program', 'aria-label': 'Your program' });
    const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
    const drawProgram = () => {
      strip.innerHTML = '';
      if (!program.length) strip.append(el('li', { class: 'program__empty' }, 'Your steps go here'));
      program.forEach((cmd, i) => strip.append(el('li', { class: 'program__step', 'data-i': i }, commands[cmd].icon)));
    };
    const pad = el('div', { class: 'robot-pad', role: 'group', 'aria-label': 'Commands' });
    Object.entries(commands).forEach(([key, cmd]) => {
      pad.append(button(cmd.icon, 'robot-key', () => {
        if (running) return;
        if (program.length >= 14) { say('That is a long program! Try Go.'); return; }
        program.push(key);
        result.innerHTML = '';
        drawProgram();
      }, { 'aria-label': cmd.label, 'data-cmd': key }));
    });
    const tools = el('div', { class: 'stage-actions' },
      button('↩ Undo', 'btn btn--ghost', () => { if (!running) { program.pop(); drawProgram(); } }),
      button('🧹 Clear', 'btn btn--ghost', () => { if (!running) { program.length = 0; drawProgram(); } }),
      button('▶ Go!', 'btn btn--sun', run));

    async function run() {
      if (running || !program.length) { if (!program.length) say('Add some steps first!'); return; }
      running = true;
      result.innerHTML = '';
      pos = [...level.start];
      dir = level.dir;
      b.place(pos, dir);
      await wait(250);
      for (let i = 0; i < program.length; i++) {
        $$('.program__step', strip).forEach(s => s.classList.toggle('is-running', Number(s.dataset.i) === i));
        const step = commands[program[i]].apply(pos, dir);
        if (step.dir) dir = step.dir;
        if (step.pos) {
          if (b.blocked(step.pos)) {
            pulse(b.bot, 'is-bump');
            say('Bump! The robot hit something. Fix your program and try again.');
            result.append(el('p', { class: 'round-result__tip' }, `💥 Step ${i + 1} bumped into ${step.pos[0] < 0 || step.pos[0] > 4 || step.pos[1] < 0 || step.pos[1] > 4 ? 'the edge' : 'a rock'}.`));
            running = false;
            return;
          }
          pos = step.pos;
        }
        b.place(pos, level.dir ? dir : null);
        await wait(380);
      }
      $$('.program__step', strip).forEach(s => s.classList.remove('is-running'));
      running = false;
      if (pos[0] === level.goal[0] && pos[1] === level.goal[1]) {
        $$('button', pad).forEach(x => { x.disabled = true; });
        $$('button', tools).forEach(x => { x.disabled = true; });
        MA.launchConfetti(40);
        say(`The robot reached the crown in ${program.length} steps! ${pick(PRAISE)}`);
        onWin(result, program.length);
      } else {
        say('Not at the crown yet. Add more steps or change them!');
        result.append(el('p', { class: 'round-result__tip' }, '💡 Count the squares to the crown.'));
      }
    }
    drawProgram();
    box.append(el('p', { class: 'round-label' }, label), b.grid, strip, pad, tools, result);
  }

  /* ------------------------------------------------------------
     🎮 PLAY — arrow moves
     ------------------------------------------------------------ */
  const ARROW_CMDS = Object.fromEntries(DIRS.map(d => [d, {
    icon: ARROW[d], label: `Move ${d}`,
    apply: pos => ({ pos: [pos[0] + DELTA[d][0], pos[1] + DELTA[d][1]] })
  }]));

  function renderRobot(box, done) {
    const levels = [
      { start: [4, 0], goal: [4, 4], walls: [] },
      { start: [4, 0], goal: [0, 4], walls: [[2, 0], [2, 1], [2, 2], [2, 3]] },
      { start: [0, 0], goal: [4, 2], walls: [[1, 1], [2, 1], [3, 1], [0, 3], [1, 3], [2, 3]] }
    ];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      box.append(instruction('👆 Tap arrows to build a program. Then press Go!'));
      robotGame(box, {
        level: levels[round], commands: ARROW_CMDS, label: `Level ${round + 1} of ${levels.length}`,
        intro: round === 0 ? 'Help the robot reach the crown 👑! Tap arrows to plan the route, then press Go.' : 'Watch out for rocks!',
        onWin: result => nextOrDone(result, round === levels.length - 1, 'Next level ▶', () => { round += 1; next(); }, done, '🤖 Robot programmer!')
      });
    }
  }

  /* ------------------------------------------------------------
     🧩 PRACTISE — turns
     ------------------------------------------------------------ */
  const TURNS = {
    'quarter turn clockwise': 1, 'quarter turn anticlockwise': -1, 'half turn': 2, 'whole turn': 4, 'three-quarter turn clockwise': 3
  };
  const turnTo = (dir, steps) => DIRS[(DIRS.indexOf(dir) + steps + 8) % 4];

  function renderTurns(box, done) {
    const plan = shuffle(['quarter turn clockwise', 'quarter turn anticlockwise', 'half turn', 'quarter turn clockwise', 'whole turn', 'quarter turn anticlockwise']);
    let round = 0;
    let facing = pick(DIRS);
    next();
    function next() {
      box.innerHTML = '';
      const turn = plan[round];
      const answer = turnTo(facing, TURNS[turn]);
      let solved = false;
      say(`Milo faces ${facing}. He makes a ${turn}. Which way does he face now?`);
      const dial = el('div', { class: 'dial', role: 'img', 'aria-label': `Milo facing ${facing}` },
        el('span', { class: 'dial__n' }, '⬆️'), el('span', { class: 'dial__e' }, '➡️'), el('span', { class: 'dial__s' }, '⬇️'), el('span', { class: 'dial__w' }, '⬅️'),
        el('span', { class: 'dial__pointer', style: `--deg:${DEG[facing]}deg` }, el('span', { class: 'dial__milo' }, '🦊')));
      const result = el('div', { class: 'round-result', 'aria-live': 'polite' });
      const group = el('div', { class: 'sign-pad', role: 'group', 'aria-label': 'Which way now?' });
      DIRS.forEach(d => {
        const b = button(ARROW[d], 'sign-btn sign-btn--arrow', () => {
          if (solved) return;
          if (d === answer) {
            solved = true;
            b.classList.add('is-right');
            const pointer = dial.querySelector('.dial__pointer');
            pointer.style.setProperty('--deg', `${DEG[facing] + TURNS[turn] * 90}deg`);
            MA.launchConfetti(20);
            say(`Yes! Now he faces ${answer}. ${pick(PRAISE)}`);
            facing = answer;
            result.append(el('p', { class: 'round-result__text' }, `🧭 Now facing ${ARROW[answer]} ${answer}`));
            nextOrDone(result, round === plan.length - 1, 'Next turn ▶', () => { round += 1; next(); }, done);
          } else {
            b.classList.add('is-wrong');
            b.disabled = true;
            say(turn.includes('anticlockwise') ? 'Anticlockwise turns the opposite way to clock hands ↺.' : turn.includes('clockwise') ? 'Clockwise turns the same way as clock hands ↻.' : turn === 'half turn' ? 'A half turn makes you face the opposite way.' : 'A whole turn goes all the way round, back to the start!');
          }
        }, { 'aria-label': `Facing ${d}` });
        group.append(b);
      });
      box.append(el('p', { class: 'round-label' }, `Turn ${round + 1} of ${plan.length}`),
        el('p', { class: 'pos-question' }, `${turn.includes('anticlockwise') ? '↺' : '↻'} ${turn}`),
        dial, instruction('👆 Which way is Milo facing now?'), group, result);
    }
  }

  /* ------------------------------------------------------------
     🧠 THINK
     ------------------------------------------------------------ */
  function renderThink(box, done) {
    const statements = [
      () => ({ text: '↻ + ↻ = half turn<small>Two quarter turns make a half turn.</small>', truth: true, explain: 'True! 2 quarter turns = 1 half turn.' }),
      () => ({ text: '🔄<small>After a whole turn you face the opposite way.</small>', truth: false, explain: 'A whole turn brings you all the way round. You face the SAME way as before.', fix: { question: 'After a whole turn you face…', options: ['the same way', 'the opposite way', 'to the left'], answer: 'the same way' } }),
      () => ({ text: '🕒 ↻<small>Clockwise means turning the same way as clock hands.</small>', truth: true, explain: 'True! Clock hands turn clockwise.' }),
      () => ({ text: '⬆️ + quarter turn clockwise = ⬅️', truth: false, explain: 'A quarter turn clockwise from up faces RIGHT ➡️.', fix: { question: 'Which way should it be?', options: ['➡️', '⬇️', '⬅️'], answer: '➡️' } })
    ];
    const order = shuffle(statements);
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      say(round === 0 ? 'Turn your body to check! True or false?' : pick(['True or false?', 'Try it with your body!']));
      box.append(el('p', { class: 'round-label' }, `Question ${round + 1} of ${order.length}`), instruction('👆 Tap True or False.'));
      K.trueFalse(box, order[round](), result => nextOrDone(result, round === order.length - 1, 'Next ▶', () => { round += 1; next(); }, done));
    }
  }

  /* ------------------------------------------------------------
     🚀 CHALLENGE — robot with turns
     ------------------------------------------------------------ */
  const TURN_CMDS = {
    forward: { icon: '⬆️', label: 'Move forward', apply: (pos, dir) => ({ pos: [pos[0] + DELTA[dir][0], pos[1] + DELTA[dir][1]] }) },
    left: { icon: '↺', label: 'Quarter turn anticlockwise', apply: (pos, dir) => ({ dir: turnTo(dir, -1) }) },
    right: { icon: '↻', label: 'Quarter turn clockwise', apply: (pos, dir) => ({ dir: turnTo(dir, 1) }) }
  };

  function renderTurnRobot(box, done) {
    const levels = [
      { start: [4, 0], dir: 'up', goal: [2, 2], walls: [[1, 0], [0, 0]] },
      { start: [0, 0], dir: 'right', goal: [4, 4], walls: [[0, 2], [1, 2], [2, 2]] }
    ];
    let round = 0;
    next();
    function next() {
      box.innerHTML = '';
      box.append(instruction('👆 ⬆️ moves forward the way the robot faces. ↻ and ↺ turn it.'));
      robotGame(box, {
        level: levels[round], commands: TURN_CMDS, label: `Level ${round + 1} of ${levels.length}`,
        intro: 'This robot can only go FORWARD. Turn it with ↻ (clockwise) and ↺ (anticlockwise).',
        onWin: result => nextOrDone(result, round === levels.length - 1, 'Next level ▶', () => { round += 1; next(); }, done, '🚀 Expert programmer!')
      });
    }
  }

  /* ------------------------------------------------------------
     🏆 MASTER
     ------------------------------------------------------------ */
  const miniGrid = items => `<div class="pos-grid pos-grid--mini" aria-hidden="true">${items.map(i => `<span class="pos-cell">${i}</span>`).join('')}</div>`;
  const arrowOpts = right => shuffle(DIRS).slice(0, 4).filter((d, i, a) => a.indexOf(d) === i).map(d => ({ value: d, label: ARROW[d] }));
  function qLeft() { const items = shuffle(THINGS).slice(0, 9); const q = makeQuestion(pick(['left', 'right'])); const at = ([r, c]) => items[r * 3 + c]; const opts = shuffle([at(q.answer), ...shuffle(items.filter(x => x !== at(q.answer) && x !== at(q.ref))).slice(0, 2)]); return { icon: '👀', question: `What is ${WORD[q.type]} the ${at(q.ref)}?`, instruction: 'Look at the grid.', visual: miniGrid(items), options: opts.map(v => ({ value: v, label: v })), answer: at(q.answer), hint: HELP[q.type], explain: `The ${at(q.answer)} is ${WORD[q.type].toLowerCase()} the ${at(q.ref)}.` }; }
  function qQuarter() { const f = pick(DIRS); const a = turnTo(f, 1); return { icon: '↻', question: `Facing ${ARROW[f]}, make a quarter turn clockwise. Which way now?`, instruction: 'Clockwise: like clock hands.', options: arrowOpts(), answer: a, hint: 'Almost! Turn your body a quarter, like a clock hand.', explain: `${ARROW[f]} ↻ → ${ARROW[a]}` }; }
  function qHalf() { const f = pick(DIRS); const a = turnTo(f, 2); return { icon: '🔄', question: `Facing ${ARROW[f]}, make a half turn. Which way now?`, instruction: 'Half way round.', options: arrowOpts(), answer: a, hint: 'Almost! A half turn faces the opposite way.', explain: `${ARROW[f]} half turn → ${ARROW[a]}` }; }
  function qAnti() { const f = pick(DIRS); const a = turnTo(f, -1); return { icon: '↺', question: `Facing ${ARROW[f]}, make a quarter turn anticlockwise. Which way now?`, instruction: 'Anticlockwise: the other way.', options: arrowOpts(), answer: a, hint: 'Almost! Anticlockwise goes against the clock hands.', explain: `${ARROW[f]} ↺ → ${ARROW[a]}` }; }
  function qWhole() { return { icon: '🌀', question: 'How many quarter turns make a whole turn?', instruction: 'Go all the way round.', options: K.optionsFor(4, [2, 1, 3]), answer: 4, hint: 'Almost! Up, right, down, left… and back.', explain: '4 quarter turns = 1 whole turn.' }; }

  function renderMaster(box, done) {
    K.runMaster(box, done, { makeQuestions: () => [qLeft(), qQuarter(), qHalf(), qAnti(), qWhole()], moduleId: MODULE_ID, badgeId: 'super-navigator', title: 'Super Navigator' });
  }

  K.startModule({ moduleId: MODULE_ID, stages: STAGES });
})();
