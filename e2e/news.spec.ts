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
        const random = Math.floor(Math.random() * 1000000);
        const testNews = await createTestNews(request, adminToken, {
            title: `E2E News Title ${timestamp}`,
            slug: `e2e-news-${timestamp}-${random}`,
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
                domain: "127.0.0.1",
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
        await expect(page).toHaveURL(/\/news\/?$/);
    });

    test("Authenticated user can like news", async ({ userPage }) => {
        await navigateTo(userPage, `/news/${newsSlug}`);

        const likeBtn = userPage.getByTestId("like-button");
        const dislikeBtn = userPage.getByTestId("dislike-button");

        await expect(likeBtn).toBeVisible();
        await expect(dislikeBtn).toBeVisible();

        // Initial state logic depends on previous runs, but assuming fresh user/news it should be neutral
        // We'll just click and verify no error toast/action happens
        await likeBtn.click();

        // Check if the button has the active state class
        await expect(likeBtn).toHaveClass(/reaction-btn-like-active/);
    });

    test("Admin can delete news", async ({ adminPage, request }) => {
        // Create another news article specifically for deletion test to avoid affecting other tests
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        const testNews = await createTestNews(request, adminToken, {
            title: `Delete Me News ${timestamp}`,
            slug: `delete-me-${timestamp}-${random}`,
            summary: "This news will be deleted",
            content: "<p>Content</p>",
            category: "Testing",
            is_published: true
        });

        await navigateTo(adminPage, `/news/${testNews.slug}`);
        await ensurePageReady(adminPage);

        // Ensure page is ready and some hydration time
        await adminPage.waitForTimeout(1000);
        // Click delete button
        // Monitor console and dialogs
        adminPage.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
        adminPage.on('dialog', dialog => {
            console.log(`[Browser Dialog] ${dialog.message()}`);
            dialog.accept();
        });

        const deleteBtn = adminPage.getByTestId("delete-article-btn");
        console.log("Delete button locator created");
        await deleteBtn.scrollIntoViewIfNeeded();
        console.log("Scrolled into view");
        await expect(deleteBtn).toBeVisible({ timeout: 10000 });
        console.log("Delete button visible");
        await deleteBtn.click();
        console.log("Delete button clicked");

        // Modal should appear
        const modal = adminPage.locator('[role="dialog"]').filter({ hasText: /conferma|confirm/i }).first();
        await expect(modal).toBeVisible({ timeout: 5000 });
        console.log("Modal visible");

        // Wait for animation
        await adminPage.waitForTimeout(500);

        // Confirm
        const confirmBtn = modal.getByTestId("modal-confirm");
        await confirmBtn.click();
        console.log("Confirm button clicked");

        // Should redirect to news list
        await expect(adminPage).toHaveURL(/\/news\/?$/, { timeout: 30000 });

        // Wait for list to load
        // await adminPage.waitForResponse(resp => resp.url().includes('/news') && resp.request().method() === 'GET');

        await adminPage.reload();
        await adminPage.waitForLoadState('networkidle');

        // Should not be visible in the list anymore
        await expect(adminPage.getByText(testNews.title)).not.toBeVisible({ timeout: 10000 });
    });
});
