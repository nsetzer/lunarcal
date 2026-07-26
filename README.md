# VN Lunar Calendar

Convert a Gregorian date and time into Vietnamese lunar **four pillars**: year, month, day, and hour — each with a five-element (Ngũ hành) and zodiac animal (Địa chi).

The web UI lives in `src/app`. The original Python helper is in `src/lunacy/lunacy.py`.

## Features

- Date, hour, and minute inputs (defaults to 2025-10-02 at 04:15)
- Live table of element + animal for year / month / day / hour (with emoji)
- Lunar date readout for the selected Gregorian day
- Appendix for the five elements and twelve Vietnamese animals, including triad allies (Tam hợp) and opposite clashes (Tương xung)
- Vietnamese zodiac order (Cat in fourth place, not Rabbit)

## Project layout

```
src/app/                 Static web UI (HTML / CSS / JS)
src/lunacy/lunacy.py     Python reference implementation
scripts/build.mjs        Copies src/app → dist/
scripts/verify.mjs       Checks JS conversion against known cases
.github/workflows/       GitHub Pages deploy
```

## Requirements

- Node.js 18+ (for build and tests)
- Optional: Python 3.12+ and [`lunardate`](https://pypi.org/project/lunardate/) if you use the Python script

## Local development

Serve the app directly from `src/app` (ES modules), or build first:

```bash
npm run build
npx serve dist
```

Then open the URL printed by `serve` (usually `http://localhost:3000`).

### Scripts

| Command         | Description                                      |
|-----------------|--------------------------------------------------|
| `npm test`      | Run conversion checks against reference outputs  |
| `npm run build` | Emit static site to `dist/` (includes `.nojekyll`) |

### Python reference

```bash
pip install lunardate
python src/lunacy/lunacy.py
```

## GitHub Pages

Push to `main` or `master` (or run the workflow manually). The workflow:

1. Runs `npm test`
2. Runs `npm run build`
3. Deploys `dist/` with GitHub Pages

Enable Pages in the repo: **Settings → Pages → Source: GitHub Actions**.

## Notes

- Lunar conversion covers Chinese/Vietnamese calendar years **1900–2099** (same range as `lunardate`).
- Element and animal rules follow `src/lunacy/lunacy.py`; the JS port is verified with `npm test`.
- Hour pillars use the traditional two-hour branches (Rat covers 23:00–00:59).
