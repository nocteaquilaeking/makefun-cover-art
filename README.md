[![make.fun competition](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/nocteaquilaeking/makefun-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/nocteaquilaeking/makefun-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Afterglow Cover Studio

Afterglow is a small, offline cover-art studio inspired by the bright, cinematic color and bold lettering of open-world game covers. It runs as a static page, with no build step and no network dependency.

## Run it

Use Node 24 to assemble the entry and dossier:

```sh
node main.ts
```

The command checks for a JPG in `screenshots/`, copies `app/` and `screenshots/` to `MAKEFUN_OUTPUT_DIR` (or `/output`), and writes and validates `dossier.json` there.

To use the studio directly, open `app/index.html` in a browser. The interface includes nine individually selectable image frames, two sample photographs, local photo upload, per-frame zoom, four caption colors, three color stories, and a square PNG export. Screenshot scenes can be selected with `?shot=cover` or `?shot=editor`, with optional `photo` and `caption` values.
