import { motion } from "framer-motion";
import { Package, Plus } from "lucide-react";

const orders = [
  { product: "Toxina Botulínica 100U", qty: 10, supplier: "Allergan", date: "01/03/2026", status: "Em trânsito" },
  { product: "Ácido Hialurônico 1ml", qty: 20, supplier: "Galderma", date: "28/02/2026", status: "Entregue" },
];

export default function EstoquePedidos() {
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Pedidos</h1>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium min-h-[44px] flex items-center gap-1.5"><Plus className="w-4 h-4" /> Novo Pedido</button>
        </div>
        <div className="space-y-2">
          {orders.map((o, i) => (
            <div key={i} className="stat-card !p-4 flex items-center gap-3">
              <Package className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{o.product} ({o.qty}un)</p>
                <p className="text-xs text-muted-foreground">{o.supplier} · {o.date}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${o.status === "Entregue" ? "bg-success/20 text-success-foreground" : "bg-info/20 text-info-foreground"}`}>{o.status}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
