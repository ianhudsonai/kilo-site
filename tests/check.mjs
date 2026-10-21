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

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' };

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
async function visitor({ viewport = PHONE, reply = { ok: true }, reducedMotion = 'no-preference', colorScheme = 'light' } = {}) {
  const context = await browser.newContext({ viewport, reducedMotion, colorScheme, serviceWorkers: 'block' });
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
  // The "Aceitar sugestão" button sits 36% of the way down the screenshot; that row, not just the phone's top edge, must show.
  const shot = await v.page.getByRole('img', { name: /Aceitar sugestão/ }).boundingBox();
  const buttonRow = shot && shot.y + shot.height * 0.36;
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
  expect(JSON.stringify(titles) === JSON.stringify(['A carga da próxima série', 'Seu gasto real', 'Check-in semanal']), `blocks read ${JSON.stringify(titles)}`);
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

await check('every text on the page has an English version', async () => {
  const v = await visitor();
  await v.page.goto(base + '/');
  const pt = await v.page.locator('[data-t]').evaluateAll(els => els.map(el => [el.getAttribute('data-t'), el.textContent.trim()]));
  await v.page.getByRole('button', { name: 'English' }).click();
  const en = await v.page.locator('[data-t]').evaluateAll(els => els.map(el => el.textContent.trim()));
  // Words that are the same in both languages.
  const same = new Set(['Kilo']);
  const missing = pt.filter(([key, text], i) => !en[i] || (en[i] === text && !same.has(text))).map(([key]) => key);
  expect(missing.length === 0, `no English for: ${[...new Set(missing)].join(', ')}`);
  const altsPt = await v.page.locator('[data-t-alt]').count();
  expect(altsPt >= 4, `expected the hero and 3 screens to have translated alt text, saw ${altsPt}`);
  await v.close();
  return `${pt.length} texts`;
});

await check('no sideways scroll on a small phone, in light and dark mode', async () => {
  for (const colorScheme of ['light', 'dark']) {
    const v = await visitor({ viewport: { width: 375, height: 667 }, colorScheme });
    await v.page.goto(base + '/');
    const wide = await v.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(wide <= 0, `${colorScheme}: page is ${wide}px wider than the screen`);
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
