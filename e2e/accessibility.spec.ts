import { test, expect } from "./fixtures";
import { injectAxe, checkA11y } from "axe-playwright";

test.describe("Accessibility Audit", () => {
    test("Home page should be accessible", async ({ page }) => {
        await page.goto("/");
        await injectAxe(page);
        await checkA11y(page, undefined, {
            axeOptions: {
                runOnly: {
                    type: "tag",
                    values: ["wcag2a", "wcag2aa"],
                },
            },
            detailedReport: true,
            detailedReportOptions: { html: true },
        });
    });

    test("Jobs page should be accessible", async ({ page }) => {
        await page.goto("/jobs");
        await injectAxe(page);
        await checkA11y(page, undefined, {
            axeOptions: {
                runOnly: {
                    type: "tag",
                    values: ["wcag2a", "wcag2aa"],
                },
            },
            detailedReport: true,
            detailedReportOptions: { html: true },
        });
    });

    test("News page should be accessible", async ({ page }) => {
        await page.goto("/news");
        await injectAxe(page);
        await checkA11y(page, undefined, {
            axeOptions: {
                runOnly: {
                    type: "tag",
                    values: ["wcag2a", "wcag2aa"],
                },
            },
            detailedReport: true,
            detailedReportOptions: { html: true },
        });
    });
});
