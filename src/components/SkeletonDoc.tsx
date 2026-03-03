import { motion } from "framer-motion";

const LILAC = "#9b87f5";

interface SkeletonDocProps {
  progress?: number;
  status?: string;
  className?: string;
}

/**
 * Skeleton que imita o layout de um documento clínico (cabeçalho, grid, parágrafos)
 * com animação pulsante em tons de lilás/cinza. Usado durante conversão ou "Gerar com IA".
 */
export function SkeletonDoc({ progress = 0, status, className = "" }: SkeletonDocProps) {
  return (
    <div
      className={`w-full max-w-3xl mx-auto p-8 bg-white dark:bg-card rounded-xl shadow-sm border border-slate-100 dark:border-border/40 ${className}`}
    >
      {/* Barra de progresso no topo */}
      {(progress > 0 || status) && (
        <div className="w-full mb-6 space-y-1">
          <div className="w-full h-1.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              className="h-full rounded-full"
              style={{ backgroundColor: LILAC }}
              transition={{ ease: "easeInOut", duration: 0.3 }}
            />
          </div>
          {status && (
            <p className="text-xs font-medium truncate" style={{ color: LILAC }}>
              {status}
            </p>
          )}
        </div>
      )}

      {/* Cabeçalho pulsante */}
      <div className="flex flex-col items-center mb-10 space-y-4">
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-8 w-48 rounded-lg"
          style={{ backgroundColor: `${LILAC}20` }}
        />
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          className="h-4 w-32 bg-slate-200 dark:bg-muted rounded"
        />
      </div>

      {/* Grid (simulando topo da anamnese) */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-16 bg-slate-100 dark:bg-muted rounded" />
            <motion.div
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              className="h-10 w-full rounded-md"
              style={{
                background: `linear-gradient(90deg, rgb(241 245 249), ${LILAC}18, rgb(241 245 249))`,
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Corpo do texto */}
      <div className="space-y-6">
        <div
          className="h-4 w-40 rounded"
          style={{ backgroundColor: `${LILAC}30` }}
        />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              className="h-4 bg-slate-100 dark:bg-muted rounded"
              style={{ width: i === 3 ? "40%" : "100%" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
