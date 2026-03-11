# Dashboard (React + Vite)

Frontend dashboard application with animated routing, camera-wise analytics views, and API-backed data loading with graceful mock fallbacks.

## Tech Stack

- React 19
- Vite 7
- React Router 7
- Tailwind CSS 4
- Framer Motion
- Axios

## Features

- Login screen with animated UI and video background
- Nested dashboard routes for camera-specific views
- API service layer with timeout handling and fallback mock data
- Person activity timeline view support
- Smooth route transitions using `AnimatePresence`

## Project Structure

```text
src/
  api/
    cameraService.js
  components/
    CameraCard.jsx
    Sidebar.jsx
  pages/
    Login.jsx
    Dashboard.jsx
    OwlyticsDashboard.jsx
    EntranceDashboard.jsx
    WorkspaceDashboard.jsx
    CameraDashboard.jsx
  App.jsx
  main.jsx
```

## Routes

- `/` -> redirects to `/login`
- `/login`
- `/dashboard` -> redirects to `/dashboard/owlytics`
- `/dashboard/owlytics`
- `/dashboard/entrance`
- `/dashboard/workspace`
- `/dashboard/:cameraId`

## Getting Started

### Prerequisites

- Node.js 18+ (recommended 20+)
- npm 9+

### Install

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Demo Login

Current login check in `src/pages/Login.jsx` uses hardcoded credentials:

- Username: `admin`
- Password: `123456`

For production, replace this with secure server-side authentication.

## API Integration

`src/api/cameraService.js` uses an Axios client with:

- `baseURL: /api`
- `timeout: 5000`

Implemented calls:

- `GET /api/dashboard/filters`
- `GET /api/dashboard/overview?camera=<id>&date=<yyyy-mm-dd>`
- `GET /api/dashboard/person-activity?camera=<id>&date=<yyyy-mm-dd>&personId=<id>`

If these endpoints are unavailable, the app falls back to deterministic mock data so UI development can continue.

## Static Assets

The app expects assets in `public/`, including:

- `startup-logo.png`
- `login_background-2.mp4`

## Notes

- `.gitignore` is configured to exclude build output, dependencies, env files, and cache artifacts.
- `dist/` should not be committed.
