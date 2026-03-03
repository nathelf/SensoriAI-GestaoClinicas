import { motion } from "framer-motion";
import { Merge } from "lucide-react";

export default function MesclarContatos() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <Merge className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Mesclar Contatos</h1>
        </div>
        <div className="stat-card text-center py-12">
          <Merge className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Nenhum contato duplicado encontrado</p>
          <p className="text-xs text-muted-foreground">O sistema busca automaticamente contatos com informações similares para mesclagem.</p>
        </div>
      </motion.div>
    </div>
  );
}
