/** Paleta de cores pastel para conexões e pontos de nó (handles) */
export const PASTEL_PALETTE = [
  '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
  '#CDB4DB', '#FFC8DD', '#FFAFCC', '#BDE0FE', '#A2D2FF',
  '#D4A5A5', '#E8D5B7', '#C9E4DE', '#C5DEDD', '#F2C4CE',
  '#B8D4E3', '#FADADD', '#DDA0DD', '#98D8C8', '#F7DC6F',
] as const;

/** Cores pastel por posição do handle (top, right, bottom, left) para os nós */
export const HANDLE_COLORS = {
  top: '#FFB3BA',
  right: '#BAE1FF',
  bottom: '#BAFFC9',
  left: '#CDB4DB',
} as const;

/** Estilo inline para cor de fundo do handle por posição */
export function getHandleStyle(position: 'top' | 'right' | 'bottom' | 'left'): { backgroundColor: string } {
  return { backgroundColor: HANDLE_COLORS[position] };
}
