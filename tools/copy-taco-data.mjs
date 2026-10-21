// Copies the TACO foods the Kilo app ships into data/taco.json, which tools/build-food-pages.mjs turns into the /alimentos/
// pages. Rerun it, then the page builder, whenever the app's food data changes:
//
//   node tools/copy-taco-data.mjs /path/to/fitness-app     (a clean checkout of the app repo at the commit to copy)
//   node tools/build-food-pages.mjs
//
// The numbers come from the app's generated table (apps/mobile/src/kilo-nutrition/food-data.generated.ts), so the pages show
// exactly what the app logs; the categories come from the app's TACO source files. The copy records the app commit and date.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = process.argv[2];
if (!app) { console.error('usage: node tools/copy-taco-data.mjs /path/to/fitness-app'); process.exit(1); }

const GENERATED = 'apps/mobile/src/kilo-nutrition/food-data.generated.ts';
const TACO_DIR = 'data/food-sources/taco';
const git = (...args) => execFileSync('git', ['-C', app, ...args]).toString().trim();
if (git('status', '--porcelain', '--', GENERATED, TACO_DIR)) { console.error(`${app} has local changes to the food data; copy from a clean checkout`); process.exit(1); }

/** One CSV line: comma separated, a field with commas in double quotes, "" for a quote inside one. Empty fields stay ''. */
function csvFields(line) {
  const fields = [];
  let field = '', quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false; else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { fields.push(field); field = ''; } else field += c;
  }
  fields.push(field);
  return fields;
}
function parseCsv(text) {
  const [head, ...lines] = text.trim().split(/\r?\n/).map(csvFields);
  return lines.map(fields => {
    if (fields.length !== head.length) throw new Error(`a CSV line has ${fields.length} fields, the header ${head.length}`);
    return Object.fromEntries(head.map((key, i) => [key, fields[i]]));
  });
}

const source = fs.readFileSync(path.join(app, GENERATED), 'utf8');
const table = JSON.parse(source.match(/^export const TACO_TABLE = (".*");$/m)[1]);
const notApplicable = JSON.parse(source.match(/^export const TACO_NOT_APPLICABLE = (\[.*\]) as readonly string\[\];$/m)[1]);
const categoryOf = new Map(parseCsv(fs.readFileSync(path.join(app, TACO_DIR, 'food.csv'), 'utf8')).map(row => [row.id, Number(row.categoryId)]));
// Which macros the table marks "NA" (blank in the source file); the app stores them as 0.
const blank = new Map(parseCsv(fs.readFileSync(path.join(app, TACO_DIR, 'nutrients.csv'), 'utf8'))
  .map(row => [row.foodId, [['protein', 'protein'], ['carbs', 'carbohydrates'], ['fat', 'lipids']].filter(([, column]) => row[column] === '').map(([key]) => key)]));
const categories = parseCsv(fs.readFileSync(path.join(app, TACO_DIR, 'categories.csv'), 'utf8')).map(row => ({ id: Number(row.id), name: row.name }));

const foods = table.split('\n').map(line => {
  const [id, name, kcal, protein, carbs, fat] = line.split('\t');
  if (!categoryOf.has(id)) throw new Error(`food ${id} has no category`);
  if (!blank.has(id)) throw new Error(`food ${id} has no nutrients row`);
  if (notApplicable.includes(id) !== blank.get(id).length > 0) throw new Error(`food ${id}: the app's "not applicable" list and the source file disagree`);
  return { id: Number(id), name, category: categoryOf.get(id), kcal: Number(kcal), protein: Number(protein), carbs: Number(carbs), fat: Number(fat), ...(blank.get(id).length ? { notApplicable: blank.get(id) } : {}) };
});

const commit = git('log', '-1', '--format=%H', '--', GENERATED, TACO_DIR);
const data = {
  source: {
    note: 'Copied by tools/copy-taco-data.mjs from the Kilo app repo; do not edit by hand.',
    repo: 'ianhudsonai/fitness-app', files: [GENERATED, `${TACO_DIR}/food.csv`, `${TACO_DIR}/categories.csv`, `${TACO_DIR}/nutrients.csv`],
    commit, commitDate: git('log', '-1', '--format=%cs', commit), copiedOn: new Date().toISOString().slice(0, 10),
    table: 'Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição revisada e ampliada, NEPA–UNICAMP, Campinas, 2011',
    units: 'per 100 g of edible portion; kcal, then protein, carbs and fat in grams. "notApplicable" lists the macros the table marks "NA", which the app stores as 0.',
  },
  categories,
  foods,
};
// One food per line, so a rerun's diff shows exactly which foods changed.
const list = items => '[\n' + items.map(item => '  ' + JSON.stringify(item)).join(',\n') + '\n ]';
fs.writeFileSync(path.join(ROOT, 'data/taco.json'),
  `{\n "source": ${JSON.stringify(data.source)},\n "categories": ${list(categories)},\n "foods": ${list(foods)}\n}\n`);
console.log(`wrote data/taco.json: ${foods.length} foods in ${categories.length} categories, app commit ${commit.slice(0, 7)} (${data.source.commitDate})`);
