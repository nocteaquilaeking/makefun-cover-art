# Afterglow Cover Studio — make.fun bounty entry

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/nocteaquilaeking/makefun-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/nocteaquilaeking/makefun-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Afterglow Cover Studio is a self-contained poster editor for assembling a nine-frame, Vice-inspired cover. Load the bundled pier or boulevard scene, add your own images, crop each panel, adjust the colour grade and title, and save a PNG. The Anton typeface is included locally.

## Run the studio

Open `app/index.html` in a browser, or serve the `app/` folder with any static web server. Editing works without a build step or network connection.

## Capture and package

`shots.json` describes three scenes: a pier cover, the editor with the boulevard image, and a second boulevard cover. The capture harness in `app/src/shots.js` reads each query, loads its sample and caption, waits for fonts and painting, then sets `window.__shotReady`. The screenshot runner stores the named captures in `screenshots/`.

Run `MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=/tmp/cover-out node main.ts` to copy the app and screenshots and produce a `dossier.json` file in the output directory.
