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

            // Isolation reset: Ensure we start with no reactions
            const url = page.url();
            const jobIdMatch = url.match(/\/jobs\/detail\/([^\/?#]+)/);
            const jobId = jobIdMatch ? jobIdMatch[1] : null;

            if (jobId) {
                const { resetUserReactions } = await import('./fixtures');
                await resetUserReactions(userContext, authenticatedAsUser.token, jobId);
                await page.reload();
                await ensurePageReady(page);
            }

            await page.waitForTimeout(1500); // Hydration wait

            const scope = '[data-testid="job-actions"]';
            const likeBtn = page.locator(scope).locator(SELECTORS.likeButton).first();

            // PRE-CONDITION: Button should not be active initially
            await expect(likeBtn).toHaveAttribute('data-active', 'false', { timeout: 10000 });
            const initial = await getReactionCounts(page, scope);

            // Wait for the POST request to complete if we click
            const responsePromise = page.waitForResponse(r =>
                r.url().includes('/likes') && r.request().method() === 'POST',
                { timeout: 10000 }
            ).catch(() => null);

            await likeBtn.click({ force: true });
            await responsePromise;

            // ASSERT: Button should now be active
            await expect(likeBtn).toHaveAttribute('data-active', 'true', { timeout: 10000 });
            await expect.poll(async () => {
                const current = await getReactionCounts(page, scope);
                return current.likes;
            }, { timeout: 20000, intervals: [500, 1000, 2000] }).toBe(initial.likes + 1);
        });

        test('should be able to toggle like off', async ({ userPage: page, userContext, authenticatedAsUser }) => {
            await goToFirstJobDetail(page);

            // Isolation reset
            const url = page.url();
            const jobIdMatch = url.match(/\/jobs\/detail\/([^\/?#]+)/);
            const jobId = jobIdMatch ? jobIdMatch[1] : null;

            if (jobId) {
                const { resetUserReactions } = await import('./fixtures');
                await resetUserReactions(userContext, authenticatedAsUser.token, jobId);
                await page.reload();
                await ensurePageReady(page);
            }

            await page.waitForTimeout(1500);
            const scope = '[data-testid="job-actions"]';
            const likeBtn = page.locator(scope).locator(SELECTORS.likeButton).first();

            // PRE-CONDITION
            await expect(likeBtn).toHaveAttribute('data-active', 'false', { timeout: 10000 });
            const initial = await getReactionCounts(page, scope);

            // Turn like on
            const likeOnPromise = page.waitForResponse(r =>
                r.url().includes('/likes') && r.request().method() === 'POST',
                { timeout: 15000 }
            ).catch(() => null);

            await likeBtn.click({ force: true });

            await likeOnPromise;
            await expect(likeBtn).toHaveAttribute('data-active', 'true', { timeout: 10000 });
            await page.waitForTimeout(1500);
            await expect.poll(async () => (await getReactionCounts(page, scope)).likes, { timeout: 20000 }).toBe(initial.likes + 1);

            // Turn like off
            const likeOffPromise = page.waitForResponse(r =>
                r.url().includes('/likes') && r.request().method() === 'DELETE',
                { timeout: 15000 }
            ).catch(() => null);

            await likeBtn.click({ force: true });

            await likeOffPromise;
            await expect(likeBtn).toHaveAttribute('data-active', 'false', { timeout: 10000 });
            await page.waitForTimeout(1500);
            await expect.poll(async () => (await getReactionCounts(page, scope)).likes, { timeout: 20000 }).toBe(initial.likes);
        });

        test('should update counts when switching from like to dislike', async ({ userPage: page, userContext, authenticatedAsUser }) => {
            await goToFirstJobDetail(page);

            // Isolation reset
            const url = page.url();
            const jobIdMatch = url.match(/\/jobs\/detail\/([^\/?#]+)/);
            const jobId = jobIdMatch ? jobIdMatch[1] : null;

            if (jobId) {
                const { resetUserReactions } = await import('./fixtures');
                await resetUserReactions(userContext, authenticatedAsUser.token, jobId);
                await page.reload();
                await ensurePageReady(page);
            }

            await page.waitForTimeout(1500);
            const scope = '[data-testid="job-actions"]';
            const likeBtn = page.locator(scope).locator(SELECTORS.likeButton).first();
            const dislikeBtn = page.locator(scope).locator(SELECTORS.dislikeButton).first();

            // PRE-CONDITION
            await expect(likeBtn).toHaveAttribute('data-active', 'false', { timeout: 10000 });
            await expect(dislikeBtn).toHaveAttribute('data-active', 'false', { timeout: 10000 });
            const initial = await getReactionCounts(page, scope);

            // Like it first
            const likePromise = page.waitForResponse(r =>
                r.url().includes('/likes') && r.request().method() === 'POST',
                { timeout: 15000 }
            ).catch(() => null);

            await likeBtn.click({ force: true });

            await likePromise;
            await expect(likeBtn).toHaveAttribute('data-active', 'true', { timeout: 10000 });
            await page.waitForTimeout(1500);
            await expect.poll(async () => (await getReactionCounts(page, scope)).likes, { timeout: 20000 }).toBe(initial.likes + 1);

            // Switch to dislike
            const dislikePromise = page.waitForResponse(r =>
                r.url().includes('/likes') && r.request().method() === 'POST',
                { timeout: 15000 }
            ).catch(() => null);

            await dislikeBtn.click({ force: true });

            await dislikePromise;
            await expect(dislikeBtn).toHaveAttribute('data-active', 'true', { timeout: 10000 });
            await expect(likeBtn).toHaveAttribute('data-active', 'false', { timeout: 10000 });
            await page.waitForTimeout(1500);
            await expect.poll(async () => await getReactionCounts(page, scope), { timeout: 20000 }).toEqual({
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
