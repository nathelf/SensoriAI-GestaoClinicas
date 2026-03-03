interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title = "Confirmar exclusão", message = "Tem certeza que deseja excluir? Esta ação não pode ser desfeita.", loading }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm border border-border/40 p-5" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{message}</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border/40 text-sm font-medium text-muted-foreground hover:bg-muted">Cancelar</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium disabled:opacity-50">{loading ? "Excluindo..." : "Excluir"}</button>
        </div>
      </div>
    </div>
  );
}
