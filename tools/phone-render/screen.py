# Builds a phone screen picture: an iOS-style status bar (9:41, full signal, Wi-Fi and battery) over a Kilo screenshot.
import sys
from PIL import Image, ImageDraw, ImageFont
src, dst = sys.argv[1], sys.argv[2]
shift = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0   # share of the screenshot scrolled off the top
W, H = 1320, 2868
S = W / 440  # points to pixels
shot = Image.open(src).convert('RGB')
bg = shot.getpixel((5, 5))
im = Image.new('RGB', (W, H), bg)
bar = int(62 * S)
sw = W; sh = round(shot.height * W / shot.width)
shot = shot.resize((sw, sh), Image.LANCZOS)
top = round(sh * shift)
# The tab bar (bottom 8.3% of the screenshot) stays pinned to the bottom of the screen; only the content above it scrolls.
tab = round(sh * 0.9185)
# Scrolled, the content ends after "+ Adicionar série" (the Notas card would show cut in half under the tab bar).
end = tab if shift == 0 else round(sh * 0.886)
im.paste(shot.crop((0, top, sw, min(end, top + H - bar))), (0, bar))
im.paste(shot.crop((0, tab, sw, sh)), (0, H - (sh - tab)))
d = ImageDraw.Draw(im)
d.rectangle([0, 0, W, bar - 1], fill=bg)
ink = (0, 0, 0)
font = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-SemiBold.otf', int(17 * S))
cy = int(31 * S)
d.text((int(64 * S), cy), '9:41', font=font, fill=ink, anchor='mm')
x = int(318 * S)
for i, h in enumerate([4, 6.5, 9, 11.5]):  # signal
    bx = x + int(i * 4.6 * S)
    d.rounded_rectangle([bx, cy + int(5.5 * S) - int(h * S), bx + int(3 * S), cy + int(5.5 * S)], radius=int(1 * S), fill=ink)
wx, wy = int(350 * S), cy + int(5 * S)  # wifi
for r, wdt in [(12, 2.6), (8, 2.6)]:
    d.arc([wx - int(r * S), wy - int(r * S), wx + int(r * S), wy + int(r * S)], 225, 315, fill=ink, width=int(wdt * S))
d.pieslice([wx - int(4 * S), wy - int(4 * S), wx + int(4 * S), wy + int(4 * S)], 225, 315, fill=ink)
bx0, by0 = int(372 * S), cy - int(6.5 * S)  # battery
d.rounded_rectangle([bx0, by0, bx0 + int(25 * S), by0 + int(12.5 * S)], radius=int(4 * S), outline=(150, 150, 150), width=int(1.2 * S))
d.rounded_rectangle([bx0 + int(2 * S), by0 + int(2 * S), bx0 + int(23 * S), by0 + int(10.5 * S)], radius=int(2.5 * S), fill=ink)
d.rounded_rectangle([bx0 + int(26.5 * S), by0 + int(4 * S), bx0 + int(28 * S), by0 + int(8.5 * S)], radius=int(1 * S), fill=(150, 150, 150))
im.save(dst, quality=92)
