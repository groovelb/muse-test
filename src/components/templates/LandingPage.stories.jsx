import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from './LandingPage.jsx';

export default {
  title: 'Template/LandingPage',
  component: LandingPage,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    onPrimaryCta: { action: 'primaryCta', description: '주요 CTA ("시작하기")' },
    onSecondaryCta: { action: 'secondaryCta', description: '보조 CTA ("로그인")' },
    brandName: { control: 'text', description: '브랜드명' },
  },
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
};

export const Default = {
  args: { brandName: 'MUSE' },
};
