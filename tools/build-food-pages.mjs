// Builds the TACO food pages from data/taco.json (see tools/copy-taco-data.mjs): /alimentos/ lists every food by category,
// and /alimentos/<food>/ shows one food's calories and macros per 100 g, the table's credit line and the waitlist box tagged
// seo-food. It also rewrites the food part of sitemap.xml. Rerun it after copying new data; it replaces the whole /alimentos/.
//
//   node tools/build-food-pages.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://kiloapp.com.br';
const DIR = 'alimentos';
const TAG = 'seo-food';
// The TACO terms (p. ii of the 4th edition) allow reproducing it "desde que seja citada a fonte"; this is that citation,
// as the book's own catalogue entry gives it.
const CREDIT = 'Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição revisada e ampliada. NEPA–UNICAMP, Campinas, 2011';
const TACO_URL = 'https://www.nepa.unicamp.br/arquivo/uploads/taco-4-edicao-ampliada-e-revisada/taco_4_edicao_ampliada_e_revisada/';
const MACROS = [['protein', 'Proteína'], ['carbs', 'Carboidrato'], ['fat', 'Gordura']];
const RELATED = 8;

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/taco.json'), 'utf8'));

const escape = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const grams = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const kcal = n => n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
/**
 * The table's name as people say it, for headings, titles and addresses: "Arroz, integral, cozido" is "Arroz integral
 * cozido", "Coco, água de" is "Água de coco", and the table's footnote marks ("Cerveja, pilsen 2") are dropped.
 */
function plain(name) {
  let parts = name.split(/\s*,\s*/);
  if (parts.length === 2 && / de$/.test(parts[1])) parts = [parts[1], parts[0].toLowerCase()];
  const text = parts.join(' ').replace(/\s+/g, ' ').replace(/(?<!tipo) \d$/, '').trim();
  return text[0].toUpperCase() + text.slice(1);
}
const slugOf = name => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/%/g, ' por cento ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const categories = new Map(data.categories.map(c => [c.id, { ...c, slug: slugOf(c.name), foods: [] }]));
const used = new Set();
const foods = data.foods.map(food => {
  const name = plain(food.name);
  let slug = slugOf(name);
  if (used.has(slug)) slug += '-' + food.id;
  used.add(slug);
  const page = { ...food, slug, plain: name, url: `/${DIR}/${slug}/` };
  categories.get(food.category).foods.push(page);
  return page;
});

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
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/assets/pages.css">
</head>
<body>
<div class="wrap">
  <header class="top"><a class="brand" href="/"><span class="mark" aria-hidden="true">K</span>Kilo</a></header>
`;
}

const joinCard = lead => `  <section class="join-card" aria-labelledby="join-title">
    <h2 id="join-title">O Kilo registra isso com um toque</h2>
    <p>${lead} A Tabela TACO já vem dentro do app, e a busca funciona sem internet.</p>
    <a class="cta" href="/?origem=${TAG}">Entrar na lista de espera</a>
    <p class="small">Grátis, sem anúncios. Primeiro no iPhone.</p>
  </section>
`;

const footer = `  <footer>
    <a href="/">Página inicial do Kilo</a>
    <a href="/${DIR}/">Todos os alimentos</a>
    <a href="mailto:contato@kiloapp.com.br">contato@kiloapp.com.br</a>
    <p class="note">O Kilo é uma ferramenta de registro e não substitui orientação médica ou de um nutricionista.</p>
  </footer>
</div>
</body>
</html>
`;

const crumbs = items => `  <nav class="crumbs" aria-label="Você está em"><ol>${items.map(([label, href]) => `<li>${href ? `<a href="${href}">${escape(label)}</a>` : `<span aria-current="page">${escape(label)}</span>`}</li>`).join('')}</ol></nav>
`;

const row = food => `<li><a href="${food.url}"><b>${escape(food.plain)}</b><span>${kcal(food.kcal)} kcal</span></a></li>`;

const NA_WORDS = { protein: 'a proteína', carbs: 'o carboidrato', fat: 'a gordura' };
function foodPage(food) {
  const category = categories.get(food.category);
  const p = food.plain;
  const title = `${p}: calorias e macros em 100 g · Kilo`;
  const description = `${p} tem ${kcal(food.kcal)} kcal em 100 g, com ${grams(food.protein)} g de proteína, ${grams(food.carbs)} g de carboidrato e ${grams(food.fat)} g de gordura, segundo a Tabela TACO.`;
  const at = category.foods.indexOf(food);
  // The nearest foods in the table's own order: usually the same food cooked another way, then its neighbours.
  const related = category.foods.filter(f => f !== food).sort((a, b) => Math.abs(category.foods.indexOf(a) - at) - Math.abs(category.foods.indexOf(b) - at)).slice(0, RELATED)
    .sort((a, b) => a.id - b.id);
  const na = food.notApplicable ?? [];
  const naNote = na.length ? `    <p class="na">A TACO marca ${na.map(k => NA_WORDS[k]).join(na.length > 2 ? ', ' : ' e ').replace(/, ([^,]*)$/, ' e $1')} deste alimento como “não se aplica”; aqui ${na.length > 1 ? 'aparecem' : 'aparece'} como 0, como no app.</p>\n` : '';
  return head({ title, description, url: food.url })
    + crumbs([['Kilo', '/'], ['Alimentos', `/${DIR}/`], [category.name, `/${DIR}/#${category.slug}`]])
    + `  <main>
  <h1>${escape(p)}</h1>
  <p class="sub">Calorias e macronutrientes em 100 g, pela Tabela TACO (nome na tabela: “${escape(food.name)}”).</p>
  <section class="facts" aria-label="Valores em 100 g">
    <p class="kcal"><strong data-kcal>${kcal(food.kcal)}</strong> <span>kcal em 100 g</span></p>
    <table class="macros">
${MACROS.map(([key, label]) => `      <tr><th scope="row">${label}</th><td data-${key}>${grams(food[key])} g</td></tr>`).join('\n')}
    </table>
${naNote}  </section>
  <p class="source">Fonte: <a href="${TACO_URL}">${CREDIT}</a>. Valores por 100 g da parte comestível.</p>
${joinCard(`No Kilo, você busca “${escape(p.toLowerCase())}”, escolhe quantos gramas comeu, e as calorias e os macros entram no seu dia.`)}
  <section class="more" aria-labelledby="more-title">
    <h2 id="more-title">Mais em ${escape(category.name)}</h2>
    <ul class="list">${related.map(row).join('')}</ul>
    <p><a href="/${DIR}/">Ver todos os ${foods.length} alimentos</a></p>
  </section>
  </main>
` + footer;
}

function indexPage() {
  const groups = [...categories.values()].filter(c => c.foods.length);
  return head({
    title: 'Calorias dos alimentos: Tabela TACO completa · Kilo',
    description: `Calorias, proteína, carboidrato e gordura em 100 g dos ${foods.length} alimentos da Tabela TACO (NEPA–Unicamp), por categoria: arroz, feijão, frutas, carnes e mais.`,
    url: `/${DIR}/`,
  })
    + crumbs([['Kilo', '/'], ['Alimentos', null]])
    + `  <main>
  <h1>Calorias dos alimentos</h1>
  <p class="sub">Os ${foods.length} alimentos da Tabela TACO, com calorias, proteína, carboidrato e gordura em 100 g. Toque em um alimento para ver tudo.</p>
  <ul class="jump" aria-label="Categorias">${groups.map(c => `<li><a href="#${c.slug}">${escape(c.name)}</a></li>`).join('')}</ul>
${joinCard('No Kilo, você busca o alimento, escolhe quantos gramas comeu, e as calorias e os macros entram no seu dia.')}
${groups.map(c => `  <section class="group" id="${c.slug}" aria-labelledby="h-${c.slug}">
    <h2 id="h-${c.slug}">${escape(c.name)}</h2>
    <ul class="list">${c.foods.map(row).join('')}</ul>
  </section>
`).join('')}  <p class="source">Fonte: <a href="${TACO_URL}">${CREDIT}</a>. Valores por 100 g da parte comestível.</p>
  </main>
` + footer;
}

const out = path.join(ROOT, DIR);
fs.rmSync(out, { recursive: true, force: true });
const write = (rel, html) => { fs.mkdirSync(path.join(out, rel), { recursive: true }); fs.writeFileSync(path.join(out, rel, 'index.html'), html); };
write('', indexPage());
foods.forEach(food => write(food.slug, foodPage(food)));

// The sitemap's food part sits between two marker comments; everything else in it is hand-written.
const START = '  <!-- alimentos: written by tools/build-food-pages.mjs -->', END = '  <!-- /alimentos -->';
const sitemapFile = path.join(ROOT, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapFile, 'utf8');
const block = [START, ...[`/${DIR}/`, ...foods.map(f => f.url)].map(url => `  <url><loc>${SITE}${url}</loc></url>`), END].join('\n');
sitemap = sitemap.includes(START)
  ? sitemap.slice(0, sitemap.indexOf(START)) + block + sitemap.slice(sitemap.indexOf(END) + END.length)
  : sitemap.replace('</urlset>', block + '\n</urlset>');
fs.writeFileSync(sitemapFile, sitemap);
console.log(`wrote /${DIR}/ and ${foods.length} food pages; sitemap has ${foods.length + 1} food addresses`);
