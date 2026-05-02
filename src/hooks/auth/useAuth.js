import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';

/**
 * useAuth
 *
 * 현재 supabase 세션 / user / signOut 을 제공하는 훅.
 * 내부적으로 supabase.auth.getSession() 1회 호출 + onAuthStateChange 구독.
 *
 * 반환:
 * - user: { id, email, user_metadata, ... } | null  (supabase auth.User)
 * - session: Session | null
 * - loading: boolean (초기 세션 로딩 중)
 * - signOut(): Promise<void>
 *
 * 주의: AuthProvider 같은 별도 Context 불필요. supabase.auth 가 이미 singleton.
 */
export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user: session?.user ?? null,
    session,
    loading,
    signOut,
  };
}
