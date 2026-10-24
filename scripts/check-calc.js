#!/usr/bin/env node
// Sanity checks for the calculator in index.html (run ./build.sh first).
// - the page script parses
// - SLOPE values match the original Colab Python (reference values below)
// - point values match WD Maverick's calculator logic (POINT_TABLES copied from his slope_calculator.html)
// If the creator changes his formula or tables, update REF / CREATOR_TABLES here to his new values.
const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const script = src.match(/<script>([\s\S]*?)<\/script>/)[1];
new Function(script); // throws on a syntax error
const core = src.slice(src.indexOf("// ---------- Rank scale"), src.indexOf("// ---------- Storage"));
const T = new Function(core + "; return { rankToLp, lpToRank, slope, pointsFor, LEAGUES };")();

let fail = 0;
const check = (ok, msg) => { if (!ok) { fail++; console.log("FAIL", msg); } };

// Reference: Diamond 2 45 LP current, Master 180 LP peak, 412 games, 62% main champion (from the Colab Python)
const REF = { "1 on": -1.3662, "1 secondary": -227.4073, "1 off": -453.4484, "2 on": 24.6749, "2 secondary": -75.3251,
  "2 off": -175.3251, "3 on": 33.3553, "3 secondary": -16.6447, "3 off": -66.6447 };
const x = T.rankToLp("diamond", 2, 45), y = T.rankToLp("master", 4, 180);
for (const [k, want] of Object.entries(REF)) {
  const [fd, role] = k.split(" ");
  const got = T.slope(+fd, x, y, 412, 0.62, role).value;
  check(Math.abs(got - want) < 1e-3, `slope ${k}: got ${got.toFixed(4)} want ${want}`);
}
// Under 200 games: peak (y') replaces the current/peak blend, penalties still apply (SLOPE.pdf eq. 14, 22, 30)
for (const [k, want] of Object.entries(REF)) {
  const [fd, role] = k.split(" ");
  const blend = T.slope(+fd, x, y, 412, 0.62, role).base, expect = y + (want - blend);
  const got = T.slope(+fd, x, y, 150, 0.62, role).value;
  check(Math.abs(got - expect) < 1e-3, `under-200 ${k}: got ${got.toFixed(4)} want ${expect.toFixed(4)}`);
}

// Creator's point logic
const CREATOR_TABLES = { 1: { bottom: -400, cap: 16 }, 2: { bottom: -800, cap: 11 }, 3: { bottom: -2000, cap: 12 } };
const creatorPoints = (div, value) => {
  const t = CREATOR_TABLES[div], v = Math.round(value);
  const p = v < 0 ? Math.floor((v - t.bottom) / 100) + 1 : (-t.bottom / 100 + 1) + Math.floor(v / 125);
  return Math.max(1, Math.min(t.cap, p));
};
let n = 0;
for (const [k, L] of Object.entries(T.LEAGUES))
  for (let v = -2600; v <= 2000; v += 0.7, n++)
    check(T.pointsFor(k, v).pts === creatorPoints(L.formula, v), `points ${k} @ ${v.toFixed(1)}`);

console.log(fail ? `${fail} check(s) failed` : `All checks passed (${Object.keys(REF).length * 2} formula, ${n} point samples)`);
process.exit(fail ? 1 : 0);
