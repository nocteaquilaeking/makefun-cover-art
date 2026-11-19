# Afterglow Cover Studio — make.fun bounty entry

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/nocteaquilaeking/makefun-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/nocteaquilaeking/makefun-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Afterglow is an offline GTA-inspired cover maker. Add your own photos or use the bundled pier and boulevard scenes, arrange them in a nine-panel grid, then tune the title, colour grade, crop, and format before exporting a PNG. Anton is bundled locally for the cover lettering.

## Run it

Open `app/index.html` directly in a browser, or serve the `app/` directory with a static file server. No build step or network access is needed for editing.

## Screenshots and entry

The three files in `screenshots/` are captured from the app using the deterministic scenes in `shots.json`: a pier cover, the boulevard editor, and another boulevard cover. The harness in `app/src/shots.js` loads the selected bundled sample and caption for each `?shot=` URL. Run `main.ts` with Node to copy the app and screenshots into `MAKEFUN_OUTPUT_DIR` and generate `dossier.json`.
