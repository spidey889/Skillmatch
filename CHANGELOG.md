# Changelog

## 2026-10-08

- Made the offline college demo usable without backend credentials: saved profile/project/idea/message actions, project description editing, join/leave/delete, isolated conversations, and working student detail pages.
- Replaced inconsistent static demo counts, activity, achievements, and recommendations with saved-state reads. Renamed recommendations to Skill Matches to reflect the actual algorithm.
- Added explicit backend opt-in, restored normal session persistence/refresh for that path, preserved the signup profile-setup redirect, and added visible request failures and five-second backend chat polling.
- Added a fresh-project SQL bootstrap with RLS, restricted message updates, atomic membership changes, and deduplicated voting. Documented that real backend reconnection still requires a live Supabase project.
- Added demo persistence/isolation/storage-failure tests and locally verified database ownership, membership, voting, and private-message permissions. Production build and TypeScript pass; lint comparison found 27 existing errors in changed files (28 before), with no added findings.

## 2026-08-05

- Fixed strict TypeScript callback typing for badge, dashboard, messages, recommendations, and navigation auth-state code.
- Added Suspense boundaries around login and signup query-parameter consumers so the Next.js 16 production build can prerender both routes.
- Verified `npx tsc --noEmit` and `npm run build` pass. The build still reports the non-blocking Next.js middleware-to-proxy deprecation warning.
- Pinned Turbopack's root to the SkillMatch project directory after confirming there were no stray lockfiles or `node_modules` in the parent directory. Dev mode starts cleanly and `/login` returns HTTP 200.
- Disabled browser Supabase session persistence, token refresh, and URL detection, and removed the navbar's automatic mount-time auth fetch. TypeScript passes; direct dev requests to `/` and `/login` returned 200 without the deleted-backend wait.
- Made middleware auth opt-in and fail-open so the deleted Supabase backend cannot trigger auth refresh retries on normal requests. Verified `/` and `/login` return 200 with zero `fetch failed` or `AuthRetryableFetchError` matches in captured dev logs.
- Added isolated guest demo fixtures so the main screens remain presentable without Supabase data. Removed the build-time Google Fonts dependency, added reduced-motion handling to the canvas background, improved guest-mode navigation, and replaced the most synthetic auth/home copy with plain product language.
- Refined the signup and dashboard UI without changing their flow: clearer typography, calmer surfaces, stronger primary actions, less decorative noise, and more useful guest-preview content.
