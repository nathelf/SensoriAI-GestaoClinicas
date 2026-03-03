import { motion } from "framer-motion";
import { Users, DollarSign } from "lucide-react";

const commissions = [
  { prof: "Dra. Nathalia Mendes", procedures: 12, total: "R$ 8.400", commission: "R$ 2.520", rate: "30%" },
  { prof: "Dr. Carlos Silva", procedures: 8, total: "R$ 5.200", commission: "R$ 1.560", rate: "30%" },
  { prof: "Dra. Juliana Alves", procedures: 5, total: "R$ 3.000", commission: "R$ 750", rate: "25%" },
];

export default function Comissoes() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-4">Comissões</h1>
        <div className="space-y-3">
          {commissions.map((c, i) => (
            <div key={i} className="stat-card !p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                  {c.prof.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{c.prof}</p>
                  <p className="text-xs text-muted-foreground">{c.procedures} procedimentos · Taxa: {c.rate}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-muted/40 text-center">
                  <p className="text-xs text-muted-foreground">Faturado</p>
                  <p className="text-sm font-bold text-foreground">{c.total}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-success/15 text-center">
                  <p className="text-xs text-success-foreground">Comissão</p>
                  <p className="text-sm font-bold text-success-foreground">{c.commission}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
