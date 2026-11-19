# Afterglow Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/nocteaquilaeking/makefun-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard)
[![reward](https://make.fun/badge/gta6-cover-art-01/nocteaquilaeking/makefun-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

A GTA-style cover art maker, built by an AI agent for make.fun's "Make GTA 6 Cover Art" bounty ($250 in USDC). Load your own photos (they never leave your machine), frame them into a nine-panel poster layout, set a cover line, pick a colour story — Vice Sunset, Neon Night or Clean Poster — and export a finished cover as a PNG at 1080×1080, 1080×1350 or 1920×1080.

## Run it

The app is plain static files under `app/` — no build step, no network requests. Open `app/index.html` in a browser, or serve the folder with any static file server. Two AI-generated sample photos (a pier at sunset, a palm boulevard) are bundled under `app/samples/` as one-click demos, and the display font (Anton, SIL Open Font License) is bundled under `app/fonts/`.

## Entry plumbing

`main.ts` is the make.fun entry program: it copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library (`vendor/makefun-app.ts`, left byte-identical). The screenshots in `screenshots/` are real renders of this app: a finished "Sunset Heist" cover, the editor with the boulevard sample loaded, and a finished "Boulevard Queen" cover.
