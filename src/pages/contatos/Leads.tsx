import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

const leads = [
  { nome: "Fernanda Lima", origem: "Instagram", interesse: "Harmonização", data: "01/03/2026" },
  { nome: "Patricia Alves", origem: "WhatsApp", interesse: "Botox", data: "28/02/2026" },
  { nome: "Carla Mendes", origem: "Site", interesse: "Preenchimento labial", data: "25/02/2026" },
];

export default function Leads() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Leads</h1>
        </div>
        <div className="space-y-3">
          {leads.map((l, i) => (
            <div key={i} className="stat-card !p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{l.nome}</p>
                <p className="text-xs text-muted-foreground">{l.interesse} · {l.origem}</p>
              </div>
              <span className="text-xs text-muted-foreground">{l.data}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
