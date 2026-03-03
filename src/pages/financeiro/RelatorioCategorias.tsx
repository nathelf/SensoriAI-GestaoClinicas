import { motion } from "framer-motion";
import { PieChart } from "lucide-react";

const categorias = [
  { nome: "Toxina Botulínica", valor: "R$ 8.400,00", percent: 35 },
  { nome: "Preenchimento", valor: "R$ 6.200,00", percent: 26 },
  { nome: "Bioestimuladores", valor: "R$ 4.800,00", percent: 20 },
  { nome: "Skincare/Peeling", valor: "R$ 2.400,00", percent: 10 },
  { nome: "Outros", valor: "R$ 2.200,00", percent: 9 },
];

export default function RelatorioCategorias() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Relatório de Categorias</h1>
        </div>
        <div className="space-y-2">
          {categorias.map((c, i) => (
            <div key={i} className="stat-card !p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">{c.nome}</span>
                <span className="text-sm font-bold text-foreground">{c.valor}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${c.percent}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{c.percent}% do total</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
