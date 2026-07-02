# Casa Studio — Upgraded

A modern, polished house design studio website with Gmail authentication, OTP verification, admin file management, and auto-download links.

## Features

### Authentication
- **Gmail-only sign-in** — only `@gmail.com` addresses are accepted
- **OTP verification** — a 6-digit code is generated (shown on screen in demo mode; in production this would be sent via email/SMS)
- **New user registration** — new users provide their name; returning users go straight to OTP
- **Admin account** — pre-seeded at `admin@casastudio.com`

### Admin Dashboard
- Upload any file type via drag-and-drop or file picker
- Edit file name and description inline
- Delete files
- View download counts
- Copy auto-download URLs for each file

### Auto-Download Links
- Route: `/download/:fileId`
- Signed-in users who visit the URL get an automatic file download
- Unauthenticated users are redirected to sign in first

### UI/UX
- Smooth scroll navigation with blur-on-scroll header
- Mobile-responsive with slide-in nav drawer
- Animated hero, fade-up entrance animations
- Clean card grid for services, work portfolio, testimonials
- Resources section showing available downloads

## Project Structure

- Frontend: the Vite + React + TanStack app in the root source tree, responsible for the public site UI and admin dashboard.
- Backend: the Express API in the backend folder, responsible for file uploads, downloads, and consultation email delivery.

## Getting Started

```bash
# Install dependencies
bun install

# Start the frontend and backend locally
bun run dev
```

The development script starts the Vite frontend and the Express backend together. The frontend is served on the Vite URL reported in the terminal, and the backend runs on port 4000.

## Admin Access

Sign in with `admin@casastudio.com` — on first visit it's auto-created.
When signed in as admin, a gear icon appears in the user menu to open the Admin Dashboard.

## Production Notes

- Replace `localStorage` auth with a real backend (e.g. Supabase, Firebase)
- Replace the demo OTP display with an actual email service (SendGrid, Resend, etc.)
- File uploads should go to cloud storage (S3, Cloudflare R2) rather than `localStorage`
- The `/download/:fileId` route should verify auth server-side and serve a signed URL

## Deployment

Railway should use the normal `npm start` command, which now runs the built SSR server from `.output/server/index.mjs`.

If you deploy from GitHub, Railway will install dependencies, build the project, and then start the service with this command.

## Environment Notes

For a local development setup, set these environment variables before starting the app if you want email sending and uploads to work:

```bash
RESEND_API_KEY=your_resend_key
UPLOADS_DIR=./.uploads
```

The frontend uses the backend proxy from Vite, so the local API stays available at http://localhost:4000.

## Tech Stack

- React 19 + TypeScript
- TanStack Router (file-based routing)
- Tailwind CSS v4
- Lucide React icons
- Radix UI primitives
