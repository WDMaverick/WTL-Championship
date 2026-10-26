---
name: update-rulebook
description: Re-review the WTL Championship rulebook Google Doc (and, if provided, a new version of WD Maverick's SLOPE calculator in temp/) and update the GitHub Pages site to match. Use when the user says the rulebook or calculator changed, or asks to "re-review", "resync" or "update the page".
---

# Update the WTL rulebook site

The site is one static page: edit `src/page.html`, run `./build.sh` to regenerate `index.html`, and push to `main`. GitHub Pages serves it at https://weteachleague.github.io/WTL-Championship/ (repo `weteachleague/WTL-Championship`, public).

Sources:
- Rulebook Google Doc: https://docs.google.com/document/d/1Qu6pscRUl_iEMHQSeYPh40HkourK8NhKNg7LbW2ugCQ/edit?tab=t.0 (publicly exportable)
- SLOPE.pdf: https://drive.google.com/file/d/1ss4DqESf0VN2vPcBvnPUsJRWD0nqzJhL/view
- Original Colab POC: https://colab.research.google.com/drive/115SeCJfrsuFeppZrprDW_tJcKFyIaOHo
- Creator's calculator: the user drops new versions at `temp/slope_calculator.html`. The last reviewed copy is `temp/reviewed/slope_calculator.html`. `temp/` is gitignored and must never be committed.

## Part 1: Rulebook

1. Run `scripts/fetch-doc.sh`. It downloads the doc to `sources/rulebook.latest.txt` (+ `.html` for links) and prints a unified diff against `sources/rulebook.txt`, the snapshot the page was last synced to. Exit 0 means nothing changed: tell the user and skip to Part 2.
2. For every hunk in the diff, update the matching markup in `src/page.html`:
   - Rules are `<div class="rule"><span class="rid">X.Y.Z</span><p>…</p></div>`; sub-rules (4 levels, e.g. 3.1.2.1) add `class="rule nested"`. Sections are `<div class="sub" id="rX-Y">` with an `<h4>`, chapters are `<div class="chapter" id="rX">` with an `<h3>`.
   - Transcribe the doc's wording **verbatim**, including its own numbering and typos. Do not silently fix them; list them for the user instead (see step 6).
   - Keep the doc's hyperlinks as real links (`target="_blank" rel="noopener"`). Links to rules or sections inside the page use `#rX-Y` anchors; the tab router opens the right tab.
   - New or removed sections: update the contents sidebar (`<aside class="toc">`) as well.
   - The 2.3.1 TPE limits table and the "Late to match" table are hand-written HTML; the five point-value tables in 1.2 are generated from `LEAGUES` in the script (see Part 3).
   - The doc's "**Pending" placeholder for the website stays off the page; the page's own Calculator tab is that website.
3. Check knock-on effects outside the Rulebook tab:
   - **Calculator team checks** in `renderTeam()` quote rules: roster slot count (2.1.1), academy starters (2.3.3), below-bracket players (1.2.4), subs below starters (2.3.2), TPE limits (2.3.1). Update the numbers and rule references if those rules changed. Keep the example roster (`EXAMPLE`) passing the academy rule.
   - **TPE limits / point tables / division ranges** also live in `LEAGUES` (used by the calculator). Change them there if the doc changes them.
   - **Masthead chips** (schedule, format) and the **SLOPE tab** text, if the doc changes what they summarise.
4. Run `python3 -I scripts/check-rules.py`. It must report no missing and no stale rule IDs, and every doc hyperlink should be "on page".
5. Run `./build.sh && node scripts/check-calc.js`; both must pass.
6. Copy the new snapshot over the old one: `cp sources/rulebook.latest.txt sources/rulebook.txt`.

## Part 2: Creator's calculator (only if `temp/slope_calculator.html` exists)

1. Compare it with the last reviewed copy: `diff temp/reviewed/slope_calculator.html temp/slope_calculator.html`. If identical, skip. If there is no reviewed copy, read the whole file.
2. Read the changed logic, not just the diff lines. Compare it with the page's script:
   - `rankToLp`, `lpToRank`, `qOfA`, `slope` (formula and penalties per division: `PEN`)
   - `POINT_TABLES` / `points()` (the page's `pointsFor` follows the creator's: rounded LP, clamped to [1, cap], keyed on formula division)
   - New inputs, outputs, validation messages, or UI features (e.g. PNG export, multi-player view)
3. Port changes into `src/page.html` in the page's own style and WTL theme (navy/blue/magenta tokens, Oswald + Public Sans). Do not paste his CSS or his fonts.
4. If his formula or tables changed, update `REF` / `CREATOR_TABLES` in `scripts/check-calc.js` to match his new code, then run it.
5. When done, `cp temp/slope_calculator.html temp/reviewed/slope_calculator.html`.

## Part 3: Things to keep consistent

- `LEAGUES` maps each league division to a SLOPE formula (1–3), its TPE limits and its rulebook point table. Current mapping: NA D1→1, NA D2→2, NA D3→3, EU D1→2, EU D2→3. Re-check it whenever division names or ranges change.
- Known open questions (tell the user if they're still unresolved):
  - The rulebook's NA D2 table stops at Diamond 1 (8 points), but the creator's Division 2 table runs to Master 374 LP (11 points). The page follows the creator and warns.
  - The doc's 2.3.1 labels the EU divisions "Division 2 / Division 3", while its point tables call them EU Division 1 / 2.

## Part 4: Verify, publish, report

1. Optional but recommended: take a headless screenshot of the changed tab, e.g.
   `google-chrome --headless=new --no-sandbox --hide-scrollbars --virtual-time-budget=4000 --window-size=1280,1400 --screenshot=<scratchpad>/shot.png "file://$PWD/index.html"`
   (load without a `#hash`; the hash jump makes headless screenshots misleading).
2. Commit `src/page.html`, `index.html`, `sources/rulebook.txt` and any script changes, then push to `main`. Never `git add temp/`. End the commit message with the Co-Authored-By line from the current attribution reminder.
3. Wait for Pages: `gh api repos/weteachleague/WTL-Championship/pages/builds/latest --jq .status` should be `built`; spot-check the live page with `curl`.
4. Report to the user: what changed in the doc and/or calculator, what you changed on the page (including calculator checks), and a list of inconsistencies or typos in the new source that the doc owner may want to fix.
