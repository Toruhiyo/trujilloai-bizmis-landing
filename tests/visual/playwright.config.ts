import fs from "node:fs";
import { defineConfig, devices } from "playwright/test";

/**
 * The landing's visual regression suite (see the "Visual regression suite"
 * section of the repo's agent rules). Runs against the production build
 * (vite build, then vite preview routed like Vercel: vite.preview.config.ts).
 *
 * The baselines are Linux renders from the pinned Playwright image (the same
 * image CI runs), so run it through `npm run test:visual`, which starts that
 * image locally. A plain `playwright test` on macOS would compare macOS font
 * rendering against Linux baselines and fail everywhere.
 */
const inContainer = Boolean(process.env.CI) || fs.existsSync("/.dockerenv") || Boolean(process.env.VR_IN_DOCKER);
if (!inContainer && !process.env.VR_ALLOW_HOST) {
  throw new Error(
    "Run the visual suite with `npm run test:visual` (it runs in the Playwright Docker image the baselines come from). " +
      "Set VR_ALLOW_HOST=1 to run it on this machine anyway (expect font-rendering diffs).",
  );
}

const PORT = Number(process.env.VR_PORT ?? 4791);
const OUT = "tests/visual/.build";

/** A viewport project: desktop sizes as a desktop Chrome, the rest as a touch device. */
const viewport = (name: string, width: number, height: number, touch: boolean) => ({
  name,
  use: {
    ...devices["Desktop Chrome"],
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: touch,
    hasTouch: touch,
    // on a host (VR_ALLOW_HOST) the system Chrome, as the image's browser isn't installed there
    ...(inContainer ? {} : { channel: "chrome" }),
  },
});

export default defineConfig({
  testDir: ".",
  outputDir: ".results",
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{testFileName}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: process.env.CI ? 4 : 6,
  timeout: 180_000,
  reporter: process.env.CI
    ? [["list"], ["github"], ["html", { outputFolder: ".report", open: "never" }]]
    : [["list"], ["html", { outputFolder: ".report", open: "never" }]],
  expect: {
    timeout: 15_000,
    // the screenshots (support.ts `shot`: one capture each, compared as an image snapshot)
    toMatchSnapshot: {
      // The pages are frozen (support.ts): a run reproduces a static shot to the pixel, so it is
      // compared finely: a pixel counts as changed from a small colour step (threshold 0.02, enough
      // to see a faint glow cut off), and 250 changed pixels (a 16x16 patch) fail it. The landing's
      // scroll-driven scenes are compared more coarsely (home.spec.ts `ANIMATED`). VR_STRICT=1
      // allows no changed pixel, VR_THRESHOLD sets the colour step (both to measure the noise).
      maxDiffPixels: process.env.VR_STRICT ? 0 : 250,
      threshold: Number(process.env.VR_THRESHOLD ?? 0.02),
    },
  },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "light",
    contextOptions: { reducedMotion: "no-preference" },
    serviceWorkers: "block",
    trace: "off",
    screenshot: "off",
  },
  projects: [
    viewport("desktop-1440x900", 1440, 900, false),
    viewport("phone-390x844", 390, 844, true),
    viewport("phone-landscape-844x390", 844, 390, true),
    viewport("tablet-768x1024", 768, 1024, true),
    viewport("wide-2560x1440", 2560, 1440, false),
  ],
  webServer: {
    // the production build, served the way Vercel serves it (never the dev server)
    command: `npx vite build --outDir ${OUT} --emptyOutDir && npx vite preview --config tests/visual/vite.preview.config.ts --outDir ${OUT} --host 127.0.0.1 --port ${PORT} --strictPort`,
    cwd: "../..",
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
