# Qwik City App ⚡️

- [Qwik Docs](https://qwik.dev/)
- [Discord](https://qwik.dev/chat)
- [Qwik GitHub](https://github.com/QwikDev/qwik)
- [@QwikDev](https://twitter.com/QwikDev)
- [Vite](https://vitejs.dev/)

---

## Project Structure

This project is using Qwik with [QwikCity](https://qwik.dev/qwikcity/overview/). QwikCity is just an extra set of tools on top of Qwik to make it easier to build a full site, including directory-based routing, layouts, and more.

Inside your project, you'll see the following directory structure:

```
├── public/
│   └── ...
└── src/
    ├── components/
    │   └── ...
    └── routes/
        └── ...
```

- `src/routes`: Provides the directory-based routing, which can include a hierarchy of `layout.tsx` layout files, and an `index.tsx` file as the page. Additionally, `index.ts` files are endpoints. Please see the [routing docs](https://qwik.dev/qwikcity/routing/overview/) for more info.

- `src/components`: Recommended directory for components.

- `public`: Any static assets, like images, can be placed in the public directory. Please see the [Vite public directory](https://vitejs.dev/guide/assets.html#the-public-directory) for more info.

## Add Integrations and deployment

Use the `bun run qwik add` command to add additional integrations. Some examples of integrations includes: Cloudflare, Netlify or Express Server, and the [Static Site Generator (SSG)](https://qwik.dev/qwikcity/guides/static-site-generation/).

```shell
bun run qwik add
```

## Environment Variables

This project uses environment variables for configuration. Create a `.env` file in the root directory (based on `.env.example`).

| Variable          | Description                                       | Default / Example       |
| ----------------- | ------------------------------------------------- | ----------------------- |
| `PUBLIC_API_URL`  | URL of the backend API                            | `http://localhost:3001` |
| `PUBLIC_SITE_URL` | Base URL of the frontend (used for SEO/Canonical) | `https://itjobhub.com`  |

## Development

Development mode uses [Vite's development server](https://vitejs.dev/). The `dev` command will server-side render (SSR) the output during development.

```shell
bun run start
```

> Note: during dev mode, Vite may request a significant number of `.js` files. This does not represent a Qwik production build.

## Preview

The preview command will create a production build of the client modules, a production build of `src/entry.preview.tsx`, and run a local server. The preview server is only for convenience to preview a production build locally and should not be used as a production server.

```shell
bun run preview
```

## Quality Assurance

### Linting

We use ESLint to maintain code quality. To run the linter:

```bash
bun run lint
```

### Type Checking

To run a full TypeScript type check:

```bash
bun run build.types
```

### Formatting

We use Prettier for code formatting.

- **Check formatting**: `bun run fmt.check`
- **Fix formatting**: `bun run fmt`

### Testing

### Testing

#### E2E Testing (Playwright)

We use **Playwright** for End-to-End testing.

**Prerequisites:**
The backend server must be running on port 3001.

```bash
cd ../backend
bun run dev
```

**Running Tests:**

```bash
# Run all E2E tests
bun run test.e2e

# Run tests with UI mode
bun run test.e2e.ui

# View the last HTML report
bun run test.e2e.report
```

## Production

The production build will generate client and server modules by running both client and server build commands. The build command will use Typescript to run a type check on the source code.

```shell
bun run build
```

## Git Hooks (Husky)

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality with pre-commit hooks.

### Installation

To install Husky and its hooks (if not automatically installed):

```shell
bun run prepare
```

### Pre-commit Hook

Husky is configured to run automatically before you commit.

- **Action**: Runs `bun lint`.
- **Behavior**: If linting fails, the commit is **blocked**. You must fix the lint errors before committing.

### Testing the Hook

To verify the hook works:

1. Make a change that violates lint rules (e.g. use `any`).
2. Try to commit: `git commit -m "test"`.
3. The commit should fail.
4. Fix the issue and commit again.
