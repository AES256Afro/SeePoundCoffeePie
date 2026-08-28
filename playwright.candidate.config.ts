import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4198'

export default defineConfig({
  testDir: './tests/candidate-e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    colorScheme: 'light',
    contextOptions: {
      reducedMotion: 'reduce',
    },
    locale: 'en-US',
    screenshot: 'only-on-failure',
    serviceWorkers: 'block',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'candidate-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'SPCP_DEV_RUNNER_ORIGIN=https://127.0.0.1:1 node scripts/serve-practical-cpp-candidate-e2e.mjs',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
