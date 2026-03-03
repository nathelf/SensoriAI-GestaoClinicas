import { motion } from "framer-motion";
import { DoorOpen, Plus } from "lucide-react";

const salas = [
  { nome: "Sala 1 - Procedimentos", capacidade: "1 profissional", status: "Ativa" },
  { nome: "Sala 2 - Avaliação", capacidade: "1 profissional", status: "Ativa" },
  { nome: "Sala 3 - Laser", capacidade: "1 profissional", status: "Inativa" },
];

export default function SalasAtendimento() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Salas de Atendimento</h1>
          </div>
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova sala
          </button>
        </div>
        <div className="space-y-2">
          {salas.map((s, i) => (
            <div key={i} className="stat-card !p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{s.nome}</p>
                <p className="text-xs text-muted-foreground">{s.capacidade}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${s.status === "Ativa" ? "bg-success/20 text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
