import { motion } from "framer-motion";
import { CreditCard, Banknote, Smartphone, QrCode } from "lucide-react";

const metodos = [
  { nome: "PIX", icon: QrCode, ativo: true },
  { nome: "Cartão de Crédito", icon: CreditCard, ativo: true },
  { nome: "Cartão de Débito", icon: CreditCard, ativo: true },
  { nome: "Dinheiro", icon: Banknote, ativo: true },
  { nome: "Transferência", icon: Smartphone, ativo: false },
];

export default function MetodosPagamento() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Métodos de Pagamento</h1>
        </div>
        <div className="space-y-2">
          {metodos.map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="stat-card !p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground flex-1">{m.nome}</span>
                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${m.ativo ? "bg-success/20 text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                  {m.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
