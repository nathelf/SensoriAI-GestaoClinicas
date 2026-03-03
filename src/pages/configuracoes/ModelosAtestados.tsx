import { motion } from "framer-motion";
import { FileSignature, Plus } from "lucide-react";

const modelos = [
  { nome: "Atestado de Comparecimento", tipo: "Atestado" },
  { nome: "Prescrição de Home Care", tipo: "Prescrição" },
  { nome: "Termo de Consentimento - Botox", tipo: "Termo" },
  { nome: "Termo de Consentimento - Preenchimento", tipo: "Termo" },
];

export default function ModelosAtestados() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Modelos de Atestados e Prescrições</h1>
          </div>
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo modelo
          </button>
        </div>
        <div className="space-y-2">
          {modelos.map((m, i) => (
            <div key={i} className="stat-card !p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
              <span className="text-sm font-medium text-foreground">{m.nome}</span>
              <span className="text-xs px-2 py-1 rounded-lg bg-muted text-muted-foreground">{m.tipo}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
