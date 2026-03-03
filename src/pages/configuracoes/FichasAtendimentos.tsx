import { motion } from "framer-motion";
import { ClipboardList, Plus } from "lucide-react";

const fichas = [
  { nome: "Ficha de Anamnese Geral", campos: 15 },
  { nome: "Ficha de Toxina Botulínica", campos: 12 },
  { nome: "Ficha de Preenchimento", campos: 14 },
  { nome: "Ficha de Avaliação Facial", campos: 10 },
];

export default function FichasAtendimentos() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Fichas de Atendimentos</h1>
          </div>
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova ficha
          </button>
        </div>
        <div className="space-y-2">
          {fichas.map((f, i) => (
            <div key={i} className="stat-card !p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
              <span className="text-sm font-medium text-foreground">{f.nome}</span>
              <span className="text-xs text-muted-foreground">{f.campos} campos</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
