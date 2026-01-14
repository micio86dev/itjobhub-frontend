import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 30 * 1000,
    expect: {
        timeout: 5000
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
    },
    projects: [
        // Desktop Chrome
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // Desktop Safari
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        // Mobile Chrome
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        // Mobile Safari
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
    ],
    webServer: {
        command: 'bun run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
