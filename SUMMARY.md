# Frontend - DevBoards.io

The DevBoards.io frontend is a high-performance web application designed for developer productivity and user responsiveness.

## Architecture

- **Framework**: [Qwik](https://qwik.builder.io/) (resumable framework)
- **Tooling**: [Vite](https://vitejs.dev/) for development and building.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first responsive design (enhanced with `@tailwindcss/typography`).
- **Routing**: [Qwik City](https://qwik.builder.io/docs/qwikcity/) for directory-based routing.

## Key Features

1.  **Job Search & Discovery**: Advanced filtering by skills (case-insensitive), seniority, and remote status. Uses implicit language filtering based on user profile.
2.  **Personalized Dashboard**: Tailored job feeds based on user profile and preferences.
3.  **Community Hub**: Viewing and interacting with comments and ratings on job listings.
4.  **Profile Builder**: Guided onboarding to help users showcase their IT expertise.
5.  **Admin Dashboard**: Rich statistical insights including "Top Seniority", user growth, and engagement metrics.
6.  **Multi-language Support**: Comprehensive localization for IT, EN, FR, ES, and DE.
7.  **Job Type Variety**: Support for Full-time, Part-time, Contract, Freelance, and Internship positions.
8.  **News Hub**: Integrated tech news feed with infinite scroll, category filtering, and engagement tracking (likes/comments).
9.  **Performance**: Near-zero hydration, ensuring instant interaction on page load.

## Code Quality

- **ESLint/Prettier**: Enforced coding standards and formatting.
- **Type Safety**: Fully typed with TypeScript to catch errors at compile time.
- **Responsive**: Mobile-first design principles applied consistently.

## Recent Changes

### 2026-02-03: Route Loader Refactoring and Build Optimization

- **Route Loader Naming Standardization**:
  - Renamed generic `useHeadMeta` to route-specific loaders (e.g., `useJobsHeadLoader`, `useNewsListHeadLoader`, `useProfileHeadLoader`) across all major routes.
  - This prevents potential naming collisions and improves code readability by explicitly indicating the loader's purpose within its context.
- **Build Performance Optimization**:
  - Refactored `vite.config.ts` to improve dependency handling during development and bundling.
  - Optimized `optimizeDeps.include` by removing redundant Qwik core packages, allowing Vite and Qwik's plugin to handle them more efficiently.
- **Code Consistency & Cleanup**:
  - Applied consistent indentation and formatting across all route files (`index.tsx`).
  - Improved JSX structure for better legibility and maintainability.
- **Verification**: Confirmed all linters and type checks pass across the entire workspace.

### 2026-01-31: Job Posting Date Translation Fix

- **Missing Translation Restoration**: Added the missing `job.posted` translation key across all supported locales (IT, EN, FR, ES, DE).
- **Accessibility Enhancement**: Restored effective screen-reader labeling for job posting dates in `JobCard`, ensuring WCAG compliance for chronological information.
- **Verification**: Confirmed accessibility compliance and unit test stability.

### 2026-01-31: Social Login Callback Page Redesign & News Filters Branding

- **News Filter Tags Styling Update**:
  - Changed active filter tags on the news page to use the brand primary color (`brand-neon`) instead of blue.
  - Implemented the brand-neon color with a hybrid CSS approach (CSS variables for background-color) to ensure theme compatibility and reliability.
  - Updated text color to white (light mode) and black (dark mode) for optimal contrast on the neon background.
  - Added a subtle neon-colored shadow to active filter buttons.
- **Header Icon Optimization**: Updated the news page header icon container and text to use brand-neon colors for a more cohesive brand identity.
- **Redesigned Callback Page**: Replaced the hardcoded indigo/purple gradient with a brand-consistent theme-aware design.
- **Improved UI/UX**:
  - **Light Mode**: Subtle geometric gradient using brand light background colors.
  - **Dark Mode**: Premium radial gradient featuring a subtle `brand-neon` glow over `brand-dark-bg`.
  - **Card Styling**: Standardized the callback card to match site-wide card aesthetics (border, shadow, background).
  - **Success/Error States**: Enhanced icon colors and animations; standardized success green (`brand-neon`) and error red colors across themes.
- **Refactored CSS Architecture**: Extracted styles into a dedicated `index.css` file for the callback route, using semantic classes and the refined hybrid CSS approach.
- **Verified Stability**: Confirmed passing status for `social-auth.spec.ts` E2E tests.

- **Updated .btn-primary Text Color**: Standardized `.btn-primary` and `.btn-success` text color to be **black in dark mode** and **white in light mode** for optimal contrast with the neon green brand color.
- **Consolidated CSS Architecture**:
  - Removed duplicate `.btn-primary` and `.btn-secondary` definitions from `profile-wizard.css` and `modal.css`.
  - Enforced a single source of truth in `global.css` for primary button styling, following the **hybrid CSS approach** (Tailwind utilities + plain CSS for state-dependent colors).
- **Fixed Build & Type Errors**:
  - Resolved `no-explicit-any` linting errors in `forgot-password` and `reset-password` routes by properly typing error handling.
  - Unblocked build by resolving `google.maps` namespace conflicts in `job-map.tsx`.
- **Verified Stability**: Confirmed `lint` passes and buttons correctly toggle text colors based on theme.

### 2026-01-30: Build Restoration and Google Maps Type Safety

- **Fixed Critical Build Error**: Resolved a syntax error in `src/routes/news/[slug]/index.tsx` caused by a duplicate `useTask$` import that prevented the application from starting/building.
- **Enhanced Google Maps Type Safety**:
  - Migrated `JobMap` component to use official `@types/google.maps` instead of legacy custom global interfaces.
  - Resolved conflicts by deleting `src/types/google.d.ts` and updating `tsconfig.json` to include `google.maps` in compiler types.
  - Fixed linting errors (`no-explicit-any`) and improved code readability in admin map charts.
- **Improved Build Pipeline**: Verified 100% green status for `lint` and `build.types` commands.

### 2026-01-30: News Card Interaction Fix and Job Card Icon Restoration

- **Restored Job Card Comments Icon**: Fixed a regression where the comments icon (SVG) in `.comments-btn` was invisible by explicitly adding `w-4 h-4` dimensions.
- **Unified Reaction Buttons**: Refactored `NewsCard` to use the shared `ReactionButtons` component, ensuring consistent styling and behavior with `JobCard`.
- **Enhanced CSS Architecture for Cards**:
  - Centered reaction buttons in `jobs-grid` layout using `@apply justify-between w-full m-auto`.
  - Removed duplicate CSS rules in `job-card.css`.
- **Optimized E2E Tests**: Updated `auth.spec.ts` to use `@faker-js/faker` for generating unique test emails, improving test reliability.
- **Improved Translations**: Updated deletion confirmation text in all locales for better clarity ("Delete job" vs "Delete").

### 2026-01-29: CSS Architecture Stabilization and Comments System Fixes

- **Resolved Critical CSS Compilation Errors**:
  - Fixed `bg-brand-neon-hover class does not exist` errors by separating Tailwind `@apply` directives from `:hover` states in `job-card.css`, `global.css`, and `cta-section.css`.
  - Adopted a **hybrid CSS approach**: using `@apply` for structural utilities and standard CSS/PostCSS blocks for dynamic/variable-based colors to ensure robustness.
  - Standardized `tailwind.config.js` color keys from `neon-hover` to `neonHover` to prevent parsing ambiguity.
  - Migrated all codebase references to use the new `neonHover` camelCase naming convention.
- **Fixed Comments System QRL Serialization**:
  - Refactored `BaseCommentsSection` and `Modal` components to use `PropFunction` instead of `QRL` for event props.
  - Removed explicit `.invoke()` calls in favor of direct function calls, aligning with Qwik's standard event handling patterns to fix TypeScript errors and `p0 is not a function` runtime issues.
  - Added missing `$` import in `Modal.tsx`.
- **E2E Test Verification**:
  - Restored passing status for `e2e/comments.spec.ts` covering comment creation, edition, and deletion.
  - Verified `e2e/news.spec.ts` to ensure no regressions in admin capabilities.

### 2026-01-29: QRL Serialization Fix and Admin Deletion Refinement

- **Resolved QRL Serialization Error**: Fixed persistent `TypeError: p0 is not a function` by replacing the `AdminDeleteButton` component with an **inline modal implementation** in both News and Job details pages. This ensures stable function serialization across Qwik resumes.
- **Deprecated AdminDeleteButton**: Deleted the `AdminDeleteButton` component to simplify the codebase and prevent future rendering/serialization issues.
- **Improved E2E Test Stability**:
  - Enhanced `Admin can delete news` test with more robust URL matching (`/\/news\/?$/`).
  - Implemented explicit cache bypassing (`cache: "no-store"`) for news list fetching to ensure data freshness.
  - Added strategic page reloads and network idle waits to E2E workflows for higher reliability.
- **Modal Component Cleanup**: Refactored the base `Modal` component with proper `PropFunction` types and removed unused QRL imports.
- **Zero-Bug Navigation**: Verified that delete actions now navigate correctly back to the list and refresh the UI without stale results.

### 2026-01-28: News Filter Bar Refactoring and Sticky Navigation

- **Refactored News Filter Bar**: Created a dedicated `news-index.css` with semantic classes (`.news-filter-bar`, `.category-btn`) to replace complex inline Tailwind classes.
- **Fixed "Flying" Scroll Issue**: Resolved visual glitches where the news filter would appear "floating" with a gap when scrolling by making the main `Navigation` bar `sticky top-0`.
- **Improved UX**: The news filter now sticks perfectly at `64px` from the top, aligned exactly below the navigation bar, with smooth `backdrop-blur` and transition effects.
- **Enhanced Categorization UI**: Added custom thin scrollbar for category filtering on mobile and improved button transitions.

### 2026-01-28: Theme Toggle Icon Swap and Context Reactivity

- **Swapped Theme Icons**: Changed theme toggle button to display **Sun icon** in Light mode and **Moon icon** in Dark mode for better semantic clarity.
- **Improved Theme Context**: Refactored `ThemeContext` to use proper Qwik store reactivity by passing the store wrapper instead of primitive values.
- **Added Accessibility**: Included `aria-hidden="true"` attributes on theme toggle SVG icons for better screen reader compatibility.
- **Verified Behavior**: Icons now correctly represent the current theme state and toggle smoothly between light and dark modes.

### 2026-01-28: Favorite Button Visual Refinement

- Realigned `.favoriteButton` in `JobHeader` to match the visual style of reaction buttons (like/dislike).
- Updated padding from `p-3` to `p-2` to match standard button sizes.
- Replaced solid borders and backgrounds with transparent defaults and consistent hover states (`bg-brand-neon/10`).
- Synchronized icon size (`w-5 h-5`) and added micro-animations (`scale-110`) on hover.
- Verified dark mode consistency and E2E persistence for favoritism actions.

### 2026-01-28: Job Description Text Color Sync

- Synchronized `.descriptionContent p` text color with `.companyAboutText` for both light and dark modes.
- Light mode: `text-gray-600`.
- Dark mode: `text-gray-400`.
- Used `:global(p)` to correctly target elements inside `dangerouslySetInnerHTML`.

### 2026-01-28: Job Description UI Consistency Fix

- Fixed job description box background in dark mode to match the standard card styling (`bg-gray-800`).
- Removed redundant borders and backgrounds from `JobDescription` component to ensure seamless integration into its parent card container.
- Verified visual consistency across all job detail sections.

### 2026-01-23: Tech News Feature Implementation

- Implemented **News Feed** (`/news`) with infinite scroll using `IntersectionObserver`.
- Added **News Detail** (`/news/[slug]`) with support for multi-language translations.
- Integrated **Interactions**: Users can like/dislike news articles and add comments.
- Created `NewsCard` component with optimistic UI updates and skeleton loading states.
- Replaced `@qwikest/icons/lucide` with **Inline SVGs** to optimize build size and fix dependency issues.
- Added comprehensive **E2E tests** (`e2e/news.spec.ts`) and API test helpers.
- Enhanced backend to expose **News Management** endpoints for testing and content management.

### 2026-01-17: Persistent Language Selection (Cookies)

- Implemented server-side and client-side language persistence using cookies instead of `localStorage`.
- Enhanced `I18nProvider` to support initialization from server-side cookies, preventing "language flicker" on page load.
- Updated `layout.tsx` to read the `preferred-language` cookie in the Qwik route loader.
- Improved SEO mapping for `og:locale` and `content-language` meta tags (partial implementation).
- Added comprehensive E2E test suite in `e2e/i18n.spec.ts` to verify language persistence across page refreshes.

### 2026-01-17: Navigation Premium Styling Enhancement

- Redesigned navigation bar with premium visual effects and micro-animations
- Enhanced nav links with:
  - Gradient background hover effects with smooth opacity transitions
  - Animated gradient underline with elastic bounce effect (cubic-bezier easing)
  - Smooth translateY(-1px) lift on hover with color and text-shadow transitions
  - Three-color gradient underline (indigo → purple → pink) with glow effect
- Improved button styling:
  - Register button: Multi-color gradient (indigo → purple → pink) with animated background position
  - Logout button: Red gradient with subtle white overlay on hover
  - All buttons feature smooth lift animations and dynamic shadows
- Enhanced theme toggle with 180° rotation and scale effect on hover with colored glow
- Improved language selector with background transitions and lift animations
- Mobile navigation updates:
  - Added vertical gradient accent bar animation on hover
  - Smooth slide-in effect (translateX) for mobile links
  - Enhanced register button with animated gradient background
- Consistent dark mode support with adjusted colors and enhanced glow effects
- All transitions use optimized cubic-bezier timing functions for premium feel

### 2026-01-16: Comprehensive QRL Invocation Fix

- Fixed "p0 is not a function" errors across the entire frontend application
- Corrected QRL invocations in 10+ locations across 6 files:
  - `comments-section.tsx`: Delete and edit comment buttons
  - `job-card.tsx`: Toggle comments button
  - `social-login-buttons.tsx`: Google, LinkedIn, and GitHub login buttons
  - `tag-input.tsx`: Remove tag and select suggestion buttons
  - `navigation.tsx`: Language selector dropdown
  - `register/index.tsx`: Social registration buttons
- All arrow functions in event handlers now properly wrapped with $() for correct Qwik serialization
- Ensures consistent QRL behavior across authentication, navigation, and interactive components

### 2026-01-16: Job Deletion Modal Fix

- Fixed "p0 is not a function" error when clicking the delete button on job detail pages
- Properly implemented QRL function serialization for modal close handler
- Verified authorization: delete button only visible to admin users

### 2026-01-16: Apply Button Styling Enhancement

- Enhanced apply button design in job cards with modern gradient background
- Added smooth hover effects with scale transformation and shadow transitions
- Implemented dark mode support with adjusted colors and glowing shadows
- Improved visual hierarchy to make the CTA more prominent

### 2026-01-16: Apply Button Style Scoping Fix

- Fixed issue where 'Apply' button lost styling due to Qwik Link component scope isolation
- Implemented `.job-card :global(.apply-btn)` selector pattern to ensure styles reach the inner anchor tag of the Link component
- Verified persistence of style in both light and dark modes

### 2026-01-16: Fixed QRL Serialization (Resumability) in Confirm Modals

- Resolved TypeError: p0 is not a function affecting Delete actions after page refresh by ensuring stable QRL references.
- Eliminated props destructuring in Modal and JobHeader components to maintain proxy reactivity and prevent serialization breaks during the "Resume" phase.
- Standardized PropFunction execution using explicit await props.onAction$() patterns and inlined simple state mutations to reduce closure capturing errors.

### 2026-01-16: Resolved Qwik.js Resumability Bugs

- Fixed critical p0 runtime errors in Delete confirmation workflows triggered after browser refresh.
- Refactored job-header.tsx and modal.tsx to follow Qwik best practices for QRL prop handling and closure serialization.
- Optimized component architecture to ensure UI stability across server-to-client handoffs.

### 2026-01-16: Profile Wizard Work Mode Persistence Fix

- Fixed issue where selected work modes (Remote, Hybrid, On-site) were not correctly persisted or displayed in the profile wizard when reopening it
- Corrected backend response in `GET /users/:id/profile` to include `workModes` field
- Updated `ProfileWizard` initialization in `profile/index.tsx` to correctly pass existing `workModes` from `auth.user`
- Added missing work mode translations for all supported languages (IT, EN, FR, ES, DE)
- Enhanced profile page to display active work mode preferences in the professional information section

### 2026-01-16: Job Header Login Hint Styling Fix

- Fixed styling of "Login/Register" hint in `job-header.tsx`
- Changed orange text (amber-600) to theme-aware black/white (gray-900/white)
- Updated login and register links to use bold indigo/purple color matching the rest of the application
- Improved link visibility and hover states
