# Testing Guide: Job Deletion Authorization

## Overview

This guide helps verify that the job deletion feature works correctly and is properly restricted to admin users only.

## Prerequisites

- Frontend dev server running on http://localhost:5174
- Backend API running on http://localhost:3001
- Test accounts:
  - Regular user account
  - Admin user account

## Test Scenarios

### 1. Guest User (Not Logged In)

**Expected Behavior**: Delete button should NOT be visible

1. Open http://localhost:5174/jobs in your browser
2. Click on any job to view its detail page
3. **Verify**: The "Elimina" (Delete) button is NOT present in the header actions

### 2. Regular Authenticated User

**Expected Behavior**: Delete button should NOT be visible

1. Navigate to http://localhost:5174/login
2. Login with a regular user account (non-admin)
3. Navigate to any job detail page
4. **Verify**: The "Elimina" (Delete) button is NOT present in the header actions

### 3. Admin User

**Expected Behavior**: Delete button IS visible and functional

1. If logged in as regular user, logout first
2. Navigate to http://localhost:5174/login
3. Login with an admin account (user with role="admin")
4. Navigate to any job detail page
5. **Verify**: The "Elimina" (Delete) button IS visible in the header actions
6. Click the "Elimina" button
7. **Verify**: A confirmation modal appears with:
   - Title: "Conferma eliminazione" or similar
   - Message asking for confirmation
   - Two buttons: "Elimina" (confirm) and "Annulla" (cancel)
8. Click "Annulla" to close the modal
9. **Verify**: Modal closes without deleting the job
10. Click "Elimina" again to reopen the modal
11. Click "Elimina" (confirm button)
12. **Verify**:
    - Job is deleted successfully
    - You are redirected to /jobs page
    - No "p0 is not a function" error appears in the console

## What Was Fixed

### The Problem

When clicking the delete button, the application threw a `TypeError: p0 is not a function` error. This was caused by improper function serialization in Qwik.

### The Solution

1. Created a proper QRL function `handleCloseDeleteModal` using `$()` wrapper
2. Replaced the inline arrow function `() => (state.showDeleteModal = false)` with the QRL function
3. This ensures Qwik can properly serialize and deserialize the function across the client-server boundary

### Code Changes

**Before:**

```tsx
<Modal
  onClose$={() => (state.showDeleteModal = false)}
  ...
/>
```

**After:**

```tsx
const handleCloseDeleteModal = $(() => {
  state.showDeleteModal = false;
});

<Modal
  onClose$={handleCloseDeleteModal}
  ...
/>
```

## Authorization Logic

The delete button visibility is controlled in `job-header.tsx`:

```tsx
{isAdmin && (
  <button onClick$={onDelete$} ...>
    {t("job.delete")}
  </button>
)}
```

Where `isAdmin` is passed from the job detail page:

```tsx
isAdmin={auth.user?.role === "admin"}
```

This ensures only users with `role: "admin"` can see and interact with the delete button.
