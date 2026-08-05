# Changelog

## 2026-08-05

- Fixed strict TypeScript callback typing for badge, dashboard, messages, recommendations, and navigation auth-state code.
- Added Suspense boundaries around login and signup query-parameter consumers so the Next.js 16 production build can prerender both routes.
- Verified `npx tsc --noEmit` and `npm run build` pass. The build still reports the non-blocking Next.js middleware-to-proxy deprecation warning.
- Pinned Turbopack's root to the SkillMatch project directory after confirming there were no stray lockfiles or `node_modules` in the parent directory. Dev mode starts cleanly and `/login` returns HTTP 200.
- Disabled browser Supabase session persistence, token refresh, and URL detection, and removed the navbar's automatic mount-time auth fetch. TypeScript passes; direct dev requests to `/` and `/login` returned 200 without the deleted-backend wait.
- Made middleware auth opt-in and fail-open so the deleted Supabase backend cannot trigger auth refresh retries on normal requests. Verified `/` and `/login` return 200 with zero `fetch failed` or `AuthRetryableFetchError` matches in captured dev logs.
- Added isolated guest demo fixtures so the main screens remain presentable without Supabase data. Removed the build-time Google Fonts dependency, added reduced-motion handling to the canvas background, improved guest-mode navigation, and replaced the most synthetic auth/home copy with plain product language.
- Refined the signup and dashboard UI without changing their flow: clearer typography, calmer surfaces, stronger primary actions, less decorative noise, and more useful guest-preview content.
