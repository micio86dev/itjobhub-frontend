# E2E Testing Guide

This directory contains Playwright end-to-end tests for ITJobHub.

## Prerequisites

1. **Backend running** on `http://localhost:3000`
2. **Database seeded** with test users
3. **Playwright installed** (included in devDependencies)

## Test Users

| Role   | Email            | Password     |
|--------|------------------|--------------|
| Admin  | admin@test.com   | password123  |
| User   | seeker@test.com  | password123  |

## Quick Start

```bash
# Seed the database (from backend directory)
cd ../backend
bun run scripts/seed-e2e.ts

# Run all tests (from frontend directory)
cd ../frontend
bun run test.e2e

# Run with UI mode for debugging
bun run test.e2e.ui

# View test report
bun run test.e2e.report
```

## Running Specific Configurations

### By Browser

```bash
# Desktop Chrome only
bun run test.e2e -- --project=chromium

# Desktop Safari only
bun run test.e2e -- --project=webkit

# Mobile Chrome (Pixel 5)
bun run test.e2e -- --project="Mobile Chrome"

# Mobile Safari (iPhone 12)
bun run test.e2e -- --project="Mobile Safari"
```

### By Test File

```bash
# Auth tests only
bun run test.e2e -- auth.spec.ts

# Multiple files
bun run test.e2e -- auth.spec.ts user.spec.ts

# By pattern
bun run test.e2e -- --grep "login"
```

### By Test Title

```bash
# Run tests matching pattern
bun run test.e2e -- --grep "should allow a user to login"
```

## Test Coverage Matrix

| Test File | Guest | User | Admin | Coverage |
|-----------|-------|------|-------|----------|
| auth.spec.ts | ✓ | ✓ | - | Registration, Login, Logout |
| guest.spec.ts | ✓ | - | - | Homepage, Jobs, Search, Protected Routes |
| user.spec.ts | - | ✓ | - | Profile, Favorites, Comments, Reactions |
| admin.spec.ts | - | - | ✓ | Job CRUD, Admin Panel, Moderation |
| company.spec.ts | - | - | ✓ | Job Posting, Company Management |
| comments.spec.ts | ✓ | ✓ | ✓ | View, Add, Delete Comments |
| favorites.spec.ts | ✓ | ✓ | - | Add, Remove, View Favorites |
| profile.spec.ts | ✓ | ✓ | - | View, Edit Profile, Wizard |
| mobile.spec.ts | ✓ | ✓ | - | Mobile Navigation, Touch, Responsive |

## Test Architecture

### Fixtures (`fixtures.ts`)

Provides pre-authenticated contexts:
- `adminPage` - Page logged in as admin
- `userPage` - Page logged in as seeker
- `loginViaAPI()` - Fast login using API

### Helpers (`helpers.ts`)

Common utilities:
- `SELECTORS` - Centralized test selectors
- `ensurePageReady()` - Wait for hydration
- `loginViaUI()` - UI-based login
- `goToFirstJobDetail()` - Navigate to job detail

## Best Practices

### Selectors

Always prefer `data-testid` attributes:

```typescript
// ✅ Good
page.locator('[data-testid="login-submit"]')

// ❌ Avoid
page.locator('.btn-primary')
page.locator('button:nth-child(2)')
```

### Waiting

Use explicit assertions instead of timeouts:

```typescript
// ✅ Good
await expect(page.locator('[data-testid="job-card"]')).toBeVisible();

// ❌ Avoid
await page.waitForTimeout(2000);
```

### API Responses

Wait for specific responses when needed:

```typescript
const responsePromise = page.waitForResponse(
    response => response.url().includes('/auth/login')
);
await page.click('[data-testid="login-submit"]');
await responsePromise;
```

## Debugging

### Visual Debugging

```bash
# Run with headed browser
bun run test.e2e -- --headed

# Run with UI mode
bun run test.e2e.ui

# Debug specific test
bun run test.e2e -- --debug auth.spec.ts
```

### Trace Viewer

After a failed test, view the trace:

```bash
npx playwright show-trace test-results/*/trace.zip
```

### Screenshots

Failed tests automatically capture screenshots in `test-results/`.

## CI/CD

For CI environments, ensure:

1. `CI=true` environment variable is set
2. Backend and frontend servers are running
3. Database is seeded before tests

```bash
# CI command
CI=true bun run test.e2e
```

## Troubleshooting

### Tests timing out

- Increase timeout in `playwright.config.ts`
- Check backend is responding
- Verify database is seeded

### Auth state not persisting

- Ensure `loginViaAPI()` completes before navigation
- Check localStorage is accessible

### Mobile tests failing

- Verify running with correct project: `--project="Mobile Safari"`
- Check viewport-specific selectors
