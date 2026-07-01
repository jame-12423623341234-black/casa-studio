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

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server
bun run dev
```

## Admin Access

Sign in with `admin@casastudio.com` — on first visit it's auto-created.
When signed in as admin, a gear icon appears in the user menu to open the Admin Dashboard.

## Production Notes

- Replace `localStorage` auth with a real backend (e.g. Supabase, Firebase)
- Replace the demo OTP display with an actual email service (SendGrid, Resend, etc.)
- File uploads should go to cloud storage (S3, Cloudflare R2) rather than `localStorage`
- The `/download/:fileId` route should verify auth server-side and serve a signed URL

## Tech Stack

- React 19 + TypeScript
- TanStack Router (file-based routing)
- Tailwind CSS v4
- Lucide React icons
- Radix UI primitives
