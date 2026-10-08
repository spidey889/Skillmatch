# SkillMatch architecture and behavior

SkillMatch is a Next.js 16 App Router college prototype using strict TypeScript and Supabase. Turbopack's root is pinned to this directory. Auth forms wrap useSearchParams in Suspense.

## Offline demo (default)

Unless NEXT_PUBLIC_SUPABASE_ENABLED=true, pages use local fixtures and never contact Supabase. Browser client auth persistence and refresh are disabled in this mode, and accidental requests return a local 503. Login/signup explain that the backend is disabled and offer Continue as Guest. No database credentials are required for the demo.

utils/demo-store.ts keeps profile, project, idea, vote, and message changes in versioned localStorage keys, with a session fallback if storage is blocked/full. Changes survive reloads. Clearing browser storage resets the demo. This is one local guest account, not multi-user authentication. Demo chats isolate messages by recipient and do not simulate replies. Profiles, dashboard activity/counts, achievements, and skill matches read the same saved state.

Projects support creation, description editing, deletion, joining, and leaving. Ideas support creation, one vote per guest per idea, and owner identity reveal. Missing project/student IDs show not-found states rather than unrelated fixtures. Skill matches are case-insensitive shared-skill comparisons, not AI.

## Optional Supabase backend

Configure a fresh Supabase project using database/setup.sql and the README environment settings. Browser auth uses the normal cookie-backed SSR defaults when enabled, so sessions persist and refresh. Middleware refreshes auth only when enabled; pages check authentication and database RLS protects writes and private messages. Middleware does not redirect public/guest previews.

The bootstrap defines profiles, projects, idea_pitches, messages, badges, and private vote records. RLS restricts profile writes and project edits/deletes to their owners and message reads to participants. Only receivers can update the read column. Private SQL functions behind invoker RPC wrappers perform atomic membership updates and deduplicated votes; direct client writes cannot replace members or vote counters. Badges remain cosmetic, client-calculated achievements. Idea anonymity is display-only: authenticated users can inspect creator IDs through the API.

Backend chat polls every five seconds while visible, stops on unmount, and preserves reading position during refreshes. Failed sends restore the draft and show an inline error. List/query failures show a visible reload notice rather than appearing to be empty results.

The previously configured backend is unreachable. The new schema and permissions were tested locally in PostgreSQL via PGlite, not applied to a hosted project.
