import { motion } from "framer-motion";
import { Clock, Plus } from "lucide-react";

const blocks = [
  { day: "Segunda-feira", start: "12:00", end: "13:00", reason: "Almoço" },
  { day: "Quarta-feira", start: "12:00", end: "13:00", reason: "Almoço" },
  { day: "Sexta-feira", start: "12:00", end: "14:00", reason: "Reunião de equipe" },
];

export default function AgendaBloqueios() {
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Bloqueios de Horário</h1>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium min-h-[44px] flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Novo Bloqueio
          </button>
        </div>
        <div className="space-y-2">
          {blocks.map((b, i) => (
            <div key={i} className="stat-card !p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{b.day}</p>
                <p className="text-xs text-muted-foreground">{b.start} - {b.end} · {b.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
