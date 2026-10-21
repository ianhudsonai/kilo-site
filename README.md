# kilo-site

The public website for the Kilo app, served by GitHub Pages at https://kiloapp.com.br.

This repository holds public pages only. It never holds app code, keys or private data.

## Short links for social bios

Each folder below forwards to the main page, which holds the waitlist form, with its source tag, so sign-ups are counted per account. Old links to `/lista` forward to the main page too, keeping their tag.

| Link | Goes to |
| --- | --- |
| kiloapp.com.br/ig | /?origem=ig-kiloapp |
| kiloapp.com.br/elas | /?origem=ig-elas |
| kiloapp.com.br/treino | /?origem=ig-treino |
| kiloapp.com.br/tt | /?origem=tt-kiloapp |
| kiloapp.com.br/ttelas | /?origem=tt-elas |
| kiloapp.com.br/tttreino | /?origem=tt-treino |
| kiloapp.com.br/ian | /?origem=ig-ian |

## The main page

`index.html` is the landing page: the pitch and the waitlist form, in Portuguese with an English switch (`?lang=en`). Its words are in `assets/site.js` (both languages; the HTML holds the Portuguese, so the page reads right before the script runs) and its look is in `assets/site.css`. The form calls the waitlist function set in `lista/config.js`. The consent line and the button label must stay word for word: the database records that people agreed to that wording.

## Prices on the main page

The "Quanto custaria tudo isso?" block shows real Brazilian prices with no app or company names. Each number's source link and check date sit in the HTML comment beside the block in `index.html`. Re-check them before launch and update the comment, the numbers and the month in the note together.

## Google and link previews

- `index.html`'s head holds the title, description, link-preview tags, language links (`?lang=en` is the English page) and the JSON-LD Google reads about the app and the questions. `site.js` swaps in the English words, address and FAQ on `?lang=en`. The FAQ in the JSON-LD must match the visible questions word for word; the check compares them.
- Link previews (WhatsApp, Instagram) never run JavaScript, so they always show the Portuguese title and `assets/img/compartilhar.jpg`. To remake the picture, see `tools/share-card.html`.
- `sitemap.xml` lists the public pages and `robots.txt` points to it. Short links, `/lista` and `/lista/sair` carry `noindex` and stay out of the sitemap. Add new public pages to the sitemap.
- There is no canonical in the HTML: `site.js` adds it, since Google asks that JavaScript never change one already there. Pages with `noindex` carry no canonical.
- App details (MobileApplication) wait for the App Store listing: Google reports an app without real ratings as an error, and ratings are never made up. Add them at launch with the App Store link.

## Food pages (/alimentos/)

One page per TACO food the app ships (591), plus an index by category, for people who search a food's calories. Each shows kcal and macros per 100 g, the table's credit line and a box that opens the main page's form tagged `seo-food`. The pages are generated; don't edit them by hand.

- `data/taco.json` is a copy of the app's own TACO data, with the app commit it came from. When the app's food data changes, rerun `node tools/copy-taco-data.mjs /path/to/fitness-app` from a clean app checkout, then `node tools/build-pages.mjs`, which rebuilds `/alimentos/`, `/exercicios/` and their parts of `sitemap.xml`.
- TACO's terms (4th edition, NEPA–UNICAMP, p. ii): "Tabela Brasileira de Composição de Alimentos – TACO é uma publicação do NEPA. É permitida a reprodução total ou parcial do material, desde que seja citada a fonte." So every page cites it; keep the credit line.
- Names read as people say them (`plain()` in the builder); the few the rule can't fix are named by hand in `SAID`. An address never changes food: a name clash stops the build.
- Where the table marks a macro "NA" (oils, spirits), the page shows 0 like the app, with a note saying so.

## Exercise pages (/exercicios/)

One page per exercise in the app's library (294), plus an index by muscle group, for people who search how to do an exercise. Each shows the Portuguese name, the muscle group, the English name, the app's own how-to tip with a safety line, and a box that opens the main page's form tagged `seo-exercise`. The pages are generated; don't edit them by hand.

- `data/exercises.json` is a copy of the app's exercise library (its database migrations 00031 to 00039, checked against the tips bundled in the app), with the app commit it came from. When the library changes, rerun `node tools/copy-exercise-data.mjs /path/to/fitness-app` from a clean app checkout, then `node tools/build-pages.mjs`.
- An exercise's address never changes, even if the app renames it: `data/exercise-addresses.json` keeps the address each app exercise (by its app slug) was first given. The builder adds new exercises to it; commit it with the pages.
- Source and licence: the library and its tips were written for Kilo ("written fresh; no third-party data", migration 00031), so no outside credit is needed. The tips are general technique reminders, not a prescription, and every page says so.
- The box claims only what the approved App Store text says: the suggested weight for the next set, the last numbers filled in, and each exercise's history and chart.

## Comparison pages (/comparar/)

Hand-written pages for people who search "MyFitnessPal vale a pena?" or "fatsecret ou Kilo": `comparar/myfitnesspal/` and `comparar/fatsecret/`, each ending with the waitlist box tagged `seo-compare`. Comparative advertising in Brazil must be true, checkable and must not put the other product down, so:

- Every fact about the other app comes from a page actually opened, recorded word for word in the HTML comment at the top of the page, with the date. The page shows that date and links those pages; the check stops if a linked source is missing from the comment.
- Each page says first what the other app does well, says the Kilo is not out yet, and leaves out anything that could not be checked (prices, ratings, ads where the source says nothing).
- Kilo's side uses only the approved App Store text.
- Apps change: re-open the sources, update the facts, the comment and the date together, and re-check at launch.

## Calorie calculator (/calculadora/)

A free calculator for a daily calorie and macro target, in Portuguese and English (`?lang=en`), ending with the waitlist box tagged `seo-calc`. `assets/calculator.js` holds the Kilo app's goal maths (`target-calculator.ts` in the app repo), with the pace the app uses when none is picked (lose 0.5 kg a week, gain 0.25); the app's onboarding dial can start a little faster for small bodies, so the page says it uses the default pace, and the app's own warning words (`target-rules.ts`). It runs in the browser only: the number boxes have no names and the form never submits.

`data/goal-samples.json` holds the app's answers for 684 sample people, written by `node --experimental-strip-types tools/make-goal-samples.mjs /path/to/fitness-app`. The check compares the site's answers with them, so when the app's goal maths changes, rerun that and fix `assets/calculator.js` until the check passes.

## Checking the site

```sh
node tests/check.mjs
```

Serves this folder on localhost and opens it in headless Chromium (Playwright, from this repo or the global npm root, as cloud containers have it). The waitlist server is never called: its address gets a fake reply, and any other request leaving localhost fails the check. It ends with `CHECK OK` or `CHECK FAILED`. Run it before every merge.
