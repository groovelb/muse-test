import { NavLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAuth } from '../hooks/auth/useAuth.js';

const NAV_ITEMS = [
  { to: '/archive', label: 'Archive' },
  { to: '/projects', label: 'Projects' },
  { to: '/settings', label: 'Settings' },
];

/**
 * MuseNav: GNB 좌측 영역 (로고 + 네비게이션) + 우측 사용자 영역
 *
 * AuthGuard 내부에서만 마운트되므로 user 가 항상 존재한다고 가정.
 */
export function MuseNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <Box
      sx={ {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: 4,
      } }
    >
      <Box sx={ { display: 'flex', alignItems: 'center', gap: 4 } }>
        <NavLink to="/archive" style={ { textDecoration: 'none' } }>
          <Typography variant="h6" sx={ { fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' } }>
            MUSE
          </Typography>
        </NavLink>
        <Box sx={ { display: 'flex', gap: 3 } }>
          { NAV_ITEMS.map((item) => (
            <NavLink
              key={ item.to }
              to={ item.to }
              style={ { textDecoration: 'none' } }
            >
              { ({ isActive }) => (
                <Typography
                  variant="body2"
                  sx={ {
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'text.primary' : 'text.secondary',
                    transition: 'color 150ms',
                    '&:hover': { color: 'text.primary' },
                  } }
                >
                  { item.label }
                </Typography>
              ) }
            </NavLink>
          )) }
        </Box>
      </Box>

      { user && (
        <Box sx={ { display: 'flex', alignItems: 'center', gap: 2 } }>
          <Typography variant="body2" color="text.secondary">
            { user.displayName || user.email }
          </Typography>
          <Button onClick={ handleSignOut } size="small" variant="text">
            로그아웃
          </Button>
        </Box>
      ) }
    </Box>
  );
}
