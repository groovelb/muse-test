# appendix. Auth Design

> [04-data-bridge.md § 4 Auth 시퀀스](./04-data-bridge.md) 의 회원가입 트리거 SQL + Dashboard 설정 + 클라이언트 플로우.
> UI 컴포넌트 사양은 [appendix-auth-ui-spec.md](./appendix-auth-ui-spec.md).

## 인증 방식 (합의 결과)

| 항목 | 값 | 비고 |
|---|---|---|
| Provider | Email + Password | OAuth 추가는 추후 확장 |
| 이메일 인증 (Confirm email) | **OFF** | 학습용. 가입 즉시 로그인 가능 |
| 비밀번호 정책 | 8자 이상 | Supabase 기본 |
| 역할 시스템 | 없음 | 모든 사용자 동등 |
| `display_name` 기본값 | 이메일 local part | 트리거에서 자동 (`hong@gmail.com` → `hong`) |
| 세션 | Supabase 기본 | access token 1h, refresh 자동 갱신 |

## profiles + user_settings 자동 생성 트리거

`auth.users` insert 직후 `profiles` + `user_settings` 에 default row 자동 생성. 누락 시 가입 직후 조회 실패 → NPE 위험.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  );

  insert into public.user_settings (id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 주의사항

- **`security definer` 필수**: 트리거가 `auth.users` 컨텍스트에서 실행되므로 권한 상승 없으면 `public.profiles` insert 실패.
- **`set search_path = public`**: SQL injection 방어. 미설정 시 lint 경고.
- **`coalesce(raw_user_meta_data->>'display_name', split_part(...))`**: 회원가입 폼이 display_name 을 넘기면 그대로, 안 넘기면 이메일 local part 로 fallback. (Q4=a 합의)
- **`user_settings` default 값**: schema 의 `default` 절이 자동 적용 (ai_model='claude-sonnet-4-6', storage_mode='cloud', theme_mode='system', is_auto_tag_enabled=true).

## Supabase Dashboard 설정 체크리스트

> ⚠️ Dashboard 설정은 SQL 로 검증 못 하는 항목. 사용자가 Dashboard 에서 직접 토글 후 화면 캡처 / 직접 확인 필요.

### Authentication → Providers

- [ ] **Email** Enabled

### Authentication → Sign In / Up

- [ ] **Confirm email**: **OFF** (학습용 합의)
- [ ] **Allow new users to sign up**: ON

### Authentication → URL Configuration

- [ ] **Site URL**: `http://localhost:5173` (Vite 기본 포트)
- [ ] **Redirect URLs**: `http://localhost:5173/*` 추가 (배포 도메인 추가 시 함께)

### Authentication → Password

- [ ] **Minimum password length**: `8`

### Authentication → Email Templates (선택)

- [ ] 한국어 안내 필요 시 Reset password / Invite user 등 템플릿 커스터마이즈

## 클라이언트 플로우

### 회원가입

1. `SignUpForm` 에서 email + password 입력
2. `supabase.auth.signUp({ email, password })` 호출
3. `auth.users` insert → `handle_new_user` 트리거 → `profiles` + `user_settings` 자동 생성
4. (Confirm email OFF 이므로) 즉시 세션 발급 → `useAuth` 가 user 감지 → 보호 라우트 진입 가능

### 로그인

1. `LoginForm` 에서 email + password 입력
2. `supabase.auth.signInWithPassword({ email, password })` 호출
3. 성공 시 access token 자동 저장 (Supabase SDK 가 localStorage 관리)
4. `useAuth` 의 `onAuthStateChange` 가 user 감지 → UI 갱신

### 로그아웃

1. GNB 의 로그아웃 버튼 → `supabase.auth.signOut()`
2. 세션 삭제 → `useAuth` 가 user=null 감지 → `AuthGuard` 가 `/auth` 로 리다이렉트

### 세션 복원 (앱 진입 시)

1. 앱 마운트 → `supabase.auth.getSession()` 호출
2. 기존 세션 있으면 user 자동 복원, 없으면 null
3. `AuthGuard` 가 `/` (Archive) 같은 보호 라우트에서 user=null 이면 `/auth` 로 리다이렉트

## 마이그레이션 파일

- `supabase/migrations/20260502060519_auth_profiles.sql` (본 문서)

## 참조

- [appendix-db-schema.md](./appendix-db-schema.md) (profiles / user_settings 테이블)
- [appendix-auth-ui-spec.md](./appendix-auth-ui-spec.md) (LoginForm / SignUpForm / AuthGuard 사양)
- [appendix-rls-policies.md](./appendix-rls-policies.md) (Phase 3, 인증 후 데이터 접근 정책)
