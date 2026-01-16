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

### 2026-01-16: Job Deletion Modal Fix
- Fixed "p0 is not a function" error when clicking the delete button on job detail pages
- Properly implemented QRL function serialization for modal close handler
- Verified authorization: delete button only visible to admin users

### 2026-01-16: Apply Button Styling Enhancement
- Enhanced apply button design in job cards with modern gradient background
- Added smooth hover effects with scale transformation and shadow transitions
- Implemented dark mode support with adjusted colors and glowing shadows
- Improved visual hierarchy to make the CTA more prominent
