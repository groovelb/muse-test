import { MemoryRouter } from 'react-router-dom';
import { SignUpForm } from './SignUpForm.jsx';
import Box from '@mui/material/Box';

/**
 * Storybook decorator note:
 * useSignUp 훅이 supabase.auth 에 직접 접근. 폼 제출은 실 supabase 호출이 나간다.
 */

export default {
  title: 'Custom Component/SignUpForm',
  component: SignUpForm,
  tags: ['autodocs'],
  argTypes: {
    onSignedUp: { action: 'signedUp', description: '가입 성공 콜백 (user 인자)' },
    onSwitchToLogin: { action: 'switchToLogin', description: '"로그인으로" 링크 클릭' },
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
    onSwitchToLogin: () => alert('로그인으로 이동'),
  },
};
