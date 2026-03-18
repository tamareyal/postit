# PostIt Frontend

Frontend application for PostIt built with React + TypeScript + Vite.

It includes:
- Authentication with email/password and Google login
- Home feed with post creation, search, likes, edit/delete, and infinite scrolling
- Comments page per post with infinite scrolling
- Profile page with username/avatar editing and user-only post feed
- Token-based session handling with refresh-token auto retry

## Tech Stack

- React 19
- TypeScript
- Vite
- Axios
- React Hook Form + Zod
- Bootstrap 5

## Prerequisites

- Node.js 20+ (recommended for latest Vite)
- npm
- A running PostIt backend API
- Google OAuth client ID (for Google sign-in)

## Environment Variables

Create a `.env` file in the project root:

```dotenv
VITE_BACKEND_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Required variables

- `VITE_GOOGLE_CLIENT_ID`
  - Used by `@react-oauth/google` provider in `src/main.tsx`
  - Required for the auth screen (Google login button)

- `VITE_BACKEND_URL`
  - Base URL for API and static image paths
  - Used across services (`src/services/api.ts`, `src/services/authService.ts`, `src/services/imageService.ts`)
  - If omitted, code falls back to `http://localhost:3000`

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables in `.env` (see above).

3. Start development server:

   ```bash
   npm run dev
   ```

4. Open the app in your browser (Vite will print the local URL).

## Available Scripts

- `npm run dev` – start Vite dev server
- `npm run build` – type-check and build for production
- `npm run preview` – preview production build locally
- `npm run lint` – run ESLint

## Frontend Routing Behavior

This app currently uses URL state with `window.history` rather than React Router:

- `/` → Home feed
- `/profile` → Profile page
- `?commentsPostId=<postId>` → Comments page for a post

## Backend API Expectations

The frontend expects these backend route groups:

- `/api/auth/*` (login/register/google/refresh/logout/me)
- `/api/posts/*` (CRUD, like, pagination, search, user posts)
- `/api/comments/*` (create + paginated comments by post)
- `/api/users/*` (profile fetch/update)
- `/api/general/upload/*` (image upload/delete)

## Notes

- Auth tokens are stored in `localStorage` and attached to API requests.
- On `401`, the client attempts refresh token flow automatically.
