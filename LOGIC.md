# SkillMatch production behavior

SkillMatch is a Next.js App Router application. Supabase-backed reads and writes are guarded by the page-level fallback behavior so the app can render guest/mock content when the backend is unavailable. The login page provides a guest path that skips Supabase authentication and enters the dashboard.

The project uses strict TypeScript checking. Supabase query rows are locally typed at callback boundaries where generated database types are not configured. Login and signup pages place their `useSearchParams` consumers behind Suspense so static production prerendering remains valid in Next.js 16.

Turbopack's filesystem root is explicitly pinned to the directory containing `next.config.ts`. This prevents an external launch workspace from changing module resolution away from `skillmatch/node_modules`.

The browser Supabase client does not persist sessions, auto-refresh tokens, or inspect auth callback URLs. The global navbar also avoids an automatic mount-time `getUser()` request; auth requests remain limited to explicit protected-page or user actions.

Middleware auth is opt-in through `SUPABASE_AUTH_ENABLED=true`. With the backend disabled, middleware returns the request immediately and never constructs a Supabase auth client. If explicitly enabled, its `getUser()` check is fail-open and catches backend failures without logging or redirecting.

Guest mode uses local-only demo fixtures from `utils/demo-data.ts`. These fixtures populate the main directory, project, idea, messaging, dashboard, badge, recommendation, and profile views without changing the Supabase-backed path. The app uses a system font stack so a demo build does not require Google Fonts network access.

The signup and dashboard screens share the same dark-indigo foundation but use quieter surfaces, tighter hierarchy, plain-language copy, and lower-motion decoration so they read as a product demo rather than a generated concept page.
