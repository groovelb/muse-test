import { useState } from 'react';
import Box from '@mui/material/Box';
import { CategoryTab } from '../in-page-navigation/CategoryTab.jsx';
import { ColorSwatchList } from '../data-display/ColorSwatchList.jsx';
import { TypographyPreview } from '../data-display/TypographyPreview.jsx';
import { LayoutTokenPreview } from '../data-display/LayoutTokenPreview.jsx';
import { GradientPreview } from '../data-display/GradientPreview.jsx';
import { VisualDirectionPreview } from '../data-display/VisualDirectionPreview.jsx';
import { DesignMdPreview } from '../data-display/DesignMdPreview.jsx';
import { ANALYSIS_LAYERS_WITH_DESIGN_MD } from '../../data/muse/layers.js';

/**
 * AnalysisLayerTabs
 *
 * T3 분석 결과 (system 모드) 레이어 탭 셸. 상단 CategoryTab + 하단 활성 레이어 에디터.
 * color / typography / layout / gradient / visualDirection / designMd 6 개 분기 처리.
 *
 * Props:
 * @param {object} analysis - 레이어별 토큰 묶음 { color, typography, layout, gradient, visualDirection } [Required]
 * @param {object} project - 프로젝트 (DESIGN.md 렌더링 시 필요) [Optional]
 * @param {array}  references - 출처 참조용 references 배열 [Optional, 기본값: []]
 * @param {function} onUpdateToken - (layerKey, tokenId, patch) => void [Optional]
 * @param {array}  layers - 표시할 카테고리 배열 [Optional, 기본값: ANALYSIS_LAYERS_WITH_DESIGN_MD]
 * @param {string} defaultLayer - 초기 활성 레이어 [Optional, 기본값: 'color']
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <AnalysisLayerTabs
 *   project={ project }
 *   analysis={ analysis }
 *   references={ references }
 *   onUpdateToken={ (layer, id, patch) => updateStore(layer, id, patch) }
 * />
 */
export function AnalysisLayerTabs({
  analysis,
  project,
  references = [],
  onUpdateToken,
  layers = ANALYSIS_LAYERS_WITH_DESIGN_MD,
  defaultLayer = 'color',
  sx,
}) {
  const [activeLayer, setActiveLayer] = useState(defaultLayer);

  const handleChange = (layerKey) => (id, patch) => {
    onUpdateToken?.(layerKey, id, patch);
  };

  const renderEditor = () => {
    switch (activeLayer) {
      case 'color':
        return (
          <ColorSwatchList
            tokens={ analysis?.color || [] }
            onChange={ handleChange('color') }
            references={ references }
          />
        );
      case 'typography':
        return (
          <TypographyPreview
            tokens={ analysis?.typography || [] }
            onChange={ handleChange('typography') }
            references={ references }
          />
        );
      case 'layout':
        return (
          <LayoutTokenPreview
            tokens={ analysis?.layout || [] }
            onChange={ handleChange('layout') }
            references={ references }
          />
        );
      case 'gradient':
        return (
          <GradientPreview
            tokens={ analysis?.gradient || [] }
            onChange={ handleChange('gradient') }
            references={ references }
          />
        );
      case 'visualDirection':
        return <VisualDirectionPreview visualDirection={ analysis?.visualDirection } />;
      case 'designMd':
        return (
          <Box
            sx={ {
              bgcolor: 'background.paper',
              borderRadius: 3,
              p: { xs: 2, md: 4 },
              border: '1px solid',
              borderColor: 'divider',
            } }
          >
            <DesignMdPreview project={ project } layers={ analysis } variant="raw" />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={ sx }>
      <CategoryTab
        categories={ layers }
        selected={ activeLayer }
        onChange={ setActiveLayer }
      />
      <Box sx={ { py: 2 } }>
        { renderEditor() }
      </Box>
    </Box>
  );
}
