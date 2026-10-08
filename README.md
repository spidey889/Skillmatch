# SkillMatch

The app where student builders find teammates, ideas, and someone to blame when the group project gets weird.

This is a lightweight prototype for matching student builders with collaborators and project ideas.

Dark mode. Purple gradients. Suspiciously confident dashboards.

## Run it

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000) and click **Continue as Guest**.

The demo works offline. Profile edits, projects, ideas, votes, and messages save in your browser. Clear site storage to reset it. Guest messages are local only and do not send to another person.

## Optional real backend

1. Create a fresh Supabase project and run [database/setup.sql](database/setup.sql) in its SQL editor. The script is for an empty project, not an existing database upgrade.
2. Create `.env.local` with these values from the project's Connect dialog:

```env
NEXT_PUBLIC_SUPABASE_ENABLED=true
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_KEY
```

Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` is also accepted. Never use a service-role key in browser settings. Leave the enabled flag unset for the offline demo.

3. Configure the Auth site URL and allow `http://localhost:3000/auth/callback` (plus your deployed callback URL). Enable Google only if you want Google login. Restart/rebuild after changing environment variables.
4. Sign up, confirm your email, and save your profile before creating projects or messaging. The old configured project is unreachable and has not been restored.

The setup follows Supabase's [SSR client guide](https://supabase.com/docs/guides/auth/server-side/creating-a-client) and [RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security). Identity hiding on idea cards is cosmetic, not database anonymity. Badges are cosmetic achievements.

## Checks

```bash
npm test
npx tsc --noEmit --incremental false
npm run build
```
