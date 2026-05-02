import Box from '@mui/material/Box';

/**
 * BridgeMarquee
 *
 * 4행 marquee. HeroBridge sticky stage 안에서 단일 이미지 레이어로 동작:
 * - 각 row 는 동일 image 세트를 3번 반복 (1set + 2set + 3set).
 * - 1set 자식만 인라인 `--ox`, `--oy` 로 scatter 출발 offset 보유.
 *   부모 stage 의 `--p` (0~1) 와 곱해 `transform: translate(ox*(1-p), oy*(1-p))` 보간.
 *   progress 0 → scatter 위치, progress 1 → row 자연 위치.
 * - 2/3 set 은 offset 0 (자연 위치 유지). progress 0 일 때 viewport 우측 밖에 위치하므로
 *   사용자에게는 1set 의 scatter 모양만 보임.
 * - row container left = (stageW - setWidth) / 2 로 1set 가운데 정렬.
 * - inner wrapper 에 marquee animation. isPlaying=true 일 때만 running.
 *
 * Props:
 * @param {Array<{
 *   images: string[], sizes: number[], depths: number[],
 *   offsets: Array<{ox:number, oy:number}>, indexMap: number[],
 *   setWidth: number, height: number, rowLeft: number,
 *   direction: 'left'|'right', duration: number, y: string, gap: number,
 * }>} rows - HeroBridge 가 stage 사이즈 측정 후 계산해 넘겨주는 행 설정
 * @param {boolean} isPlaying - marquee animation 작동 여부
 * @param {function} onImageEnter - 1set 자식 hover 시 호출 (originalIndex 인자)
 * @param {function} onImageLeave - 1set 자식 hover 해제 시 호출 (originalIndex 인자)
 *
 * Example usage:
 * <BridgeMarquee rows={ rows } isPlaying={ isPlaying }
 *   onImageEnter={ handleEnter } onImageLeave={ handleLeave } />
 */
export function BridgeMarquee({ rows, isPlaying, onImageEnter, onImageLeave }) {
  return (
    <>
      { rows.map((row, r) => (
        <Box
          key={ r }
          aria-hidden
          sx={ {
            position: 'absolute',
            top: row.y,
            left: `${ row.rowLeft }px`,
            transform: 'translateY(-50%)',
            height: `${ row.height }px`,
            pointerEvents: 'none',
            zIndex: 1,
          } }
        >
          <Box
            sx={ {
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              gap: `${ row.gap }px`,
              width: 'max-content',
              willChange: 'transform',
              animation: isPlaying
                ? `${ row.direction === 'left' ? 'mqLeft' : 'mqRight' } ${ row.duration }s linear infinite`
                : 'none',
              '@keyframes mqLeft': {
                from: { transform: 'translateX(0)' },
                to: { transform: 'translateX(-33.3333%)' },
              },
              '@keyframes mqRight': {
                from: { transform: 'translateX(-33.3333%)' },
                to: { transform: 'translateX(0)' },
              },
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            } }
          >
            { [...row.images, ...row.images, ...row.images].map((src, i) => {
              const setSize = row.images.length;
              const setIdx = Math.floor(i / setSize);
              const colIdx = i % setSize;
              const size = row.sizes[colIdx];
              const depth = row.depths[colIdx];
              const offset = setIdx === 0 ? row.offsets[colIdx] : { ox: 0, oy: 0 };
              const baseOp = [0.12, 0.18, 0.25][depth];
              const baseScale = [0.88, 0.96, 1.04][depth];
              const strength = [6, 14, 24][depth];
              const origIdx = row.indexMap[colIdx];

              return (
                <Box
                  key={ i }
                  component="img"
                  src={ src }
                  alt=""
                  loading="lazy"
                  onMouseEnter={ () => setIdx === 0 && onImageEnter?.(origIdx) }
                  onMouseLeave={ () => setIdx === 0 && onImageLeave?.(origIdx) }
                  style={ {
                    '--ox': `${ offset.ox }px`,
                    '--oy': `${ offset.oy }px`,
                    '--baseOp': baseOp,
                    '--baseScale': baseScale,
                    '--strength': `${ strength }px`,
                  } }
                  sx={ {
                    flex: '0 0 auto',
                    width: `${ size }px`,
                    height: `${ size }px`,
                    objectFit: 'cover',
                    borderRadius: 1,
                    boxShadow: 1,
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    /** scatter 출발 offset(자연 위치 0으로 수렴) + 마우스 패럴럭스(progress 따라 페이드) + scale 보간 */
                    transform:
                      'translate(' +
                      'calc(var(--ox) * (1 - var(--p, 0)) + var(--mx, 0) * var(--strength) * (1 - var(--p, 0))),' +
                      'calc(var(--oy) * (1 - var(--p, 0)) + var(--my, 0) * var(--strength) * (1 - var(--p, 0)))' +
                      ') scale(calc(var(--baseScale) + (1 - var(--baseScale)) * var(--p, 0)))',
                    /** Hero 시점 1 → marquee 도착 시 0.85 로 보간 */
                    opacity: 'calc(1 - 0.15 * var(--p, 0))',
                    transition:
                      'transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 320ms ease',
                    willChange: 'transform, opacity',
                    '@media (prefers-reduced-motion: reduce)': {
                      transform: 'none',
                      transition: 'none',
                    },
                  } }
                />
              );
            }) }
          </Box>
        </Box>
      )) }
    </>
  );
}
