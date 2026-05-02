import { Navigate, useNavigate } from 'react-router-dom';
import { LandingPage } from '../components/templates/LandingPage.jsx';
import { useAuth } from '../hooks/auth/useAuth.js';

/**
 * LandingRoute
 *
 * `/` 진입점. 비로그인 사용자에게 LandingPage 노출.
 * 이미 로그인된 사용자는 /archive 로 리다이렉트.
 * 가입/로그인은 LandingPage 내부 AuthDialog 모달로 처리되며,
 * 성공 시 onAuthenticated 콜백으로 /archive 이동.
 */
export function LandingRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && user) {
    return <Navigate to="/archive" replace />;
  }

  return (
    <LandingPage
      onAuthenticated={ () => navigate('/archive', { replace: true }) }
    />
  );
}
