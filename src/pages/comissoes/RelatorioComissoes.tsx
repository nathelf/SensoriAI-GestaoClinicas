import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

export default function RelatorioComissoes() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Relatório de Comissões</h1>
        </div>
        <div className="stat-card !p-5">
          <p className="text-sm text-muted-foreground">Relatório consolidado com filtros por período, profissional e tipo de comissão.</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {[
              { label: "Total Pago", value: "R$ 8.200,00" },
              { label: "Em Aberto", value: "R$ 2.050,00" },
              { label: "Profissionais", value: "4" },
            ].map((s, i) => (
              <div key={i} className="text-center p-3 rounded-2xl bg-muted/40">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-foreground mt-1">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
