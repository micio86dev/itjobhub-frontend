# Frontend - IT Job Hub

The IT Job Hub frontend is a high-performance web application designed for developer productivity and user responsiveness.

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
7.  **Multi-language Support**: Comprehensive localization for IT, EN, FR, ES, and DE.
8.  **Job Type Variety**: Support for Full-time, Part-time, Contract, Freelance, and Internship positions.
9.  **Performance**: Near-zero hydration, ensuring instant interaction on page load.

## Code Quality

- **ESLint/Prettier**: Enforced coding standards and formatting.
- **Type Safety**: Fully typed with TypeScript to catch errors at compile time.
- **Responsive**: Mobile-first design principles applied consistently.

## Recent Changes

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

### 2026-01-16: Fix 'p0 is not a function' on Delete Actions
- Resolved `TypeError: p0 is not a function` when clicking "Delete" button in Job Detail page and Confirm Modal
- Wrapped `onDelete$` and `onConfirm$`/`onClose$` prop invocations in `$(() => prop.invoke())` explicit QRL pattern
- Updated `src/components/jobs/job-header.tsx` and `src/components/ui/modal.tsx` to handle QRL props safely

### 2026-01-16: Profile Wizard Work Mode Persistence Fix
- Fixed issue where selected work modes (Remote, Hybrid, On-site) were not correctly persisted or displayed in the profile wizard when reopening it
- Corrected backend response in `GET /users/:id/profile` to include `workModes` field
- Updated `ProfileWizard` initialization in `profile/index.tsx` to correctly pass existing `workModes` from `auth.user`
- Added missing work mode translations for all supported languages (IT, EN, FR, ES, DE)
- Enhanced profile page to display active work mode preferences in the professional information section
