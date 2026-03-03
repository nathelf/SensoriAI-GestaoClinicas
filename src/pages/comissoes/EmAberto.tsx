import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const comissoes = [
  { profissional: "Dra. Ana Paula", valor: "R$ 1.200,00", procedimentos: 8 },
  { profissional: "Dr. Carlos", valor: "R$ 850,00", procedimentos: 5 },
];

export default function EmAberto() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Comissões em Aberto</h1>
        </div>
        <div className="space-y-3">
          {comissoes.map((c, i) => (
            <div key={i} className="stat-card !p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{c.profissional}</p>
                <p className="text-xs text-muted-foreground">{c.procedimentos} procedimentos</p>
              </div>
              <span className="text-sm font-bold text-foreground">{c.valor}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
