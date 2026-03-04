import { Handle, Position } from '@xyflow/react';
import { getHandleStyle } from './canvasStyles';

type Pos = 'top' | 'right' | 'bottom' | 'left';

const POSITION_MAP = {
  top: Position.Top,
  right: Position.Right,
  bottom: Position.Bottom,
  left: Position.Left,
} as const;

const WRAPPER_POSITION: Record<Pos, string> = {
  top: '-top-2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  right: '-right-2 top-1/2 translate-x-1/2 -translate-y-1/2',
  bottom: '-bottom-2 left-1/2 -translate-x-1/2 translate-y-1/2',
  left: '-left-2 top-1/2 -translate-x-1/2 -translate-y-1/2',
};

/** Bolinha discreta (8px visível), hitbox 28px para facilitar a conexão "imantar" ao ponto */
const handleBase =
  'rounded-full border-[10px] border-white shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg pointer-events-auto';

export function NodeHandle({ position }: { position: Pos }) {
  const pos = POSITION_MAP[position];
  const wrapperCls = WRAPPER_POSITION[position];
  const colorStyle = getHandleStyle(position);
  // 28x28 total, borda 10px = centro colorido ~8px (discreto). Hitbox ampla para conexão fácil.
  const handleStyle = {
    ...colorStyle,
    width: 28,
    height: 28,
    minWidth: 28,
    minHeight: 28,
  };

  return (
    <div
      className={`absolute z-20 w-12 h-12 flex items-center justify-center pointer-events-none ${wrapperCls}`}
      title="Arraste para conectar"
      aria-hidden
    >
      <div className="pointer-events-auto w-full h-full flex items-center justify-center">
        <Handle
          type="source"
          position={pos}
          id={`${position}-src`}
          className={handleBase}
          style={handleStyle}
        />
        <Handle
          type="target"
          position={pos}
          id={`${position}-tgt`}
          className={handleBase}
          style={handleStyle}
        />
      </div>
    </div>
  );
}
