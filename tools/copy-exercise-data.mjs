// Copies the Kilo app's exercise library (names, muscle group, one-side flag and the Portuguese and English how-to tips) into
// data/exercises.json, which tools/build-pages.mjs turns into the /exercicios/ pages. Rerun it, then the page builder,
// whenever the library changes:
//
//   node tools/copy-exercise-data.mjs /path/to/fitness-app     (a clean checkout of the app repo at the commit to copy)
//
// The library lives in the app repo's database migrations (00031 to 00039: "written fresh; no third-party data"), applied in
// order: an insert keyed by slug, then tips added by 00037. The tips bundled in the app (exercise-cues-data.ts) must match.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = process.argv[2];
if (!app) { console.error('usage: node tools/copy-exercise-data.mjs /path/to/fitness-app'); process.exit(1); }

const MIGRATIONS = 'supabase/migrations';
const CUES = 'apps/mobile/src/lib/exercise-cues-data.ts';
const git = (...args) => execFileSync('git', ['-C', app, ...args]).toString().trim();
if (git('status', '--porcelain', '--', MIGRATIONS, CUES)) { console.error(`${app} has local changes to the exercise library; copy from a clean checkout`); process.exit(1); }

/** The value tuples of an SQL `values (...), (...)` list: strings ('' is a quote), true/false and bare words. */
function tuples(sql) {
  const rows = [];
  let i = 0;
  const skip = () => { while (/\s/.test(sql[i])) i++; };
  while ((i = sql.indexOf('(', i)) !== -1) {
    i++; skip();
    if (sql[i] !== "'") continue; // not a value tuple, e.g. "values (" or a function call
    const row = [];
    for (;;) {
      skip();
      if (sql[i] === "'") {
        let text = '';
        for (i++; ; i++) {
          if (sql[i] === "'" && sql[i + 1] === "'") { text += "'"; i++; } else if (sql[i] === "'") { i++; break; } else text += sql[i];
        }
        row.push(text);
      } else {
        const word = sql.slice(i).match(/^[a-z_]+/)[0];
        row.push(word === 'true' ? true : word === 'false' ? false : word);
        i += word.length;
      }
      skip();
      if (sql[i] === ',') { i++; continue; }
      if (sql[i] === ')') { i++; break; }
      throw new Error(`unexpected "${sql.slice(i, i + 20)}"`);
    }
    rows.push(row);
  }
  return rows;
}

const files = fs.readdirSync(path.join(app, MIGRATIONS)).filter(f => /^\d{5}_.*\.sql$/.test(f)).sort();
const library = new Map();
const used = [];
for (const file of files) {
  const sql = fs.readFileSync(path.join(app, MIGRATIONS, file), 'utf8');
  // Every statement that writes exercise_catalog rows (with or without "public.") must be one this script reads; any other
  // write (a delete, a new kind of update) stops the copy, so the site never keeps an exercise the app changed or dropped.
  const statements = sql.split(/;\s*\n/).map(s => s.replace(/--[^\n]*/g, '')).filter(s => /\bexercise_catalog\b/.test(s));
  for (const statement of statements) {
    if (/^\s*insert into (public\.)?exercise_catalog \(id, slug, name_en, name_pt, muscle_group, is_unilateral(, tip_en, tip_pt)?\) values/.test(statement)) {
      used.push(file);
      for (const [, slug, nameEn, namePt, muscle, unilateral, tipEn, tipPt] of tuples(statement.slice(statement.indexOf(' values')))) {
        library.set(slug, { slug, namePt, nameEn, muscle, unilateral, tipPt: tipPt ?? library.get(slug)?.tipPt ?? null, tipEn: tipEn ?? library.get(slug)?.tipEn ?? null });
      }
    } else if (/^\s*update (public\.)?exercise_catalog c set tip_en = v\.tip_en, tip_pt = v\.tip_pt/.test(statement)) {
      used.push(file);
      for (const [slug, tipEn, tipPt] of tuples(statement.slice(statement.indexOf('from (values')))) {
        if (!library.has(slug)) throw new Error(`${file}: tip for unknown exercise ${slug}`);
        Object.assign(library.get(slug), { tipEn, tipPt });
      }
    } else if (/\b(insert\s+into|update|delete\s+from|truncate(\s+table)?|merge\s+into)\s+(only\s+)?(public\.)?exercise_catalog\b/i.test(statement)) {
      throw new Error(`${file} writes exercise_catalog in a way this script does not read; update it`);
    }
  }
}

// The app's bundled tips must equal the library's (the app has a test for this too).
const cueSource = fs.readFileSync(path.join(app, CUES), 'utf8');
let bundled = 0;
for (const [, line] of cueSource.matchAll(/^\s*'((?:[^'\\]|\\.)*)',?$/gm)) {
  bundled++;
  const [slug, en, pt] = line.replace(/\\'/g, "'").split('|');
  const row = library.get(slug);
  if (!row || row.tipEn !== en || row.tipPt !== pt) throw new Error(`the app's bundled tip for ${slug} differs from the library`);
}
if (bundled < 100) throw new Error(`read only ${bundled} bundled tips from ${CUES}; its format changed`);
const exercises = [...library.values()];
const missing = exercises.filter(e => !e.tipPt);
if (missing.length) throw new Error(`no Portuguese tip: ${missing.map(e => e.slug).join(', ')}`);

const read = [...new Set(used)].map(f => `${MIGRATIONS}/${f}`).concat(CUES);
const commit = git('log', '-1', '--format=%H', '--', ...read);
const source = { note: 'Copied by tools/copy-exercise-data.mjs from the Kilo app repo; do not edit by hand.', repo: 'ianhudsonai/fitness-app', files: read, commit, commitDate: git('log', '-1', '--format=%cs', commit), copiedOn: new Date().toISOString().slice(0, 10), licence: 'Written for Kilo ("written fresh; no third-party data", 00031); tips are general technique reminders, not a prescription.' };
const list = items => '[\n' + items.map(item => '  ' + JSON.stringify(item)).join(',\n') + '\n ]';
fs.writeFileSync(path.join(ROOT, 'data/exercises.json'), `{\n "source": ${JSON.stringify(source)},\n "exercises": ${list(exercises)}\n}\n`);
console.log(`wrote data/exercises.json: ${exercises.length} exercises (${bundled} bundled tips checked) from ${source.files.length - 1} migrations, app commit ${commit.slice(0, 7)} (${source.commitDate})`);
