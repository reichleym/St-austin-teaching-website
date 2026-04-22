import { promises as fs } from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();
const APP_DIR = path.join(REPO_ROOT, "src", "app");
const DOCS_DIR = path.join(REPO_ROOT, "src", "content", "page-docs");
const GENERATED_MAP_PATH = path.join(REPO_ROOT, "src", "lib", "page-docs.generated.ts");

function toKebabCase(value) {
  return value
    .replace(/^\((.*)\)$/, "$1")
    .replace(/^\[(.*)\]$/, "$1")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

function slugFromAppPagePath(pagePath) {
  const rel = path.relative(APP_DIR, pagePath);
  const noSuffix = rel.replace(/[/\\]page\.tsx$/, "");
  if (!noSuffix || noSuffix === "page.tsx") return "home";

  const segments = noSuffix.split(/[\\/]/g).filter(Boolean).map(toKebabCase);
  return segments.join("-");
}

function routeFromAppPagePath(pagePath) {
  const rel = path.relative(APP_DIR, pagePath);
  const noSuffix = rel.replace(/[/\\]page\.tsx$/, "");
  if (!noSuffix || noSuffix === "page.tsx") return "/";

  const segments = noSuffix
    .split(/[\\/]/g)
    .filter(Boolean)
    .map((seg) => seg.replace(/^\((.*)\)$/, "$1"));
  return `/${segments.join("/")}`;
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function getNestedValue(source, key) {
  return key.split(".").reduce((current, segment) => {
    if (typeof current !== "object" || current === null) return undefined;
    return current[segment];
  }, source);
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function listPageFiles(dir) {
  /** @type {string[]} */
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listPageFiles(full)));
      continue;
    }
    if (entry.isFile() && entry.name === "page.tsx") {
      out.push(full);
    }
  }
  return out;
}

function extractTranslationKeys(source) {
  const keys = new Set();
  const re = /\b(?:translate|t)\(\s*["'`]([^"'`]+)["'`]/g;
  for (const match of source.matchAll(re)) {
    keys.add(match[1]);
  }
  return [...keys].sort();
}

function extractLibImports(source) {
  const imports = new Set();
  const re = /from\s+["']@\/lib\/([^"']+)["']/g;
  for (const match of source.matchAll(re)) {
    imports.add(`@/lib/${match[1]}`);
  }
  return [...imports].sort();
}

function extractComponents(source) {
  /** @type {Map<string, { component: string; occurrences: number; propsUsed: Set<string> }>} */
  const map = new Map();
  const tagRe = /<([A-Z][A-Za-z0-9_]*)\b([^>]*)>/g;

  for (const match of source.matchAll(tagRe)) {
    const component = match[1];
    const attrs = match[2] ?? "";

    if (component === "Image") continue;

    const existing =
      map.get(component) ??
      ({
        component,
        occurrences: 0,
        propsUsed: new Set(),
      });

    existing.occurrences += 1;

    const propRe = /\b([A-Za-z_][A-Za-z0-9_]*)\s*=/g;
    for (const propMatch of attrs.matchAll(propRe)) {
      existing.propsUsed.add(propMatch[1]);
    }

    map.set(component, existing);
  }

  return [...map.values()]
    .map((entry) => ({
      component: entry.component,
      occurrences: entry.occurrences,
      propsUsed: [...entry.propsUsed].sort(),
    }))
    .sort((a, b) => a.component.localeCompare(b.component));
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writePageDoc({ pagePath, enTranslations, frTranslations }) {
  const slug = slugFromAppPagePath(pagePath);
  const docPath = path.join(DOCS_DIR, `${slug}.json`);

  try {
    await fs.access(docPath);
    return { slug, skipped: true };
  } catch {
    // continue (file doesn't exist)
  }

  const source = await fs.readFile(pagePath, "utf8");
  const translationKeys = extractTranslationKeys(source);
  const translationDefaults = Object.fromEntries(
    translationKeys.map((key) => {
      const en = getNestedValue(enTranslations, key);
      const fr = getNestedValue(frTranslations, key);
      return [
        key,
        {
          en: typeof en === "string" ? en : null,
          fr: typeof fr === "string" ? fr : null,
        },
      ];
    })
  );

  const doc = {
    generatedAt: new Date().toISOString(),
    pageInfo: {
      name: `${titleFromSlug(slug)} Page`,
      slug,
      route: routeFromAppPagePath(pagePath),
      file: `src/app/${path.relative(APP_DIR, pagePath).replace(/\\/g, "/")}`,
    },
    componentsUsed: extractComponents(source),
    translationKeys,
    translationDefaults,
    dataSources: extractLibImports(source),
    pageNotes: [
      "This file is auto-generated from the page.tsx source. It captures which components are used and which translation keys are referenced.",
      "For full admin-driven content editing, extend this document with per-section content models and validation rules.",
    ],
  };

  await fs.writeFile(docPath, JSON.stringify(doc, null, 2) + "\n", "utf8");
  return { slug, skipped: false };
}

async function writeGeneratedMap() {
  const entries = (await fs.readdir(DOCS_DIR)).filter((name) => name.endsWith(".json")).sort();
  const slugs = entries.map((name) => name.replace(/\.json$/, ""));

  const importLines = slugs.map((slug, idx) => {
    const varName = `doc${idx}`;
    return `import ${varName} from \"@/content/page-docs/${slug}.json\";`;
  });

  const mapLines = slugs.map((slug, idx) => `  \"${slug}\": doc${idx},`);

  const ts = `// This file is auto-generated by scripts/generate-page-docs.mjs
// Do not edit by hand.

${importLines.join("\n")}

export const pageDocSlugs = ${JSON.stringify(slugs, null, 2)} as const;

export type PageDocSlug = (typeof pageDocSlugs)[number];

const PAGE_DOCS: Record<string, unknown> = {
${mapLines.join("\n")}
};

export function getPageDoc(slug: string): unknown | null {
  return PAGE_DOCS[slug] ?? null;
}
`;

  await fs.writeFile(GENERATED_MAP_PATH, ts, "utf8");
}

async function main() {
  await ensureDir(DOCS_DIR);

  const enTranslations = await readJson(path.join(REPO_ROOT, "src", "lib", "translations", "en.json"));
  const frTranslations = await readJson(path.join(REPO_ROOT, "src", "lib", "translations", "fr.json"));

  const pageFiles = await listPageFiles(APP_DIR);
  pageFiles.sort();

  const results = [];
  for (const pagePath of pageFiles) {
    results.push(await writePageDoc({ pagePath, enTranslations, frTranslations }));
  }

  await writeGeneratedMap();

  const created = results.filter((r) => !r.skipped).map((r) => r.slug);
  const skipped = results.filter((r) => r.skipped).map((r) => r.slug);

  // eslint-disable-next-line no-console
  console.info("[page-docs] created:", created.length ? created.join(", ") : "(none)");
  // eslint-disable-next-line no-console
  console.info("[page-docs] skipped:", skipped.length ? skipped.join(", ") : "(none)");
  // eslint-disable-next-line no-console
  console.info("[page-docs] map:", path.relative(REPO_ROOT, GENERATED_MAP_PATH));
}

await main();

