# Gmail Email Verification App

This project contains a complete email verification system using Node.js, Express.js, MongoDB, JWT, and Gmail SMTP.

## Structure

- `backend/` - Express API
  - `src/routes/` - authentication endpoints
  - `src/controllers/` - request handling
  - `src/models/` - MongoDB user schema
  - `src/services/` - business logic and email service
  - `src/middleware/` - rate limiting and validation
- `frontend/` - Vite + React app
  - `src/pages/` - Register, Verify, Login UI
  - `src/services/` - API client

## Setup

### 1. Configure environment variables

Copy the example file and fill in your values:

```bash
cd email-verification/backend
cp .env.example .env
```

Set these values in `backend/.env`:

- `PORT` - server port, e.g. `4000`
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `EMAIL_USER` - Gmail account email
- `EMAIL_PASS` - Gmail app password
- `CLIENT_URL` - frontend URL, e.g. `http://localhost:5173`

> Gmail SMTP requires an app password or OAuth2. Use a Gmail app password for `EMAIL_PASS`.

### 2. Install backend dependencies

```bash
cd email-verification/backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Run the backend

```bash
cd ../backend
npm run dev
```

### 5. Run the frontend

```bash
cd ../frontend
npm run dev
```

## How it works

1. User registers with name, Gmail, and password.
2. Backend hashes the password and verification code, stores them in MongoDB, and sends a 6-digit code.
3. User submits the code on the verification screen.
4. Backend verifies the hashed code, activates the account, and clears verification data.
5. Verified users can log in and receive a JWT.

## Email flow

- `POST /api/auth/register` sends the verification code.
- `POST /api/auth/verify` confirms the code before activation.
- `POST /api/auth/login` requires a verified account.
- `POST /api/auth/resend-verification` sends a new code.

## Notes for VS Code

- Open the workspace folder at `f:\my project\casa-studio-new`.
- Use two terminals: one in `email-verification/backend` and one in `email-verification/frontend`.
- If you use the VS Code debugger, configure separate launch profiles for backend and frontend.
