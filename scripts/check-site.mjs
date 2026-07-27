import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const htmlFiles = readdirSync(root).filter((file) => file.endsWith('.html'));

const isExternal = (reference) => /^(?:[a-z]+:|\/\/)/i.test(reference);

const checkReference = (reference, sourceFile, idSet) => {
  if (!reference || isExternal(reference)) return;

  if (reference.startsWith('#')) {
    const target = decodeURIComponent(reference.slice(1));
    if (target && !idSet.has(target)) {
      errors.push(`Missing anchor target ${reference} in ${sourceFile}`);
    }
    return;
  }

  const cleanReference = decodeURIComponent(reference.split('#')[0].split('?')[0]);
  const baseDirectory = dirname(resolve(root, sourceFile));
  const targetPath = cleanReference.startsWith('/')
    ? resolve(root, `.${cleanReference}`)
    : resolve(baseDirectory, cleanReference);

  if (!existsSync(targetPath)) {
    errors.push(`Missing file ${reference} referenced by ${sourceFile}`);
  }
};

let totalIds = 0;

for (const htmlFile of htmlFiles) {
  const html = readFileSync(resolve(root, htmlFile), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const idSet = new Set(ids);
  totalIds += idSet.size;

  for (const id of ids) {
    if (ids.indexOf(id) !== ids.lastIndexOf(id)) {
      errors.push(`Duplicate id #${id} in ${htmlFile}`);
    }
  }

  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    checkReference(match[1], htmlFile, idSet);
  }
}

for (const cssFile of ['assets/css/main.css', 'assets/css/custom.css']) {
  const css = readFileSync(resolve(root, cssFile), 'utf8');
  for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    checkReference(match[1], cssFile, new Set());
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Site checks passed: ${htmlFiles.length} HTML files, ${totalIds} unique ids, and all local references resolved.`);
