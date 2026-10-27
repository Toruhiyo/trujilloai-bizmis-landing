/**
 * Build step: gives every public route in every locale its own static HTML.
 *
 * After `vite build` writes dist/index.html (the app shell), this loads
 * src/seo/prerender.tsx through Vite's SSR loader and, for each route, writes
 * a copy of the shell with the route's <html lang>, head tags (title,
 * description, canonical, hreflang, Open Graph, Twitter, JSON-LD) and static
 * text in place of the <!-- seo:head --> and <!-- seo:body --> blocks. Also
 * writes 404.html, app-shell.html (JS-only routes), sitemap.xml and
 * robots.txt. vercel.json routes each URL to its file.
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

const fill = (shell: string, lang: string, head: string, body: string) =>
  shell
    .replace(HTML_LANG, `<html lang="${lang}">`)
    .replace(HEAD_BLOCK, () => head)
    .replace(BODY_BLOCK, () => body);

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

export function seoPrerender(): Plugin {
  let config: ResolvedConfig;
  return {
    name: "bizmis-seo-prerender",
    apply: "build",
    configResolved(resolved) {
      config = resolved;
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
        for (const route of routes) {
          await write(route.file, fill(shell, route.lang, route.head, route.body));
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

        config.logger.info(
          `[seo] prerendered ${routes.length} routes + 404.html, app-shell.html, sitemap.xml, robots.txt`,
        );
      } finally {
        await server.close();
      }
    },
  };
}
