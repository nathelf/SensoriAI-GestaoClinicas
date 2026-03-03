import { motion } from "framer-motion";
import { Truck, Plus } from "lucide-react";

const fornecedores = [
  { nome: "Distribuidora Estética SP", contato: "(11) 99999-0001", produtos: "Toxina, Preenchedores" },
  { nome: "Laboratório BioFill", contato: "(11) 99999-0002", produtos: "Bioestimuladores" },
  { nome: "SkinPharma", contato: "(21) 99999-0003", produtos: "Ácidos, Peelings" },
];

export default function Fornecedores() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Fornecedores</h1>
          </div>
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>
        <div className="space-y-3">
          {fornecedores.map((f, i) => (
            <div key={i} className="stat-card !p-4">
              <p className="text-sm font-semibold text-foreground">{f.nome}</p>
              <p className="text-xs text-muted-foreground">{f.contato} · {f.produtos}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
