# Afterglow Cover Studio — make.fun bounty entry

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/nocteaquilaeking/makefun-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/nocteaquilaeking/makefun-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Afterglow Cover Studio is an offline poster editor inspired by sunlit city stories. Use your own images or the bundled pier and boulevard photographs, arrange them across nine panels, adjust the crop and colour grade, add a cover line, and save the canvas as a PNG. The Anton typeface is included in the app.

## Open the app

Open `app/index.html` in a browser, or serve the `app/` folder with any static web server. Editing runs locally and needs no build step.

## Captured views

The screenshot runner uses the URLs listed in `shots.json` to set up a pier cover, a boulevard editor view, and a second boulevard cover. `app/src/shots.js` loads the bundled image, applies the requested title, waits for the local font, and signals when each scene is ready. The existing captures are stored in `screenshots/`.

To assemble an entry, run `MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=/tmp/cover-out node main.ts`. The entrypoint copies the app and captured images and creates `dossier.json` in the selected output directory.
