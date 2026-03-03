import { motion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";

const items = [
  { fornecedor: "Distribuidora Estética", valor: "R$ 3.200,00", vencimento: "08/03/2026", status: "Pendente" },
  { fornecedor: "Aluguel Sala", valor: "R$ 2.800,00", vencimento: "01/03/2026", status: "Pago" },
  { fornecedor: "Laboratório ABC", valor: "R$ 1.500,00", vencimento: "12/03/2026", status: "Pendente" },
];

export default function ContasPagar() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <ArrowDownRight className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Contas a Pagar</h1>
        </div>
        <div className="stat-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Fornecedor</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Valor</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden sm:table-cell">Vencimento</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{item.fornecedor}</td>
                  <td className="py-3 px-4 text-destructive-foreground font-semibold">{item.valor}</td>
                  <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{item.vencimento}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${item.status === "Pago" ? "bg-success/20 text-success-foreground" : "bg-warning/20 text-warning-foreground"}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
