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

- `data/taco.json` is a copy of the app's own TACO data, with the app commit it came from. When the app's food data changes, rerun `node tools/copy-taco-data.mjs /path/to/fitness-app` from a clean app checkout, then `node tools/build-food-pages.mjs`, which rebuilds `/alimentos/` and the food part of `sitemap.xml`.
- TACO's terms (4th edition, NEPA–UNICAMP, p. ii) allow reproducing it "desde que seja citada a fonte", so every page cites it. Keep the credit line.
- Where the table marks a macro "NA" (oils, spirits), the page shows 0 like the app, with a note saying so.

## Checking the site

```sh
node tests/check.mjs
```

Serves this folder on localhost and opens it in headless Chromium (Playwright, from this repo or the global npm root, as cloud containers have it). The waitlist server is never called: its address gets a fake reply, and any other request leaving localhost fails the check. It ends with `CHECK OK` or `CHECK FAILED`. Run it before every merge.
