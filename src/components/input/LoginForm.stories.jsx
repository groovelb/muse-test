import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm.jsx';
import Box from '@mui/material/Box';

/**
 * Storybook decorator note:
 * useSignIn 훅이 supabase.auth 에 직접 접근. 환경변수 (VITE_SUPABASE_URL/ANON_KEY) 가 있으면
 * 실제 supabase 로 호출이 나간다. 스토리는 시각 검증용이므로 폼 제출은 권장하지 않음.
 */

export default {
  title: 'Custom Component/LoginForm',
  component: LoginForm,
  tags: ['autodocs'],
  argTypes: {
    onSignedIn: { action: 'signedIn', description: '로그인 성공 콜백 (user 인자)' },
    onSwitchToSignUp: { action: 'switchToSignUp', description: '"회원가입으로" 링크 클릭' },
    sx: { control: 'object', description: '추가 스타일 (MUI sx)' },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Box sx={ { maxWidth: 400, mx: 'auto', p: 4 } }>
          <Story />
        </Box>
      </MemoryRouter>
    ),
  ],
};

export const Default = {
  args: {},
};

export const WithSwitchLink = {
  args: {
    onSwitchToSignUp: () => alert('회원가입으로 이동'),
  },
};
