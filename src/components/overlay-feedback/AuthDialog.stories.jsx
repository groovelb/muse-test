import { useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { AuthDialog } from './AuthDialog.jsx';

export default {
  title: 'Component/9. Overlay & Feedback/AuthDialog',
  component: AuthDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## AuthDialog

회원가입 / 로그인 탭 모달. 기존 \`SignUpForm\` / \`LoginForm\` 을 재사용합니다.

### Props
- \`open\` (boolean, required): 모달 표시 여부
- \`onClose\` (function, required): 닫기 콜백
- \`initialTab\` ('signup' | 'signin', 기본 'signup'): 초기 탭
- \`onAuthenticated\` (function): 가입/로그인 성공 시 호출, 모달은 자동 닫힘

### 동작
- 탭 전환은 내부 state. 폼 사이 입력값은 폼 단위로 독립.
- 폼 하단의 "회원가입/로그인" 링크도 탭 전환과 연동.
- ESC, backdrop 클릭, 우상단 X 모두 onClose 호출.
        `,
      },
    },
  },
  argTypes: {
    initialTab: {
      control: { type: 'inline-radio' },
      options: ['signup', 'signin'],
    },
    onClose: { action: 'close' },
    onAuthenticated: { action: 'authenticated' },
  },
};

/** open 상태를 외부 버튼으로 토글하는 데모 래퍼 */
function DemoTrigger({ initialTab, ...props }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={ { p: 4 } }>
      <Button variant="contained" onClick={ () => setOpen(true) }>
        모달 열기 ({ initialTab })
      </Button>
      <AuthDialog
        { ...props }
        open={ open }
        onClose={ () => setOpen(false) }
        initialTab={ initialTab }
      />
    </Box>
  );
}

export const SignupDefault = {
  args: { initialTab: 'signup' },
  render: (args) => <DemoTrigger { ...args } />,
};

export const LoginInitial = {
  args: { initialTab: 'signin' },
  render: (args) => <DemoTrigger { ...args } />,
};

/** 즉시 열린 상태 (탭 전환 / 폼 검증 확인용) */
export const OpenSignup = {
  args: { initialTab: 'signup', open: true },
  render: (args) => <AuthDialog { ...args } />,
};

export const OpenLogin = {
  args: { initialTab: 'signin', open: true },
  render: (args) => <AuthDialog { ...args } />,
};
