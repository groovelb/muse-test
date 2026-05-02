import Box from '@mui/material/Box';
import { VisualDirectionPreview } from './VisualDirectionPreview';

export default {
  title: 'Component/5. Data Display/VisualDirectionPreview',
  component: VisualDirectionPreview,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

const SAMPLE_VD = {
  markdown: [
    '# Visual Direction',
    '',
    '## Mood',
    '',
    '차분하고 절제된 에디토리얼 톤. 흰 여백과 얇은 디바이더가 화면을 정돈한다.',
    '',
    '## Composition',
    '',
    '- 본문은 한 호흡으로 길게 흐른다.',
    '- 시각 요소는 단순한 흑백 사진 + 굵은 세리프 헤드라인.',
    '',
    '## Avoid',
    '',
    '- 화려한 그라디언트, 채도 높은 강조색',
    '- 과한 카드 그림자',
  ].join('\n'),
  tags: {
    genre: ['editorial', 'longform'],
    style: ['monochrome', 'serif-led', 'minimal'],
    subject: ['essay', 'review'],
  },
};

export const Default = {
  render: () => (
    <Box sx={ { maxWidth: 720 } }>
      <VisualDirectionPreview visualDirection={ SAMPLE_VD } />
    </Box>
  ),
};

/** 태그 없이 markdown 만 */
export const MarkdownOnly = {
  render: () => (
    <Box sx={ { maxWidth: 720 } }>
      <VisualDirectionPreview visualDirection={ { markdown: SAMPLE_VD.markdown, tags: { genre: [], style: [], subject: [] } } } />
    </Box>
  ),
};

/** 빈 상태 */
export const Empty = {
  render: () => (
    <Box sx={ { maxWidth: 720 } }>
      <VisualDirectionPreview visualDirection={ undefined } />
    </Box>
  ),
};
