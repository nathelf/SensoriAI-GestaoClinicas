import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

const tabela = [
  { produto: "Pacote Harmonização", percentual: "10%", tipo: "Venda" },
  { produto: "Skincare Premium", percentual: "8%", tipo: "Venda" },
  { produto: "Protocolo Laser", percentual: "12%", tipo: "Venda" },
];

export default function TabelaVendas() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Tabela de Comissões de Vendas</h1>
        </div>
        <div className="space-y-2">
          {tabela.map((t, i) => (
            <div key={i} className="stat-card !p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{t.produto}</span>
              <span className="text-sm font-bold text-purple-600">{t.percentual}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
