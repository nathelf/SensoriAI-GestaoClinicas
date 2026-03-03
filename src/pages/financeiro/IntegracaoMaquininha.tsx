import { motion } from "framer-motion";
import { Wifi } from "lucide-react";

export default function IntegracaoMaquininha() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <Wifi className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Integração Maquininha</h1>
        </div>
        <div className="stat-card text-center py-12">
          <Wifi className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Nenhuma maquininha integrada</p>
          <p className="text-xs text-muted-foreground mb-4">Conecte sua maquininha de cartão para receber pagamentos automaticamente.</p>
          <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Configurar integração</button>
        </div>
      </motion.div>
    </div>
  );
}
