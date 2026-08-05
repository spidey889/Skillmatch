# SkillMatch

### Find the people who make your half-finished idea suddenly make sense.

SkillMatch is a polished student collaboration app for discovering people, projects, ideas, and the next thing worth building.

It is intentionally easy to show off: the Supabase backend is currently unplugged, so the app runs in a reliable demo mode with realistic placeholder data. No database setup. No auth ceremony. No tiny server wearing a fake moustache.

## Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), head to the login or signup page, and choose **Continue as Guest**.

For a production build:

```bash
npm run build
npm start
```

## What is inside

- A dark, focused dashboard for student builders
- Browseable students, projects, ideas, badges, messages, and recommendations
- Guest mode with mock data, so the frontend remains useful without a backend
- Supabase-ready structure for reconnecting real authentication and data later

## Project notes

This is a frontend-first portfolio project: something you can open quickly, explain clearly, and use as a starting point when the real backend comes back from its little vacation.

The main app lives in `app/`, reusable UI lives in `components/`, and the demo fallback data lives in `utils/demo-data.ts`.

## Built with

Next.js, React, TypeScript, Tailwind CSS, and a healthy amount of purple.
