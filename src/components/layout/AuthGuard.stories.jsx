import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthGuard } from './AuthGuard.jsx';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Storybook decorator note:
 * AuthGuard 가 useAuth 훅을 통해 supabase.auth 에 직접 접근.
 * 스토리에서는 별도 mock 없이 실 supabase 세션 상태를 그대로 사용.
 * - 로컬에서 supabase 에 로그인된 상태면 ProtectedScreen 노출
 * - 로그인 안 된 상태면 redirect → FakeAuthScreen
 *
 * 시각 검증용. 실제 인증 상태에 따라 분기되는 모습을 확인하려면 dev 앱에서 확인 권장.
 */

const ProtectedScreen = () => (
  <Box sx={ { p: 4 } }>
    <Typography variant="h5" sx={ { fontWeight: 600 } }>보호된 화면</Typography>
    <Typography variant="body2" color="text.secondary">로그인된 사용자만 볼 수 있습니다.</Typography>
  </Box>
);

const FakeAuthScreen = () => (
  <Box sx={ { p: 4 } }>
    <Typography variant="h5" sx={ { fontWeight: 600 } }>로그인 페이지로 이동됨</Typography>
    <Typography variant="body2" color="text.secondary">미인증 상태에서 AuthGuard 가 redirect 한 결과입니다.</Typography>
  </Box>
);

const Frame = ({ initialPath = '/protected' }) => (
  <MemoryRouter initialEntries={ [initialPath] }>
    <Routes>
      <Route
        path="/protected"
        element={
          <AuthGuard>
            <ProtectedScreen />
          </AuthGuard>
        }
      />
      <Route path="/auth" element={ <FakeAuthScreen /> } />
    </Routes>
  </MemoryRouter>
);

export default {
  title: 'Custom Component/AuthGuard',
  component: AuthGuard,
  tags: ['autodocs'],
  argTypes: {
    redirectTo: { control: 'text', description: '미인증 시 이동 경로 (기본 /auth)' },
  },
};

export const Default = {
  render: () => <Frame />,
};
