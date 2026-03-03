import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";

const items = [
  { hora: "08:00", descricao: "Abertura de caixa", valor: "R$ 500,00", tipo: "info" },
  { hora: "09:30", descricao: "Botox - Clara R.", valor: "+R$ 1.200,00", tipo: "entrada" },
  { hora: "11:00", descricao: "Pagamento fornecedor", valor: "-R$ 320,00", tipo: "saida" },
  { hora: "14:00", descricao: "Preenchimento - Ana S.", valor: "+R$ 800,00", tipo: "entrada" },
  { hora: "16:30", descricao: "Material de limpeza", valor: "-R$ 85,00", tipo: "saida" },
];

export default function FluxoCaixaDiario() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Fluxo de Caixa Diário</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">03 de Março de 2026</p>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="stat-card !p-4 flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-12 shrink-0">{item.hora}</span>
              <p className="text-sm font-medium text-foreground flex-1">{item.descricao}</p>
              <span className={`text-sm font-bold ${item.tipo === "entrada" ? "text-success-foreground" : item.tipo === "saida" ? "text-destructive-foreground" : "text-info-foreground"}`}>
                {item.valor}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
