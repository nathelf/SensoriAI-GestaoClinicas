import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const comissoes = [
  { profissional: "Dra. Ana Paula", valor: "R$ 2.400,00", periodo: "Fev/2026" },
  { profissional: "Dr. Carlos", valor: "R$ 1.600,00", periodo: "Fev/2026" },
];

export default function Finalizadas() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-success-foreground" />
          <h1 className="text-xl font-bold text-foreground">Comissões Finalizadas</h1>
        </div>
        <div className="space-y-3">
          {comissoes.map((c, i) => (
            <div key={i} className="stat-card !p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{c.profissional}</p>
                <p className="text-xs text-muted-foreground">{c.periodo}</p>
              </div>
              <span className="text-sm font-bold text-success-foreground">{c.valor}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
