/* Trims bootstrap-icons.css to the glyphs the site actually uses and writes the
   matching codepoint list so the font files can be subset to match.

   Run:  npm run icons:subset
   Then: pyftsubset (see the printed command) to shrink the woff/woff2.

   The list is derived, never hand-maintained: every `bi-*` token in the HTML,
   CSS and JS. main.js toggles bi-list / bi-x at runtime, but both appear there
   as literals so the scan catches them. If an icon name is ever built by
   concatenation, add it to DYNAMIC below or it will silently vanish. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const CSS = 'assets/vendor/bootstrap-icons/bootstrap-icons.css';
const DYNAMIC = [];

let hay = '';
for (const f of readdirSync('.')) if (f.endsWith('.html')) hay += readFileSync(f, 'utf8');
for (const d of ['assets/css', 'assets/js', 'scripts']) {
  for (const f of readdirSync(d)) {
    if (/\.(css|js|mjs)$/.test(f)) hay += readFileSync(`${d}/${f}`, 'utf8');
  }
}

const used = new Set(DYNAMIC);
for (const m of hay.matchAll(/\bbi-[a-z0-9]+(?:-[a-z0-9]+)*/g)) used.add(m[0]);

const css = readFileSync(CSS, 'utf8');
const cp = new Map();
for (const m of css.matchAll(/\.(bi-[a-z0-9-]+)::before\s*\{\s*content:\s*"\\([0-9a-f]{4})"/g)) cp.set(m[1], m[2]);

const keep = [...used].filter(n => cp.has(n)).sort();
const unknown = [...used].filter(n => !cp.has(n));
if (unknown.length) console.log('  ignored (not glyph names):', unknown.join(', '));

const firstRule = css.search(/\.bi-[a-z0-9-]+::before/);
const preamble = css.slice(0, firstRule);
const out = preamble + keep.map(n => `.${n}::before { content: "\\${cp.get(n)}"; }`).join('\n') + '\n';
writeFileSync(CSS, out);

console.log(`  ${CSS}`);
console.log(`  ${cp.size} glyph rules -> ${keep.length}    ${Math.round(css.length / 1024)} KB -> ${Math.round(out.length / 1024)} KB`);

const unicodes = keep.map(n => 'U+' + cp.get(n).toUpperCase()).join(',');
writeFileSync('scripts/.icon-unicodes.txt', unicodes);
console.log(`  codepoints -> scripts/.icon-unicodes.txt`);
console.log(`  icons kept: ${keep.join(' ')}`);
