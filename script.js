/* ==============================================================
   🌈 Math Adventure World — script.js
   Vanilla JavaScript. No libraries, no backend.
   --------------------------------------------------------------
   1.  World data (locations, modules, badges, Milo's lines)
   2.  Small utilities (DOM, random numbers, dates)
   3.  Storage (localStorage)
   4.  Progress API: addStars, addGems, unlockBadge, updateProgress
   5.  Feedback: Milo, toasts, confetti
   6.  Navigation
   7.  Adventure map + location dialog
   8.  Challenge engine (reusable for every future module)
   9.  Daily challenge
   10. Badges + progress panels
   11. Parent / teacher tools
   12. Start-up + public API (window.MathAdventure)
   ============================================================== */
'use strict';

document.documentElement.classList.add('js');

/* ==============================================================
   1. WORLD DATA
   To add a new place or module later, edit this data only —
   the map, dialog and progress panels are all drawn from it.
   ============================================================== */

const STORAGE_KEY = 'maw-progress-v1';
const DAILY_REWARD_STARS = 5;
const PRACTICE_REWARD_STARS = 1;
const DISCOVERY_REWARD_GEMS = 1;

/**
 * Module helpers.
 * status 'soon'  → shows "🔒 Coming Soon"
 * status 'ready' → playable. Future modules add `url`
 *   e.g. ready('Counting', '🔢', { url: 'number-island/counting.html' })
 */
const soon = (title, icon) => ({ title, icon, status: 'soon' });
const ready = (title, icon, extra = {}) => ({ title, icon, status: 'ready', ...extra });

/* x / y are percentages on the desktop map, listed in path order. */
const LOCATIONS = [
  {
    id: 'number-island', name: 'Number Island', emoji: '🏝️', strand: 'Number',
    color: '#FF8A3D', shade: '#D9661C', tint: '#FFF0E3', x: 14, y: 24,
    tip: 'Count, build and compare numbers',
    milo: 'Number Island! Numbers are hiding everywhere here.',
    modules: [
      ready('Counting', '🔢', { id: 'counting', url: 'number-island/counting.html', steps: 6 }), ready('Place Value', '🧱', { id: 'place-value', url: 'number-island/place-value.html', steps: 6 }), ready('Comparing Numbers', '⚖️', { id: 'comparing-numbers', url: 'number-island/comparing-numbers.html', steps: 6 }),
      ready('Addition', '➕', { id: 'addition', url: 'number-island/addition.html', steps: 6 }), ready('Subtraction', '➖', { id: 'subtraction', url: 'number-island/subtraction.html', steps: 6 }), ready('Multiplication', '✖️', { id: 'multiplication', url: 'number-island/multiplication.html', steps: 6 }),
      ready('Division', '➗', { id: 'division', url: 'number-island/division.html', steps: 6 }), ready('Fractions', '🍕', { id: 'fractions', url: 'number-island/fractions.html', steps: 6 }), ready('Number Patterns', '🔁', { id: 'number-patterns', url: 'number-island/number-patterns.html', steps: 6 })
    ]
  },
  {
    id: 'pattern-forest', name: 'Pattern Forest', emoji: '🌳', strand: 'Thinking and Working Mathematically',
    color: '#3BB273', shade: '#25875A', tint: '#E7F7EE', x: 38, y: 14,
    tip: 'Spot patterns and solve puzzles',
    milo: 'Pattern Forest! What comes next? Let\'s find out.',
    modules: [
      ready('Number Patterns', '🔢', { id: 'number-patterns', url: 'number-island/number-patterns.html', steps: 6, progressId: 'number-island/number-patterns' }),
      ready('Shape Patterns', '🔷', { id: 'shape-patterns', url: 'pattern-forest/shape-patterns.html', steps: 6 }),
      ready('Repeating Patterns', '🔁', { id: 'repeating-patterns', url: 'pattern-forest/repeating-patterns.html', steps: 6 }),
      ready('Logic Challenges', '🧩', { id: 'logic-challenges', url: 'pattern-forest/logic-challenges.html', steps: 6 })
    ]
  },
  {
    id: 'shape-castle', name: 'Shape Castle', emoji: '🏰', strand: 'Geometry and Measure',
    color: '#7B61FF', shade: '#5A41DB', tint: '#EFEBFF', x: 64, y: 13,
    tip: 'Explore flat and solid shapes',
    milo: 'Shape Castle! Can you spot circles, squares and cubes?',
    modules: [
      ready('2D Shapes', '🔺', { id: '2d-shapes', url: 'shape-castle/2d-shapes.html', steps: 6 }), ready('3D Shapes', '🧊', { id: '3d-shapes', url: 'shape-castle/3d-shapes.html', steps: 6 }), ready('Shape Properties', '📐', { id: 'shape-properties', url: 'shape-castle/shape-properties.html', steps: 6 }),
      ready('Symmetry', '🦋', { id: 'symmetry', url: 'shape-castle/symmetry.html', steps: 6 }), ready('Position & Direction', '🧭', { id: 'position-direction', url: 'shape-castle/position-direction.html', steps: 6 })
    ]
  },
  {
    id: 'measure-mountain', name: 'Measure Mountain', emoji: '📏', strand: 'Geometry and Measure',
    color: '#2FA9D8', shade: '#1B83AE', tint: '#E4F5FC', x: 86, y: 30,
    tip: 'How long? How heavy? How full?',
    milo: 'Measure Mountain! Which is longer? Which is heavier?',
    modules: [
      soon('Length', '📏'), soon('Mass', '⚖️'), soon('Capacity', '🥛'),
      soon('Temperature', '🌡️'), soon('Time', '⏱️')
    ]
  },
  {
    id: 'money-market', name: 'Money Market', emoji: '💰', strand: 'Geometry and Measure',
    color: '#E8A800', shade: '#B88400', tint: '#FFF7D6', x: 66, y: 48,
    tip: 'Coins, notes and shopping',
    milo: 'Money Market! Let\'s count coins and go shopping.',
    modules: [
      soon('Coins', '🪙'), soon('Notes', '💵'), soon('Counting Money', '🧮'), soon('Shopping Games', '🛒')
    ]
  },
  {
    id: 'time-town', name: 'Time Town', emoji: '⏰', strand: 'Geometry and Measure',
    color: '#FF6B8B', shade: '#D9466A', tint: '#FFEBF0', x: 38, y: 50,
    tip: 'Clocks, days and months',
    milo: 'Time Town! Tick tock. What time is it?',
    modules: [
      soon('Clock', '🕒'), soon('Calendar', '📅'), soon('Days', '🌞'),
      soon('Months', '🗓️'), soon('Time Problems', '⏳')
    ]
  },
  {
    id: 'data-park', name: 'Data Park', emoji: '📊', strand: 'Statistics and Probability',
    color: '#22B5A6', shade: '#13877B', tint: '#E2F7F4', x: 18, y: 76,
    tip: 'Sort, count and make charts',
    milo: 'Data Park! Let\'s sort things and make charts.',
    modules: [
      soon('Tally Charts', '✏️'), soon('Pictograms', '🖼️'), soon('Block Graphs', '📊'),
      soon('Sorting', '🗂️'), soon('Data Questions', '❓')
    ]
  },
  {
    id: 'challenge-arena', name: 'Challenge Arena', emoji: '🎯', strand: 'All strands',
    color: '#E04F4F', shade: '#B23434', tint: '#FFE9E9', x: 76, y: 80,
    tip: 'Today\'s challenge is here!',
    milo: 'Challenge Arena! Today\'s challenge is waiting for you.',
    modules: [
      ready('Daily Challenge', '🎯', { action: 'daily' }),
      soon('Mixed Challenges', '🎲'), soon('Timed Games', '⏱️'),
      soon('Puzzle Challenges', '🧩'), soon('Boss Challenges', '🐉')
    ]
  }
];

const BADGES = [
  { id: 'first-steps',     icon: '🥾', name: 'First Steps',     how: 'Start your adventure' },
  { id: 'first-discovery', icon: '🧭', name: 'Discoverer',      how: 'Visit your first place' },
  { id: 'challenge-champ', icon: '🎯', name: 'Challenge Champ', how: 'Solve a daily challenge' },
  { id: 'gem-finder',      icon: '💎', name: 'Gem Finder',      how: 'Collect 5 gems' },
  { id: 'star-collector',  icon: '⭐', name: 'Star Collector',  how: 'Collect 25 stars' },
  { id: 'world-explorer',  icon: '🗺️', name: 'World Explorer',  how: 'Visit every place on the map' },
  { id: 'counting-master', icon: '🔢', name: 'Counting Master', how: 'Master Counting on Number Island' },
  { id: 'place-value-pro', icon: '🧱', name: 'Place Value Pro', how: 'Master Place Value on Number Island' },
  { id: 'comparing-champ', icon: '⚖️', name: 'Comparing Champ', how: 'Master Comparing Numbers on Number Island' },
  { id: 'addition-ace',    icon: '➕', name: 'Addition Ace',    how: 'Master Addition on Number Island' },
  { id: 'subtraction-star', icon: '➖', name: 'Subtraction Star', how: 'Master Subtraction on Number Island' },
  { id: 'multiplication-master', icon: '✖️', name: 'Multiplication Master', how: 'Master Multiplication on Number Island' },
  { id: 'division-detective', icon: '➗', name: 'Division Detective', how: 'Master Division on Number Island' },
  { id: 'fraction-hero',   icon: '🍕', name: 'Fraction Hero',   how: 'Master Fractions on Number Island' },
  { id: 'pattern-pro',     icon: '🔁', name: 'Pattern Pro',     how: 'Master Number Patterns on Number Island' },
  { id: 'number-island-hero', icon: '🏝️', name: 'Number Island Hero', how: 'Master every module on Number Island' },
  { id: 'shape-spotter',   icon: '🔺', name: 'Shape Spotter',   how: 'Master 2D Shapes in Shape Castle' },
  { id: 'solid-shape-expert', icon: '🧊', name: '3D Shape Expert', how: 'Master 3D Shapes in Shape Castle' },
  { id: 'property-pro',    icon: '📐', name: 'Property Pro',    how: 'Master Shape Properties in Shape Castle' },
  { id: 'symmetry-star',   icon: '🦋', name: 'Symmetry Star',   how: 'Master Symmetry in Shape Castle' },
  { id: 'super-navigator', icon: '🧭', name: 'Super Navigator', how: 'Master Position & Direction in Shape Castle' },
  { id: 'shape-castle-hero', icon: '🏰', name: 'Shape Castle Hero', how: 'Master every module in Shape Castle' },
  { id: 'rhythm-ranger',   icon: '🔁', name: 'Rhythm Ranger',   how: 'Master Repeating Patterns in Pattern Forest' },
  { id: 'shape-pattern-pro', icon: '🔷', name: 'Shape Pattern Pro', how: 'Master Shape Patterns in Pattern Forest' },
  { id: 'logic-legend',    icon: '🧩', name: 'Logic Legend',    how: 'Master Logic Challenges in Pattern Forest' },
  { id: 'pattern-forest-hero', icon: '🌳', name: 'Pattern Forest Hero', how: 'Master every module in Pattern Forest' }
];

const MILO_LINES = {
  greet: [
    "Hi! I'm Milo. Let's explore numbers!",
    'Ready for an adventure?',
    'Maths is everywhere. Let\'s find it!',
    'Tap START ADVENTURE to begin!'
  ],
  correct: ['Great thinking!', 'Fantastic!', 'You did it!', 'Super explorer!'],
  retry: ["You're getting closer!", "Let's try another way.", 'Good try! Look again.'],
  mapIdle: 'Where shall we go first? Tap a place!'
};

/* ==============================================================
   2. UTILITIES
   ============================================================== */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const prefersReducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Small seeded random generator, so everyone gets the same daily challenge. */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const randInt = (rand, min, max) => min + Math.floor(rand() * (max - min + 1));
const pick = (list, rand = Math.random) => list[Math.floor(rand() * list.length)];

function shuffle(list, rand = Math.random) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Local date as YYYY-MM-DD. */
function todayKey(date = new Date()) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

/** Whole days since 1970 for the local date (used to rotate challenge types). */
function dayNumber(date = new Date()) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

/* ==============================================================
   3. STORAGE
   Everything lives in one localStorage key. Later this object can
   be synced to a backend without changing the rest of the code.
   ============================================================== */

function createDefaultState() {
  return {
    version: 1,
    stars: 0,
    gems: 0,
    badges: [],
    visited: [],
    daily: { date: null, solved: false },
    solvedCount: 0,
    modules: {}   // e.g. { 'number-island/counting': { stages: ['learn'], mastered: false } }
  };
}

function loadState() {
  const fresh = createDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const saved = JSON.parse(raw);
    return {
      ...fresh,
      stars: Math.max(0, Number(saved.stars) || 0),
      gems: Math.max(0, Number(saved.gems) || 0),
      badges: Array.isArray(saved.badges) ? saved.badges.filter(id => BADGES.some(b => b.id === id)) : [],
      visited: Array.isArray(saved.visited) ? saved.visited.filter(id => LOCATIONS.some(l => l.id === id)) : [],
      daily: { ...fresh.daily, ...(saved.daily || {}) },
      solvedCount: Math.max(0, Number(saved.solvedCount) || 0),
      modules: cleanModules(saved.modules)
    };
  } catch (error) {
    return fresh; // storage blocked or corrupted: start fresh
  }
}

/** Keep only well-formed module progress from storage. */
function cleanModules(raw) {
  const clean = {};
  if (!raw || typeof raw !== 'object') return clean;
  Object.keys(raw).forEach(key => {
    const entry = raw[key] || {};
    clean[key] = {
      stages: Array.isArray(entry.stages) ? entry.stages.filter(x => typeof x === 'string') : [],
      mastered: entry.mastered === true
    };
  });
  return clean;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    /* Private mode or storage full: the game still works for this visit. */
  }
}

let state = loadState();

/* ==============================================================
   4. PROGRESS API
   ============================================================== */

const hasBadge = id => state.badges.includes(id);
const isDailySolvedToday = () => state.daily.solved && state.daily.date === todayKey();

/** Add stars. Options: { silent: true } skips the toast, { message } adds a reason. */
function addStars(amount = 1, { silent = false, message = '' } = {}) {
  const n = Math.max(0, Math.round(amount));
  if (!n) return state.stars;
  state.stars += n;
  saveState();
  if (!silent) showToast(`+${n} ${n === 1 ? 'star' : 'stars'}${message ? ` — ${message}` : ''}`, '⭐');
  checkMilestones();
  updateProgress();
  return state.stars;
}

/** Add gems. Same options as addStars. */
function addGems(amount = 1, { silent = false, message = '' } = {}) {
  const n = Math.max(0, Math.round(amount));
  if (!n) return state.gems;
  state.gems += n;
  saveState();
  if (!silent) showToast(`+${n} ${n === 1 ? 'gem' : 'gems'}${message ? ` — ${message}` : ''}`, '💎');
  checkMilestones();
  updateProgress();
  return state.gems;
}

/** Unlock a badge once. Returns true only the first time. */
function unlockBadge(id, { silent = false } = {}) {
  const badge = BADGES.find(b => b.id === id);
  if (!badge || hasBadge(id)) return false;
  state.badges.push(id);
  saveState();
  if (!silent) {
    showToast(`New badge: ${badge.name}!`, badge.icon);
    launchConfetti(70);
  }
  updateProgress();
  return true;
}

/* ---------- Module progress (used by every learning module) ---------- */

/** Progress for one module, e.g. getModuleProgress('number-island/counting'). */
function getModuleProgress(moduleId) {
  const entry = state.modules[moduleId];
  return entry ? { stages: [...entry.stages], mastered: entry.mastered } : { stages: [], mastered: false };
}

function ensureModule(moduleId) {
  if (!state.modules[moduleId]) state.modules[moduleId] = { stages: [], mastered: false };
  return state.modules[moduleId];
}

/** Mark a step (learn, play, practise, think, challenge, master) done. True the first time. */
function completeStage(moduleId, stageId) {
  const entry = ensureModule(moduleId);
  if (entry.stages.includes(stageId)) return false;
  entry.stages.push(stageId);
  saveState();
  updateProgress();
  return true;
}

const isStageDone = (moduleId, stageId) => getModuleProgress(moduleId).stages.includes(stageId);

/** Mark a whole module mastered. True the first time. */
function markModuleMastered(moduleId) {
  const entry = ensureModule(moduleId);
  if (entry.mastered) return false;
  entry.mastered = true;
  saveState();
  checkMilestones();
  updateProgress();
  return true;
}

/** Badges earned by reaching totals. */
function checkMilestones() {
  if (state.stars >= 25) unlockBadge('star-collector');
  if (state.gems >= 5) unlockBadge('gem-finder');
  if (LOCATIONS.every(loc => state.visited.includes(loc.id))) unlockBadge('world-explorer');
  // Place heroes: when every module in a place is built and mastered, award "<place-id>-hero"
  LOCATIONS.forEach(loc => {
    const built = loc.modules.filter(m => m.url);
    if (built.length && built.length === loc.modules.length && built.every(m => getModuleProgress(m.progressId || `${loc.id}/${m.id}`).mastered)) {
      unlockBadge(`${loc.id}-hero`);
    }
  });
}

/** Redraw every place that shows progress. Safe to call any time. */
function updateProgress() {
  setCount('stars', state.stars);
  setCount('gems', state.gems);
  setCount('badges', state.badges.length);
  renderBadges();
  renderProgressPanel();
  refreshMapSpots();
  updateDailyStatus();
}

/** Update a counter and give its header pill a little bump. */
function setCount(key, value) {
  $$(`[data-count="${key}"]`).forEach(el => {
    if (el.textContent === String(value)) return;
    el.textContent = value;
    const pill = el.closest('.stat');
    if (pill) {
      pill.classList.remove('bump');
      void pill.offsetWidth; // restart the animation
      pill.classList.add('bump');
    }
  });
}

/* ==============================================================
   5. FEEDBACK: MILO, TOASTS, CONFETTI
   ============================================================== */

/** Make Milo say something in one of his speech bubbles: hero, map or challenge. */
function miloSay(text, where = 'hero') {
  const bubble = $(`[data-milo-bubble="${where}"]`);
  if (!bubble) return;
  bubble.textContent = text;
  bubble.classList.remove('pop');
  void bubble.offsetWidth;
  bubble.classList.add('pop');
}

/** Run something after the open dialog closes (toasts can't show above a modal). */
function whenNoDialog(callback) {
  const open = $('dialog[open]');
  if (open) open.addEventListener('close', callback, { once: true });
  else callback();
}

function showToast(message, icon = '✨') {
  whenNoDialog(() => {
    const region = $('#toast-region');
    if (!region) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    const iconEl = document.createElement('span');
    iconEl.className = 'toast__icon';
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.textContent = icon;
    const text = document.createElement('span');
    text.textContent = message;
    toast.append(iconEl, text);
    region.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('is-leaving');
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  });
}

function launchConfetti(amount = 70) {
  if (prefersReducedMotion()) return;
  whenNoDialog(() => {
    const layer = $('#confetti-layer');
    if (!layer) return;
    const colours = ['#FF6B6B', '#FFC93C', '#5B4BDB', '#22B5A6', '#4D96FF', '#FF8A3D', '#3BB273'];
    for (let i = 0; i < amount; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti';
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = pick(colours);
      piece.style.setProperty('--drift', `${Math.random() * 200 - 100}px`);
      piece.style.setProperty('--spin', `${Math.random() * 720 - 360}deg`);
      piece.style.animationDuration = `${2 + Math.random() * 1.5}s`;
      piece.style.animationDelay = `${Math.random() * 0.4}s`;
      layer.appendChild(piece);
      setTimeout(() => piece.remove(), 4200);
    }
  });
}

/* ==============================================================
   6. NAVIGATION
   ============================================================== */

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (!section) return;
  section.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  const heading = $('h1, h2', section);
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

function setActiveNav(key) {
  $$('.nav-link').forEach(link => {
    if (link.dataset.nav === key) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

function initNavigation() {
  // Any element with data-scroll-to="sectionId", plus in-page links
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-scroll-to], a[href^="#"]:not(.skip-link)');
    if (!trigger) return;
    const id = trigger.dataset.scrollTo || trigger.getAttribute('href').slice(1);
    if (!id || !document.getElementById(id)) return;
    event.preventDefault();
    scrollToSection(id);
  });

  // Highlight the nav item for the section on screen
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActiveNav(entry.target.dataset.navSection);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-nav-section]').forEach(section => observer.observe(section));
}

function initHero() {
  const start = $('#start-adventure');
  if (start) {
    start.addEventListener('click', () => {
      miloSay("Let's go! Start at Number Island and follow the path.", 'map');
      unlockBadge('first-steps');
    });
  }

  // Tapping Milo makes him hop and say something new
  const milo = $('#hero-milo');
  let lineIndex = 0;
  if (milo) {
    milo.addEventListener('click', () => {
      lineIndex = (lineIndex + 1) % MILO_LINES.greet.length;
      miloSay(MILO_LINES.greet[lineIndex], 'hero');
      milo.classList.remove('hop');
      void milo.offsetWidth;
      milo.classList.add('hop');
    });
  }
}

/* ==============================================================
   7. ADVENTURE MAP + LOCATION DIALOG
   ============================================================== */

const getLocation = id => LOCATIONS.find(loc => loc.id === id);
const isLocationOpen = loc => loc.modules.some(m => m.status === 'ready');

/** Build the map spots from LOCATIONS. */
function renderMap() {
  const list = $('#map-spots');
  if (!list) return;
  list.innerHTML = LOCATIONS.map((loc, i) => `
    <li class="map-spot${loc.y < 30 ? ' tip-below' : ''}"
        style="--x:${loc.x}%; --y:${loc.y}%; --i:${i}; --spot-color:${loc.color}; --spot-shade:${loc.shade}; --spot-tint:${loc.tint}">
      <button type="button" class="spot" data-location="${loc.id}">
        <span class="spot__bubble" aria-hidden="true"><span class="spot__emoji">${loc.emoji}</span></span>
        <span class="spot__label">${loc.name}</span>
        <span class="spot__step" aria-hidden="true">${i + 1}</span>
        <span class="spot__status" aria-hidden="true"></span>
        <span class="spot__tip" aria-hidden="true">${loc.tip}</span>
      </button>
    </li>`).join('');
}

/** Update lock / open / visited marks on the map. */
function refreshMapSpots() {
  $$('.spot').forEach((button, i) => {
    const loc = getLocation(button.dataset.location);
    if (!loc) return;
    const open = isLocationOpen(loc);
    const visited = state.visited.includes(loc.id);
    const item = button.closest('.map-spot');
    item.classList.toggle('is-open', open);
    item.classList.toggle('is-visited', visited);
    $('.spot__status', button).textContent = open ? '⭐' : '🔒';
    button.setAttribute('aria-label',
      `Stop ${i + 1}: ${loc.name}. ${loc.tip}. ${open ? 'Open now' : 'Coming soon'}${visited ? '. Visited' : ''}.`);
  });
}

function initMapInteractions() {
  const map = $('#adventure-map');
  const list = $('#map-spots');
  if (!map || !list) return;

  // Draw the path and pop in the places the first time the map is seen
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        map.classList.add('is-visible');
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(map);
  } else {
    map.classList.add('is-visible');
  }

  list.addEventListener('click', event => {
    const spot = event.target.closest('.spot');
    if (spot) openLocation(spot.dataset.location);
  });

  // Milo reacts when a place is hovered or focused
  let lastHovered = null;
  const react = event => {
    const spot = event.target.closest('.spot');
    if (!spot || spot.dataset.location === lastHovered) return;
    lastHovered = spot.dataset.location;
    const loc = getLocation(lastHovered);
    miloSay(`${loc.emoji} ${loc.milo}`, 'map');
  };
  list.addEventListener('mouseover', react);
  list.addEventListener('focusin', react);
  list.addEventListener('mouseleave', () => { lastHovered = null; });
}

/** Visit a place: reward the first visit, then show its dialog. */
function openLocation(id) {
  const loc = getLocation(id);
  if (!loc) return;

  const firstVisit = !state.visited.includes(id);
  const rewards = [];
  if (firstVisit) {
    state.visited.push(id);
    saveState();
  }

  fillLocationDialog(loc);
  openDialog($('#location-dialog'));

  if (firstVisit) {
    addGems(DISCOVERY_REWARD_GEMS, { message: `you discovered ${loc.name}!` });
    rewards.push(`💎 +${DISCOVERY_REWARD_GEMS} gem for discovering a new place!`);
    if (unlockBadge('first-discovery')) rewards.push('🧭 New badge: Discoverer!');
    if (hasBadge('world-explorer') && state.visited.length === LOCATIONS.length) {
      rewards.push('🗺️ New badge: World Explorer!');
    }
  }

  const rewardEl = $('#loc-reward');
  rewardEl.hidden = rewards.length === 0;
  rewardEl.innerHTML = rewards.join('<br>');

  miloSay(`${loc.name} is ready for your next adventure!`, 'map');
  updateProgress();
}

function fillLocationDialog(loc) {
  const dialog = $('#location-dialog');
  const open = isLocationOpen(loc);
  dialog.style.setProperty('--loc-color', loc.color);
  dialog.style.setProperty('--loc-tint', loc.tint);

  $('#loc-emoji').textContent = loc.emoji;
  $('#loc-title').textContent = loc.name;
  $('#loc-strand').textContent = `📚 ${loc.strand}`;
  $('#loc-soon').hidden = open;
  const playable = loc.modules.filter(m => m.status === 'ready' && m.url);
  const daily = loc.modules.find(m => m.action === 'daily');
  let message = `${loc.name} is ready for your next adventure!`;
  if (daily) message = `${loc.name} is open! Today's challenge is waiting for you.`;
  else if (playable.length) message = `${loc.name} has ${playable.length === 1 ? 'an adventure' : `${playable.length} adventures`} ready! Tap a ⭐ to play.`;
  $('#loc-message').textContent = message;

  $('#loc-modules').innerHTML = loc.modules.map(m => {
    const inner = `
      <span class="module-chip__icon" aria-hidden="true">${m.icon}</span>
      <span class="module-chip__title">${m.title}</span>
      <span class="module-chip__state">${moduleStateText(loc, m)}</span>`;
    if (m.status === 'ready' && m.url) {
      return `<li><a class="module-chip is-ready is-link" href="${m.url}">${inner}</a></li>`;
    }
    return `<li><div class="module-chip${m.status === 'ready' ? ' is-ready' : ''}">${inner}</div></li>`;
  }).join('');

  // Buttons
  const actions = $('#loc-actions');
  actions.innerHTML = '';
  if (playable.length) {
    const link = document.createElement('a');
    link.className = 'btn btn--sun';
    link.href = playable[0].url;
    link.textContent = `▶ Play ${playable[0].title}`;
    actions.appendChild(link);
  }
  if (daily) {
    actions.appendChild(makeButton("🎯 Play today's challenge", 'btn btn--coral', () => {
      closeDialog($('#location-dialog'));
      requestAnimationFrame(() => scrollToSection('challenge'));
    }));
  }
  actions.appendChild(makeButton(daily || playable.length ? 'Maybe later' : '👍 OK!', 'btn btn--ghost', () => {
    closeDialog($('#location-dialog'));
  }));
}

/** Where a module's progress is saved. A module shared by two places uses progressId. */
const progressKey = (loc, module) => module.progressId || `${loc.id}/${module.id}`;

/** Text under each module in the dialog: locked, open, in progress or mastered. */
function moduleStateText(loc, module) {
  if (module.status !== 'ready') return '🔒 Coming Soon';
  if (!module.url) return '⭐ Open now';
  const progress = getModuleProgress(progressKey(loc, module));
  if (progress.mastered) return '🏆 Mastered';
  if (progress.stages.length) return `▶ ${progress.stages.length}/${module.steps || 6} steps`;
  return '⭐ Play now';
}

function makeButton(label, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function openDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

function closeDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === 'function') dialog.close();
  else {
    dialog.removeAttribute('open');
    dialog.dispatchEvent(new Event('close'));
  }
}

function initDialog() {
  const dialog = $('#location-dialog');
  if (!dialog) return;
  $$('[data-close-dialog]', dialog).forEach(btn => btn.addEventListener('click', () => closeDialog(dialog)));
  // Tap the dark backdrop to close
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(dialog); });
}

/* ==============================================================
   8. CHALLENGE ENGINE
   A challenge is plain data:
   {
     icon, question, instruction,
     visual:  optional HTML shown above the answers,
     options: [{ value, label, html?, extra? }],
     answer:  the correct value,
     hint:    shown after a wrong try (never a penalty),
     explain: shown after the right answer,
     reward:  { stars }
   }
   Register new generators with registerChallengeType(name, fn).
   Future modules (drag, sort, build…) can reuse the same feedback,
   reward and Milo functions with their own interaction widgets.
   ============================================================== */

const CHALLENGE_TYPES = {};
const DAILY_ROTATION = ['compareNumbers', 'countOn', 'oddEven'];

function registerChallengeType(name, generator) {
  CHALLENGE_TYPES[name] = generator;
}

function createChallenge(name, rand = Math.random) {
  const generator = CHALLENGE_TYPES[name];
  if (!generator) throw new Error(`Unknown challenge type: ${name}`);
  return { reward: { stars: PRACTICE_REWARD_STARS }, ...generator(rand), type: name };
}

/** Tens rods and ones cubes for a 2-digit number. */
function baseTenHTML(n) {
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `<span class="b10" aria-hidden="true">
    <span class="b10__tens">${'<i class="rod"></i>'.repeat(tens)}</span>
    <span class="b10__ones">${'<i class="cube"></i>'.repeat(ones)}</span>
  </span>`;
}

/* --- Which number is greater? (tens digits always differ) --- */
registerChallengeType('compareNumbers', rand => {
  const t1 = randInt(rand, 1, 9);
  let t2;
  do { t2 = randInt(rand, 1, 9); } while (t2 === t1);

  let a;
  let b;
  if (rand() < 0.4) {          // swapped digits, like 27 and 72
    a = t1 * 10 + t2;
    b = t2 * 10 + t1;
  } else {
    a = t1 * 10 + randInt(rand, 0, 9);
    b = t2 * 10 + randInt(rand, 0, 9);
  }
  const answer = Math.max(a, b);
  const toOption = n => ({
    value: n,
    label: String(n),
    html: `<span class="digit-tens">${Math.floor(n / 10)}</span>${n % 10}`,
    extra: baseTenHTML(n)
  });

  return {
    icon: '⚖️',
    question: 'Which number is greater?',
    instruction: 'Tap the bigger number.',
    options: shuffle([a, b], rand).map(toOption),
    answer,
    hint: 'Almost! Look carefully at the tens digit.',
    explain: `${answer} has ${Math.floor(answer / 10)} tens. That's more tens!`
  };
});

/* --- Missing number when counting in 2s, 5s or 10s --- */
registerChallengeType('countOn', rand => {
  const step = pick([2, 5, 10], rand);
  const maxStart = Math.floor((100 - 4 * step) / step);
  const start = step * randInt(rand, 0, maxStart);
  const sequence = Array.from({ length: 5 }, (_, i) => start + i * step);
  const gap = randInt(rand, 2, 4);
  const answer = sequence[gap];

  const distractors = [...new Set([answer + 1, answer - 1, answer + step, answer + 10])]
    .filter(v => v >= 0 && v !== answer && !sequence.includes(v));
  const options = shuffle([answer, ...shuffle(distractors, rand).slice(0, 2)], rand)
    .map(n => ({ value: n, label: String(n) }));

  const track = sequence.map((n, i) => (i === gap
    ? '<li class="is-gap" aria-label="missing number">?</li>'
    : `<li>${n}</li>`)).join('');

  return {
    icon: '👣',
    question: 'What number is missing?',
    instruction: `We are counting in ${step}s. Tap the missing number.`,
    visual: `<ol class="track" aria-label="Number track">${track}</ol>`,
    options,
    answer,
    hint: `Almost! Count on ${step} from ${sequence[gap - 1]}.`,
    explain: `${sequence[gap - 1]} + ${step} = ${answer}`
  };
});

/* --- Odd or even, with dots arranged in pairs --- */
registerChallengeType('oddEven', rand => {
  const n = randInt(rand, 5, 18);
  const answer = n % 2 === 0 ? 'even' : 'odd';
  return {
    icon: '🟢',
    question: `Is ${n} odd or even?`,
    instruction: 'Look at the dots in pairs.',
    visual: `<div class="pairs" role="img" aria-label="${n} dots in pairs">${'<span class="dot"></span>'.repeat(n)}</div>`,
    options: [
      { value: 'odd', label: 'Odd', extra: '<span class="answer-btn__sub" aria-hidden="true">one left over</span>' },
      { value: 'even', label: 'Even', extra: '<span class="answer-btn__sub" aria-hidden="true">all in pairs</span>' }
    ],
    answer,
    hint: 'Almost! Is there one dot without a partner?',
    explain: answer === 'odd'
      ? `${n} is odd. One dot has no partner.`
      : `${n} is even. Every dot has a partner.`
  };
});

/**
 * Draw a challenge into a container and handle answers.
 * Wrong answers give a hint and allow another try; nothing is taken away.
 */
function renderChallenge(container, challenge, { onCorrect } = {}) {
  container.innerHTML = `
    <div class="challenge__q">
      <span class="challenge__icon" aria-hidden="true">${challenge.icon}</span>
      <h3 class="challenge__question" tabindex="-1">${challenge.question}</h3>
      <p class="challenge__instruction">👆 ${challenge.instruction}</p>
    </div>
    ${challenge.visual ? `<div class="challenge__visual">${challenge.visual}</div>` : ''}
    <div class="challenge__options" role="group" aria-label="Answer choices"></div>
    <p class="challenge__feedback" role="status" aria-live="polite"></p>`;

  const optionsEl = $('.challenge__options', container);
  const feedbackEl = $('.challenge__feedback', container);
  let solved = false;
  let attempts = 0;

  challenge.options.forEach(option => {
    const button = document.createElement('button');
    button.type = 'button';
    // words get a smaller font; numbers, emoji and pictures stay big
    const visibleText = String(option.html ?? option.label).replace(/<[^>]+>/g, '');
    button.className = Array.from(visibleText).length > 3 ? 'answer-btn answer-btn--text' : 'answer-btn';
    button.setAttribute('aria-label', option.label);
    button.innerHTML = `
      <span class="answer-btn__label">${option.html ?? option.label}</span>
      ${option.extra || ''}
      <span class="answer-btn__mark" aria-hidden="true"></span>`;

    button.addEventListener('click', () => {
      if (solved || button.disabled) return;
      attempts += 1;
      const mark = $('.answer-btn__mark', button);

      if (String(option.value) === String(challenge.answer)) {
        solved = true;
        button.classList.add('is-correct');
        mark.textContent = '✓';
        button.setAttribute('aria-label', `${option.label}, correct!`);
        $$('.answer-btn', optionsEl).forEach(b => { b.disabled = true; });
        if (onCorrect) onCorrect({ challenge, feedbackEl, attempts });
      } else {
        button.classList.add('is-wrong');
        mark.textContent = '✗';
        button.disabled = true;
        button.setAttribute('aria-label', `${option.label}, not this one`);
        setFeedback(feedbackEl, `💡 ${challenge.hint}`, 'hint');
        miloSay(pick(MILO_LINES.retry), 'challenge');
      }
    });
    optionsEl.appendChild(button);
  });
}

function setFeedback(el, message, kind, detail = '') {
  el.className = `challenge__feedback is-${kind}`;
  el.innerHTML = `<span>${message}</span>${detail ? `<small>${detail}</small>` : ''}`;
}

/* ==============================================================
   9. DAILY CHALLENGE
   Same question for the whole day (seeded by date).
   Stars are given once per day; practice rounds give 1 star.
   ============================================================== */

let challengeMode = 'daily';

function getDailyChallenge() {
  const rand = mulberry32(hashString(`maw-${todayKey()}`));
  const type = DAILY_ROTATION[dayNumber() % DAILY_ROTATION.length];
  const challenge = createChallenge(type, rand);
  challenge.reward = { stars: DAILY_REWARD_STARS };
  return challenge;
}

function renderDailyChallenge() {
  const area = $('#challenge-area');
  if (!area) return;
  challengeMode = 'daily';
  renderChallenge(area, getDailyChallenge(), { onCorrect: handleDailyCorrect });
  toggleNextButton(isDailySolvedToday());
  miloSay(isDailySolvedToday()
    ? "You solved today's challenge! Play it again, or try a new one."
    : 'Can you help me?', 'challenge');
  updateDailyStatus();
}

function handleDailyCorrect({ challenge, feedbackEl }) {
  if (!isDailySolvedToday()) {
    const stars = challenge.reward.stars;
    state.daily = { date: todayKey(), solved: true };
    state.solvedCount += 1;
    saveState();
    setFeedback(feedbackEl, `🎉 Amazing! You earned ⭐ ${stars} stars!`, 'success', challenge.explain);
    addStars(stars, { silent: true });
    if (!unlockBadge('challenge-champ')) launchConfetti(80);
  } else {
    setFeedback(feedbackEl, "🎉 Correct! You already collected today's stars.", 'success', challenge.explain);
  }
  miloSay(pick(MILO_LINES.correct), 'challenge');
  toggleNextButton(true);
  updateDailyStatus();
}

function renderPracticeChallenge() {
  const area = $('#challenge-area');
  if (!area) return;
  challengeMode = 'practice';
  const challenge = createChallenge(pick(Object.keys(CHALLENGE_TYPES)));
  renderChallenge(area, challenge, { onCorrect: handlePracticeCorrect });
  toggleNextButton(false);
  miloSay("Here's a new one. You can do it!", 'challenge');
  updateDailyStatus();
  const question = $('.challenge__question', area);
  if (question) question.focus({ preventScroll: true });
}

function handlePracticeCorrect({ challenge, feedbackEl }) {
  setFeedback(feedbackEl, `🎉 ${pick(MILO_LINES.correct)} +${challenge.reward.stars} ⭐`, 'success', challenge.explain);
  addStars(challenge.reward.stars, { silent: true });
  launchConfetti(30);
  miloSay(pick(MILO_LINES.correct), 'challenge');
  toggleNextButton(true);
}

function toggleNextButton(show) {
  const next = $('#challenge-next');
  if (next) next.hidden = !show;
}

/** Status chips in the challenge card and the hero teaser. */
function updateDailyStatus() {
  const done = isDailySolvedToday();
  const chip = $('#daily-status');
  if (chip) {
    if (challengeMode === 'practice') chip.textContent = `🔁 Practice • ⭐ +${PRACTICE_REWARD_STARS}`;
    else chip.textContent = done ? '✅ Done today' : `⭐ Win ${DAILY_REWARD_STARS} stars`;
  }
  const teaser = $('#teaser-status');
  if (teaser) teaser.textContent = done ? '✅ Done! Play for fun' : `Win ⭐ ${DAILY_REWARD_STARS} stars`;
}

function initChallengeControls() {
  const dateChip = $('#challenge-date');
  if (dateChip) {
    dateChip.textContent = `📅 ${new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`;
  }
  const practice = $('#practice-btn');
  if (practice) practice.addEventListener('click', renderPracticeChallenge);
}

/* ==============================================================
   10. BADGES + PROGRESS PANELS
   ============================================================== */

function renderBadges() {
  const grid = $('#badge-grid');
  if (!grid) return;
  grid.innerHTML = BADGES.map(badge => {
    const unlocked = hasBadge(badge.id);
    return `
      <li class="badge-card ${unlocked ? 'is-unlocked' : 'is-locked'}">
        <span class="badge-card__icon" aria-hidden="true">
          <span class="badge-card__emoji">${badge.icon}</span>
          ${unlocked ? '' : '<span class="badge-card__lock">🔒</span>'}
        </span>
        <h3 class="badge-card__name">${badge.name}</h3>
        <p class="badge-card__how">${badge.how}</p>
        <span class="badge-card__state">${unlocked ? '✅ Unlocked!' : '🔒 Locked'}</span>
      </li>`;
  }).join('');
}

function renderProgressPanel() {
  const visitedCount = LOCATIONS.filter(loc => state.visited.includes(loc.id)).length;
  const total = LOCATIONS.length;

  const count = $('#places-count');
  if (count) count.textContent = `${visitedCount} / ${total}`;

  const bar = $('#places-bar');
  const fill = $('#places-bar-fill');
  if (bar && fill) {
    bar.setAttribute('aria-valuemax', String(total));
    bar.setAttribute('aria-valuenow', String(visitedCount));
    fill.style.width = `${(visitedCount / total) * 100}%`;
  }

  const chips = $('#place-chips');
  if (chips) {
    chips.innerHTML = LOCATIONS.map(loc => {
      const visited = state.visited.includes(loc.id);
      return `<li class="place-chip${visited ? ' is-visited' : ''}" style="--c:${loc.color}">
        <span aria-hidden="true">${visited ? loc.emoji : '❔'}</span> ${loc.name}${visited ? ' ✓' : ''}
      </li>`;
    }).join('');
  }

  const totalBadges = $('#badges-total');
  if (totalBadges) totalBadges.textContent = BADGES.length;

  const nextBadge = $('#next-badge');
  if (nextBadge) {
    const next = BADGES.find(b => !hasBadge(b.id));
    nextBadge.innerHTML = next
      ? `<span class="next-badge__icon" aria-hidden="true">${next.icon}</span><span>Next badge: <strong>${next.name}</strong> — ${next.how}</span>`
      : '<span class="next-badge__icon" aria-hidden="true">🏆</span><span>You have every badge so far. Amazing explorer!</span>';
  }
}

/* ==============================================================
   11. PARENT / TEACHER TOOLS
   ============================================================== */

function resetProgress() {
  if (!window.confirm('Reset all stars, gems, badges and visited places on this device?')) return;
  state = createDefaultState();
  saveState();
  renderDailyChallenge();
  updateProgress();
  miloSay(MILO_LINES.mapIdle, 'map');
  showToast('Progress reset. A fresh adventure begins!', '🌱');
}

function initGrownUps() {
  const reset = $('#reset-progress');
  if (reset) reset.addEventListener('click', resetProgress);
}

/* ==============================================================
   12. START-UP + PUBLIC API
   ============================================================== */

function init() {
  renderMap();
  initMapInteractions();
  initDialog();
  initNavigation();
  initHero();
  initChallengeControls();
  initGrownUps();
  renderDailyChallenge();
  updateProgress();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

/* Future module pages can load this script and call these. */
window.MathAdventure = {
  addStars,
  addGems,
  unlockBadge,
  updateProgress,
  miloSay,
  showToast,
  launchConfetti,
  registerChallengeType,
  createChallenge,
  renderChallenge,
  LOCATIONS,
  BADGES,
  getModuleProgress,
  completeStage,
  isStageDone,
  markModuleMastered,
  getState: () => JSON.parse(JSON.stringify(state))
};
