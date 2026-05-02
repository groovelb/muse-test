import { Navigate, useNavigate } from 'react-router-dom';
import { LandingPage } from '../components/templates/LandingPage.jsx';
import { useAuth } from '../hooks/auth/useAuth.js';

/**
 * LandingRoute
 *
 * `/` 진입점. 비로그인 사용자에게 LandingPage 노출.
 * 이미 로그인된 사용자는 /archive 로 리다이렉트.
 */
export function LandingRoute() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && user) {
    return <Navigate to="/archive" replace />;
  }

  return (
    <LandingPage
      onPrimaryCta={ () => navigate('/auth?mode=signup') }
      onSecondaryCta={ () => navigate('/auth') }
    />
  );
}
