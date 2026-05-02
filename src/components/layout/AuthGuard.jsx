import { Navigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../../hooks/auth/useAuth.js';

/**
 * AuthGuard
 *
 * 보호 라우트 wrapper. 인증된 사용자만 children 을 렌더한다.
 * 미인증 → redirectTo 로 navigate (현재 location 을 state.from 으로 전달).
 * 세션 로딩 중 → CircularProgress.
 *
 * Props:
 * @param {node} children - 보호할 라우트/컴포넌트 [Required]
 * @param {string} redirectTo - 미인증 시 이동 경로 [Optional, 기본값: '/auth']
 *
 * Example usage:
 * <Route element={ <AuthGuard><AppShellLayout /></AuthGuard> }>
 *   <Route path="/archive" element={ <ArchiveRoute /> } />
 * </Route>
 */
export function AuthGuard({ children, redirectTo = '/auth' }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={ {
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        } }
      >
        <CircularProgress size={ 32 } />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to={ redirectTo } replace state={ { from: location.pathname } } />;
  }

  return children;
}
