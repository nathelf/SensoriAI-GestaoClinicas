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

/** Bolinha visível e área de conexão maior para a linha grudar no nó */
const handleBase =
  'rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:!scale-110 hover:shadow-xl pointer-events-auto';

export function NodeHandle({ position }: { position: Pos }) {
  const pos = POSITION_MAP[position];
  const wrapperCls = WRAPPER_POSITION[position];
  const colorStyle = getHandleStyle(position);
  // Área maior (36px) para facilitar soltar a conexão na bolinha; o React Flow usa isso para hit
  const handleStyle = { ...colorStyle, width: 36, height: 36, minWidth: 36, minHeight: 36 };

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
