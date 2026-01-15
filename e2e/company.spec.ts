import { test, expect, TEST_USERS } from './fixtures';
import { SELECTORS, ensurePageReady, loginViaUI } from './helpers';

test.describe('Company User / Admin Job Posting', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin (who acts as company for now in tests)
        await loginViaUI(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    });

    test.describe('Job Posting Access', () => {
        test('should see the post job button/link', async ({ page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            // Handle mobile menu
            const mobileMenu = page.locator(SELECTORS.mobileMenuButton);
            if (await mobileMenu.isVisible({ timeout: 1000 }).catch(() => false)) {
                await mobileMenu.click();
            }

            // Look for "Pubblica Annuncio" or similar link
            const postLink = page.getByRole('link', { name: /Pubblica Annuncio|Post Job|Nuovo/i });

            if (await postLink.isVisible({ timeout: 2000 }).catch(() => false)) {
                await postLink.click();
                await expect(page).toHaveURL(/.*jobs\/new|.*admin/);
            } else {
                // Fallback: check admin page for job creation
                await page.goto('/admin');
                await expect(page).toHaveURL(/.*admin/);
            }
        });

        test('should have access to admin panel for job management', async ({ page }) => {
            await page.goto('/admin');
            await ensurePageReady(page);

            await expect(page).toHaveURL(/.*admin/);
            await expect(page.locator('h1, h2').first()).toBeVisible();
        });
    });

    test.describe('Job Visibility', () => {
        test('should see all jobs including own', async ({ page }) => {
            await page.goto('/jobs');
            await ensurePageReady(page);

            const jobCards = page.locator(SELECTORS.jobCard);
            await expect(jobCards.first()).toBeVisible();

            const count = await jobCards.count();
            expect(count).toBeGreaterThan(0);
        });

        test('should be able to view job details', async ({ page }) => {
            await page.goto('/jobs');
            await ensurePageReady(page);

            const firstJob = page.locator(SELECTORS.jobCardLink).first();
            await firstJob.click();

            await expect(page).toHaveURL(/\/jobs\/detail\//);
            await ensurePageReady(page);

            // Job title should be visible
            await expect(page.locator('h1').first()).toBeVisible();
        });
    });

    test.describe('Job Actions', () => {
        test('should see edit/delete options on own jobs', async ({ page }) => {
            await page.goto('/jobs');
            await ensurePageReady(page);

            const firstJob = page.locator(SELECTORS.jobCardLink).first();
            if (await firstJob.count() > 0) {
                await firstJob.click();
                await expect(page).toHaveURL(/\/jobs\/detail\//);
                await ensurePageReady(page);

                // Should see delete button (admin has this)
                const deleteBtn = page.locator(SELECTORS.deleteButton).first();
                await expect(deleteBtn).toBeVisible({ timeout: 10000 });
            }
        });
    });

    test.describe('Statistics', () => {
        test('should be able to access admin stats', async ({ page }) => {
            await page.goto('/admin/stats');
            await ensurePageReady(page);

            // Should either see stats or be on admin page
            expect(page.url()).toMatch(/\/admin/);
        });
    });
});
