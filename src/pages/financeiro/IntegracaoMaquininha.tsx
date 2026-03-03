import { motion } from "framer-motion";
import { Wifi, CreditCard, Shield } from "lucide-react";

export default function IntegracaoMaquininha() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <Wifi className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Integração Maquininha</h1>
        </div>
        <div className="stat-card">
          <div className="flex flex-col sm:flex-row items-center gap-6 py-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <p className="text-sm font-medium text-foreground mb-1">Nenhuma maquininha integrada</p>
              <p className="text-xs text-muted-foreground mb-4">Conecte sua maquininha de cartão para registrar pagamentos automaticamente no financeiro.</p>
              <button type="button" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Configurar integração
              </button>
            </div>
          </div>
          <div className="border-t border-border/40 pt-4 mt-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Segurança</p>
              <p>As integrações utilizam conexão segura e não armazenam dados do cartão. Os pagamentos são processados pelo provedor da maquininha.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
