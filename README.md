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

## Visitor counter

`assets/site.js` can load Umami Cloud, a cookie-free counter with its data in the EU region. It stays off while `COUNTER` holds empty values. Switch it on only together with its section on the waitlist privacy page, once ian has approved that text: paste the `src` and `data-website-id` from Umami's tracking code into `COUNTER`.

It counts pages, sources (only the `origem` and `lang` parts of the page address and of the address before it; another site's address is cut to its name), scroll depth (`rolagem`), taps on the join buttons (`entrar-na-lista`), joins (`entrou`) and the QR card (`qr-mostrado`, `qr-fechado`). It never counts an email. Browsers sending Do Not Track or Global Privacy Control are not counted. The English switch changes the address, so Umami counts it as one more page view. If the counter is blocked or broken, the page works the same.

The main page's promise heading ("No app: sem anúncios, sem rastreamento"), its data FAQ answer and its footer link mention the site's counting, and the privacy page has a section on it. Keep all of these in step with the counter.

## Checking the site

```sh
node tests/check.mjs
```

Serves this folder on localhost and opens it in headless Chromium (Playwright, from this repo or the global npm root, as cloud containers have it). The waitlist server is never called: its address gets a fake reply, and any other request leaving localhost fails the check. It ends with `CHECK OK` or `CHECK FAILED`. Run it before every merge.
