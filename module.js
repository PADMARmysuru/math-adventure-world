/* ==============================================================
   🧰 Math Adventure World — module.js  (shared module toolkit)
   --------------------------------------------------------------
   Every learning module page loads, in this order:
     ../script.js   rewards, saving, Milo, challenge engine
     ../module.js   this file: helpers, step bar, drag-and-drop
     its own .js    only the activities for that topic

   A module only needs to describe its six steps:

     ModuleKit.startModule({
       moduleId: 'number-island/place-value',
       stages: [
         { id: 'learn', icon: '🌱', label: 'Learn', title: '…', render: (box, done) => { … } },
         …
       ]
     });

   Each render(box, done) draws its activity into `box` and calls
   done() when the child has finished that step.
   ============================================================== */
'use strict';

(function () {
  const MA = window.MathAdventure;
  if (!MA) return;

  /* ------------------------------------------------------------
     Small helpers
     ------------------------------------------------------------ */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const shuffle = list => {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(resolve => setTimeout(resolve, reducedMotion() ? Math.min(ms, 120) : ms));
  const say = text => MA.miloSay(text, 'module');
  const PRAISE = ['Great thinking!', 'Yes!', 'Spot on!', 'Fantastic!', 'Super explorer!'];

  /** Tiny element builder: el('button', { class: 'x', onclick: fn }, 'text', child) */
  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return;
      if (key === 'class') node.className = value;
      else if (key === 'html') node.innerHTML = value;
      else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? '' : value);
    });
    children.flat().forEach(child => {
      if (child === undefined || child === null || child === false) return;
      node.append(child.nodeType ? child : document.createTextNode(String(child)));
    });
    return node;
  }

  const button = (label, cls, onclick, extra = {}) => el('button', { type: 'button', class: cls, onclick, ...extra }, label);
  const instruction = text => el('p', { class: 'stage-instruction' }, text);
  const pulse = (node, cls) => { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };

  /** Three answer options (answer + 2 different, 0–100), shuffled, for MA.renderChallenge. */
  function optionsFor(answer, candidates) {
    const values = [answer];
    candidates.forEach(c => {
      if (values.length < 3 && c >= 0 && c <= 100 && !values.includes(c)) values.push(c);
    });
    return shuffle(values).map(v => ({ value: v, label: String(v) }));
  }

  /** Number track HTML; '?' marks the gap. */
  const track = items => `<ol class="track" aria-label="Number track">${items
    .map(v => (v === '?' ? '<li class="is-gap" aria-label="missing number">?</li>' : `<li>${v}</li>`)).join('')}</ol>`;

  /* ------------------------------------------------------------
     Drag and drop that works with mouse, touch, tap-tap and keyboard.
     Drop targets are any element with class "slot".
     ------------------------------------------------------------ */
  function makeDraggable(tile, { onDrop, onTap }) {
    let suppressClick = false;

    tile.addEventListener('pointerdown', event => {
      if (tile.disabled || event.button > 0) return;
      const startX = event.clientX;
      const startY = event.clientY;
      const rect = tile.getBoundingClientRect();
      const offsetX = startX - rect.left;
      const offsetY = startY - rect.top;
      let ghost = null;
      let overSlot = null;
      tile.setPointerCapture(event.pointerId);

      const move = ev => {
        if (!ghost && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 8) {
          ghost = tile.cloneNode(true);
          ghost.classList.add('tile--ghost');
          ghost.classList.remove('is-selected');
          ghost.style.width = `${rect.width}px`;
          ghost.style.height = `${rect.height}px`;
          document.body.append(ghost);
          tile.classList.add('is-lifted');
        }
        if (!ghost) return;
        ghost.style.left = `${ev.clientX - offsetX}px`;
        ghost.style.top = `${ev.clientY - offsetY}px`;
        const under = document.elementFromPoint(ev.clientX, ev.clientY);
        const slot = under && under.closest('.slot');
        if (slot !== overSlot) {
          if (overSlot) overSlot.classList.remove('is-over');
          if (slot && !slot.disabled) slot.classList.add('is-over');
          overSlot = slot;
        }
      };

      const end = ev => {
        tile.removeEventListener('pointermove', move);
        tile.removeEventListener('pointerup', end);
        tile.removeEventListener('pointercancel', end);
        if (overSlot) overSlot.classList.remove('is-over');
        tile.classList.remove('is-lifted');
        if (ghost) {
          ghost.remove();
          suppressClick = true;
          setTimeout(() => { suppressClick = false; }, 0);
          if (ev.type === 'pointerup') {
            const under = document.elementFromPoint(ev.clientX, ev.clientY);
            onDrop(under && under.closest('.slot'));
          }
        }
      };

      tile.addEventListener('pointermove', move);
      tile.addEventListener('pointerup', end);
      tile.addEventListener('pointercancel', end);
    });

    // A tap (or Enter/Space) selects the tile instead
    tile.addEventListener('click', () => {
      if (suppressClick) { suppressClick = false; return; }
      onTap();
    });
  }

  /* ------------------------------------------------------------
     Module page shell: step bar + stage card
     Needs #stepper and #stage-panel in the page.
     ------------------------------------------------------------ */
  function startModule({ moduleId, stages, stageStars = 2, backUrl = '../index.html#adventure' }) {
    let current = 0;

    function renderStepper() {
      const list = $('#stepper');
      list.innerHTML = '';
      stages.forEach((stage, i) => {
        const done = MA.isStageDone(moduleId, stage.id);
        const step = button([
          el('span', { class: 'step__icon', 'aria-hidden': 'true' }, done ? '✓' : stage.icon),
          el('span', { class: 'step__label' }, stage.label)
        ], `step${i === current ? ' is-current' : ''}${done ? ' is-done' : ''}`, () => goTo(i), {
          'aria-current': i === current ? 'step' : null,
          'aria-label': `${stage.label}${done ? ', done' : ''}`
        });
        list.append(el('li', {}, step));
      });
    }

    function goTo(index, { scroll = true } = {}) {
      current = index;
      const stage = stages[index];
      const isLast = index === stages.length - 1;
      renderStepper();

      const panel = $('#stage-panel');
      panel.innerHTML = '';
      const body = el('div', { class: 'stage-body' });
      const next = button(
        isLast ? '🗺️ Back to the map' : `Next: ${stages[index + 1].icon} ${stages[index + 1].label}`,
        'btn btn--sun stage-next',
        () => { if (isLast) window.location.href = backUrl; else goTo(index + 1); }
      );
      next.hidden = !MA.isStageDone(moduleId, stage.id);

      panel.append(
        el('header', { class: 'stage-head' },
          el('span', { class: 'stage-head__icon', 'aria-hidden': 'true' }, stage.icon),
          el('div', {},
            el('p', { class: 'stage-head__step' }, `Step ${index + 1} of ${stages.length} · ${stage.label}`),
            el('h2', { class: 'stage-head__title', tabindex: '-1' }, stage.title))),
        body,
        el('footer', { class: 'stage-foot' }, next)
      );

      stage.render(body, () => finishStage(stage, next));

      if (scroll) {
        panel.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
        $('.stage-head__title', panel).focus({ preventScroll: true });
      }
    }

    function finishStage(stage, next) {
      const first = MA.completeStage(moduleId, stage.id);
      if (first && stage.id !== 'master') MA.addStars(stageStars, { message: `${stage.label} complete!` });
      next.hidden = false;
      pulse(next, 'pop-in');
      renderStepper();
    }

    // Open the first step not yet done
    const firstOpen = stages.findIndex(stage => !MA.isStageDone(moduleId, stage.id));
    goTo(firstOpen === -1 ? 0 : firstOpen, { scroll: false });
    return { goTo };
  }

  /** Standard "mastered" finale used by every module's Master step. */
  function masterFinale(box, { moduleId, badgeId, title, firstTry, total, reward = { stars: 5, gems: 1 }, onReplay, backUrl = '../index.html#adventure' }) {
    box.innerHTML = '';
    const first = MA.markModuleMastered(moduleId);
    if (first) {
      MA.addStars(reward.stars, { message: `${title}!` });
      MA.addGems(reward.gems, { silent: true });
      MA.unlockBadge(badgeId);
    } else {
      MA.launchConfetti(60);
    }
    box.append(el('div', { class: 'finale' },
      el('div', { class: 'finale__trophy', 'aria-hidden': 'true' }, '🏆'),
      el('h3', { class: 'finale__title' }, `${title}!`),
      el('p', { class: 'finale__text' }, `${firstTry} of ${total} right on the first try.`),
      el('p', { class: 'finale__reward' }, first
        ? `⭐ +${reward.stars} stars  •  💎 +${reward.gems} gem  •  🏅 New badge!`
        : 'You already mastered this. Great practice!'),
      el('div', { class: 'stage-actions' },
        button('🔁 Play again', 'btn btn--ghost', onReplay),
        el('a', { class: 'btn btn--sun', href: backUrl }, '🗺️ Back to the map'))
    ));
    say(`You are a ${title}! 🏆`);
  }

  /** Master quiz built on MA.renderChallenge. makeQuestions() returns fresh challenge objects. */
  function runMaster(box, done, options) {
    const { makeQuestions, moduleId, badgeId, title } = options;
    const questions = makeQuestions();
    let index = 0;
    let firstTry = 0;
    show();

    function show() {
      box.innerHTML = '';
      const dots = el('ol', { class: 'q-dots', 'aria-label': `Question ${index + 1} of ${questions.length}` });
      questions.forEach((_, k) => dots.append(el('li', {
        class: k < index ? 'is-done' : (k === index ? 'is-now' : '')
      }, k < index ? '✓' : String(k + 1))));

      const area = el('div', { class: 'challenge' });
      const isLast = index === questions.length - 1;
      const next = button(isLast ? '🏆 Finish' : 'Next question ▶', 'btn', () => {
        index += 1;
        if (index < questions.length) show();
        else {
          masterFinale(box, {
            moduleId, badgeId, title, firstTry, total: questions.length,
            onReplay: () => runMaster(box, done, options)
          });
          done();
        }
      }, { hidden: true });

      box.append(dots, area, el('div', { class: 'stage-actions' }, next));
      say(index === 0 ? `${questions.length} questions. Show me what you know!` : pick(['Keep going!', 'You can do it!', 'Nice and steady.']));

      MA.renderChallenge(area, questions[index], {
        onCorrect: ({ feedbackEl, attempts, challenge }) => {
          if (attempts === 1) firstTry += 1;
          feedbackEl.className = 'challenge__feedback is-success';
          feedbackEl.innerHTML = '';
          feedbackEl.append(el('span', {}, `🎉 ${pick(PRAISE)}`), el('small', {}, challenge.explain));
          next.hidden = false;
          say(pick(PRAISE));
        }
      });
    }
  }

  window.ModuleKit = {
    MA, $, $$, rnd, pick, shuffle, wait, reducedMotion, say, PRAISE,
    el, button, instruction, pulse, optionsFor, track,
    makeDraggable, startModule, masterFinale, runMaster
  };
})();
