import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const dias = [
  { dia: "Segunda-feira", inicio: "08:00", fim: "18:00", ativo: true },
  { dia: "Terça-feira", inicio: "08:00", fim: "18:00", ativo: true },
  { dia: "Quarta-feira", inicio: "08:00", fim: "18:00", ativo: true },
  { dia: "Quinta-feira", inicio: "08:00", fim: "18:00", ativo: true },
  { dia: "Sexta-feira", inicio: "08:00", fim: "17:00", ativo: true },
  { dia: "Sábado", inicio: "08:00", fim: "12:00", ativo: true },
  { dia: "Domingo", inicio: "", fim: "", ativo: false },
];

export default function HorariosFuncionamento() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Horários de Funcionamento</h1>
        </div>
        <div className="space-y-2">
          {dias.map((d, i) => (
            <div key={i} className="stat-card !p-4 flex items-center justify-between">
              <span className={`text-sm font-medium ${d.ativo ? "text-foreground" : "text-muted-foreground"}`}>{d.dia}</span>
              {d.ativo ? (
                <span className="text-sm text-muted-foreground">{d.inicio} - {d.fim}</span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-lg bg-muted text-muted-foreground">Fechado</span>
              )}
            </div>
          ))}
        </div>
        <button className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Salvar horários</button>
      </motion.div>
    </div>
  );
}
