# WTL Championship Rulebook site

Static GitHub Pages site (https://wdmaverick.github.io/WTL-Championship/) for the We Teach League WTL Championship 2026: rulebook, SLOPE explainer and live SLOPE calculator, in three tabs.

- Edit `src/page.html` only, then run `./build.sh` to regenerate `index.html` (what Pages serves). Push to `main` to publish.
- Theme follows weteachleague.com's Elementor kit: navy `#010F19`, blue `#2323F2`, magenta `#FF60FF`, greys `#D5D5D5` / `#A1A1A1` / `#2E2E2E`, Oswald (uppercase headings) + Public Sans. Dark only.
- When the rulebook Google Doc or the creator's calculator changes, follow the `update-rulebook` skill (`.claude/skills/update-rulebook/SKILL.md`).
- `temp/` holds files the user downloads (e.g. new calculator versions). It is gitignored; never commit it.
- Checks: `python3 -I scripts/check-rules.py` (rule IDs vs doc) and `node scripts/check-calc.js` (formula and points).
