# SecureCloud

SecureCloud is a React and Vite frontend prototype for a secure cloud file-sharing application. The current UI includes login and registration screens, a dashboard, sample file data, search, and local file selection previews.

The Express API includes account and session routes backed by MongoDB models. The React login and registration forms are not connected to those routes yet, and account requests need a configured MongoDB connection. File uploads, sharing, and encryption are not implemented.

## Requirements

- Node.js and npm

## Run the frontend

From the project root, install frontend dependencies once and start Vite:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite. The Vite development server proxies requests under `/api` to `http://localhost:3000`.

## Run the API

In a second terminal:

```powershell
cd server
npm.cmd install
Copy-Item .env.example .env
npm.cmd run dev
```

Set `MONGODB_URI` in `server/.env` to a local MongoDB or Atlas connection string before using account routes. Do not commit `server/.env`; only the example file belongs in Git. Without a database connection, the API starts in a degraded state and authentication routes return `503`.

The API listens on port `3000` by default. Check its health at:

```text
http://localhost:3000/api/health
```

It returns `{"status":"ok","database":"connected"}` when MongoDB is connected. Without a connection, it returns a degraded status. The same endpoint can be reached through Vite at `http://localhost:5173/api/health` while both development servers are running.

The API provides `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, and `POST /api/auth/logout`. Sessions use an HTTP-only cookie and are stored in MongoDB. The React login form is not connected to these routes yet.

## Project layout

```text
src/                 React frontend
server/              Express API
PROJECT_STATUS.md    Project progress and planned work
```

## Planned work

The planned backend stack includes MongoDB Atlas for application metadata and Supabase Storage for private file storage. MongoDB connection details are not configured, and Supabase Storage is not connected. Check current free-tier limits before choosing external services, and keep credentials in local environment files that are not committed to Git.
