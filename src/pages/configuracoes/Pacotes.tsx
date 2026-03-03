import { motion } from "framer-motion";
import { Package, Plus } from "lucide-react";

const pacotes = [
  { nome: "Pacote Harmonização Completa", sessoes: 10, valor: "R$ 8.000,00" },
  { nome: "Pacote Botox Trimestral", sessoes: 4, valor: "R$ 3.200,00" },
  { nome: "Pacote Skincare Premium", sessoes: 6, valor: "R$ 2.100,00" },
];

export default function Pacotes() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Pacotes</h1>
          </div>
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>
        <div className="space-y-3">
          {pacotes.map((p, i) => (
            <div key={i} className="stat-card !p-4">
              <p className="text-sm font-semibold text-foreground">{p.nome}</p>
              <p className="text-xs text-muted-foreground">{p.sessoes} sessões · {p.valor}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
