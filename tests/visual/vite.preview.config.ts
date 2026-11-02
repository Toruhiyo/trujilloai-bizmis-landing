import fs from "node:fs";
import path from "node:path";
import { defineConfig, mergeConfig, type Plugin } from "vite";
import base from "../../vite.config";

/**
 * `vite preview` as Vercel serves the build (vercel.json): a clean URL gets its
 * prerendered page (/pricing -> dist/pricing/index.html), the app-shell routes
 * get app-shell.html, and anything else is 404.html with a 404 status. Plain
 * `vite preview` would answer every path with the home page's HTML.
 */
const vercelRouting = (): Plugin => ({
  name: "bizmis-vr-vercel-routing",
  configurePreviewServer(server) {
    const dist = path.resolve(server.config.root, server.config.build.outDir);
    const send = (res: import("node:http").ServerResponse, file: string, status = 200) => {
      res.statusCode = status;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(fs.readFileSync(file));
    };
    server.middlewares.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();
      const url = (req.url ?? "/").split("?")[0];
      if (path.extname(url)) return next();
      const clean = url.replace(/\/+$/, "");
      const page = path.join(dist, clean, "index.html");
      if (page.startsWith(dist) && fs.existsSync(page)) return send(res, page);
      if (/^\/(?:(?:es|fr|it|ca)\/)?(?:v2|unsubscribe)$/.test(clean) || /^\/(?:admin|email-renders)(?:\/|$)/.test(clean))
        return send(res, path.join(dist, "app-shell.html"));
      return send(res, path.join(dist, "404.html"), 404);
    });
  },
});

export default defineConfig((env) =>
  mergeConfig(typeof base === "function" ? base(env) : base, { plugins: [vercelRouting()] }),
);
