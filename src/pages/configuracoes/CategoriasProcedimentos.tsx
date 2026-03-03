import { motion } from "framer-motion";
import { Layers, Plus } from "lucide-react";

const categorias = [
  { nome: "Injetáveis", procedimentos: 3 },
  { nome: "Facial", procedimentos: 5 },
  { nome: "Corporal", procedimentos: 2 },
  { nome: "Laser", procedimentos: 4 },
];

export default function CategoriasProcedimentos() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Categorias de Procedimentos</h1>
          </div>
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova
          </button>
        </div>
        <div className="space-y-2">
          {categorias.map((c, i) => (
            <div key={i} className="stat-card !p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{c.nome}</span>
              <span className="text-xs text-muted-foreground">{c.procedimentos} procedimentos</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
