// Writes data/goal-samples.json: what the Kilo app's own goal maths (target-calculator.ts) answers for a spread of sample
// people. The calculator check compares the site's calculator (assets/calculator.js) with these answers, so the site never
// gives a number the app wouldn't. Rerun it when the app's goal maths changes, then fix assets/calculator.js until the check passes:
//
//   node --experimental-strip-types tools/make-goal-samples.mjs /path/to/fitness-app     (a clean checkout of the app repo)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = process.argv[2];
if (!app) { console.error('usage: node --experimental-strip-types tools/make-goal-samples.mjs /path/to/fitness-app'); process.exit(1); }
const FILE = 'apps/mobile/src/kilo-nutrition/target-calculator.ts';
const git = (...args) => execFileSync('git', ['-C', app, ...args]).toString().trim();
if (git('status', '--porcelain', '--', FILE)) { console.error(`${app} has local changes to ${FILE}; use a clean checkout`); process.exit(1); }
const { proposeTarget, bodyRangeProblem } = await import(pathToFileURL(path.join(app, FILE)).href);

// The calculator asks every question, so nothing is guessed; the pace is the app's default when none is picked on its
// speedometer (lose 0.5 kg a week, gain 0.25), with the usual limits.
const PACE = { lose: 0.5, maintain: null, gain: 0.25 };
const BODIES = [
  [16, 165, 55], [17, 180, 70], [18, 160, 45], [18, 175, 52], [22, 170, 60], [25, 185, 95], [30, 175, 80], [30, 155, 42],
  [35, 162, 68], [40, 190, 130], [45, 150, 38], [55, 168, 75], [65, 158, 50], [70, 172, 90], [100, 120, 30], [20, 230, 300],
];
const samples = [];
for (const [age, heightCm, weightKg] of BODIES) {
  for (const sex of ['female', 'male', 'unspecified']) {
    for (const activity of ['sitting', 'light', 'active', 'very']) {
      for (const goal of ['lose', 'maintain', 'gain']) {
        const input = { age, heightCm, weightKg, sex, activity, goal };
        const p = proposeTarget({ ...input, paceKgPerWeek: PACE[goal] });
        samples.push({ input, out: {
          kcal: p.kcal, protein: p.protein, carbs: p.carbs, fat: p.fat, restingKcal: p.restingKcal, maintenanceKcal: p.maintenanceKcal,
          goal: p.goal, restriction: p.restriction, lowBmi: p.lowBmi, capped: p.capped, belowResting: p.belowResting, unsavable: p.unsavable,
        } });
      }
    }
  }
}
// Where the app stops before any maths: numbers out of range, and under 16.
const PROBLEMS = [[15, 170, 60], [10, 140, 35], [101, 170, 60], [30, 119, 60], [30, 231, 60], [30, 170, 29.9], [30, 170, 300.5], [16, 170, 60]]
  .map(([age, heightCm, weightKg]) => ({ input: { age, heightCm, weightKg }, problem: bodyRangeProblem({ age, heightCm, weightKg }) }));

const commit = git('log', '-1', '--format=%H', '--', FILE);
const list = items => '[\n' + items.map(item => '  ' + JSON.stringify(item)).join(',\n') + '\n ]';
const source = { note: 'Written by tools/make-goal-samples.mjs from the Kilo app repo; do not edit by hand.', repo: 'ianhudsonai/fitness-app', file: FILE, commit, commitDate: git('log', '-1', '--format=%cs', commit), pace: PACE };
fs.writeFileSync(path.join(ROOT, 'data/goal-samples.json'), `{\n "source": ${JSON.stringify(source)},\n "problems": ${list(PROBLEMS)},\n "samples": ${list(samples)}\n}\n`);
console.log(`wrote data/goal-samples.json: ${samples.length} samples and ${PROBLEMS.length} range checks, app commit ${commit.slice(0, 7)} (${source.commitDate})`);
