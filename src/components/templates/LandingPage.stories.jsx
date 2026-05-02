import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from './LandingPage.jsx';

export default {
  title: 'Template/LandingPage',
  component: LandingPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
랜딩 페이지. 상단 GNB-lite + HeroScatter (Scatter Layout 배경 + hover blur) +
Features + Footer CTA + AuthDialog 모달.

모든 CTA 버튼은 내부 AuthDialog 를 오픈합니다 (탭으로 가입/로그인 구분).
\`onAuthenticated\` 콜백으로 성공 시 외부 라우팅 트리거.
        `,
      },
    },
  },
  argTypes: {
    onAuthenticated: { action: 'authenticated', description: '가입/로그인 성공 시' },
    brandName: { control: 'text' },
  },
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
};

export const Default = {
  args: { brandName: 'MUSE' },
};
