"""Writes the QR codes the computer card shows: one per short-link tag, plus one without a tag.

    python3 tools/make-qr.py      (needs the `qrcode` package: pip install qrcode==7.4.2)

Each SVG opens https://kiloapp.com.br/ on a phone, keeping the tag of the link the visitor came from. When a tag is added to
the short links, add it to TAGS here and in assets/site.js (QR_TAGS), then run this again.
"""
from pathlib import Path

import qrcode

TAGS = ['ig-kiloapp', 'ig-elas', 'ig-treino', 'tt-kiloapp', 'tt-elas', 'tt-treino', 'ig-ian']
OUT = Path(__file__).resolve().parent.parent / 'assets' / 'qr'


def svg(url):
    code = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=2)
    code.add_data(url)
    code.make(fit=True)
    rows = code.get_matrix()
    size = len(rows)
    # One path, with each run of dark modules in a row drawn as a single rectangle, keeps the file small.
    parts = []
    for y, row in enumerate(rows):
        x = 0
        while x < size:
            if row[x]:
                start = x
                while x < size and row[x]:
                    x += 1
                parts.append(f'M{start} {y}h{x - start}v1h-{x - start}z')
            else:
                x += 1
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" shape-rendering="crispEdges">'
            f'<rect width="{size}" height="{size}" fill="#fff"/><path fill="#20231F" d="{"".join(parts)}"/></svg>\n')


OUT.mkdir(parents=True, exist_ok=True)
(OUT / 'kilo.svg').write_text(svg('https://kiloapp.com.br/'))
for tag in TAGS:
    (OUT / f'{tag}.svg').write_text(svg(f'https://kiloapp.com.br/?origem={tag}'))
print(f'wrote {len(TAGS) + 1} QR codes to {OUT}')
