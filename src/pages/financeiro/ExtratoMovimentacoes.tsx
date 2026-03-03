import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const movimentos = [
  { data: "03/03/2026", descricao: "Botox - Clara Ribeiro", tipo: "Entrada", valor: "R$ 1.200,00" },
  { data: "02/03/2026", descricao: "Compra insumos", tipo: "Saída", valor: "-R$ 450,00" },
  { data: "01/03/2026", descricao: "Preenchimento - Ana Santos", tipo: "Entrada", valor: "R$ 800,00" },
  { data: "28/02/2026", descricao: "Aluguel", tipo: "Saída", valor: "-R$ 2.800,00" },
  { data: "27/02/2026", descricao: "Harmonização - Juliana F.", tipo: "Entrada", valor: "R$ 3.500,00" },
];

export default function ExtratoMovimentacoes() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Extrato de Movimentações</h1>
        </div>
        <div className="space-y-2">
          {movimentos.map((m, i) => (
            <div key={i} className="stat-card !p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{m.descricao}</p>
                <p className="text-xs text-muted-foreground">{m.data}</p>
              </div>
              <span className={`text-sm font-bold ${m.tipo === "Entrada" ? "text-success-foreground" : "text-destructive-foreground"}`}>
                {m.valor}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
