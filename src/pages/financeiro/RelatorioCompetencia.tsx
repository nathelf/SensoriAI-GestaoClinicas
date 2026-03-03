import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

export default function RelatorioCompetencia() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Relatório de Competência</h1>
        </div>
        <div className="stat-card text-center py-12">
          <p className="text-muted-foreground text-sm">Selecione o período para gerar o relatório de competência.</p>
          <div className="flex gap-3 justify-center mt-4">
            <input type="month" defaultValue="2026-03" className="px-4 py-2 rounded-xl border border-border/40 bg-card text-sm text-foreground" />
            <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Gerar</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
