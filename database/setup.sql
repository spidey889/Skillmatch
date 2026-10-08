-- Bootstrap a NEW Supabase project in the SQL editor. Not an upgrade for existing tables.
begin;
create schema if not exists private;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', bio text not null default '',
  university text not null default '', year_of_study text not null default '1st',
  skills text[] not null default '{}', updated_at timestamptz not null default now()
);
create table public.projects (
  id uuid primary key default gen_random_uuid(), title text not null check (length(trim(title)) > 0),
  description text not null, skills_needed text[] not null default '{}',
  creator_id uuid not null references public.profiles(id), members uuid[] not null default '{}',
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);
create table public.idea_pitches (
  id uuid primary key default gen_random_uuid(), title text not null check (length(trim(title)) > 0),
  description text not null, skills_needed text[] not null default '{}',
  creator_id uuid not null references public.profiles(id), revealed boolean not null default false,
  upvotes integer not null default 0, created_at timestamptz not null default now()
);
create table private.idea_votes (
  pitch_id uuid references public.idea_pitches(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade, primary key (pitch_id, user_id)
);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id), receiver_id uuid not null references public.profiles(id),
  content text not null check (length(trim(content)) between 1 and 5000),
  read boolean not null default false, created_at timestamptz not null default now()
);
create index messages_participants on public.messages(sender_id, receiver_id, created_at);
create index messages_receiver on public.messages(receiver_id, created_at);
create table public.badges (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  badge_type text not null check (badge_type in ('profile_complete', 'skill_master', 'first_project', 'team_player')),
  earned_at timestamptz not null default now(), unique(user_id, badge_type)
);
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.idea_pitches enable row level security;
alter table public.messages enable row level security;
alter table public.badges enable row level security;
alter table private.idea_votes enable row level security;
create policy profiles_read on public.profiles for select to authenticated using (true);
create policy profiles_insert on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy projects_read on public.projects for select to authenticated using (true);
create policy projects_insert on public.projects for insert to authenticated with check (creator_id = (select auth.uid()) and members = array[(select auth.uid())]);
create policy projects_update on public.projects for update to authenticated using (creator_id = (select auth.uid())) with check (creator_id = (select auth.uid()));
create policy projects_delete on public.projects for delete to authenticated using (creator_id = (select auth.uid()));
create policy ideas_read on public.idea_pitches for select to authenticated using (true);
create policy ideas_insert on public.idea_pitches for insert to authenticated with check (creator_id = (select auth.uid()) and upvotes = 0);
create policy ideas_update on public.idea_pitches for update to authenticated using (creator_id = (select auth.uid())) with check (creator_id = (select auth.uid()));
create policy messages_read on public.messages for select to authenticated using ((select auth.uid()) in (sender_id, receiver_id));
create policy messages_insert on public.messages for insert to authenticated with check (sender_id = (select auth.uid()));
create policy messages_update on public.messages for update to authenticated using (receiver_id = (select auth.uid())) with check (receiver_id = (select auth.uid()));
-- Badges are cosmetic, self-awarded achievements in this college prototype.
create policy badges_read on public.badges for select to authenticated using (user_id = (select auth.uid()));
create policy badges_insert on public.badges for insert to authenticated with check (user_id = (select auth.uid()));
-- Remove Supabase default table-wide UPDATE grants before granting specific columns.
revoke all on public.profiles, public.projects, public.idea_pitches, public.messages, public.badges from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.projects to authenticated;
grant update(title, description, skills_needed, status) on public.projects to authenticated;
grant select, insert on public.idea_pitches to authenticated;
grant update(revealed) on public.idea_pitches to authenticated;
grant select, insert on public.messages to authenticated;
grant update(read) on public.messages to authenticated;
grant select, insert on public.badges to authenticated;
-- Membership/votes need narrowly privileged operations: ordinary users must never
-- update another owner's entire row. Keep definers private with a fixed search path.
create function private.set_project_membership(project_id uuid, joining boolean)
returns public.projects language plpgsql security definer set search_path = '' as $$
declare result public.projects;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  select * into result from public.projects where id = project_id for update;
  if not found then raise exception 'Project not found'; end if;
  if joining and result.status <> 'open' then raise exception 'Project is closed'; end if;
  if not joining and result.creator_id = auth.uid() then raise exception 'The owner cannot leave'; end if;
  update public.projects set members = case
    when joining and not auth.uid() = any(members) then array_append(members, auth.uid())
    when not joining then array_remove(members, auth.uid()) else members end
  where id = project_id returning * into result;
  return result;
end $$;
create function private.upvote_idea(pitch_id uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare result integer;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  insert into private.idea_votes values (pitch_id, auth.uid()) on conflict do nothing;
  if found then
    update public.idea_pitches set upvotes = upvotes + 1 where id = pitch_id returning upvotes into result;
  else select upvotes into result from public.idea_pitches where id = pitch_id;
  end if;
  return result;
end $$;
create function public.set_project_membership(project_id uuid, joining boolean)
returns public.projects language sql security invoker set search_path = ''
as $$ select private.set_project_membership(project_id, joining) $$;
create function public.upvote_idea(pitch_id uuid)
returns integer language sql security invoker set search_path = ''
as $$ select private.upvote_idea(pitch_id) $$;
revoke all on function private.set_project_membership(uuid, boolean), private.upvote_idea(uuid), public.set_project_membership(uuid, boolean), public.upvote_idea(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.set_project_membership(uuid, boolean), private.upvote_idea(uuid), public.set_project_membership(uuid, boolean), public.upvote_idea(uuid) to authenticated;
commit;
