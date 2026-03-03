import { motion } from "framer-motion";
import { Landmark, Plus } from "lucide-react";

const contas = [
  { nome: "Banco padrão", tipo: "Conta Corrente", saldo: "R$ 2.431,00" },
  { nome: "Caixa", tipo: "Caixa", saldo: "R$ 0,00" },
  { nome: "Conta Poupança", tipo: "Poupança", saldo: "R$ 5.200,00" },
];

export default function ContasFinanceiras() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Contas Financeiras</h1>
          </div>
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova conta
          </button>
        </div>
        <div className="space-y-3">
          {contas.map((c, i) => (
            <div key={i} className="stat-card !p-4 flex items-center gap-3">
              <Landmark className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{c.nome}</p>
                <p className="text-xs text-muted-foreground">{c.tipo}</p>
              </div>
              <span className="text-sm font-bold text-foreground">{c.saldo}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
