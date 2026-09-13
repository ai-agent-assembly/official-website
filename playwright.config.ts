import {defineConfig} from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:3068';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'pnpm build && pnpm serve -- --host 127.0.0.1 --port 3068',
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
