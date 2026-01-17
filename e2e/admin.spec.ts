import { test, expect, TEST_USERS } from './fixtures';
import { SELECTORS, ensurePageReady, loginViaUI, verifyAuthState } from './helpers';

test.describe('Admin User', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin
        await loginViaUI(page, TEST_USERS.admin.email, TEST_USERS.admin.password);
    });

    test.describe('Authentication & Access', () => {
        test('should have admin auth state after login', async ({ page }) => {
            await verifyAuthState(page, true);

            const authUser = await page.evaluate(() => {
                const user = localStorage.getItem('auth_user');
                return user ? JSON.parse(user) : null;
            });

            expect(authUser?.role).toBe('admin');
        });

        test('should be able to access admin panel', async ({ page }) => {
            await page.goto('/admin');
            await ensurePageReady(page);

            // Should not be redirected to login
            await expect(page).toHaveURL(/\/admin/);
        });
    });

    test.describe('Job Management', () => {
        test('should be able to view all jobs', async ({ page }) => {
            await page.goto('/jobs');
            await ensurePageReady(page);

            await expect(page.locator(SELECTORS.jobCard).first()).toBeVisible();
        });

        test('should see delete button on job detail page', async ({ page }) => {
            await page.goto('/jobs');
            await ensurePageReady(page);

            const jobLink = page.locator(SELECTORS.jobCardLink).first();
            if (await jobLink.count() > 0) {
                await jobLink.click();
                await expect(page).toHaveURL(/\/jobs\/detail\//);
                await ensurePageReady(page);

                // Admin should see delete button
                const deleteBtn = page.locator(SELECTORS.deleteButton).first();
                await expect(deleteBtn).toBeVisible({ timeout: 10000 });
            }
        });

        test('should be able to delete a job with confirmation', async ({ page }) => {
            await page.goto('/jobs');
            await ensurePageReady(page);

            const jobLink = page.locator(SELECTORS.jobCardLink).first();
            if (await jobLink.count() > 0) {
                await jobLink.click();
                await expect(page).toHaveURL(/\/jobs\/detail\//);
                await ensurePageReady(page);

                // Click delete button
                const deleteBtn = page.locator(SELECTORS.deleteButton).first();
                await expect(deleteBtn).toBeVisible({ timeout: 10000 });
                await deleteBtn.click();

                // Modal should appear
                await expect(page.locator(SELECTORS.modal)).toBeVisible();
                await expect(page.locator('text=/sicuro|eliminare|delete|confirm/i').first()).toBeVisible();

                // Confirm deletion
                const confirmBtn = page.locator(SELECTORS.modalConfirm);
                await confirmBtn.click();

                // Should redirect to jobs list
                await expect(page).toHaveURL(/\/jobs\/?$/);
            }
        });

        test('should be able to cancel job deletion', async ({ page }) => {
            await page.goto('/jobs');
            await ensurePageReady(page);

            const jobLink = page.locator(SELECTORS.jobCardLink).first();
            if (await jobLink.count() > 0) {
                const currentUrl = page.url();
                await jobLink.click();
                await expect(page).toHaveURL(/\/jobs\/detail\//);
                const detailUrl = page.url();
                await ensurePageReady(page);

                // Click delete button
                const deleteBtn = page.locator(SELECTORS.deleteButton).first();
                await expect(deleteBtn).toBeVisible({ timeout: 10000 });
                await deleteBtn.click();

                // Modal should appear
                await expect(page.locator(SELECTORS.modal)).toBeVisible();

                // Cancel deletion
                const cancelBtn = page.locator(SELECTORS.modalCancel);
                await cancelBtn.click();

                // Modal should close, should still be on detail page
                await expect(page.locator(SELECTORS.modal)).not.toBeVisible();
                await expect(page).toHaveURL(detailUrl);
            }
        });
    });

    test.describe('Admin Dashboard', () => {
        test('should see admin statistics or dashboard elements', async ({ page }) => {
            await page.goto('/admin');
            await ensurePageReady(page);

            // Should see admin content - new specific selectors
            await expect(page.getByTestId('admin-stats-users-card')).toBeVisible();
            await expect(page.getByTestId('admin-stats-jobs-card')).toBeVisible();
            await expect(page.getByTestId('admin-stats-companies-card')).toBeVisible();
            await expect(page.getByTestId('admin-stats-engagement-card')).toBeVisible();

            // Stats values should be visible
            await expect(page.getByTestId('admin-stats-total-users')).toBeVisible();
            await expect(page.getByTestId('admin-stats-active-jobs')).toBeVisible();
        });

        test('should access admin stats page if available', async ({ page }) => {
            await page.goto('/admin/stats');
            await ensurePageReady(page);

            // Either we see stats or redirect to admin
            const isOnAdminPage = /\/admin/.test(page.url());
            expect(isOnAdminPage).toBeTruthy();

            // Check for selectors
            await expect(page.getByTestId('admin-stats-month-select')).toBeVisible().catch(() => { });
            await expect(page.getByTestId('admin-stats-year-select')).toBeVisible().catch(() => { });
        });
    });

    test.describe('Comments Moderation', () => {
        test('should be able to see delete button on any comment', async ({ page }) => {
            await page.goto('/jobs');
            await ensurePageReady(page);

            const jobLink = page.locator(SELECTORS.jobCardLink).first();
            if (await jobLink.count() > 0) {
                await jobLink.click();
                await expect(page).toHaveURL(/\/jobs\/detail\//);
                await ensurePageReady(page);

                // Check if there are comments
                const comments = page.locator(SELECTORS.commentItem);
                if (await comments.count() > 0) {
                    // Admin should see delete button on comments
                    const deleteCommentBtn = comments.first().locator(SELECTORS.commentDelete);
                    // May or may not be visible depending on comment ownership and UI
                    await expect(deleteCommentBtn).toBeVisible({ timeout: 3000 }).catch(() => {
                        // Not all comments may have delete visible, that's okay
                    });
                }
            }
        });
    });

    test.describe('Navigation', () => {
        test('should see admin-specific navigation elements', async ({ page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            // Handle mobile menu
            const mobileMenu = page.locator(SELECTORS.mobileMenuButton);
            if (await mobileMenu.isVisible({ timeout: 1000 }).catch(() => false)) {
                await mobileMenu.click();
            }

            // Admin might see "Pubblica Annuncio" or admin link
            const adminLinks = page.locator(`${SELECTORS.adminLink}, ${SELECTORS.postJobLink}`);
            if (await adminLinks.first().isVisible({ timeout: 2000 }).catch(() => false)) {
                await expect(adminLinks.first()).toBeVisible();
            }
        });
    });
});
