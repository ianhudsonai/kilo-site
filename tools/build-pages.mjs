// Builds the generated Google pages, each from data copied in from the Kilo app repo:
//   /alimentos/   every TACO food (data/taco.json, see tools/copy-taco-data.mjs): calories and macros per 100 g, the table's
//                 credit line and the waitlist box tagged seo-food; the index lists them by category.
//   /exercicios/  every exercise in the app's library (data/exercises.json, see tools/copy-exercise-data.mjs): the muscle,
//                 the app's how-to tip and the waitlist box tagged seo-exercise; the index lists them by muscle.
// It also rewrites both parts of sitemap.xml. Rerun it after copying new data; it replaces the whole of both folders.
//
//   node tools/build-pages.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://kiloapp.com.br';
const FOODS = 'alimentos';
const EXERCISES = 'exercicios';
// The TACO terms (p. ii of the 4th edition) allow reproducing it "desde que seja citada a fonte"; this is that citation,
// as the book's own catalogue entry gives it.
const CREDIT = 'Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição revisada e ampliada. NEPA–UNICAMP, Campinas, 2011';
const TACO_URL = 'https://www.nepa.unicamp.br/arquivo/uploads/taco-4-edicao-ampliada-e-revisada/taco_4_edicao_ampliada_e_revisada/';
const MACROS = [['protein', 'Proteína'], ['carbs', 'Carboidrato'], ['fat', 'Gordura']];
const RELATED = 8;

const taco = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/taco.json'), 'utf8'));
const library = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises.json'), 'utf8'));

const escape = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const grams = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const kcal = n => n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
const slugOf = name => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/%/g, ' por cento ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/** The nearest items to `item` in `list`'s own order, then back in that order. */
const nearest = (list, item) => {
  const at = list.indexOf(item);
  return list.filter(other => other !== item).sort((a, b) => Math.abs(list.indexOf(a) - at) - Math.abs(list.indexOf(b) - at)).slice(0, RELATED)
    .sort((a, b) => list.indexOf(a) - list.indexOf(b));
};

// ---- Shared parts of every page ----

function head({ title, description, url }) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}">
<link rel="canonical" href="${SITE}${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Kilo">
<meta property="og:locale" content="pt_BR">
<meta property="og:url" content="${SITE}${url}">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:image" content="${SITE}/assets/img/compartilhar.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="O app de treino e dieta que aprende com você: o Kilo no iPhone, ao lado do gorila do Kilo">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/assets/pages.css">
</head>
<body>
<div class="wrap">
  <header class="top"><a class="brand" href="/"><span class="mark" aria-hidden="true">K</span>Kilo</a></header>
`;
}

/** The waitlist box, tagged for the page type so sign-ups are counted per kind of page. */
const joinCard = ({ title, lead, tag }) => `  <section class="join-card" aria-labelledby="join-title">
    <h2 id="join-title">${title}</h2>
    <p>${lead}</p>
    <a class="cta" href="/?origem=${tag}">Entrar na lista de espera</a>
    <p class="small">Grátis, sem anúncios. Primeiro no iPhone.</p>
  </section>
`;

const footer = (note = 'O Kilo é uma ferramenta de registro e não substitui orientação médica ou de um nutricionista.') => `  <footer>
    <a href="/">Página inicial do Kilo</a>
    <a href="/${FOODS}/">Calorias dos alimentos</a>
    <a href="/${EXERCISES}/">Como fazer os exercícios</a>
    <a href="/calculadora/">Calculadora de calorias</a>
    <a href="mailto:contato@kiloapp.com.br">contato@kiloapp.com.br</a>
    <p class="note">${note}</p>
  </footer>
</div>
</body>
</html>
`;

const crumbs = items => `  <nav class="crumbs" aria-label="Você está em"><ol>${items.map(([label, href]) => `<li>${href ? `<a href="${href}">${escape(label)}</a>` : `<span aria-current="page">${escape(label)}</span>`}</li>`).join('')}</ol></nav>
`;

// ---- Foods ----

/**
 * The table's name as people say it, for headings, titles and addresses: "Arroz, integral, cozido" is "Arroz integral
 * cozido", "Coco, água de" is "Água de coco", and the table's footnote marks ("Cerveja, pilsen 2") are dropped.
 */
// Names the general rules below can't turn into Portuguese people say, by the table's food number.
const SAID = {
  7: 'Aveia em flocos crua', 14: 'Mistura para bolo', 21: 'Flocos de milho com sal', 22: 'Flocos de milho sem sal', 30: 'Mistura para curau de milho verde',
  48: 'Pão de forma de aveia', 50: 'Pão de forma de glúten', 51: 'Pão de forma de milho', 52: 'Pão de forma integral', 53: 'Pão francês', 54: 'Pão sovado',
  159: 'Molho de tomate industrializado', 171: 'Ameixa em calda enlatada', 173: 'Ameixa em calda enlatada drenada', 472: 'Aguardente de cana',
  535: 'Molho cuxá', 584: 'Tofu (queijo de soja)',
};
// "Laranja, baía, suco" is "Suco de laranja baía"; "Achocolatado, pó" is "Achocolatado em pó".
const KIND = /^(suco|polpa|extrato|purê|farinha|semente)\b/;
/** The table's footnote mark at the end of a name ("Cerveja, pilsen 2"), which the pages don't carry. */
const unmarked = name => name.replace(/(?<!tipo) \d$/, '');
function plain(food) {
  if (SAID[food.id]) return SAID[food.id];
  let parts = unmarked(food.name).split(/\s*,\s*/);
  const powder = parts.slice(1).includes('pó');
  if (powder) parts = parts.filter((part, i) => i === 0 || part !== 'pó');
  const kind = parts.findIndex((part, i) => i > 0 && KIND.test(part));
  if (kind > 0) parts = [`${parts[kind]} de ${parts[0].toLowerCase()}`, ...parts.slice(1).filter((part, i) => i + 1 !== kind)];
  else if (parts.length === 2 && / (de|para)$/.test(parts[1])) parts = [parts[1], parts[0].toLowerCase()];
  const text = parts.join(' ').replace(/\s+/g, ' ').trim() + (powder ? ' em pó' : '');
  return text[0].toUpperCase() + text.slice(1);
}

const categories = new Map(taco.categories.map(c => [c.id, { ...c, slug: slugOf(c.name), foods: [] }]));
const foodSlugs = new Set();
const foods = taco.foods.map(food => {
  const name = plain(food);
  const slug = slugOf(name);
  // An address must keep pointing at the same food, so a clash is fixed by hand (in SAID) rather than numbered.
  if (foodSlugs.has(slug)) throw new Error(`two foods would share /${FOODS}/${slug}/; give one a name in SAID`);
  foodSlugs.add(slug);
  const page = { ...food, slug, plain: name, url: `/${FOODS}/${slug}/` };
  categories.get(food.category).foods.push(page);
  return page;
});

const foodCard = lead => joinCard({
  title: 'O Kilo registra isso com um toque',
  lead: `${lead} A Tabela TACO já vem dentro do app, a busca funciona sem internet e os alimentos que você mais usa aparecem primeiro em cada refeição.`,
  tag: 'seo-food',
});
const foodRow = food => `<li><a href="${food.url}"><b>${escape(food.plain)}</b><span>${kcal(food.kcal)} kcal</span></a></li>`;

const NA_WORDS = { protein: 'a proteína', carbs: 'o carboidrato', fat: 'a gordura' };
function foodPage(food) {
  const category = categories.get(food.category);
  const p = food.plain;
  // Google shows about 60 characters; long names drop the words a search would not need.
  const title = [`${p}: calorias e macros · Kilo`, `${p}: calorias · Kilo`].find(t => t.length <= 60) ?? `${p}: calorias`;
  const description = `${p} tem ${kcal(food.kcal)} kcal em 100 g, com ${grams(food.protein)} g de proteína, ${grams(food.carbs)} g de carboidrato e ${grams(food.fat)} g de gordura, segundo a Tabela TACO.`;
  // The nearest foods in the table's own order: usually the same food cooked another way, then its neighbours.
  const related = nearest(category.foods, food);
  const na = food.notApplicable ?? [];
  const naNote = na.length ? `    <p class="na">A TACO marca ${na.map(k => NA_WORDS[k]).join(na.length > 2 ? ', ' : ' e ').replace(/, ([^,]*)$/, ' e $1')} deste alimento como “não se aplica”; aqui ${na.length > 1 ? 'aparecem' : 'aparece'} como 0, como no app.</p>\n` : '';
  return head({ title, description, url: food.url })
    + crumbs([['Kilo', '/'], ['Alimentos', `/${FOODS}/`], [category.name, `/${FOODS}/#${category.slug}`]])
    + `  <main>
  <h1>${escape(p)}</h1>
  <p class="sub">Calorias e macronutrientes em 100 g, pela Tabela TACO (nome na tabela: “${escape(unmarked(food.name))}”).</p>
  <section class="facts" aria-label="Valores em 100 g">
    <p class="kcal"><strong data-kcal>${kcal(food.kcal)}</strong> <span>kcal em 100 g</span></p>
    <table class="macros">
${MACROS.map(([key, label]) => `      <tr><th scope="row">${label}</th><td data-${key}>${grams(food[key])} g</td></tr>`).join('\n')}
    </table>
${naNote}  </section>
  <p class="source">Fonte: <a href="${TACO_URL}">${CREDIT}</a>. Valores por 100 g da parte comestível.</p>
${foodCard(`No Kilo, você busca “${escape(p.toLowerCase())}”, escolhe quantos gramas comeu e as calorias e os macros entram no seu dia.`)}
  <section class="more" aria-labelledby="more-title">
    <h2 id="more-title">Mais em ${escape(category.name)}</h2>
    <ul class="list">${related.map(foodRow).join('')}</ul>
    <p><a href="/${FOODS}/">Ver todos os ${foods.length} alimentos</a></p>
  </section>
  </main>
` + footer();
}

function foodIndex() {
  const groups = [...categories.values()].filter(c => c.foods.length);
  return head({
    title: 'Calorias dos alimentos: Tabela TACO completa · Kilo',
    description: `Calorias, proteína, carboidrato e gordura em 100 g dos ${foods.length} alimentos da Tabela TACO (NEPA–UNICAMP), por categoria: arroz, feijão, frutas, carnes e mais.`,
    url: `/${FOODS}/`,
  })
    + crumbs([['Kilo', '/'], ['Alimentos', null]])
    + `  <main>
  <h1>Calorias dos alimentos</h1>
  <p class="sub">Os ${foods.length} alimentos da Tabela TACO, com calorias, proteína, carboidrato e gordura em 100 g. Toque em um alimento para ver tudo.</p>
  <ul class="jump" aria-label="Categorias">${groups.map(c => `<li><a href="#${c.slug}">${escape(c.name)}</a></li>`).join('')}</ul>
${foodCard('No Kilo, você busca o alimento, escolhe quantos gramas comeu e as calorias e os macros entram no seu dia.')}
${groups.map(c => `  <section class="group" id="${c.slug}" aria-labelledby="h-${c.slug}">
    <h2 id="h-${c.slug}">${escape(c.name)}</h2>
    <ul class="list">${c.foods.map(foodRow).join('')}</ul>
  </section>
`).join('')}  <p class="source">Fonte: <a href="${TACO_URL}">${CREDIT}</a>. Valores por 100 g da parte comestível.</p>
  </main>
` + footer();
}

// ---- Exercises ----

// The app's muscle groups, in the order the index shows them, with the Portuguese the app's filter uses.
// "other" holds cardio, mobility and whole-body moves, which the app labels "Outros".
const MUSCLES = [
  ['chest', 'Peito'], ['back', 'Costas'], ['shoulders', 'Ombros'], ['biceps', 'Bíceps'], ['triceps', 'Tríceps'], ['forearms', 'Antebraços'],
  ['quads', 'Quadríceps'], ['hamstrings', 'Posteriores de coxa'], ['glutes', 'Glúteos'], ['calves', 'Panturrilhas'], ['core', 'Core e abdômen'],
  ['other', 'Cardio e outros'],
];
const muscles = new Map(MUSCLES.map(([key, label]) => [key, { key, label, slug: slugOf(label), exercises: [] }]));
const exerciseSlugs = new Set();
const exercises = library.exercises.map(exercise => {
  const group = muscles.get(exercise.muscle);
  if (!group) throw new Error(`${exercise.slug} has muscle group "${exercise.muscle}", which the pages don't know; add it to MUSCLES`);
  const slug = slugOf(exercise.namePt);
  if (exerciseSlugs.has(slug)) throw new Error(`two exercises would share /${EXERCISES}/${slug}/ (${exercise.namePt})`);
  exerciseSlugs.add(slug);
  const page = { ...exercise, url: `/${EXERCISES}/${slug}/`, pageSlug: slug };
  group.exercises.push(page);
  return page;
});
const alphabetical = list => [...list].sort((a, b) => a.namePt.localeCompare(b.namePt, 'pt-BR'));

// Only what the approved App Store text says the app does.
const exerciseCard = lead => joinCard({
  title: 'No Kilo, a carga da próxima série vem sugerida',
  lead: `${lead} Você registra carga, repetições e RIR em cada série, com os números da última vez já preenchidos, e cada exercício tem histórico, calendário e gráfico.`,
  tag: 'seo-exercise',
});
const exerciseRow = exercise => `<li><a href="${exercise.url}"><b>${escape(exercise.namePt)}</b></a></li>`;
const SAFETY = 'Dicas gerais de técnica, não uma prescrição. Comece leve e pare se sentir dor.';
const firstSentence = text => text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;

function exercisePage(exercise) {
  const group = muscles.get(exercise.muscle);
  const n = exercise.namePt;
  const title = [`${n}: como fazer · Kilo`, `${n}: como fazer`].find(t => t.length <= 60) ?? n;
  // Google shows about 160 characters: the name, then the tip's first step when it fits.
  const tipped = `Como fazer ${n}: ${firstSentence(exercise.tipPt)}`;
  const description = tipped.length <= 160 ? tipped : `Como fazer ${n} (${exercise.nameEn}), exercício de ${group.label.toLowerCase()}: dica de execução e exercícios parecidos.`;
  return head({ title, description, url: exercise.url })
    + crumbs([['Kilo', '/'], ['Exercícios', `/${EXERCISES}/`], [group.label, `/${EXERCISES}/#${group.slug}`]])
    + `  <main>
  <h1>${escape(n)}</h1>
  <p class="sub">Grupo muscular: <span data-muscle>${escape(group.label)}</span>. Em inglês: <span lang="en">${escape(exercise.nameEn)}</span>.${exercise.unilateral ? ' Feito um lado de cada vez.' : ''}</p>
  <section class="facts how" aria-labelledby="how-title">
    <h2 id="how-title">Como fazer</h2>
    <p data-tip>${escape(exercise.tipPt)}</p>
    <p class="na">${SAFETY}</p>
  </section>
${exerciseCard(`${escape(n)} já vem no app, com esta dica.`)}
  <section class="more" aria-labelledby="more-title">
    <h2 id="more-title">Mais exercícios de ${escape(group.label.toLowerCase())}</h2>
    <ul class="list">${nearest(group.exercises, exercise).map(exerciseRow).join('')}</ul>
    <p><a href="/${EXERCISES}/">Ver todos os ${exercises.length} exercícios</a></p>
  </section>
  </main>
` + footer(`${SAFETY} O Kilo é uma ferramenta de registro e não substitui orientação de um profissional de educação física ou de um médico.`);
}

function exerciseIndex() {
  const groups = [...muscles.values()].filter(g => g.exercises.length);
  return head({
    title: 'Como fazer os exercícios da academia · Kilo',
    description: `Como fazer ${exercises.length} exercícios de academia, por grupo muscular: peito, costas, ombros, braços, pernas, glúteos, abdômen e cardio, cada um com uma dica curta.`,
    url: `/${EXERCISES}/`,
  })
    + crumbs([['Kilo', '/'], ['Exercícios', null]])
    + `  <main>
  <h1>Como fazer os exercícios</h1>
  <p class="sub">Os ${exercises.length} exercícios que vêm no Kilo, por grupo muscular, cada um com uma dica curta de execução. Toque em um exercício para ver a dica.</p>
  <ul class="jump" aria-label="Grupos musculares">${groups.map(g => `<li><a href="#${g.slug}">${escape(g.label)}</a></li>`).join('')}</ul>
${exerciseCard('Cada exercício desta lista já vem no app, com a sua dica.')}
${groups.map(g => `  <section class="group" id="${g.slug}" aria-labelledby="h-${g.slug}">
    <h2 id="h-${g.slug}">${escape(g.label)}</h2>
    <ul class="list">${alphabetical(g.exercises).map(exerciseRow).join('')}</ul>
  </section>
`).join('')}  </main>
` + footer(`${SAFETY} O Kilo é uma ferramenta de registro e não substitui orientação de um profissional de educação física ou de um médico.`);
}

// ---- Writing ----

function writeFolder(dir, pages) {
  const out = path.join(ROOT, dir);
  fs.rmSync(out, { recursive: true, force: true });
  for (const [rel, html] of pages) {
    fs.mkdirSync(path.join(out, rel), { recursive: true });
    fs.writeFileSync(path.join(out, rel, 'index.html'), html);
  }
}
writeFolder(FOODS, [['', foodIndex()], ...foods.map(food => [food.slug, foodPage(food)])]);
writeFolder(EXERCISES, [['', exerciseIndex()], ...exercises.map(exercise => [exercise.pageSlug, exercisePage(exercise)])]);

// Each folder's part of the sitemap sits between two marker comments; everything else in it is hand-written.
const sitemapFile = path.join(ROOT, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapFile, 'utf8');
for (const [dir, urls] of [[FOODS, foods.map(f => f.url)], [EXERCISES, exercises.map(e => e.url)]]) {
  const START = `  <!-- ${dir}: written by tools/build-pages.mjs -->`, END = `  <!-- /${dir} -->`;
  const marks = [sitemap.split(START).length - 1, sitemap.split(END).length - 1];
  if (marks.join() !== '0,0' && marks.join() !== '1,1') throw new Error(`sitemap.xml has ${marks[0]} start and ${marks[1]} end markers for /${dir}/; fix it by hand`);
  const block = [START, ...[`/${dir}/`, ...urls].map(url => `  <url><loc>${SITE}${url}</loc></url>`), END].join('\n');
  sitemap = sitemap.includes(START)
    ? sitemap.slice(0, sitemap.indexOf(START)) + block + sitemap.slice(sitemap.indexOf(END) + END.length)
    : sitemap.replace('</urlset>', block + '\n</urlset>');
}
fs.writeFileSync(sitemapFile, sitemap);
console.log(`wrote /${FOODS}/ with ${foods.length} food pages and /${EXERCISES}/ with ${exercises.length} exercise pages; sitemap updated`);
