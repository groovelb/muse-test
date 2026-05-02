import { useCallback, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { normalizeSupabaseError } from '../../utils/supabaseError.js';

/**
 * useSignUp
 *
 * 이메일+비밀번호 가입. supabase.auth.signUp 호출.
 * Confirm email OFF 합의 → 가입 즉시 세션 발급.
 * displayName 은 raw_user_meta_data.display_name 으로 전달 → handle_new_user 트리거가 profiles.display_name 채움.
 *
 * 반환:
 * - signUp(email, password, displayName?): Promise<user>
 * - loading: boolean
 * - error: string | null
 *
 * SignUpForm 의 기존 시그니처 유지.
 */
export function useSignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signUp = useCallback(async (email, password, displayName) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: displayName ? { data: { display_name: displayName } } : undefined,
      });
      if (err) throw err;
      setLoading(false);
      return data.user;
    } catch (err) {
      const { message } = normalizeSupabaseError(err);
      setError(message);
      setLoading(false);
      throw new Error(message);
    }
  }, []);

  return { signUp, loading, error };
}
