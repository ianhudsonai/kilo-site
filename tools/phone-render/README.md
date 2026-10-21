# Phone renders

The hero's turning phone (`assets/phone/turn.webm`, `turn.mp4`, `treino.webp`) and the three screen pictures
(`assets/phone/treino-resumo.webp`, `alimentacao-dia.webp`, `meta-e-peso.webp`) are rendered here with three.js in
headless Chromium.

The 3D model is not in the repo. It is "Apple iPhone 17 Pro Max" from Sketchfab (uploader "Apple User", "Free Standard"
licence), downloaded by Ian on 2026-10-21. Its file is `iphone17promax.glb`; `patch.js` swaps the material named
`BsXHDwLKqtDOfrW` (the screen) for a Kilo screenshot.

Run everything from a scratch folder that holds these files, `model.glb` and `npm i three@0.169.0`:

```sh
python3 screen.py ../../assets/img/treino-aceitar-sugestao.webp screen-treino.png 0.17   # status bar + scrolled screen
node drive.mjs "model=model.glb&screen=screen-treino.png&w=900&h=1660&dist=5.0" 84 out/turn   # 84 frames, 1.4 s at 60 fps
python3 stack.py out/turn out/turn-stack 136,156,764,1504   # colour above, transparency below
# BT.709 everywhere and tagged, so every browser decodes the same orange as the stills.
TAGS="-vf scale=out_color_matrix=bt709:out_range=tv -colorspace bt709 -color_primaries bt709 -color_trc bt709"
ffmpeg -framerate 60 -i out/turn-stack/%03d.png $TAGS -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -pix_fmt yuv420p turn.webm
ffmpeg -framerate 60 -i out/turn-stack/%03d.png $TAGS -c:v libx264 -crf 22 -preset slow -pix_fmt yuv420p -movflags +faststart turn.mp4
```

The still `treino.webp` is the last frame (`out/turn/083.png`) cropped the same way, and `turn-first.webp` the first
(`out/turn/000.png`), shown while the video loads. The mp4 is H.264 High 4.2, matching `avc1.64002A` in site.js. The screen pictures use
`screen.py <screenshot> <out> 0`, then `drive.mjs "...&fixed=0" 1` and a crop of `136,182,764,1478`. The crop boxes
are the union of every frame's visible pixels; re-measure them if the camera or the model changes.
