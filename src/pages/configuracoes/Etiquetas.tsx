import { motion } from "framer-motion";
import { Tag, Plus } from "lucide-react";

const etiquetas = [
  { nome: "VIP", cor: "bg-primary/20 text-primary" },
  { nome: "Novo Paciente", cor: "bg-success/20 text-success-foreground" },
  { nome: "Retorno Pendente", cor: "bg-warning/20 text-warning-foreground" },
  { nome: "Inadimplente", cor: "bg-destructive/20 text-destructive-foreground" },
];

export default function Etiquetas() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Etiquetas</h1>
          </div>
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {etiquetas.map((e, i) => (
            <span key={i} className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity ${e.cor}`}>
              {e.nome}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
