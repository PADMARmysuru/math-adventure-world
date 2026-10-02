# 🌈 Math Adventure World

A colourful maths adventure for Grade 2 learners (about ages 6–7), with topics organised around the
**Cambridge Primary Mathematics Stage 2 (0096)** curriculum framework. Not an official Cambridge resource.

Created by **Mrs. Padma R**.

**Live site:** https://padmarmysuru.github.io/math-adventure-world/

## The map — 8 places, 41 modules

| Place | Modules |
|---|---|
| 🏝️ Number Island | Counting · Place Value · Comparing Numbers · Addition · Subtraction · Multiplication · Division · Fractions · Number Patterns |
| 🌳 Pattern Forest | Number Patterns (shared) · Shape Patterns · Repeating Patterns · Logic Challenges |
| 🏰 Shape Castle | 2D Shapes · 3D Shapes · Shape Properties · Symmetry · Position & Direction |
| 📏 Measure Mountain | Length · Mass · Capacity · Temperature · Time |
| 💰 Money Market | Coins · Notes · Counting Money · Shopping Games |
| ⏰ Time Town | Clock · Calendar · Days · Months · Time Problems |
| 📊 Data Park | Tally Charts · Pictograms · Block Graphs · Sorting · Data Questions |
| 🎯 Challenge Arena | Daily Challenge · Mixed Challenges · Timed Games · Puzzle Challenges · Boss Challenges |

Every module follows the same six steps: 🌱 Learn → 🎮 Play → 🧩 Practise → 🧠 Think → 🚀 Challenge → 🏆 Master.

## Certificates

Open **🎓 My certificates** (on the home page, under Badges). A certificate unlocks when every adventure in a place is
mastered, plus a 🌈 Grand Explorer certificate for all eight places. The child types their name once; each certificate
prints on one A4 landscape page (or choose “Save as PDF”). Grown-ups can preview every design; previews are stamped PREVIEW.

## Files

```
index.html, style.css, script.js   Home page, adventure map, rewards, badges, daily challenge
certificates.html/.css/.js         Printable certificates
module.js, module.css              Shared toolkit used by every module page
manifest.webmanifest, icons/       App icon (add to home screen)
<place>/                           One folder per place: each module is <name>.html + <name>.js,
                                   plus a shared stylesheet and helper file for that place
```

## Easy changes

- **Footer name:** edit `SITE_CREDIT` near the top of `script.js`.
- **Currency symbol:** edit `CURRENCY` at the top of `money-market/money.js` (for example `'$'` or `'£'`).
- **Progress** is saved in each browser (localStorage). Parents/teachers can reset it on the home page.

Plain HTML, CSS and JavaScript: no build step, no libraries, works by opening `index.html` or on GitHub Pages.
