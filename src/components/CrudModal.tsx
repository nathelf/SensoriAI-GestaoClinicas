import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface CrudModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
  size?: "default" | "large";
}

export function CrudModal({ open, onClose, title, children, onSubmit, loading, submitLabel = "Salvar", size = "default" }: CrudModalProps) {
  const maxWidth = size === "large" ? "max-w-3xl" : "max-w-lg";
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-[4px]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`bg-card rounded-2xl shadow-xl w-full ${maxWidth} max-h-[85vh] overflow-y-auto border border-border/40`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <h2 className="text-lg font-bold text-foreground">{title}</h2>
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>
            <form onSubmit={onSubmit} className="p-4 space-y-3">
              {children}
              <div className="flex gap-2 pt-2">
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2.5 rounded-xl border border-border/40 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:shadow-[0_0_12px_rgba(155,135,245,0.3)] disabled:opacity-50"
                >
                  {loading ? "Salvando..." : submitLabel}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      {children}
    </div>
  );
}

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full px-3 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none ${props.className || ""}`} />;
}

export function FormTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full px-3 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none ${props.className || ""}`} rows={3} />;
}

export function FormSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return <select {...props} className={`w-full px-3 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none ${props.className || ""}`}>{children}</select>;
}
