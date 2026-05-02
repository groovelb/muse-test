import { MemoryRouter } from 'react-router-dom';
import { AuthPage } from './AuthPage.jsx';

export default {
  title: 'Template/AuthPage',
  component: AuthPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    initialMode: {
      control: 'radio',
      options: ['signin', 'signup'],
      description: '초기 모드 (signin / signup)',
    },
    onAuthenticated: { action: 'authenticated', description: '로그인/가입 성공 콜백 (user 인자)' },
    brandName: { control: 'text', description: 'hero 영역 브랜드명' },
    brandTagline: { control: 'text', description: 'hero 영역 태그라인' },
  },
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
};

export const SignIn = {
  args: { initialMode: 'signin' },
};

export const SignUp = {
  args: { initialMode: 'signup' },
};
