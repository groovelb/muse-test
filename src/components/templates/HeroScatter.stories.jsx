import { HeroScatter } from './HeroScatter.jsx';

export default {
  title: 'Template/HeroScatter',
  component: HeroScatter,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## HeroScatter

랜딩 페이지용 Hero 섹션. 배경에 example 이미지가 ScatterLayout(자유 배치)으로 흩뿌려지고,
hover 시 다른 이미지가 blur + opacity 페이드되며 강조됩니다.

### 패턴
- **Scattered / Moodboard Layout**: 그리드 없이 자유 좌표로 이미지 배치.
- **중앙 세이프존**: 가운데 텍스트 + CTA 영역은 시드 기반 좌표 생성 시 회피.
- **Hover Blur Fade**: 호버된 이미지를 제외한 나머지에 \`filter: blur\` + opacity 감소.

### Props
- \`brandName\`: 워드마크 (기본 'MUUSE')
- \`tagline\`: 메인 카피
- \`onPrimaryCta\` / \`onSecondaryCta\`: CTA 핸들러
- \`seed\`: 좌표 시드 (변경 시 배치 패턴 변화)
        `,
      },
    },
  },
  argTypes: {
    brandName: { control: 'text' },
    tagline: { control: 'text' },
    seed: { control: { type: 'number' } },
    onPrimaryCta: { action: 'primaryCta' },
  },
};

export const Default = {
  args: {
    brandName: 'MUSE',
    tagline: '바이브 디자인을 위한 영감을 관리하세요',
    seed: 7,
  },
};

export const AltSeed = {
  args: {
    ...Default.args,
    seed: 42,
  },
  parameters: {
    docs: {
      description: { story: '시드를 바꾸면 좌표 패턴이 달라집니다.' },
    },
  },
};

export const Mobile = {
  args: { ...Default.args },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: { story: 'xs 뷰포트. 이미지 사이즈 자동 축소.' },
    },
  },
};

export const CustomCopy = {
  args: {
    brandName: 'MUSE',
    tagline: '레퍼런스에서 토큰까지, 결정의 흔적을 남기세요',
    seed: 11,
  },
};
