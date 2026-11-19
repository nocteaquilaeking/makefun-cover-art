# Afterglow Cover Studio — make.fun bounty entry

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/nocteaquilaeking/makefun-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/nocteaquilaeking/makefun-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Afterglow Cover Studio is an offline poster editor for assembling a nine-frame, Vice-inspired cover. Choose the included pier or boulevard photograph, upload your own pictures, reframe each panel, tune the colour grade and title, then export a PNG. The Anton font is bundled locally.

## Run it

Open `app/index.html` in a browser, or serve the `app/` directory with a static web server. No build step or network connection is needed for editing.

## Screenshots and packaging

`shots.json` describes the three browser scenes: a pier cover, the editor with a boulevard image, and another boulevard cover. The capture page reads each query string and `app/src/shots.js` loads the chosen photo, applies the title, waits for fonts and painting, and sets `window.__shotReady` for the screenshot runner. Captures use the filenames in `screenshots/`.

Run `MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=/tmp/cover-out node main.ts` to copy the app and screenshot directory and create `dossier.json` in the output folder.
