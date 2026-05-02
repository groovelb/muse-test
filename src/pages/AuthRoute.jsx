import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthPage } from '../components/templates/AuthPage.jsx';
import { useAuth } from '../hooks/auth/useAuth.js';

/**
 * AuthRoute
 *
 * `/auth` 진입점. 비로그인 사용자에게 AuthPage 노출.
 * 이미 로그인된 사용자는 from (AuthGuard 가 보존한 원래 경로) 또는 /archive 로 이동.
 *
 * Query: ?mode=signin | signup → AuthPage 의 initialMode 분기.
 */
export function AuthRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const from = location.state?.from || '/archive';

  if (!loading && user) {
    return <Navigate to={ from } replace />;
  }

  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  return (
    <AuthPage
      initialMode={ mode }
      onAuthenticated={ () => navigate(from, { replace: true }) }
    />
  );
}
