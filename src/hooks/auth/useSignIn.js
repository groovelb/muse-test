import { useCallback, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { normalizeSupabaseError } from '../../utils/supabaseError.js';

/**
 * useSignIn
 *
 * 이메일+비밀번호 로그인. supabase.auth.signInWithPassword 호출.
 *
 * 반환:
 * - signIn(email, password): Promise<user>
 * - loading: boolean
 * - error: string | null  (한국어 정규화 메시지)
 *
 * LoginForm 의 기존 시그니처 (signIn(email, password)) 유지.
 */
export function useSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
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

  return { signIn, loading, error };
}
