-- MUSE init schema
-- 입력: docs/muse/04-data-bridge.md § 1.5 DB 스펙 미리보기
-- 원칙: 모든 테이블 uuid PK + created_at/updated_at + RLS enable (정책은 별도 마이그레이션에서)

-- =============================================================================
-- 0. 공통 함수
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- 1. profiles  (auth.users 확장: displayName, avatarUrl)
-- =============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- =============================================================================
-- 2. user_settings  (사용자당 1 row)
-- =============================================================================

create table public.user_settings (
  id uuid primary key references auth.users(id) on delete cascade,
  ai_model text not null default 'claude-sonnet-4-6',
  storage_mode text not null default 'cloud' check (storage_mode in ('local', 'cloud')),
  theme_mode text not null default 'system' check (theme_mode in ('light', 'dark', 'system')),
  is_auto_tag_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_user_settings_set_updated_at
  before update on public.user_settings
  for each row execute procedure public.set_updated_at();

-- =============================================================================
-- 3. reference_items  (영감 이미지 + 자동 태깅 결과)
-- =============================================================================

create table public.reference_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('file', 'url')),
  thumbnail_url text not null,
  title text,
  tags jsonb,
  dominant_colors text[],
  extracted jsonb,
  created_at timestamptz not null default now()
);

create index idx_reference_items_owner_id on public.reference_items(owner_id);
create index idx_reference_items_created_at on public.reference_items(created_at desc);

-- =============================================================================
-- 4. projects  (5-step 위자드 산출)
-- =============================================================================

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  mode text not null check (mode in ('concept', 'system')),
  intent text,
  user_notes text,
  reference_notes jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_projects_owner_id on public.projects(owner_id);
create index idx_projects_created_at on public.projects(created_at desc);

create trigger trg_projects_set_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

-- =============================================================================
-- 5. project_references  (M:N 매핑)
-- =============================================================================

create table public.project_references (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  reference_id uuid not null references public.reference_items(id) on delete cascade,
  use_layers text[] not null default '{}',
  unique (project_id, reference_id)
);

create index idx_project_references_project_id on public.project_references(project_id);
create index idx_project_references_reference_id on public.project_references(reference_id);

-- =============================================================================
-- 6. analysis_results  (5 레이어 토큰 jsonb)
-- =============================================================================

create table public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'running', 'done', 'error')),
  layers jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index idx_analysis_results_project_id on public.analysis_results(project_id);

create trigger trg_analysis_results_set_updated_at
  before update on public.analysis_results
  for each row execute procedure public.set_updated_at();

-- =============================================================================
-- 7. RLS enable (정책은 별도 마이그레이션 rls_policies 에서)
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.reference_items enable row level security;
alter table public.projects enable row level security;
alter table public.project_references enable row level security;
alter table public.analysis_results enable row level security;
