import { createClient } from '@supabase/supabase-js';

/**
 * Supabase singleton client.
 *
 * 모든 데이터 호출은 이 인스턴스 1개를 공유한다.
 * 데이터 훅은 `{ client = supabase }` 패턴으로 받아, Storybook 에서 mock 주입 가능.
 *
 * 환경 변수:
 * - VITE_SUPABASE_URL: Project URL
 * - VITE_SUPABASE_ANON_KEY: anon public key (브라우저 노출 OK, RLS 보호)
 *
 * service_role 키는 절대 여기 사용 금지.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local',
  );
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
