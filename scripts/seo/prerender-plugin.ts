/**
 * Build step: gives every public route in every locale its own static HTML.
 *
 * After `vite build` writes dist/index.html (the app shell), this loads
 * src/seo/prerender.tsx through Vite's SSR loader and, for each route, writes
 * a copy of the shell with the route's <html lang>, head tags (title,
 * description, canonical, hreflang, Open Graph, Twitter, JSON-LD) and static
 * text in place of the <!-- seo:head --> and <!-- seo:body --> blocks. Also
 * writes 404.html, app-shell.html (JS-only routes), sitemap.xml, robots.txt,
 * llms.txt and llms-full.txt (src/seo/llms.ts). vercel.json routes each URL
 * to its file. In dev, /llms.txt and /llms-full.txt are rendered on request.
 *
 * The app itself is unchanged: it still mounts with createRoot (no
 * hydration), replacing the static text, and react-helmet-async adopts the
 * head tags because they carry data-rh.
 */
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin, ResolvedConfig } from "vite";

const HEAD_BLOCK = /<!-- seo:head[\s\S]*?<!-- \/seo:head -->/;
const BODY_BLOCK = /<!-- seo:body[\s\S]*?<!-- \/seo:body -->/;
const HTML_LANG = /<html lang="[^"]*">/;

type PrerenderModule = typeof import("../../src/seo/prerender");

const fill = (shell: string, lang: string, head: string, body: string, preloads = "") =>
  shell
    .replace(HTML_LANG, `<html lang="${lang}">`)
    .replace(HEAD_BLOCK, () => head)
    .replace(BODY_BLOCK, () => body)
    // (outside the seo:head block: fetch hints, not metadata)
    .replace("</head>", () => (preloads ? `  ${preloads}\n  </head>` : "</head>"));

/**
 * Each prerendered page's own code, by page key (App.tsx's lazy routes). Its
 * static HTML preloads that chunk (and the chunks and CSS it pulls in), plus a
 * non-English route's dictionary, so they download alongside the main bundle
 * instead of after it has run and asked for them.
 */
const PAGE_MODULES: Record<string, string> = {
  pricing: "src/pages/Pricing.tsx",
  faqs: "src/pages/FAQs.tsx",
  earlyAccess: "src/pages/EarlyAccess.tsx",
  contact: "src/pages/Contact.tsx",
  privacy: "src/pages/PrivacyPolicy.tsx",
  terms: "src/pages/Terms.tsx",
  v1: "src/pages/IndexV1.tsx",
};
const homeModule = (heroFilm: boolean) => (heroFilm ? "src/pages/FilmLanding.tsx" : "src/pages/Index.tsx");
const localeModule = (locale: string) => `src/i18n/messages/${locale}.ts`;

interface ChunkInfo {
  file: string;
  imports: string[];
  css: string[];
  isEntry: boolean;
}

/** The modulepreload / style preload tags for some source modules' chunks (the entry excluded: index.html loads it). */
const chunkPreloads = (
  modules: string[],
  byModule: Map<string, ChunkInfo>,
  byFile: Map<string, ChunkInfo>,
  base: string,
): string => {
  const js: string[] = [];
  const css: string[] = [];
  const seen = new Set<string>();
  const visit = (chunk: ChunkInfo | undefined) => {
    if (!chunk || chunk.isEntry || seen.has(chunk.file)) return;
    seen.add(chunk.file);
    js.push(chunk.file);
    for (const c of chunk.css) if (!css.includes(c)) css.push(c);
    for (const dep of chunk.imports) visit(byFile.get(dep));
  };
  for (const id of modules) visit(byModule.get(id));
  return [
    ...js.map((f) => `<link rel="modulepreload" crossorigin href="${base}${f}">`),
    // (a preload, not a stylesheet: Vite adds the stylesheet itself when the chunk runs, from the
    // cache; crossorigin, as Vite's own link is, or the preload goes unused)
    ...css.map((f) => `<link rel="preload" as="style" crossorigin href="${base}${f}">`),
  ].join("\n    ");
};

/** Last commit date (YYYY-MM-DD) touching any of the paths, if git can tell. */
const lastCommitDate = (root: string, paths: string[]): string | undefined => {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...paths], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : undefined;
  } catch {
    return undefined;
  }
};

const LLMS_FILES: Record<string, "renderLlmsTxt" | "renderLlmsFullTxt"> = {
  "/llms.txt": "renderLlmsTxt",
  "/llms-full.txt": "renderLlmsFullTxt",
};

/** Dev server: /llms.txt and /llms-full.txt, rendered fresh from the sources. */
function llmsDev(): Plugin {
  return {
    name: "bizmis-seo-llms-dev",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const fn = req.url ? LLMS_FILES[req.url.split("?")[0]] : undefined;
        if (!fn) return next();
        try {
          // (loosely typed: the node tsconfig has no "@/" alias for src/seo/llms.ts)
          const mod = (await server.ssrLoadModule("/src/seo/llms.ts")) as Record<string, () => string>;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(mod[fn]());
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export function seoPrerender(): Plugin[] {
  return [seoBuild(), llmsDev()];
}

function seoBuild(): Plugin {
  let config: ResolvedConfig;
  // the app's chunks, by each source module they hold and by file name
  const byModule = new Map<string, ChunkInfo>();
  const byFile = new Map<string, ChunkInfo>();
  return {
    name: "bizmis-seo-prerender",
    apply: "build",
    configResolved(resolved) {
      config = resolved;
    },
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk") continue;
        const info: ChunkInfo = {
          file: chunk.fileName,
          imports: chunk.imports,
          css: [...(chunk.viteMetadata?.importedCss ?? [])],
          isEntry: chunk.isEntry,
        };
        byFile.set(chunk.fileName, info);
        // (every module the chunk holds, not only its facade: a page's chunk may have none)
        for (const id of chunk.moduleIds) {
          if (id.startsWith("\0")) continue;
          byModule.set(path.relative(config.root, id.split("?")[0]).split(path.sep).join("/"), info);
        }
      }
    },
    async closeBundle() {
      if (config.build.ssr) return;
      const root = config.root;
      const outDir = path.resolve(root, config.build.outDir);
      const shell = await readFile(path.join(outDir, "index.html"), "utf8");
      if (!HEAD_BLOCK.test(shell) || !BODY_BLOCK.test(shell)) {
        throw new Error("[seo] index.html lost its <!-- seo:head --> / <!-- seo:body --> markers");
      }

      const { createServer } = await import("vite");
      const server = await createServer({
        configFile: false,
        root,
        logLevel: "error",
        appType: "custom",
        server: { middlewareMode: true, hmr: false, ws: false },
        resolve: config.resolve,
        esbuild: { jsx: "automatic" },
        optimizeDeps: { noDiscovery: true, include: [] },
      });

      try {
        const mod = (await server.ssrLoadModule("/src/seo/prerender.tsx")) as PrerenderModule;
        const write = async (file: string, html: string) => {
          const target = path.join(outDir, file);
          await mkdir(path.dirname(target), { recursive: true });
          await writeFile(target, html);
        };

        const routes = await mod.renderRoutes();
        const heroFilm = config.env.VITE_HERO_FILM !== "0";
        for (const route of routes) {
          const pageModule = route.page === "home" ? homeModule(heroFilm) : PAGE_MODULES[route.page];
          const modules = [pageModule, route.locale === "en" ? "" : localeModule(route.locale)].filter(Boolean);
          for (const id of modules) {
            if (!byModule.has(id)) config.logger.warn(`[seo] no chunk for ${id}: ${route.url} won't preload it`);
          }
          const preloads = [route.preloads, chunkPreloads(modules, byModule, byFile, config.base)]
            .filter(Boolean)
            .join("\n    ");
          await write(route.file, fill(shell, route.lang, route.head, route.body, preloads));
        }

        const notFound = mod.renderNotFound();
        await write(notFound.file, fill(shell, notFound.lang, notFound.head, notFound.body));
        await write(
          "app-shell.html",
          fill(shell, "en", mod.renderAppShellHead(), "<!-- the app renders here -->"),
        );

        const today = new Date().toISOString().slice(0, 10);
        const lastmod: Record<string, string> = {};
        for (const [page, sources] of Object.entries(mod.PAGE_SOURCES)) {
          lastmod[page] = lastCommitDate(root, sources ?? []) ?? today;
        }
        await write("sitemap.xml", mod.renderSitemap(lastmod));
        await write("robots.txt", mod.renderRobots());

        // GEO: llms.txt and llms-full.txt, from the same copy and data as the pages
        for (const [url, fn] of Object.entries(LLMS_FILES)) {
          const text = mod[fn]();
          const dashes = mod.findDashes(text);
          if (dashes.length > 0) {
            config.logger.warn(
              `[seo] ${url} has em/en dashes (copy rule: none). Fix the source copy:\n  ${dashes.join("\n  ")}`,
            );
          }
          await write(url.slice(1), text);
        }

        config.logger.info(
          `[seo] prerendered ${routes.length} routes + 404.html, app-shell.html, sitemap.xml, robots.txt, llms.txt, llms-full.txt`,
        );
      } finally {
        await server.close();
      }
    },
  };
}
