// The site check: serves this folder on localhost, opens it in headless Chromium the way visitors do, and checks what they see
// and what the waitlist form sends. The waitlist server is never called: its address answers with a fake reply, and any other
// request that leaves localhost fails the run.
//
//   node tests/check.mjs            (Playwright from the repo or the global npm root, as cloud containers have it)
//
// Prints one line per check and ends with `CHECK OK` (exit 0) or `CHECK FAILED` (exit 1).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WAITLIST = 'https://phxtuwyynocsxgeflajz.supabase.co/rest/v1/rpc/';

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try { return require('playwright'); } catch { return require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); }
}

const TYPES = { '.webm': 'video/webm', '.mp4': 'video/mp4', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' };

/** GitHub Pages' rules that matter here: a folder serves its index.html, and a folder without a trailing slash redirects to one. */
function serve() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let file = path.join(ROOT, decodeURIComponent(url.pathname));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!url.pathname.endsWith('/')) { res.writeHead(301, { location: url.pathname + '/' + url.search }).end(); return; }
      file = path.join(file, 'index.html');
    }
    if (!fs.existsSync(file)) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const SHORT_LINKS = { ig: 'ig-kiloapp', elas: 'ig-elas', treino: 'ig-treino', tt: 'tt-kiloapp', ttelas: 'tt-elas', tttreino: 'tt-treino', ian: 'ig-ian' };
const PHONE = { width: 390, height: 844 };

const server = await serve();
const base = `http://127.0.0.1:${server.address().port}`;
const { chromium } = loadPlaywright();
const browser = await chromium.launch();
const TIMEOUT = 5000;
const results = [];

/**
 * A fresh visitor: phone-sized unless told otherwise, with the waitlist faked. `reply` is what the join call answers;
 * `sent` collects every join call's body and `leaks` every request that tried to leave localhost.
 */
async function visitor({ viewport = PHONE, reply = { ok: true }, reducedMotion = 'no-preference', colorScheme = 'light', javaScriptEnabled = true } = {}) {
  const context = await browser.newContext({ viewport, reducedMotion, colorScheme, javaScriptEnabled, serviceWorkers: 'block' });
  const sent = [], leaks = [];
  await context.route('**/*', route => {
    const url = route.request().url();
    if (url.startsWith(base)) return route.continue();
    if (url === WAITLIST + 'join_waitlist') {
      sent.push(JSON.parse(route.request().postData() || '{}'));
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(typeof reply === 'function' ? reply() : reply) });
    }
    leaks.push(url);
    return route.abort();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  return { page, sent, leaks, close: () => context.close() };
}

async function check(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, ok: true });
    console.log(`PASS  ${name}${detail ? ` (${detail})` : ''}`);
  } catch (error) {
    results.push({ name, ok: false });
    console.log(`FAIL  ${name}: ${String(error.message).split('\n')[0]}`);
  }
}

function expect(condition, message) { if (!condition) throw new Error(message); }

/** True when the element's top edge is inside the first screen. */
async function inFirstScreen(locator, page) {
  const box = await locator.boundingBox();
  return !!box && box.y < page.viewportSize().height && box.y + box.height > 0;
}

async function join(page, email, box = 0) {
  const form = page.locator('form.join-form').nth(box);
  await form.getByLabel(/e-mail|email/i).fill(email);
  await form.getByRole('button', { name: /Entrar na lista de espera|Join the waitlist/ }).click();
}

await check('main page shows the headline, the phone and the email box in the first screen on a phone', async () => {
  const v = await visitor();
  await v.page.goto(base + '/');
  const h1 = v.page.getByRole('heading', { level: 1 });
  expect((await h1.innerText()).includes('O app de treino e dieta que aprende com você'), `headline reads "${await h1.innerText()}"`);
  expect(await inFirstScreen(h1, v.page), 'headline is below the first screen');
  expect(await inFirstScreen(v.page.locator('form.join-form').first().getByLabel(/e-mail/i), v.page), 'email box is below the first screen');
  // The "Aceitar sugestão" button sits 28% of the way down the phone picture (its screen is scrolled to the exercise); that row, not just the phone's top edge, must show.
  const shot = await v.page.getByRole('img', { name: /Aceitar sugestão/ }).boundingBox();
  const buttonRow = shot && shot.y + shot.height * 0.28;
  expect(buttonRow && buttonRow < PHONE.height, `the Aceitar sugestão row in the screenshot is at ${Math.round(buttonRow)}px, below the first screen`);
  expect((await v.page.locator('form.join-form').count()) === 2, 'expected an email box in the hero and one in the closing block');
  expect(v.leaks.length === 0, `requests left localhost: ${v.leaks.join(', ')}`);
  await v.close();
});

// The database records that people agreed to exactly this wording (consent version 2026-10-20), so it must never drift.
const CONSENT = {
  pt: { consent: 'Só vamos mandar e-mail sobre o lançamento do Kilo. Você pode sair da lista quando quiser.', button: 'Entrar na lista de espera' },
  en: { consent: 'We will only email you about the Kilo launch. You can leave the list at any time.', button: 'Join the waitlist' },
};

await check('both boxes show the recorded consent wording and button label, in Portuguese and English', async () => {
  for (const lang of ['pt', 'en']) {
    const v = await visitor();
    await v.page.goto(base + (lang === 'en' ? '/?lang=en' : '/'));
    for (let i = 0; i < 2; i++) {
      const form = v.page.locator('form.join-form').nth(i);
      const consent = (await form.locator('.consent').innerText()).replace(/\s+/g, ' ');
      expect(consent.startsWith(CONSENT[lang].consent), `${lang} box ${i + 1} consent reads "${consent}"`);
      expect((await form.locator('button.join').innerText()).trim() === CONSENT[lang].button, `${lang} box ${i + 1} button reads "${await form.locator('button.join').innerText()}"`);
    }
    await v.close();
  }
});

await check('joining from the hero box sends the email, no tag and Portuguese, and says Pronto', async () => {
  const v = await visitor();
  await v.page.goto(base + '/');
  await join(v.page, 'ana@exemplo.com');
  await v.page.getByText('Pronto!').first().waitFor({ timeout: 4000 });
  expect(v.sent.length === 1, `expected one join call, saw ${v.sent.length}`);
  const body = v.sent[0];
  expect(body.p_email === 'ana@exemplo.com' && body.p_origem === null && body.p_lang === 'pt' && body.p_website === '', `sent ${JSON.stringify(body)}`);
  await v.close();
});

await check('a join answer with a place in line says "Você é o nº X da fila", in both languages', async () => {
  const v = await visitor({ reply: { ok: true, position: 1234 } });
  await v.page.goto(base + '/');
  await join(v.page, 'fila@exemplo.com');
  await v.page.getByText('Você é o nº 1.234 da fila').first().waitFor({ timeout: 4000 })
    .catch(() => { throw new Error('no place in line after joining'); });
  expect(await v.page.locator('.join-done h2', { hasText: 'Pronto' }).count() === 0, 'Pronto still shows next to the place');
  expect(await v.page.locator('.join-done:not([hidden]) img.gorilla').count() === 2, 'no cheering gorilla with the place');
  await v.page.getByRole('button', { name: 'English' }).click();
  await v.page.getByText("You're number 1,234 in line").first().waitFor({ timeout: 2000 })
    .catch(() => { throw new Error('the place in line is not in English'); });
  await v.close();
  // Switched to English first, and back to Portuguese after.
  const e = await visitor({ reply: { ok: true, position: 1234 } });
  await e.page.goto(base + '/');
  await e.page.getByRole('button', { name: 'English' }).click();
  await join(e.page, 'fila@exemplo.com');
  await e.page.getByText("You're number 1,234 in line").first().waitFor({ timeout: 4000 })
    .catch(() => { throw new Error('no place in line when joining in English'); });
  await e.page.getByRole('button', { name: 'Português' }).click();
  await e.page.getByText('Você é o nº 1.234 da fila').first().waitFor({ timeout: 2000 })
    .catch(() => { throw new Error('the place in line does not switch back to Portuguese'); });
  await e.close();
  // Anything but a whole number from 1 up shows the plain Pronto (the answer before the server change, or a broken one).
  for (const position of [undefined, 0, -3, 2.5, '12', null, 1e12]) {
    const w = await visitor({ reply: { ok: true, position } });
    await w.page.goto(base + '/');
    await join(w.page, 'fila@exemplo.com');
    await w.page.getByText('Pronto!').first().waitFor({ timeout: 4000 })
      .catch(() => { throw new Error(`position ${JSON.stringify(position)} does not show Pronto`); });
    await w.close();
  }
});

await check('joining from the closing box works the same way and hides both forms', async () => {
  const v = await visitor();
  await v.page.goto(base + '/?origem=ig-treino');
  await join(v.page, 'bia@exemplo.com', 1);
  await v.page.getByText('Pronto!').first().waitFor({ timeout: 4000 });
  expect(v.sent[0]?.p_origem === 'ig-treino', `sent ${JSON.stringify(v.sent[0])}`);
  expect((await v.page.locator('form.join-form:visible').count()) === 0, 'a form is still showing after joining');
  await v.close();
});

await check('a malformed email shows the fix-it message and sends nothing', async () => {
  const v = await visitor();
  await v.page.goto(base + '/');
  await join(v.page, 'ana@exemplo');
  await v.page.getByText('Confira o e-mail. Parece que falta alguma coisa.').first().waitFor({ timeout: 3000 });
  expect(v.sent.length === 0, 'a join call was sent for a malformed email');
  await v.close();
});

await check('server answers show the same messages as the waitlist page (invalid, busy, failed)', async () => {
  const replies = [{ error: 'invalid-email' }, { error: 'busy' }, {}];
  const texts = ['Confira o e-mail. Parece que falta alguma coisa.', 'Muita gente entrando agora. Tente de novo em alguns minutos.', 'Não deu para enviar. Confira sua internet e tente de novo.'];
  for (let i = 0; i < replies.length; i++) {
    const v = await visitor({ reply: replies[i] });
    await v.page.goto(base + '/');
    await join(v.page, 'ana@exemplo.com');
    await v.page.getByText(texts[i]).first().waitFor({ timeout: 3000 });
    await v.close();
  }
});

await check('each short link opens the main page with its tag, and a join carries it', async () => {
  for (const [link, tag] of Object.entries(SHORT_LINKS)) {
    const v = await visitor();
    await v.page.goto(base + '/' + link);
    await v.page.waitForURL(u => u.pathname === '/' && u.searchParams.get('origem') === tag, { timeout: 4000 })
      .catch(() => { throw new Error(`/${link} ended at ${v.page.url()}`); });
    await join(v.page, 'ana@exemplo.com');
    await v.page.getByText('Pronto!').first().waitFor({ timeout: 4000 });
    expect(v.sent[0]?.p_origem === tag, `/${link} joined with tag ${v.sent[0]?.p_origem}`);
    await v.close();
  }
  return '7 links';
});

await check('old /lista links forward to the main page keeping their query', async () => {
  for (const [from, query] of [['/lista', ''], ['/lista/', ''], ['/lista/?origem=ig-elas', '?origem=ig-elas'], ['/lista/?origem=tt-treino&lang=en', '?origem=tt-treino&lang=en']]) {
    const v = await visitor();
    await v.page.goto(base + from);
    await v.page.waitForURL(u => u.pathname === '/' && u.search === query, { timeout: 4000 })
      .catch(() => { throw new Error(`${from} ended at ${v.page.url()}`); });
    await v.close();
  }
});

await check('?lang=en and the English switch show the page in English, and a join sends en', async () => {
  const v = await visitor();
  await v.page.goto(base + '/?lang=en');
  expect((await v.page.getByRole('heading', { level: 1 }).innerText()).includes('learns from you'), 'headline is not English with ?lang=en');
  expect((await v.page.locator('html').getAttribute('lang')) === 'en', 'html lang is not en');
  await join(v.page, 'ana@example.com');
  await v.page.getByText('Done!').first().waitFor({ timeout: 4000 });
  expect(v.sent[0]?.p_lang === 'en', `sent lang ${v.sent[0]?.p_lang}`);
  await v.close();
  const w = await visitor();
  await w.page.goto(base + '/');
  await w.page.getByRole('button', { name: 'English' }).click();
  expect((await w.page.getByRole('heading', { level: 1 }).innerText()).includes('learns from you'), 'switch did not change the headline');
  for (const text of ['Be one of the first to use Kilo.', 'Waitlist privacy', 'Your email']) {
    expect((await w.page.getByText(text, { exact: true }).count()) > 0, `"${text}" missing after switching to English`);
  }
  await w.page.getByRole('button', { name: 'Português' }).click();
  // An error on screen is translated, not dropped, when the language changes.
  await join(w.page, 'ana@exemplo');
  await w.page.getByText('Confira o e-mail. Parece que falta alguma coisa.').first().waitFor();
  await w.page.getByRole('button', { name: 'English' }).click();
  await w.page.getByText('Check the email. It looks like something is missing.').first().waitFor();
  await w.page.getByRole('button', { name: 'Português' }).click();
  expect((await w.page.getByRole('heading', { level: 1 }).innerText()).includes('aprende com você'), 'switch did not change back');
  await w.close();
});

await check('"O Kilo aprende com você" explains the three things Kilo learns', async () => {
  const v = await visitor();
  await v.page.goto(base + '/');
  const section = v.page.locator('section#aprende');
  await section.getByRole('heading', { level: 2, name: 'O Kilo aprende com você' }).waitFor();
  const titles = await section.getByRole('heading', { level: 3 }).allInnerTexts();
  expect(JSON.stringify(titles) === JSON.stringify(['A carga da próxima série', 'Seu gasto diário real', 'Check-in semanal']), `blocks read ${JSON.stringify(titles)}`);
  await v.close();
});

await check('Treino, Alimentação and Meta e peso each show a loaded app screenshot and two lines', async () => {
  const v = await visitor();
  await v.page.goto(base + '/');
  const cards = v.page.locator('section#telas figure');
  expect((await cards.count()) === 3, `expected 3 screens, saw ${await cards.count()}`);
  const names = [];
  for (let i = 0; i < 3; i++) {
    const card = cards.nth(i);
    await card.scrollIntoViewIfNeeded();
    const img = card.locator('img');
    await v.page.waitForFunction(el => el.complete && el.naturalWidth > 0, await img.elementHandle(), { timeout: TIMEOUT })
      .catch(() => { throw new Error(`screen ${i + 1} image did not load`); });
    expect(((await img.getAttribute('alt')) || '').length > 20, `screen ${i + 1} has no real alt text`);
    names.push((await card.getByRole('heading', { level: 3 }).innerText()).trim());
    expect((await card.locator('p').count()) === 2, `screen ${i + 1} should have two lines`);
  }
  expect(JSON.stringify(names) === JSON.stringify(['Treino', 'Alimentação', 'Meta e peso']), `screens read ${JSON.stringify(names)}`);
  expect(v.leaks.length === 0, `requests left localhost: ${v.leaks.join(', ')}`);
  await v.close();
});

await check('six extras, the privacy promise and the six-question FAQ are on the page', async () => {
  const v = await visitor();
  await v.page.goto(base + '/');
  expect((await v.page.locator('section#extras li').count()) === 6, `expected 6 extras, saw ${await v.page.locator('section#extras li').count()}`);
  await v.page.getByRole('heading', { name: 'Sem anúncios, sem rastreamento' }).waitFor();
  const questions = v.page.locator('section#perguntas summary');
  expect((await questions.count()) === 6, `expected 6 questions, saw ${await questions.count()}`);
  const android = v.page.locator('section#perguntas details', { hasText: 'Tem para Android?' });
  const answer = android.locator('p');
  expect(!(await answer.isVisible()), 'answers should start closed');
  await android.locator('summary').click();
  expect((await answer.innerText()).trim() === 'Primeiro no iPhone. O Android vem depois: entre na lista e avisamos.', `Android answer reads "${await answer.innerText()}"`);
  await v.close();
});

// The page's words as site.js holds them, so the checks compare the page with the table instead of trusting it.
const TEXT = (() => {
  const js = fs.readFileSync(path.join(ROOT, 'assets/site.js'), 'utf8');
  const start = js.indexOf('var TEXT = ') + 'var TEXT = '.length;
  return Function(`return ${js.slice(start, js.indexOf('\n  };', start) + 4)}`)();
})();

await check('every text and image description shows its own words in Portuguese and in English', async () => {
  const v = await visitor();
  await v.page.goto(base + '/');
  const read = () => v.page.evaluate(() => ({
    texts: [...document.querySelectorAll('[data-t]')].map(el => [el.getAttribute('data-t'), el.textContent]),
    alts: [...document.querySelectorAll('[data-t-alt]')].map(el => [el.getAttribute('data-t-alt'), el.getAttribute('alt')]),
    labels: [...document.querySelectorAll('[data-t-aria]')].map(el => [el.getAttribute('data-t-aria'), el.getAttribute('aria-label')]),
  }));
  const seen = {};
  for (const lang of ['pt', 'en']) {
    if (lang === 'en') await v.page.getByRole('button', { name: 'English' }).click();
    const { texts, alts, labels } = await read();
    expect(labels.length > 0, 'no translated button labels found');
    for (const [key, text] of [...texts, ...alts, ...labels]) {
      expect(typeof TEXT[lang][key] === 'string' && TEXT[lang][key].trim() !== '', `${lang} has no words for "${key}"`);
      expect(text === TEXT[lang][key], `${lang} "${key}" shows "${text}"`);
    }
    seen[lang] = new Map([...texts, ...alts, ...labels]);
  }
  const untranslated = [...seen.pt].filter(([key, text]) => seen.en.get(key) === text).map(([key]) => key);
  expect(untranslated.length === 0, `same words in both languages: ${untranslated.join(', ')}`);
  expect(seen.pt.size >= 60, `expected the whole page to use the text table, saw ${seen.pt.size} keys`);
  await v.close();
  return `${seen.pt.size} keys`;
});

await check('the app screens below the hero are whole phone pictures that load, each with its own description', async () => {
  const v = await visitor();
  await v.page.goto(base + '/');
  const shots = v.page.locator('#telas img.phone-shot');
  expect((await shots.count()) === 3, `expected 3 phone pictures, found ${await shots.count()}`);
  for (const shot of await shots.all()) {
    await shot.scrollIntoViewIfNeeded();
    await v.page.waitForFunction(el => el.complete && el.naturalWidth > 0, await shot.elementHandle(), { timeout: TIMEOUT })
      .catch(async () => { throw new Error(`${await shot.getAttribute('src')} did not load`); });
    expect(((await shot.getAttribute('alt')) || '').length > 20, `${await shot.getAttribute('src')} has no real description`);
  }
  await v.close();
});

await check('the price block sits after the privacy promise, in both languages, with sources and no brand names', async () => {
  const v = await visitor();
  await v.page.goto(base + '/');
  const order = await v.page.evaluate(() => [...document.querySelectorAll('main > section')].map(el => el.id || el.className));
  const at = order.indexOf('precos');
  expect(at > 0 && order[at - 1] === 'privacidade', `sections run ${order.join(' > ')}`);
  const block = v.page.locator('section#precos');
  // Apps and companies behind the prices (the sources in the comment) and the apps Kilo is usually compared with.
  const BRANDS = ['MacroFactor', 'Carbon', 'Fitbod', 'Alpha Progression', 'Cronoshare', 'Plusdin', 'Liftoff', 'Tracked', 'MyFitnessPal'];
  for (const [lang, title] of [['pt', 'Quanto custaria tudo isso?'], ['en', 'What would all this cost?']]) {
    if (lang === 'en') await v.page.getByRole('button', { name: 'English' }).click();
    await block.getByRole('heading', { level: 2, name: title }).waitFor();
    expect((await block.locator('li').count()) === 4, `${lang}: expected 3 prices and Kilo`);
    expect((await block.locator('li.kilo').innerText()).includes('R$ 0'), `${lang}: Kilo's price is not R$ 0`);
    const page = (await v.page.locator('body').innerText()).toLowerCase();
    const named = BRANDS.filter(name => page.includes(name.toLowerCase()));
    expect(named.length === 0, `${lang}: brand names on the page: ${named.join(', ')}`);
  }
  // Every source line in the comment beside the block has its link and check date, and each shown number is in the notes.
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const section = html.slice(html.indexOf('<section class="band prices"'), html.indexOf('</section>', html.indexOf('<section class="band prices"')));
  const notes = section.slice(section.indexOf('<!--'), section.indexOf('-->'));
  const lines = notes.split('\n').filter(line => line.trim().startsWith('- '));
  expect(lines.length >= 3, `expected a source line per price, saw ${lines.length}`);
  for (const line of lines) expect(/\| https:\/\/\S+ \| checked \d{4}-\d{2}-\d{2}/.test(line), `source line without link or date: ${line.trim()}`);
  expect(!/apps\.apple\.com\/br\/app\/(?!id\d)/.test(notes), 'an App Store link carries the app name (use /app/id<number>)');
  for (const figure of ['199,90', '399,90', '599,90', 'R$ 600 to R$ 1.800']) expect(notes.includes(figure), `the notes do not back ${figure}`);
  await v.close();
});

await check('the gorilla is in the hero, by the learn blocks and at the closing box, and each one moves', async () => {
  const v = await visitor();
  await v.page.goto(base + '/');
  for (const spot of ['.hero .phone-stage', '#aprende', '.closing-text']) {
    const gorilla = v.page.locator(`${spot} img.gorilla`).first();
    // A moving element never counts as stable for Playwright's own scrolling, so scroll it in directly.
    await gorilla.evaluate(el => el.scrollIntoView({ block: 'center' }));
    expect(await gorilla.isVisible(), `no gorilla showing in ${spot}`);
    await v.page.waitForFunction(el => el.complete && el.naturalWidth > 0, await gorilla.elementHandle(), { timeout: TIMEOUT })
      .catch(() => { throw new Error(`the ${spot} gorilla image did not load`); });
    expect(((await gorilla.getAttribute('alt')) || '').length > 10, `the ${spot} gorilla has no alt text`);
    await v.page.waitForFunction(el => getComputedStyle(el).animationName !== 'none', await gorilla.elementHandle(), { timeout: TIMEOUT })
      .catch(() => { throw new Error(`the ${spot} gorilla just stands there`); });
    // He moves for a few seconds, then rests: no endless motion next to the form (WCAG 2.2.2).
    const rounds = await gorilla.evaluate(el => getComputedStyle(el).animationIterationCount);
    expect(rounds !== 'infinite', `the ${spot} gorilla never stops moving`);
  }
  await v.close();
});

await check('the cheering gorilla shows next to Pronto after a successful join', async () => {
  const v = await visitor();
  await v.page.goto(base + '/');
  const cheer = v.page.locator('.join-done img.gorilla').first();
  expect(!(await cheer.isVisible()), 'the cheering gorilla shows before anyone joined');
  await join(v.page, 'ana@exemplo.com');
  await v.page.getByText('Pronto!').first().waitFor({ timeout: 4000 });
  await cheer.waitFor({ state: 'visible', timeout: 3000 }).catch(() => { throw new Error('no cheering gorilla after joining'); });
  await v.page.waitForFunction(el => getComputedStyle(el).animationName !== 'none', await cheer.elementHandle(), { timeout: TIMEOUT })
    .catch(() => { throw new Error('the cheering gorilla does not move'); });
  expect((await v.page.locator('.join-done img.gorilla:visible').count()) === 2, 'the closing box has no cheering gorilla after joining');
  // A screen reader lands on the success box: it must hear "Pronto!" first, not the picture.
  const first = await v.page.locator('.join-done').first().evaluate(el => el.firstElementChild.tagName);
  expect(first === 'H2', `the success box starts with a ${first}, not the Pronto heading`);
  await v.close();
});

await check('with reduce motion on, the gorillas hold still', async () => {
  const v = await visitor({ reducedMotion: 'reduce' });
  await v.page.goto(base + '/');
  // Bring each page gorilla into view so its move is asked for, then check it still holds still.
  for (const el of await v.page.locator('img.gorilla:visible').all()) {
    await el.evaluate(node => node.scrollIntoView({ block: 'center' }));
    await v.page.waitForFunction(node => node.classList.contains('play'), await el.elementHandle(), { timeout: TIMEOUT });
    const name = await el.evaluate(node => getComputedStyle(node).animationName);
    expect(name === 'none', `a gorilla in view still plays ${name}`);
  }
  const names = await v.page.locator('img.gorilla').evaluateAll(els => els.map(el => getComputedStyle(el).animationName));
  expect(names.length >= 5, `expected the 3 page gorillas and 2 cheering ones, saw ${names.length}`);
  expect(names.every(n => n === 'none'), `some gorillas still move: ${names.join(', ')}`);
  await v.close();
});

await check('on the smallest phones the hero gorilla stays on screen and off the email box', async () => {
  const v = await visitor({ viewport: { width: 320, height: 640 } });
  await v.page.goto(base + '/');
  const g = await v.page.locator('.gorilla.wave').boundingBox();
  const form = await v.page.locator('.hero .join-box').boundingBox();
  expect(g.x >= 0 && g.x + g.width <= 320, `the gorilla runs from ${Math.round(g.x)}px to ${Math.round(g.x + g.width)}px on a 320px screen`);
  expect(g.y >= form.y + form.height, 'the gorilla overlaps the email box');
  await v.close();
});

await check('the hero phone turns from its back to its front once it is on screen, then rests as the still picture', async () => {
  const v = await visitor();
  // Records every change to the phone box, so a turn that ends early (an error, a stall) shows as too short.
  await v.page.addInitScript(() => {
    window.turnLog = [];
    // Watches the whole document from the first byte: the turn can start before DOMContentLoaded.
    new MutationObserver(records => {
      const box = records.map(r => r.target).find(el => el.classList && el.classList.contains('phone-3d'));
      if (box) window.turnLog.push({ t: performance.now(), cls: box.className, first: !!box.querySelector('.phone-first'), canvas: !!box.querySelector('.phone-anim') });
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
  });
  await v.page.goto(base + '/');
  await v.page.waitForFunction(() => window.turnLog.some(e => e.cls.includes('turning')) && window.turnLog.at(-1).cls === 'phone-3d', null, { timeout: TIMEOUT })
    .catch(async () => { throw new Error(`the turn never ran to its end: ${JSON.stringify(await v.page.evaluate(() => window.turnLog))}`); });
  const log = await v.page.evaluate(() => window.turnLog);
  expect(log.some(e => e.cls.includes('waiting') && e.first), `the back of the phone did not stand in while the video loaded: ${JSON.stringify(log)}`);
  const from = log.find(e => e.cls.includes('turning') && e.canvas).t;
  const to = log.find(e => e.t > from && e.cls === 'phone-3d').t;
  expect(to - from > 1000, `the turn lasted ${Math.round(to - from)} ms; the video is 1.4 s, so it stopped early`);
  const still = await v.page.locator('.phone-3d .phone-still').evaluate(el => ({ opacity: getComputedStyle(el).opacity, left: el.parentNode.children.length }));
  expect(still.opacity === '1' && still.left === 1, `after the turn the box holds ${still.left} elements and the still's opacity is ${still.opacity}`);
  expect(v.leaks.length === 0, `requests left localhost: ${v.leaks.join(', ')}`);
  await v.close();
});

await check('sections slide in as they come into view', async () => {
  const v = await visitor();
  await v.page.goto(base + '/');
  const faq = v.page.locator('section#perguntas');
  expect(await faq.evaluate(el => el.classList.contains('reveal') && !el.classList.contains('in')), 'the FAQ is not waiting to slide in');
  await faq.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await v.page.waitForFunction(() => document.querySelector('section#perguntas').classList.contains('in'), null, { timeout: TIMEOUT })
    .catch(() => { throw new Error('the FAQ never slid in'); });
  await v.close();
});

await check('on a phone, the join bar shows once the hero email box is gone and hides by either email box', async () => {
  const v = await visitor();
  await v.page.goto(base + '/');
  const bar = v.page.locator('.join-bar');
  expect(!(await bar.isVisible()), 'the join bar shows next to the hero email box');
  await v.page.locator('section#telas').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
  await bar.waitFor({ state: 'visible', timeout: TIMEOUT }).catch(() => { throw new Error('no join bar after scrolling past the hero'); });
  await v.page.locator('#email-end').evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await bar.waitFor({ state: 'hidden', timeout: TIMEOUT }).catch(() => { throw new Error('the join bar stays over the closing email box'); });
  // It starts leaving a bar's height before the closing box arrives, so it is gone by the time the box is under it.
  await v.page.locator('section#telas').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
  await bar.waitFor({ state: 'visible', timeout: TIMEOUT });
  await v.page.evaluate(() => { const box = document.querySelector('#email-end').closest('[data-join]'); window.scrollBy({ top: box.getBoundingClientRect().top - innerHeight - 20, behavior: 'instant' }); });
  await v.page.waitForFunction(() => !document.querySelector('.join-bar').classList.contains('show'), null, { timeout: TIMEOUT })
    .catch(() => { throw new Error('the join bar is still coming up as the closing box arrives under it'); });
  // Keyboard focus never lands under the bar. (Wait for the bar to be fully up: one that is leaving still counts as visible.)
  await v.page.locator('section#telas').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
  await v.page.waitForFunction(() => document.querySelector('.join-bar').classList.contains('show'), null, { timeout: TIMEOUT });
  await v.page.waitForTimeout(400);
  await v.page.evaluate(() => {
    const summary = document.querySelector('#perguntas summary');
    window.scrollBy({ top: summary.getBoundingClientRect().top - innerHeight + 30, behavior: 'instant' });
    summary.focus();
  });
  // Let the focus scroll and the section's slide-in finish.
  await v.page.waitForFunction(() => new Promise(done => { const y = scrollY; setTimeout(() => done(scrollY === y), 300); }), null, { timeout: TIMEOUT });
  await v.page.waitForTimeout(700);
  const hidden = await v.page.evaluate(() => document.querySelector('#perguntas summary').getBoundingClientRect().bottom - document.querySelector('.join-bar').getBoundingClientRect().top);
  expect(hidden <= 0, `a focused question sits ${hidden}px under the join bar`);
  await v.page.locator('section#telas').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
  await bar.getByRole('button').click();
  await v.page.waitForFunction(() => document.activeElement && document.activeElement.id === 'email-end', null, { timeout: TIMEOUT })
    .catch(() => { throw new Error('tapping the bar does not put the cursor in the closing email box'); });
  await v.close();
});

await check('on a computer, the QR card slides in with the page tag, never covers an email box, and closes', async () => {
  const v = await visitor({ viewport: { width: 1440, height: 900 } });
  await v.page.goto(base + '/?origem=ig-treino');
  const card = v.page.locator('.qr-card');
  await card.waitFor({ state: 'visible', timeout: TIMEOUT }).catch(() => { throw new Error('no QR card on a wide screen'); });
  expect((await card.locator('img').getAttribute('src')).endsWith('/assets/qr/ig-treino.svg'), 'the QR code drops the page tag');
  expect(!(await v.page.locator('.join-bar').isVisible()), 'the phone join bar shows on a computer');
  const overlaps = async () => v.page.evaluate(() => {
    const c = document.querySelector('.qr-card');
    if (c.hidden || getComputedStyle(c).visibility === 'hidden') return false;
    const a = c.getBoundingClientRect();
    return [...document.querySelectorAll('[data-join]')].some(box => { const b = box.getBoundingClientRect(); return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; });
  });
  for (const y of [0, 0.5, 1]) {
    await v.page.evaluate(f => window.scrollTo({ top: f * document.documentElement.scrollHeight, behavior: 'instant' }), y);
    await v.page.waitForTimeout(400);
    expect(!(await overlaps()), `the QR card covers an email box at ${y * 100}% down the page`);
  }
  await v.page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await card.waitFor({ state: 'visible', timeout: TIMEOUT });
  await card.getByRole('button', { name: 'Fechar' }).focus();
  await v.page.keyboard.press('Enter');
  await card.waitFor({ state: 'hidden', timeout: TIMEOUT }).catch(() => { throw new Error('the QR card does not close'); });
  expect(await v.page.evaluate(() => document.activeElement !== document.body && document.activeElement !== null), 'closing the QR card drops keyboard focus');
  await v.close();
  const phone = await visitor();
  await phone.page.goto(base + '/');
  await phone.page.waitForTimeout(1500);
  expect(!(await phone.page.locator('.qr-card').isVisible()), 'the QR card shows on a phone');
  await phone.close();
});

await check('with reduce motion on, the phone is a still picture and nothing turns or slides', async () => {
  const v = await visitor({ reducedMotion: 'reduce' });
  await v.page.goto(base + '/');
  await v.page.waitForTimeout(300);
  const state = await v.page.evaluate(() => ({
    video: !!document.querySelector('.phone-3d .phone-anim') || document.querySelector('.phone-3d').className !== 'phone-3d',
    still: getComputedStyle(document.querySelector('.phone-3d .phone-still')).opacity,
    reveal: document.querySelectorAll('.reveal').length,
  }));
  expect(!state.video && state.still === '1', `the phone moves: ${JSON.stringify(state)}`);
  expect(state.reveal === 0, `${state.reveal} sections still slide in`);
  await v.page.locator('section#telas').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
  const bar = v.page.locator('.join-bar');
  await bar.waitFor({ state: 'visible', timeout: TIMEOUT });
  expect((await bar.evaluate(el => getComputedStyle(el).transitionDuration)).split(',').every(d => parseFloat(d) === 0), 'the join bar still slides');
  await v.close();
});

await check('every short-link tag has its QR code and is in the page\'s QR list', async () => {
  const js = fs.readFileSync(path.join(ROOT, 'assets/site.js'), 'utf8');
  const listed = JSON.parse(js.match(/var QR_TAGS = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
  for (const tag of [...Object.values(SHORT_LINKS), 'kilo']) {
    expect(fs.existsSync(path.join(ROOT, 'assets/qr', tag + '.svg')), `no assets/qr/${tag}.svg (run tools/make-qr.py)`);
  }
  const tags = Object.values(SHORT_LINKS);
  expect(listed.length === tags.length && tags.every(tag => listed.includes(tag)), `QR_TAGS ${listed} differs from the short links ${tags}`);
});

await check('printed, and without JavaScript, the whole page shows and the phone is a still picture', async () => {
  const v = await visitor({ viewport: { width: 1280, height: 800 } });
  await v.page.goto(base + '/');
  await v.page.waitForTimeout(600);
  await v.page.emulateMedia({ media: 'print' });
  const faint = await v.page.evaluate(() => [...document.querySelectorAll('main > section')].filter(el => getComputedStyle(el).opacity !== '1').map(el => el.id));
  expect(faint.length === 0, `printing leaves these sections blank: ${faint.join(', ')}`);
  await v.close();
  const off = await visitor({ javaScriptEnabled: false });
  await off.page.goto(base + '/');
  const state = await off.page.evaluate(() => ({
    turn: getComputedStyle(document.querySelector('.phone-3d .phone-still')).opacity,
    faint: [...document.querySelectorAll('main > section')].filter(el => getComputedStyle(el).opacity !== '1').length,
    card: getComputedStyle(document.querySelector('.qr-card')).display,
    bar: getComputedStyle(document.querySelector('.join-bar')).visibility,
  }));
  expect(state.turn === '1' && state.faint === 0 && state.card === 'none' && state.bar === 'hidden', `without JavaScript: ${JSON.stringify(state)}`);
  await off.close();
});

const SITE = 'https://kiloapp.com.br';

await check('Google and link previews get a title, description, share picture and language links', async () => {
  const v = await visitor();
  await v.page.goto(base + '/');
  const head = () => v.page.evaluate(() => {
    const meta = key => (document.querySelector(`meta[property="${key}"], meta[name="${key}"]`) || {}).content;
    return {
      title: document.title, description: meta('description'), ogTitle: meta('og:title'), ogDescription: meta('og:description'),
      ogImage: meta('og:image'), ogUrl: meta('og:url'), ogType: meta('og:type'), locale: meta('og:locale'), card: meta('twitter:card'),
      imageAlt: meta('og:image:alt'), width: meta('og:image:width'), height: meta('og:image:height'),
      alternates: [...document.querySelectorAll('meta[property="og:locale:alternate"]')].map(m => m.content),
      canonical: (document.querySelector('link[rel=canonical]') || {}).href,
      hreflang: Object.fromEntries([...document.querySelectorAll('link[rel=alternate][hreflang]')].map(l => [l.hreflang, l.href])),
    };
  });
  const pt = await head();
  expect(pt.title === TEXT.pt.docTitle && pt.description === TEXT.pt.docDescription, 'Portuguese title or description differs from the text table');
  expect(/app de treino e dieta/.test(pt.title) && pt.description.length >= 70 && pt.description.length <= 200, `title or description off: ${pt.title} / ${pt.description.length} chars`);
  expect(pt.ogTitle === pt.title && pt.ogDescription && pt.ogType === 'website' && pt.ogUrl === SITE + '/', `share tags missing: ${JSON.stringify(pt)}`);
  expect(pt.ogImage === SITE + '/assets/img/compartilhar.jpg' && pt.width === '1200' && pt.height === '630' && pt.imageAlt, `share picture tags: ${pt.ogImage} ${pt.width}x${pt.height}`);
  expect(pt.card === 'summary_large_image' && pt.locale === 'pt_BR' && pt.alternates.includes('en_US'), 'large card or locales missing');
  expect(pt.canonical === SITE + '/', `canonical is ${pt.canonical}`);
  expect(pt.hreflang['pt-BR'] === SITE + '/' && pt.hreflang.en === SITE + '/?lang=en' && pt.hreflang['x-default'] === SITE + '/', `language links: ${JSON.stringify(pt.hreflang)}`);
  const picture = await v.page.evaluate(async () => {
    const img = new Image(); img.src = '/assets/img/compartilhar.jpg'; await img.decode();
    return [img.naturalWidth, img.naturalHeight, (await (await fetch('/assets/img/compartilhar.jpg')).blob()).size];
  });
  expect(picture[0] === 1200 && picture[1] === 630 && picture[2] < 300000, `share picture is ${picture.join(' x ')} bytes`);
  // A broken details block must not stop the page from switching language.
  await v.page.route(base + '/', async route => {
    const res = await route.fetch();
    route.fulfill({ response: res, body: (await res.text()).replace('"@graph": [', '"@graph": [,') });
  });
  await v.page.goto(base + '/');
  await v.page.getByRole('button', { name: 'English' }).click();
  expect(await v.page.locator('#headline').textContent() === TEXT.en.headline, 'a broken details block stops the English switch');
  await v.page.unroute(base + '/');
  await v.page.goto(base + '/?lang=en');
  const en = await head();
  expect(en.title === TEXT.en.docTitle && en.description === TEXT.en.docDescription && en.ogTitle === en.title, `English title: ${en.title}`);
  expect(en.canonical === SITE + '/?lang=en' && en.ogUrl === SITE + '/?lang=en', `English canonical is ${en.canonical}`);
  await v.close();
});

await check('the sitemap lists the public pages, robots points to it, and link pages stay out of search', async () => {
  const get = async url => { const r = await fetch(base + url); return { status: r.status, text: await r.text() }; };
  const robots = await get('/robots.txt');
  expect(robots.status === 200 && robots.text.includes(`Sitemap: ${SITE}/sitemap.xml`), 'robots.txt does not point to the sitemap');
  expect(!/Disallow:\s*\/\s*$/m.test(robots.text), 'robots.txt blocks the whole site');
  const sitemap = await get('/sitemap.xml');
  const listed = [...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  expect(sitemap.status === 200 && listed.includes(SITE + '/') && listed.includes(SITE + '/lista/privacidade/'), `sitemap lists ${listed}`);
  expect(sitemap.text.includes(`hreflang="en" href="${SITE}/?lang=en"`), 'sitemap has no English alternate');
  for (const page of [...Object.keys(SHORT_LINKS), 'lista', 'lista/sair']) {
    expect(!listed.some(url => url.startsWith(`${SITE}/${page}/`) && !url.includes('privacidade')), `sitemap lists /${page}/`);
    const html = fs.readFileSync(path.join(ROOT, page, 'index.html'), 'utf8');
    expect(/<meta name="robots" content="noindex/.test(html), `/${page}/ can show up in search`);
    // Google: never noindex and a canonical together.
    expect(!/rel="canonical"/.test(html), `/${page}/ has noindex and a canonical`);
  }
  for (const page of ['', 'lista/privacidade/']) {
    expect(!/name="robots"/.test(fs.readFileSync(path.join(ROOT, page, 'index.html'), 'utf8')), `/${page} is in the sitemap but kept out of search`);
  }
  // Google: a canonical set by JavaScript must not change one in the HTML, so the HTML has none and site.js adds it.
  expect(!/rel="canonical"/.test(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')), 'the main page HTML has its own canonical');
});

await check('the app and FAQ details for Google match the visible page, in both languages', async () => {
  const v = await visitor();
  for (const lang of ['pt', 'en']) {
    await v.page.goto(base + (lang === 'en' ? '/?lang=en' : '/'));
    const { data, faq } = await v.page.evaluate(() => ({
      data: [...document.querySelectorAll('script[type="application/ld+json"]')].map(el => JSON.parse(el.textContent)),
      faq: [...document.querySelectorAll('#perguntas details')].map(d => [d.querySelector('summary').textContent, d.querySelector('p').textContent]),
    }));
    const nodes = data.flatMap(d => d['@graph'] || [d]);
    const byType = type => nodes.find(n => n['@type'] === type);
    const site = byType('WebSite'), page = byType('FAQPage');
    expect(site && site.name === 'Kilo' && site.url === SITE + '/' && site.description === (lang === 'en' ? TEXT.en : TEXT.pt).docDescription, `${lang}: site details ${JSON.stringify(site)}`);
    // App details wait for the App Store listing: Google flags an app without real ratings as an error.
    expect(!byType('MobileApplication') && !byType('SoftwareApplication') && !JSON.stringify(data).includes('aggregateRating'), `${lang}: app details before launch`);
    expect(page && page.mainEntity.length === faq.length, `${lang}: FAQ details have ${page && page.mainEntity.length} questions, page has ${faq.length}`);
    page.mainEntity.forEach((q, i) => {
      expect(q['@type'] === 'Question' && q.name === faq[i][0] && q.acceptedAnswer.text === faq[i][1], `${lang}: question ${i + 1} differs from the page`);
    });
    expect(page.inLanguage === (lang === 'en' ? 'en' : 'pt-BR'), `${lang}: FAQ language is ${page.inLanguage}`);
  }
  await v.close();
});

// The TACO food pages, built by tools/build-pages.mjs from data/taco.json (the app's own food data, copied in).
const TACO = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/taco.json'), 'utf8'));
const FOOD_DIR = path.join(ROOT, 'alimentos');
const foodPages = fs.readdirSync(FOOD_DIR, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name);
const ptNumber = (n, digits) => n.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

await check('every TACO food has one page with the app\'s numbers, the credit line, its own title and description, and the seo-food box', async () => {
  expect(TACO.foods.length === 591 && foodPages.length === TACO.foods.length, `${TACO.foods.length} foods, ${foodPages.length} pages`);
  const titles = new Set(), descriptions = new Set();
  const byName = new Map();
  for (const slug of foodPages) {
    const html = fs.readFileSync(path.join(FOOD_DIR, slug, 'index.html'), 'utf8');
    const name = html.match(/nome na tabela: “([^”]+)”/)?.[1]?.replace(/&amp;/g, '&');
    // The page drops the table's footnote marks ("Cerveja, pilsen 2").
    const food = TACO.foods.find(f => f.name.replace(/(?<!tipo) \d$/, '') === name);
    expect(food && !byName.has(name), `/alimentos/${slug}/ does not match exactly one food (${name})`);
    byName.set(name, slug);
    const shown = key => html.match(new RegExp(`data-${key}>([^<]+)<`))?.[1];
    const want = { kcal: ptNumber(food.kcal, 0), protein: ptNumber(food.protein, 1) + ' g', carbs: ptNumber(food.carbs, 1) + ' g', fat: ptNumber(food.fat, 1) + ' g' };
    for (const key of Object.keys(want)) expect(shown(key) === want[key], `/alimentos/${slug}/ shows ${key} ${shown(key)}, the data says ${want[key]}`);
    const title = html.match(/<title>([^<]+)<\/title>/)[1], description = html.match(/<meta name="description" content="([^"]+)">/)[1];
    expect(!titles.has(title) && !descriptions.has(description), `/alimentos/${slug}/ repeats a title or description`);
    titles.add(title); descriptions.add(description);
    expect(description.includes(`${want.kcal} kcal em 100 g, com ${want.protein} de proteína, ${want.carbs} de carboidrato e ${want.fat} de gordura`), `/alimentos/${slug}/ description numbers: ${description}`);
    // About 60 characters show in Google; only names that are long on their own go over, with nothing added but ": calorias".
    expect(title.length <= 60 || title === html.match(/<h1>([^<]+)<\/h1>/)[1] + ': calorias', `/alimentos/${slug}/ title is ${title.length} characters: ${title}`);
    // Names read as people say them: no dangling "de" or "para", no table footnote marks.
    const heading = html.match(/<h1>([^<]+)<\/h1>/)[1];
    expect(!/ (de|do|da|para|com|em|e)$/.test(heading) && !/(?<!tipo) \d$/.test(heading) && title.startsWith(heading + ':'), `/alimentos/${slug}/ is called "${heading}"`);
    expect(html.includes(`<link rel="canonical" href="${SITE}/alimentos/${slug}/">`) && !/name="robots"/.test(html), `/alimentos/${slug}/ canonical or robots`);
    expect(html.includes('Fonte: <a href=') && html.includes('Tabela Brasileira de Composição de Alimentos (TACO), 4ª edição revisada e ampliada. NEPA–UNICAMP, Campinas, 2011'), `/alimentos/${slug}/ lacks the TACO credit`);
    expect(html.includes('href="/?origem=seo-food"') && html.includes('O Kilo registra isso com um toque') && html.includes('<a class="brand" href="/">'), `/alimentos/${slug}/ lacks the tagged box or the link home`);
    for (const [, link] of html.matchAll(/href="(\/alimentos\/[^"#]*)/g)) expect(fs.existsSync(path.join(ROOT, link, 'index.html')), `/alimentos/${slug}/ links to missing ${link}`);
  }
  expect(byName.size === TACO.foods.length, 'some foods have no page');
  // The copy matches the printed table (TACO 4th edition, Tabela 1), checked by hand for these rows; "Tr" and "NA" are 0.
  const BOOK = [['Arroz, integral, cozido', 124, 2.6, 25.8, 1.0], ['Pão, trigo, francês', 300, 8.0, 58.6, 3.1], ['Milho, amido, cru', 361, 0.6, 87.1, 0],
    ['Batata, inglesa, cozida', 52, 1.2, 11.9, 0], ['Batata, frita, tipo chips, industrializada', 543, 5.6, 51.2, 36.6], ['Aveia, flocos, crua', 394, 13.9, 66.6, 8.5]];
  for (const [name, kcal, protein, carbs, fat] of BOOK) {
    const food = TACO.foods.find(f => f.name === name);
    expect(food && food.kcal === kcal && food.protein === protein && food.carbs === carbs && food.fat === fat, `${name} differs from the book: ${JSON.stringify(food)}`);
  }
  // The database keeps only well-formed tags.
  expect(/^[a-z0-9][a-z0-9-]{0,39}$/.test('seo-food'), 'seo-food is not a valid tag');
  return `${foodPages.length} pages`;
});

await check('the food index lists every food page by category, and the sitemap lists them all', async () => {
  const index = fs.readFileSync(path.join(FOOD_DIR, 'index.html'), 'utf8');
  const linked = [...index.matchAll(/<li><a href="\/alimentos\/([^"/]+)\/">/g)].map(m => m[1]);
  expect(linked.length === foodPages.length && new Set(linked).size === linked.length && foodPages.every(s => linked.includes(s)), `index links ${linked.length} foods`);
  for (const c of TACO.categories) expect(index.includes(`>${c.name.replace(/&/g, '&amp;')}</h2>`), `index has no ${c.name} heading`);
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  expect(listed.includes(SITE + '/alimentos/') && foodPages.every(s => listed.includes(`${SITE}/alimentos/${s}/`)), 'sitemap misses food pages');
  expect(new Set(listed).size === listed.length, 'sitemap repeats an address');
  const main = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  expect(main.includes('href="/alimentos/"'), 'the main page does not link to the food pages');
});

await check('a food page reads well on a phone in light and dark mode, and its box opens the form tagged seo-food', async () => {
  for (const colorScheme of ['light', 'dark']) {
    const v = await visitor({ colorScheme, viewport: { width: 360, height: 740 } });
    for (const url of ['/alimentos/', '/alimentos/arroz-integral-cozido/', '/alimentos/margarina-com-oleo-interesterificado-sem-sal-65-por-cento-de-lipideos/']) {
      await v.page.goto(base + url);
      const wide = await v.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(wide <= 0, `${url} (${colorScheme}) scrolls sideways by ${wide}px`);
    }
    await v.page.goto(base + '/alimentos/arroz-integral-cozido/');
    expect(await v.page.getByRole('heading', { level: 1 }).textContent() === 'Arroz integral cozido', 'food heading');
    expect((await v.page.locator('[data-kcal]').textContent()) === '124', 'calories on the page');
    const bg = await v.page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(colorScheme === 'dark' ? bg === 'rgb(23, 26, 25)' : bg === 'rgb(245, 244, 238)', `${colorScheme} background ${bg}`);
    if (colorScheme === 'light') {
      await v.page.getByRole('link', { name: 'Entrar na lista de espera' }).click();
      await v.page.waitForURL(base + '/?origem=seo-food');
      await join(v.page, 'ana@exemplo.com');
      await v.page.getByText('Pronto!').first().waitFor({ timeout: 4000 });
      expect(v.sent.length === 1 && v.sent[0].p_origem === 'seo-food', `join sent ${JSON.stringify(v.sent)}`);
    }
    expect(v.leaks.length === 0, `requests left the site: ${v.leaks.join(', ')}`);
    await v.close();
  }
});

// The exercise pages, built by tools/build-pages.mjs from data/exercises.json (the app's own exercise library, copied in).
const LIBRARY = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises.json'), 'utf8'));
const EXERCISE_DIR = path.join(ROOT, 'exercicios');
const exercisePages = fs.readdirSync(EXERCISE_DIR, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name);
const ADDRESSES = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercise-addresses.json'), 'utf8'));
const unescape = text => text.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

await check('every exercise in the app has one page with the app\'s name and tip, its own title and description, and the seo-exercise box', async () => {
  expect(LIBRARY.exercises.length === 294 && exercisePages.length === LIBRARY.exercises.length, `${LIBRARY.exercises.length} exercises, ${exercisePages.length} pages`);
  expect(/written fresh; no third-party data/.test(LIBRARY.source.licence) && /^[0-9a-f]{40}$/.test(LIBRARY.source.commit), 'the copied library lacks its source or licence note');
  const titles = new Set(), descriptions = new Set(), seen = new Set();
  for (const slug of exercisePages) {
    const html = fs.readFileSync(path.join(EXERCISE_DIR, slug, 'index.html'), 'utf8');
    const name = unescape(html.match(/<h1>([^<]+)<\/h1>/)[1]);
    const exercise = LIBRARY.exercises.find(e => e.namePt === name);
    expect(exercise && !seen.has(exercise.slug), `/exercicios/${slug}/ does not match exactly one exercise (${name})`);
    seen.add(exercise.slug);
    expect(unescape(html.match(/<p data-tip>([^<]+)<\/p>/)[1]) === exercise.tipPt, `/exercicios/${slug}/ tip differs from the app`);
    // The English name shows unless the Portuguese name already says it ("Burpee").
    const english = exercise.namePt.toLowerCase().includes(exercise.nameEn.toLowerCase()) ? null : exercise.nameEn;
    expect(english ? html.includes(`<span lang="en">${english.replace(/&/g, '&amp;')}</span>`) : !html.includes('Em inglês'), `/exercicios/${slug}/ English name`);
    expect(slug === ADDRESSES[exercise.slug], `/exercicios/${slug}/ is not the address kept for ${exercise.slug}`);
    expect(html.includes('Feito um lado de cada vez.') === exercise.unilateral, `/exercicios/${slug}/ one-side note`);
    const title = unescape(html.match(/<title>([^<]+)<\/title>/)[1]), description = unescape(html.match(/<meta name="description" content="([^"]+)">/)[1]);
    expect(!titles.has(title) && !descriptions.has(description), `/exercicios/${slug}/ repeats a title or description`);
    titles.add(title); descriptions.add(description);
    expect(title.length <= 60 && title.startsWith(name) && description.length <= 160 && description.startsWith(`Como fazer ${name}`), `/exercicios/${slug}/ title or description: ${title} / ${description}`);
    expect(html.includes(`<link rel="canonical" href="${SITE}/exercicios/${slug}/">`) && !/name="robots"/.test(html), `/exercicios/${slug}/ canonical or robots`);
    expect(html.includes('href="/?origem=seo-exercise"') && html.includes('No Kilo, a carga da próxima série vem sugerida') && html.includes('<a class="brand" href="/">'), `/exercicios/${slug}/ lacks the tagged box or the link home`);
    expect(html.includes('Dicas gerais de técnica, não uma prescrição. Comece leve e pare se sentir dor.'), `/exercicios/${slug}/ lacks the safety line`);
    for (const [, link] of html.matchAll(/href="(\/(?:exercicios|alimentos)\/[^"#]*)/g)) expect(fs.existsSync(path.join(ROOT, link, 'index.html')), `/exercicios/${slug}/ links to missing ${link}`);
  }
  expect(seen.size === LIBRARY.exercises.length, 'some exercises have no page');
  // The copy matches the app's own words; these were read off the app repo by hand (00031 and 00037).
  const APP = [
    ['barbell-bench-press', 'Supino Reto com Barra', 'Deite com os olhos sob a barra, pés firmes e escápulas juntas. Desça a barra até o meio do peito com os antebraços na vertical e empurre para cima e um pouco para trás. Use um auxiliar ou travas de segurança para a barra não prender você.'],
    ['farmers-carry', 'Caminhada do Fazendeiro', 'Escolha pesos que você consiga carregar sem inclinar o corpo, fique ereto e caminhe com passos curtos e firmes. Mantenha os ombros para trás e a pegada forte; apoie os pesos no chão com a coluna reta.', "Farmer's Carry"],
    ['deadlift', 'Levantamento Terra', 'Barra sobre o meio do pé, quadril para trás, coluna reta e barra junto às pernas. Empurre o chão, fique de pé e desça flexionando o quadril. Mantenha a coluna reta o tempo todo e comece leve até o movimento ficar fluido.'],
  ];
  for (const [slug, namePt, tipPt, nameEn] of APP) {
    const exercise = LIBRARY.exercises.find(e => e.slug === slug);
    expect(exercise && exercise.namePt === namePt && exercise.tipPt === tipPt && (!nameEn || exercise.nameEn === nameEn), `${slug} differs from the app: ${JSON.stringify(exercise)}`);
  }
  // An address, once given, stays: every exercise keeps one, and no two exercises share one.
  expect(LIBRARY.exercises.every(e => ADDRESSES[e.slug]) && new Set(Object.values(ADDRESSES)).size === Object.keys(ADDRESSES).length, 'data/exercise-addresses.json misses an exercise or repeats an address');
  expect(ADDRESSES['barbell-bench-press'] === 'supino-reto-com-barra' && ADDRESSES['farmers-carry'] === 'caminhada-do-fazendeiro', 'a kept address changed');
  expect(/^[a-z0-9][a-z0-9-]{0,39}$/.test('seo-exercise'), 'seo-exercise is not a valid tag');
  return `${exercisePages.length} pages, app commit ${LIBRARY.source.commit.slice(0, 7)}`;
});

await check('the exercise index lists every exercise by muscle group, and the sitemap lists them all', async () => {
  const index = fs.readFileSync(path.join(EXERCISE_DIR, 'index.html'), 'utf8');
  const linked = [...index.matchAll(/<li><a href="\/exercicios\/([^"/]+)\/">/g)].map(m => m[1]);
  expect(linked.length === exercisePages.length && new Set(linked).size === linked.length && exercisePages.every(s => linked.includes(s)), `index links ${linked.length} exercises`);
  for (const label of ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Antebraços', 'Quadríceps', 'Posteriores de coxa', 'Glúteos', 'Panturrilhas', 'Core e abdômen', 'Cardio e outros']) {
    expect(index.includes(`>${label}</h2>`), `index has no ${label} heading`);
  }
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  expect(listed.includes(SITE + '/exercicios/') && exercisePages.every(s => listed.includes(`${SITE}/exercicios/${s}/`)), 'sitemap misses exercise pages');
  expect(new Set(listed).size === listed.length, 'sitemap repeats an address');
  for (const page of ['index.html', 'calculadora/index.html', 'alimentos/index.html']) {
    expect(fs.readFileSync(path.join(ROOT, page), 'utf8').includes('href="/exercicios/"'), `${page} does not link to the exercise pages`);
  }
});

await check('an exercise page reads well on a phone in light and dark mode, and its box opens the form tagged seo-exercise', async () => {
  const longest = LIBRARY.exercises.reduce((a, b) => (b.namePt.length > a.namePt.length ? b : a));
  const longSlug = exercisePages.find(s => fs.readFileSync(path.join(EXERCISE_DIR, s, 'index.html'), 'utf8').includes(`<h1>${longest.namePt.replace(/&/g, '&amp;')}</h1>`));
  for (const colorScheme of ['light', 'dark']) {
    const v = await visitor({ colorScheme, viewport: { width: 360, height: 740 } });
    for (const url of ['/exercicios/', '/exercicios/supino-reto-com-barra/', `/exercicios/${longSlug}/`]) {
      await v.page.goto(base + url);
      const wide = await v.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(wide <= 0, `${url} (${colorScheme}) scrolls sideways by ${wide}px`);
    }
    await v.page.goto(base + '/exercicios/supino-reto-com-barra/');
    expect(await v.page.getByRole('heading', { level: 1 }).textContent() === 'Supino Reto com Barra', 'exercise heading');
    expect((await v.page.locator('[data-muscle]').textContent()) === 'Peito', 'muscle on the page');
    const bg = await v.page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(colorScheme === 'dark' ? bg === 'rgb(23, 26, 25)' : bg === 'rgb(245, 244, 238)', `${colorScheme} background ${bg}`);
    if (colorScheme === 'light') {
      await v.page.getByRole('link', { name: 'Entrar na lista de espera' }).click();
      await v.page.waitForURL(base + '/?origem=seo-exercise');
      await join(v.page, 'ana@exemplo.com');
      await v.page.getByText('Pronto!').first().waitFor({ timeout: 4000 });
      expect(v.sent.length === 1 && v.sent[0].p_origem === 'seo-exercise', `join sent ${JSON.stringify(v.sent)}`);
    }
    expect(v.leaks.length === 0, `requests left the site: ${v.leaks.join(', ')}`);
    await v.close();
  }
});

// The comparison pages (/comparar/): hand-written, every fact about the other app sourced and dated.
const COMPARE = ['myfitnesspal', 'fatsecret'];

await check('each comparison page shows its check date and sources, has its own title and description, and the seo-compare box', async () => {
  const titles = new Set(), descriptions = new Set();
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  for (const app of COMPARE) {
    const html = fs.readFileSync(path.join(ROOT, 'comparar', app, 'index.html'), 'utf8');
    const title = html.match(/<title>([^<]+)<\/title>/)[1], description = html.match(/<meta name="description" content="([^"]+)">/)[1];
    expect(title.length <= 60 && description.length <= 160 && !titles.has(title) && !descriptions.has(description), `/comparar/${app}/ title or description`);
    titles.add(title); descriptions.add(description);
    expect(html.includes(`<link rel="canonical" href="${SITE}/comparar/${app}/">`) && sitemap.includes(`<loc>${SITE}/comparar/${app}/</loc>`), `/comparar/${app}/ canonical or sitemap`);
    // The date the facts were checked shows on the page, and every source linked there is the one recorded in the comment.
    const source = html.match(/<p class="source">([\s\S]*?)<\/p>/)[1];
    expect(/conferidos em <time datetime="\d{4}-\d{2}-\d{2}">[^<]+<\/time>/.test(source), `/comparar/${app}/ shows no check date`);
    const comment = html.match(/<!--([\s\S]*?)-->/)[1];
    const links = [...source.matchAll(/href="(https:[^"]+)"/g)].map(m => m[1]);
    expect(links.length > 0 && links.every(link => comment.includes(link)), `/comparar/${app}/ links a source the comment does not record`);
    expect(/O Kilo ainda não foi lançado/.test(html) && /não é afiliado, patrocinado nem endossado/.test(html), `/comparar/${app}/ must say Kilo is not out yet and is not linked to the other app`);
    expect(html.includes('href="/?origem=seo-compare"'), `/comparar/${app}/ lacks the seo-compare box`);
    for (const [, link] of html.matchAll(/href="(\/[^"#?]+)"/g)) expect(link.startsWith('/assets/') || fs.existsSync(path.join(ROOT, link, 'index.html')), `/comparar/${app}/ links to missing ${link}`);
  }
  expect(/^[a-z0-9][a-z0-9-]{0,39}$/.test('seo-compare'), 'seo-compare is not a valid tag');
});

await check('the comparison pages fit a small phone in light and dark mode, table included', async () => {
  for (const colorScheme of ['light', 'dark']) {
    const v = await visitor({ colorScheme, viewport: { width: 320, height: 640 } });
    for (const app of COMPARE) {
      await v.page.goto(base + `/comparar/${app}/`);
      const wide = await v.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(wide <= 0, `/comparar/${app}/ (${colorScheme}) scrolls sideways by ${wide}px`);
      expect(await v.page.locator('table.compare tbody tr').count() >= 5, `/comparar/${app}/ table`);
    }
    if (colorScheme === 'light') {
      await v.page.getByRole('link', { name: 'Entrar na lista de espera' }).click();
      await v.page.waitForURL(base + '/?origem=seo-compare');
    }
    expect(v.leaks.length === 0, `requests left the site: ${v.leaks.join(', ')}`);
    await v.close();
  }
});

// The calculator (/calculadora/): the app's goal maths, run in the browser. data/goal-samples.json holds the app's own answers.
const GOAL = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/goal-samples.json'), 'utf8'));
const CALC_TEXT = (() => {
  const js = fs.readFileSync(path.join(ROOT, 'assets/calculator.js'), 'utf8');
  const start = js.indexOf('var TEXT = ') + 'var TEXT = '.length;
  return Function(`return ${js.slice(start, js.indexOf('\n  };', start) + 4)}`)();
})();
/** Fills the calculator like a visitor and presses Calcular (or Calculate). */
async function calculate(page, { goal, sex, age, height, weight, activity }) {
  const choose = async (group, value) => { if (value) await page.locator(`[data-group="${group}"] input[value="${value}"]`).check(); };
  await choose('goal', goal); await choose('sex', sex);
  await page.locator('#age').fill(String(age ?? '')); await page.locator('#height').fill(String(height ?? '')); await page.locator('#weight').fill(String(weight ?? ''));
  await choose('activity', activity);
  await page.locator('#calc button[type=submit]').click();
}

await check('the calculator gives the app\'s answer for every sample person, and refuses the same body numbers', async () => {
  const v = await visitor();
  await v.page.goto(base + '/calculadora/');
  const got = await v.page.evaluate(samples => samples.map(s => window.KiloCalculator.propose(s.input)), GOAL.samples);
  GOAL.samples.forEach((s, i) => expect(JSON.stringify(got[i]) === JSON.stringify(s.out), `${JSON.stringify(s.input)}: site ${JSON.stringify(got[i])}, app ${JSON.stringify(s.out)}`));
  const problems = await v.page.evaluate(list => list.map(p => window.KiloCalculator.rangeProblem(p.input)), GOAL.problems);
  GOAL.problems.forEach((p, i) => expect(problems[i] === p.problem, `${JSON.stringify(p.input)}: site ${problems[i]}, app ${p.problem}`));
  await v.close();
  return `${GOAL.samples.length} people, app commit ${GOAL.source.commit.slice(0, 7)}`;
});

await check('the calculator shows the target and the app\'s warnings, and nothing typed leaves the page', async () => {
  const v = await visitor();
  const requests = [];
  v.page.on('request', r => requests.push(r.url()));
  await v.page.goto(base + '/calculadora/');
  await v.page.waitForLoadState('networkidle');
  const loaded = requests.length;
  const result = v.page.locator('#result');
  // An adult losing weight: the numbers the app gives, in Portuguese format.
  const adult = GOAL.samples.find(s => JSON.stringify(s.input) === JSON.stringify({ age: 30, heightCm: 175, weightKg: 80, sex: 'male', activity: 'light', goal: 'lose' })).out;
  await calculate(v.page, { goal: 'lose', sex: 'male', age: 30, height: '1,75', weight: '80', activity: 'light' });
  await result.waitFor();
  expect(await result.locator('[data-kcal]').textContent() === adult.kcal.toLocaleString('pt-BR'), `kcal ${await result.locator('[data-kcal]').textContent()}`);
  for (const key of ['protein', 'carbs', 'fat']) expect(await result.locator(`[data-${key}]`).textContent() === `${adult[key]} g`, `${key} differs`);
  expect(await v.page.evaluate(() => document.activeElement.id) === 'result', 'focus does not move to the result');
  // A small woman losing weight hits the safe minimum; the app's note shows.
  await calculate(v.page, { goal: 'lose', sex: 'female', age: 45, height: 150, weight: '45', activity: 'sitting' });
  expect(await result.innerText().then(t => t.includes(CALC_TEXT.pt.floor) || t.includes(CALC_TEXT.pt.lowBmi)), `no limit note: ${await result.innerText()}`);
  // 17: maintenance only, with the app's words.
  await calculate(v.page, { goal: 'lose', sex: 'male', age: 17, height: 180, weight: '70', activity: 'active' });
  expect((await result.innerText()).includes(CALC_TEXT.pt.young) && (await result.innerText()).includes(CALC_TEXT.pt.paceMaintain), 'a 17-year-old does not get maintenance with the reason');
  // Under 16: no target at all.
  await calculate(v.page, { goal: 'lose', sex: 'female', age: 15, height: 160, weight: '50', activity: 'light' });
  expect(await result.isHidden() && (await v.page.locator('#calc .status').textContent()) === CALC_TEXT.pt.tooYoung, 'a 15-year-old gets a target');
  // Out of range and missing answers get the app's messages.
  await calculate(v.page, { age: 30, height: 119, weight: '70', activity: 'light' });
  expect((await v.page.locator('#calc .status').textContent()) === CALC_TEXT.pt.badHeight && await v.page.locator('#height').getAttribute('aria-invalid') === 'true', 'height 119 is accepted');
  // Like the app, a bad height is named before a bad weight.
  await calculate(v.page, { goal: 'lose', sex: 'male', age: 30, height: 119, weight: '20', activity: 'light' });
  expect((await v.page.locator('#calc .status').textContent()) === CALC_TEXT.pt.badHeight, 'a bad height and weight name the weight first');
  // Gaining past 5,000 kcal: the app offers maintenance, and the pace line says so too.
  await calculate(v.page, { goal: 'gain', sex: 'male', age: 20, height: 200, weight: '170', activity: 'very' });
  await result.waitFor();
  expect(await result.locator('[data-kcal]').textContent() === '4.920' && await result.locator('.pace').textContent() === CALC_TEXT.pt.paceMaintain
    && (await result.innerText()).includes(CALC_TEXT.pt.unsavableMaintenance.replace('{kcal}', '5.200').replace('{maintenance}', '4.920')), `gain past 5,000: ${await result.innerText()}`);
  // The weight a calculator reports is never sent: no request after the page loaded, and the address is unchanged.
  await v.page.waitForTimeout(300);
  expect(requests.length === loaded, `requests after typing: ${requests.slice(loaded).join(', ')}`);
  expect(v.page.url() === base + '/calculadora/', `the address changed to ${v.page.url()}`);
  expect(v.leaks.length === 0 && v.sent.length === 0, `requests left the site: ${v.leaks.join(', ')}`);
  expect(await v.page.locator('#calc input:not([type=radio])[name]').count() === 0, 'a number box has a name, so a form submit could carry it');
  // The box opens the waitlist tagged seo-calc.
  expect(await v.page.locator('[data-join-link]').getAttribute('href') === '/?origem=seo-calc', 'join link tag');
  await v.close();
});

await check('the calculator speaks Portuguese and English, with its own address for Google in each', async () => {
  const v = await visitor();
  await v.page.goto(base + '/calculadora/');
  await calculate(v.page, { goal: 'gain', sex: 'unspecified', age: 25, height: 185, weight: '95', activity: 'very' });
  const seen = {};
  for (const lang of ['pt', 'en']) {
    if (lang === 'en') await v.page.getByRole('button', { name: 'English' }).click();
    const texts = await v.page.evaluate(() => [...document.querySelectorAll('[data-t]')].map(el => [el.getAttribute('data-t'), el.textContent]));
    for (const [key, text] of texts) expect(typeof CALC_TEXT[lang][key] === 'string' && text === CALC_TEXT[lang][key], `${lang} "${key}" shows "${text}"`);
    seen[lang] = new Map(texts);
    const head = await v.page.evaluate(() => ({ title: document.title, description: document.querySelector('meta[name=description]').content, canonical: document.querySelector('link[rel=canonical]')?.href, lang: document.documentElement.lang }));
    expect(head.title === CALC_TEXT[lang].docTitle && head.description === CALC_TEXT[lang].docDescription, `${lang} title ${head.title}`);
    expect(head.canonical === SITE + '/calculadora/' + (lang === 'en' ? '?lang=en' : ''), `${lang} canonical ${head.canonical}`);
    expect(head.lang === (lang === 'en' ? 'en' : 'pt-BR'), `${lang} page language ${head.lang}`);
  }
  const untranslated = [...seen.pt].filter(([key, text]) => seen.en.get(key) === text && key !== 'home').map(([key]) => key);
  expect(untranslated.length === 0, `same words in both languages: ${untranslated.join(', ')}`);
  // The result redraws in English, and the waitlist link keeps the language.
  expect((await v.page.locator('#result .pace').textContent()) === CALC_TEXT.en.paceGain, 'the result stays in Portuguese');
  expect(await v.page.locator('[data-join-link]').getAttribute('href') === '/?origem=seo-calc&lang=en', 'English join link');
  expect(v.page.url() === base + '/calculadora/?lang=en', `address ${v.page.url()}`);
  await v.close();
  const html = fs.readFileSync(path.join(ROOT, 'calculadora/index.html'), 'utf8');
  expect(!/rel="canonical"/.test(html) && html.includes(`hreflang="en" href="${SITE}/calculadora/?lang=en"`), 'calculator HTML canonical or language links');
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  expect(sitemap.includes(`<loc>${SITE}/calculadora/</loc>`) && sitemap.includes(`<loc>${SITE}/calculadora/?lang=en</loc>`), 'sitemap lacks the calculator');
  expect(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').includes('href="/calculadora/"'), 'the main page does not link to the calculator');
});

await check('the calculator fits a small phone in light and dark mode, and says why it can\'t work without JavaScript', async () => {
  for (const colorScheme of ['light', 'dark']) {
    const v = await visitor({ colorScheme, viewport: { width: 360, height: 740 } });
    await v.page.goto(base + '/calculadora/');
    await calculate(v.page, { goal: 'lose', sex: 'unspecified', age: 40, height: 190, weight: '130', activity: 'sitting' });
    const wide = await v.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(wide <= 0, `${colorScheme}: scrolls sideways by ${wide}px`);
    await v.close();
  }
  const n = await visitor({ javaScriptEnabled: false });
  await n.page.goto(base + '/calculadora/');
  expect(await n.page.locator('.needs-js').isVisible() && await n.page.locator('#calc').isHidden(), 'without JavaScript the form shows or the reason does not');
  await n.close();
});

await check('no sideways scroll on a small phone in light and dark mode, or on a wide screen', async () => {
  for (const [colorScheme, viewport] of [['light', { width: 375, height: 667 }], ['dark', { width: 375, height: 667 }], ['light', { width: 1440, height: 900 }]]) {
    const v = await visitor({ viewport, colorScheme });
    await v.page.goto(base + '/');
    const wide = await v.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(wide <= 0, `${colorScheme} at ${viewport.width}px: page is ${wide}px wider than the screen`);
    await v.close();
  }
});

await check('the leave and privacy pages still load', async () => {
  const v = await visitor();
  await v.page.goto(base + '/lista/sair/?t=00000000-0000-4000-8000-000000000000');
  await v.page.getByRole('button', { name: 'Sair da lista' }).waitFor({ timeout: 3000 });
  await v.page.goto(base + '/lista/privacidade/');
  await v.page.getByRole('heading', { name: /privacidade/i }).first().waitFor({ timeout: 3000 });
  await v.close();
});

await browser.close();
server.close();
const failed = results.filter(r => !r.ok).length;
console.log(failed ? `CHECK FAILED (${failed} of ${results.length})` : `CHECK OK (${results.length} checks)`);
process.exit(failed ? 1 : 0);
