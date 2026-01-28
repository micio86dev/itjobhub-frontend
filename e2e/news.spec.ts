import { test, expect, createTestNews, deleteTestNews, TEST_USERS, API_BASE } from "./fixtures";
import { SELECTORS, ensurePageReady, navigateTo } from "./helpers";

test.describe("News Feature", () => {
    let newsId: string;
    let newsSlug: string;
    let newsTitle: string;
    let adminToken: string;

    test.beforeAll(async ({ request }) => {
        // Login as admin to get token
        const loginRes = await request.post(`${API_BASE}/auth/login`, {
            data: {
                email: TEST_USERS.admin.email,
                password: TEST_USERS.admin.password
            }
        });
        const loginData = await loginRes.json();
        adminToken = loginData.data.token;

        // Create a test news article
        const timestamp = Date.now();
        const testNews = await createTestNews(request, adminToken, {
            title: `E2E News Title ${timestamp}`,
            slug: `e2e-news-${timestamp}`,
            summary: "This is a summary for E2E testing",
            content: "<p>This is the content for E2E testing</p>",
            category: "Development",
            is_published: true
        });
        newsId = testNews.id;
        newsSlug = testNews.slug;
        newsTitle = testNews.title;
    });

    test.afterAll(async ({ request }) => {
        if (newsId && adminToken) {
            await deleteTestNews(request, adminToken, newsId);
        }
    });

    test.beforeEach(async ({ page }) => {
        if (page) {
            await page.context().addCookies([{
                name: "preferred-language",
                value: "en",
                domain: "localhost",
                path: "/"
            }]);
        }
    });

    test("Guest can view news list", async ({ page }) => {
        await navigateTo(page, "/news");

        // Check for header
        await expect(page.locator("h1")).toContainText("Tech News & Insights");

        // filters should be visible
        await expect(page.getByText("All", { exact: true })).toBeVisible();
        await expect(page.getByRole("button", { name: "Development" })).toBeVisible();

        // Check if our created news is present using the title
        // We might need to wait for hydration or list loading
        await expect(page.getByText(newsTitle, { exact: true })).toBeVisible();
    });

    test("Guest can navigate to news detail", async ({ page }) => {
        await navigateTo(page, "/news");

        // Click on the news card link
        await page.getByText(newsTitle, { exact: true }).first().click();

        await expect(page).toHaveURL(new RegExp(`/news/${newsSlug}`));
        await ensurePageReady(page);

        // Verify content
        await expect(page.locator("h1")).toContainText(/E2E News Title/);
        await expect(page.locator("article")).toBeVisible();

        // Verify back link works
        await page.click('[data-testid="back-link"]');
        await expect(page).toHaveURL(/\/news$/);
    });

    test("Authenticated user can like news", async ({ userPage }) => {
        await navigateTo(userPage, `/news/${newsSlug}`);

        const likeBtn = userPage.getByTestId("like-btn");
        const dislikeBtn = userPage.getByTestId("dislike-btn");

        await expect(likeBtn).toBeVisible();
        await expect(dislikeBtn).toBeVisible();

        // Initial state logic depends on previous runs, but assuming fresh user/news it should be neutral
        // We'll just click and verify no error toast/action happens
        await likeBtn.click();

        // Check if the button has the active state class (brand-neon style)
        await expect(likeBtn).toHaveClass(/bg-brand-neon|text-brand-neon|border-brand-neon/);
    });

    test("Admin can delete news", async ({ adminPage, request }) => {
        // Create another news article specifically for deletion test to avoid affecting other tests
        const timestamp = Date.now();
        const testNews = await createTestNews(request, adminToken, {
            title: `Delete Me News ${timestamp}`,
            slug: `delete-me-${timestamp}`,
            summary: "This news will be deleted",
            content: "<p>Content</p>",
            category: "Testing",
            is_published: true
        });

        await navigateTo(adminPage, `/news/${testNews.slug}`);
        await ensurePageReady(adminPage);

        const deleteBtn = adminPage.getByTestId("delete-article-btn");
        await expect(deleteBtn).toBeVisible();
        await deleteBtn.click();

        // Modal should appear
        const modal = adminPage.locator('[role="dialog"]');
        await expect(modal).toBeVisible();
        await expect(modal).toContainText(/confirm|delete|sicuro|eliminare/i);

        // Confirm
        const confirmBtn = adminPage.getByTestId("modal-confirm");
        await confirmBtn.click();

        // Should redirect to news list
        await expect(adminPage).toHaveURL(/\/news$/);

        // Should not be visible in the list anymore
        await expect(adminPage.getByText(testNews.title)).not.toBeVisible();
    });
});
