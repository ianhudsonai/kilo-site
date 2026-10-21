# Stacks RGBA frames into colour-on-top, alpha-below frames for a video without an alpha channel.
import sys, os
from PIL import Image
src, dst, crop = sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None
os.makedirs(dst, exist_ok=True)
files = sorted(f for f in os.listdir(src) if f.endswith('.png'))
for f in files:
    im = Image.open(os.path.join(src, f)).convert('RGBA')
    if crop: im = im.crop(tuple(int(v) for v in crop.split(',')))
    w, h = im.size
    out = Image.new('RGB', (w, h * 2), 'black')
    rgb = Image.new('RGB', (w, h), 'black'); rgb.paste(im.convert('RGB'), (0, 0), im)  # premultiplied by alpha (on black)
    out.paste(rgb, (0, 0)); out.paste(im.getchannel('A').convert('RGB'), (0, h))
    out.save(os.path.join(dst, f))
print(len(files), w, h)
