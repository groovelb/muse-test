import { useState } from 'react';
import Box from '@mui/material/Box';
import { AnalysisLayerTabs } from './AnalysisLayerTabs';
import {
  projectsWithThumbnails,
  getAnalysisResult,
  references as allReferences,
} from '../../data/muse';
import { ANALYSIS_LAYERS } from '../../data/muse/layers.js';

export default {
  title: 'Template/AnalysisLayerTabs',
  component: AnalysisLayerTabs,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

const PROJECT = projectsWithThumbnails[0];
const INITIAL_ANALYSIS = getAnalysisResult(PROJECT.id).layers;

/** 기본: 6 개 레이어 (color → designMd) 풀 탭 */
export const Default = {
  render: () => {
    const [analysis, setAnalysis] = useState(INITIAL_ANALYSIS);

    const handleUpdate = (layerKey, id, patch) => {
      setAnalysis((prev) => ({
        ...prev,
        [layerKey]: (prev[layerKey] || [])
          .map((t) => (t.id === id ? { ...t, ...patch } : t))
          .filter((t) => !t._removed),
      }));
    };

    return (
      <Box sx={ { maxWidth: 1080 } }>
        <AnalysisLayerTabs
          project={ PROJECT }
          analysis={ analysis }
          references={ allReferences }
          onUpdateToken={ handleUpdate }
        />
      </Box>
    );
  },
};

/** DESIGN.md 탭 제외 — 5 개 레이어만 (concept 모드 가까운 형태) */
export const WithoutDesignMd = {
  render: () => {
    const [analysis, setAnalysis] = useState(INITIAL_ANALYSIS);

    return (
      <Box sx={ { maxWidth: 1080 } }>
        <AnalysisLayerTabs
          project={ PROJECT }
          analysis={ analysis }
          references={ allReferences }
          layers={ ANALYSIS_LAYERS }
          onUpdateToken={ (layer, id, patch) =>
            setAnalysis((prev) => ({
              ...prev,
              [layer]: prev[layer].map((t) => (t.id === id ? { ...t, ...patch } : t)),
            }))
          }
        />
      </Box>
    );
  },
};

/** 비주얼 디렉션 탭으로 시작 */
export const StartOnVisualDirection = {
  render: () => {
    const [analysis, setAnalysis] = useState(INITIAL_ANALYSIS);

    return (
      <Box sx={ { maxWidth: 1080 } }>
        <AnalysisLayerTabs
          project={ PROJECT }
          analysis={ analysis }
          references={ allReferences }
          defaultLayer="visualDirection"
          onUpdateToken={ (layer, id, patch) =>
            setAnalysis((prev) => ({
              ...prev,
              [layer]: prev[layer].map((t) => (t.id === id ? { ...t, ...patch } : t)),
            }))
          }
        />
      </Box>
    );
  },
};

/** 최소 샘플 — color 한 토큰만 */
export const Minimal = {
  render: () => {
    const [analysis, setAnalysis] = useState({
      color: [
        { id: 'p', label: 'Primary', hex: '#4F46E5', role: 'primary', isEnabled: true, emphasis: 2 },
      ],
      typography: [],
      layout: [],
      gradient: [],
      visualDirection: { markdown: '# Minimal\n\n간단한 샘플.', tags: { genre: [], style: [], subject: [] } },
    });

    return (
      <Box sx={ { maxWidth: 1080 } }>
        <AnalysisLayerTabs
          project={ { id: 'p-min', name: 'Minimal Project', intent: '단일 컬러만 추출', referenceIds: [] } }
          analysis={ analysis }
          references={ [] }
          onUpdateToken={ (layer, id, patch) =>
            setAnalysis((prev) => ({
              ...prev,
              [layer]: prev[layer].map((t) => (t.id === id ? { ...t, ...patch } : t)),
            }))
          }
        />
      </Box>
    );
  },
};
