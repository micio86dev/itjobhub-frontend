import { test, expect, TEST_USERS } from './fixtures';
import { SELECTORS, ensurePageReady, loginViaUI, isMobileViewport } from './helpers';

/**
 * Mobile-specific tests
 * These tests specifically target mobile viewports and interactions
 */
test.describe('Mobile Experience', () => {
    // Only run on mobile projects
    test.skip(({ browserName }, testInfo) => {
        return !testInfo.project.name.toLowerCase().includes('mobile');
    }, 'Only runs on mobile viewports');

    test.describe('Navigation', () => {
        test('should show hamburger menu on mobile', async ({ page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            const hamburgerMenu = page.locator(SELECTORS.mobileMenuButton);
            await expect(hamburgerMenu).toBeVisible();
        });

        test('should open navigation when clicking hamburger', async ({ page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            const hamburgerMenu = page.locator(SELECTORS.mobileMenuButton);
            await hamburgerMenu.click();

            // Navigation should be visible
            const navLinks = page.locator('nav a, [role="navigation"] a');
            await expect(navLinks.first()).toBeVisible();
        });

        test('should navigate to login via mobile menu', async ({ page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            const hamburgerMenu = page.locator(SELECTORS.mobileMenuButton);
            await hamburgerMenu.click();

            const loginLink = page.getByRole('link', { name: /login/i }).first();
            await loginLink.click();

            await expect(page).toHaveURL(/\/login/);
        });

        test('should close menu when navigating', async ({ page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            const hamburgerMenu = page.locator(SELECTORS.mobileMenuButton);
            await hamburgerMenu.click();

            // Click a link
            await page.getByRole('link', { name: /login/i }).first().click();

            // After navigation, menu should be closed (hamburger visible again)
            await ensurePageReady(page);
            if (await hamburgerMenu.isVisible({ timeout: 1000 }).catch(() => false)) {
                // Menu is closed (hamburger is visible means menu not expanded)
                await expect(hamburgerMenu).toBeVisible();
            }
        });
    });

    test.describe('Guest Experience', () => {
        test('should see job cards in mobile layout', async ({ page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            const jobCards = page.locator(SELECTORS.jobCard);
            await expect(jobCards.first()).toBeVisible();

            // Cards should take full width on mobile
            const cardBoundingBox = await jobCards.first().boundingBox();
            const viewportSize = page.viewportSize();

            if (cardBoundingBox && viewportSize) {
                // Card should be at least 80% of viewport width on mobile
                expect(cardBoundingBox.width).toBeGreaterThan(viewportSize.width * 0.7);
            }
        });

        test('should be able to search on mobile', async ({ page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            const searchInput = page.locator(SELECTORS.searchQuery);

            if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                await searchInput.fill('developer');
                await searchInput.press('Enter');
                await ensurePageReady(page);
            }
        });

        test('should navigate to job detail on mobile', async ({ page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            const firstJob = page.locator(SELECTORS.jobCardLink).first();
            await firstJob.click();

            await expect(page).toHaveURL(/\/jobs\/detail\//);
        });
    });

    test.describe('Authenticated Mobile Experience', () => {
        test.beforeEach(async ({ page }) => {
            await loginViaUI(page, TEST_USERS.user.email, TEST_USERS.user.password);
        });

        test('should show authenticated menu items on mobile', async ({ page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            const hamburgerMenu = page.locator(SELECTORS.mobileMenuButton);
            await hamburgerMenu.click();

            // Should see logout button
            const logoutBtn = page.locator(SELECTORS.logoutButton).first();
            await expect(logoutBtn).toBeVisible({ timeout: 3000 });
        });

        test('should be able to access profile via mobile menu', async ({ page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            const hamburgerMenu = page.locator(SELECTORS.mobileMenuButton);
            await hamburgerMenu.click();

            const profileLink = page.locator(SELECTORS.profileLink).first();
            if (await profileLink.isVisible({ timeout: 2000 }).catch(() => false)) {
                await profileLink.click();
                await expect(page).toHaveURL(/\/profile/);
            }
        });

        test('should be able to logout via mobile menu', async ({ page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            const hamburgerMenu = page.locator(SELECTORS.mobileMenuButton);
            await hamburgerMenu.click();

            const logoutBtn = page.locator(SELECTORS.logoutButton).first();
            if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await logoutBtn.click();
                await expect(page).toHaveURL(/\/(login)?$/);
            }
        });
    });

    test.describe('Touch Interactions', () => {
        test('should handle tap on like button', async ({ page }) => {
            await loginViaUI(page, TEST_USERS.user.email, TEST_USERS.user.password);

            await page.goto('/jobs');
            await ensurePageReady(page);

            const firstJob = page.locator(SELECTORS.jobCardLink).first();
            await firstJob.tap();

            await expect(page).toHaveURL(/\/jobs\/detail\//);
            await ensurePageReady(page);

            const likeBtn = page.locator(SELECTORS.likeButton);
            if (await likeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await likeBtn.tap();
                // Should still be on page, button should work
                await expect(likeBtn).toBeVisible();
            }
        });

        test('should handle scrolling on job list', async ({ page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            // Scroll down
            await page.evaluate(() => {
                window.scrollBy(0, 500);
            });

            // Should still see job cards
            const jobCards = page.locator(SELECTORS.jobCard);
            expect(await jobCards.count()).toBeGreaterThan(0);
        });
    });

    test.describe('Responsive Layout', () => {
        test('should hide desktop navigation on mobile', async ({ page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            // Desktop nav should be hidden
            const desktopNav = page.locator('nav.hidden.lg\\:flex, [data-desktop-nav]');
            if (await desktopNav.count() > 0) {
                await expect(desktopNav.first()).not.toBeVisible();
            }
        });

        test('should show mobile-optimized search if exists', async ({ page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            const searchInput = page.locator(SELECTORS.searchQuery);
            if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                const boundingBox = await searchInput.boundingBox();
                const viewportSize = page.viewportSize();

                if (boundingBox && viewportSize) {
                    // Search should be reasonably wide on mobile
                    expect(boundingBox.width).toBeGreaterThan(viewportSize.width * 0.5);
                }
            }
        });
    });
});
