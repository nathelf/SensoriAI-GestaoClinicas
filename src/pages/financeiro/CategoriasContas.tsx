import { motion } from "framer-motion";
import { Tag, Plus } from "lucide-react";

const categorias = [
  { nome: "Receitas de serviços", tipo: "Receita", cor: "bg-success/20 text-success-foreground" },
  { nome: "Venda de produtos", tipo: "Receita", cor: "bg-success/20 text-success-foreground" },
  { nome: "Aluguel", tipo: "Despesa", cor: "bg-destructive/20 text-destructive-foreground" },
  { nome: "Insumos", tipo: "Despesa", cor: "bg-destructive/20 text-destructive-foreground" },
  { nome: "Marketing", tipo: "Despesa", cor: "bg-destructive/20 text-destructive-foreground" },
  { nome: "Salários", tipo: "Despesa", cor: "bg-destructive/20 text-destructive-foreground" },
];

export default function CategoriasContas() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Categorias de Contas</h1>
          </div>
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova categoria
          </button>
        </div>
        <div className="space-y-2">
          {categorias.map((c, i) => (
            <div key={i} className="stat-card !p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{c.nome}</span>
              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${c.cor}`}>{c.tipo}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
