import { useCallback } from 'react';
import { X } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

interface NodeDeleteButtonProps {
  nodeId: string;
  /** Oculta quando isPdfMode (renderização para PDF) */
  hidden?: boolean;
}

/** Botão X no canto superior direito do bloco para remover do canvas */
export function NodeDeleteButton({ nodeId, hidden }: NodeDeleteButtonProps) {
  const { deleteElements } = useReactFlow();

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteElements({ nodes: [{ id: nodeId }] });
    },
    [nodeId, deleteElements]
  );

  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="absolute top-2 right-2 z-30 w-7 h-7 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive flex items-center justify-center transition-colors border border-destructive/30"
      title="Remover bloco (ou use Delete)"
      aria-label="Remover bloco"
    >
      <X size={14} />
    </button>
  );
}
