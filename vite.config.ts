import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { spawn } from "node:child_process";
import { componentTagger } from "lovable-tagger";

/**
 * Dev-only HTTP endpoints that shell out to the Instantly generator
 * scripts so the admin UI can offer one-click regeneration buttons. Each
 * route runs its npm script as a child process, then responds with the
 * captured stdout/stderr and exit code. Active only with `apply: "serve"`,
 * so production builds never expose these endpoints.
 */
const DEV_GENERATOR_ROUTES: Record<string, string> = {
  "/__bizmis/regenerate-instantly-template": "generate:instantly-template",
  "/__bizmis/regenerate-instantly-lead-fields": "generate:instantly-lead-fields",
};

function devGeneratorEndpoints(): PluginOption {
  return {
    name: "bizmis-dev-generator-endpoints",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "POST" || !req.url) return next();
        const route = req.url.split("?")[0];
        const npmScript = DEV_GENERATOR_ROUTES[route];
        if (!npmScript) return next();

        const child = spawn("npm", ["run", "--silent", npmScript], {
          cwd: server.config.root,
          env: process.env,
        });
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
        child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
        child.on("error", (err) => {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: err.message }));
        });
        child.on("close", (exitCode) => {
          res.statusCode = exitCode === 0 ? 200 : 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: exitCode === 0, exitCode, stdout, stderr }));
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && devGeneratorEndpoints(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
