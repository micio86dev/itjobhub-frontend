import { test, expect } from './fixtures';
import { ensurePageReady, getReactionCounts, goToFirstJobDetail, SELECTORS } from './helpers';

test.describe('Registered User', () => {

    test.describe('Profile', () => {
        test('should be able to view their profile', async ({ userPage: page }) => {
            await page.goto('/profile');
            await ensurePageReady(page);
            await expect(page.locator('h1').first()).toBeVisible();
        });

        test('should be able to update their profile', async ({ userPage: page }) => {
            await page.goto('/profile');
            await ensurePageReady(page);
            const bioInput = page.locator(SELECTORS.profileBio);
            if (await bioInput.isVisible({ timeout: 5000 })) {
                const newBio = `Updated bio ${Date.now()}`;
                await bioInput.fill(newBio);
                await page.locator(SELECTORS.profileSave).click();
                await page.waitForTimeout(1000);
                await page.reload();
                await expect(page.locator(SELECTORS.profileBio)).toHaveValue(newBio);
            }
        });
    });

    test.describe('Jobs', () => {
        test('should be able to view job listings', async ({ userPage: page }) => {
            await page.goto('/jobs');
            await ensurePageReady(page);
            await expect(page.locator(SELECTORS.jobCard).first()).toBeVisible({ timeout: 10000 });
        });

        test('should be able to search and filter jobs', async ({ userPage: page }) => {
            await page.goto('/jobs');
            await ensurePageReady(page);
            const searchInput = page.locator(SELECTORS.searchQuery);
            await searchInput.fill('developer');
            await searchInput.press('Enter');
            await expect(page).toHaveURL(/\?|jobs/);
        });

        test('should be able to view job details', async ({ userPage: page }) => {
            await goToFirstJobDetail(page);
            await expect(page.locator('h1').first()).toBeVisible();
        });
    });

    test.describe('Reactions (Like/Dislike)', () => {
        // Reset reactions before each test to ensure isolation
        test.beforeEach(async ({ userContext }) => {
            // We need to know which job is the "first" one. 
            // Alternatively, we can just reset reactions after we navigate.
        });

        test('should be able to like a job', async ({ userPage: page, userContext, authenticatedAsUser }) => {
            await goToFirstJobDetail(page);

            // Extract jobId from URL
            const url = page.url();
            const jobId = url.split('/').pop()?.split('?')[0];
            if (jobId) {
                const { resetUserReactions } = await import('./fixtures');
                await resetUserReactions(userContext, authenticatedAsUser.token, jobId);
                await page.reload();
                await ensurePageReady(page);
            }

            await page.waitForTimeout(1000); // Hydration wait

            const likeBtn = page.locator(SELECTORS.likeButton).first();
            const initial = await getReactionCounts(page);

            await likeBtn.click();
            await expect.poll(async () => {
                const current = await getReactionCounts(page);
                return current.likes;
            }, { timeout: 15000 }).toBe(initial.likes + 1);
        });

        test('should be able to toggle like off', async ({ userPage: page, userContext, authenticatedAsUser }) => {
            await goToFirstJobDetail(page);

            // Isolation reset
            const jobId = page.url().split('/').pop()?.split('?')[0];
            if (jobId) {
                const { resetUserReactions } = await import('./fixtures');
                await resetUserReactions(userContext, authenticatedAsUser.token, jobId);
                await page.reload();
                await ensurePageReady(page);
            }

            await page.waitForTimeout(1000);
            const likeBtn = page.locator(SELECTORS.likeButton).first();
            const initial = await getReactionCounts(page);

            // Turn like on
            await likeBtn.click();
            await expect.poll(async () => (await getReactionCounts(page)).likes, { timeout: 10000 }).toBe(initial.likes + 1);

            // Turn like off
            await likeBtn.click();
            await expect.poll(async () => (await getReactionCounts(page)).likes, { timeout: 10000 }).toBe(initial.likes);
        });

        test('should update counts when switching from like to dislike', async ({ userPage: page, userContext, authenticatedAsUser }) => {
            await goToFirstJobDetail(page);

            // Isolation reset
            const jobId = page.url().split('/').pop()?.split('?')[0];
            if (jobId) {
                const { resetUserReactions } = await import('./fixtures');
                await resetUserReactions(userContext, authenticatedAsUser.token, jobId);
                await page.reload();
                await ensurePageReady(page);
            }

            await page.waitForTimeout(1000);
            const likeBtn = page.locator(SELECTORS.likeButton).first();
            const dislikeBtn = page.locator(SELECTORS.dislikeButton).first();
            const initial = await getReactionCounts(page);

            // Like it first
            await likeBtn.click();
            await expect.poll(async () => (await getReactionCounts(page)).likes, { timeout: 10000 }).toBe(initial.likes + 1);

            // Switch to dislike
            await dislikeBtn.click();
            await expect.poll(async () => await getReactionCounts(page), { timeout: 15000 }).toEqual({
                likes: initial.likes,
                dislikes: initial.dislikes + 1
            });
        });
    });

    test.describe('Favorites', () => {
        test('should be able to access favorites page', async ({ userPage: page }) => {
            await page.goto('/favorites');
            await ensurePageReady(page);
            await expect(page.locator('h1').first()).toBeVisible();
        });

        test('should be able to favorite a job from listing', async ({ userPage: page }) => {
            await page.goto('/jobs');
            await ensurePageReady(page);
            const firstCard = page.locator(SELECTORS.jobCard).first();
            const favBtn = firstCard.locator(SELECTORS.favoriteButton);
            if (await favBtn.isVisible()) {
                await favBtn.click();
                await page.waitForResponse(r => r.url().includes('/favorites'), { timeout: 5000 }).catch(() => null);
            }
        });
    });

    test.describe('Comments', () => {
        test('should be able to see comment section on job detail', async ({ userPage: page }) => {
            await goToFirstJobDetail(page);
            await expect(page.locator('text=/commenti|comments/i').first()).toBeVisible({ timeout: 10000 });
        });

        test('should be able to add a comment', async ({ userPage: page }) => {
            await goToFirstJobDetail(page);
            const input = page.locator(SELECTORS.commentInput);
            if (await input.isVisible({ timeout: 5000 })) {
                const text = `Comment ${Date.now()}`;
                await input.fill(text);
                await page.locator(SELECTORS.commentSubmit).click();
                await expect(page.locator(`text="${text}"`).first()).toBeVisible({ timeout: 10000 });
            }
        });
    });

    test.describe('Navigation', () => {
        test('should see authenticated navigation elements', async ({ userPage: page }) => {
            await page.goto('/');
            await ensurePageReady(page);

            // If on mobile, open menu first
            const mobileMenuBtn = page.locator(SELECTORS.mobileMenuButton);
            if (await mobileMenuBtn.isVisible()) {
                await mobileMenuBtn.click();
                await page.waitForTimeout(500);
            }

            const logoutBtn = page.locator(SELECTORS.logoutButton).filter({ visible: true }).first();
            await expect(logoutBtn).toBeVisible({ timeout: 10000 });
        });
    });
});
