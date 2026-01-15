import { test as base, expect, Page, BrowserContext } from '@playwright/test';

// API base URL for direct API calls
const API_BASE = 'http://localhost:3000/api';

// Test users credentials
export const TEST_USERS = {
    admin: {
        email: 'admin@test.com',
        password: 'password123',
    },
    user: {
        email: 'seeker@test.com',
        password: 'password123',
    },
} as const;

// Auth state storage paths
const ADMIN_STORAGE = 'e2e/.auth/admin.json';
const USER_STORAGE = 'e2e/.auth/user.json';

/**
 * Login via API and store auth state
 */
export async function loginViaAPI(
    context: BrowserContext,
    email: string,
    password: string
): Promise<{ token: string; user: unknown }> {
    const response = await context.request.post(`${API_BASE}/auth/login`, {
        data: { email, password },
    });

    if (!response.ok()) {
        throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
    }

    const body = await response.json();
    const token = body.data?.token;
    const user = body.data?.user;

    if (!token) {
        throw new Error('No token received from login');
    }

    // Store token in localStorage via page evaluation
    const page = await context.newPage();
    await page.goto('/');
    await page.evaluate(
        ({ token, user }) => {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));
        },
        { token, user }
    );
    await page.close();

    return { token, user };
}

/**
 * Wait for Qwik hydration to complete
 */
export async function waitForHydration(page: Page): Promise<void> {
    // Wait for Qwik's hydration marker or any network idle
    await page.waitForLoadState('networkidle');
    // Additional wait for any client-side rendering
    await page.waitForFunction(() => {
        return document.readyState === 'complete';
    });
}

/**
 * Handle mobile menu if visible (for responsive tests)
 */
export async function openMobileMenuIfNeeded(page: Page): Promise<void> {
    const menuButton = page.locator('button[aria-label="Menu"], [data-testid="mobile-menu-button"]');
    if (await menuButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await menuButton.click();
        await page.waitForTimeout(300); // Animation time
    }
}

/**
 * Create a test job via API
 */
export async function createTestJob(
    context: BrowserContext,
    token: string,
    jobData?: Partial<{
        title: string;
        description: string;
        company_id: string;
        location: string;
        remote: boolean;
    }>
): Promise<string> {
    const defaultJob = {
        title: `E2E Test Job ${Date.now()}`,
        description: '<p>Test job created by E2E tests</p>',
        location: 'Milan',
        remote: true,
        ...jobData,
    };

    const response = await context.request.post(`${API_BASE}/jobs`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        data: defaultJob,
    });

    if (!response.ok()) {
        throw new Error(`Failed to create job: ${response.status()}`);
    }

    const body = await response.json();
    return body.data.id;
}

/**
 * Delete a test job via API
 */
export async function deleteTestJob(
    context: BrowserContext,
    token: string,
    jobId: string
): Promise<void> {
    const response = await context.request.delete(`${API_BASE}/jobs/${jobId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok() && response.status() !== 404) {
        throw new Error(`Failed to delete job: ${response.status()}`);
    }
}

/**
 * Reset user reactions (likes/dislikes) for a job via API
 */
export async function resetUserReactions(
    context: BrowserContext,
    token: string,
    jobId: string
): Promise<void> {
    // Remove like
    await context.request.delete(`${API_BASE}/likes?job_id=${jobId}&type=like`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    // Remove dislike  
    await context.request.delete(`${API_BASE}/likes?job_id=${jobId}&type=dislike`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

// Extend Playwright test with custom fixtures
type TestFixtures = {
    adminContext: BrowserContext;
    adminPage: Page;
    userContext: BrowserContext;
    userPage: Page;
    authenticatedAsAdmin: { token: string; user: unknown };
    authenticatedAsUser: { token: string; user: unknown };
};

export const test = base.extend<TestFixtures>({
    // Admin authenticated context
    adminContext: async ({ browser }, use) => {
        const context = await browser.newContext();
        await loginViaAPI(context, TEST_USERS.admin.email, TEST_USERS.admin.password);
        await use(context);
        await context.close();
    },

    // Admin authenticated page
    adminPage: async ({ adminContext }, use) => {
        const page = await adminContext.newPage();
        await use(page);
        await page.close();
    },

    // User authenticated context
    userContext: async ({ browser }, use) => {
        const context = await browser.newContext();
        await loginViaAPI(context, TEST_USERS.user.email, TEST_USERS.user.password);
        await use(context);
        await context.close();
    },

    // User authenticated page
    userPage: async ({ userContext }, use) => {
        const page = await userContext.newPage();
        await use(page);
        await page.close();
    },

    // Auth data for admin
    authenticatedAsAdmin: async ({ browser }, use) => {
        const context = await browser.newContext();
        const auth = await loginViaAPI(context, TEST_USERS.admin.email, TEST_USERS.admin.password);
        await use(auth);
        await context.close();
    },

    // Auth data for user
    authenticatedAsUser: async ({ browser }, use) => {
        const context = await browser.newContext();
        const auth = await loginViaAPI(context, TEST_USERS.user.email, TEST_USERS.user.password);
        await use(auth);
        await context.close();
    },
});

export { expect };
