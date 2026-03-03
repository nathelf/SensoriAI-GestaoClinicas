import { motion } from "framer-motion";
import { MessageSquare, Phone } from "lucide-react";

const logs = [
  { patient: "Clara Ribeiro", type: "WhatsApp", msg: "Confirmação de agendamento para 03/03", time: "10:30", date: "02/03/2026" },
  { patient: "Ana Santos", type: "WhatsApp", msg: "Lembrete de retorno enviado", time: "09:00", date: "01/03/2026" },
  { patient: "Mariana Costa", type: "Ligação", msg: "Paciente confirmou retorno dia 18/03", time: "15:45", date: "28/02/2026" },
];

export default function Comunicacao() {
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-4">Comunicação</h1>
        <div className="space-y-2">
          {logs.map((l, i) => (
            <div key={i} className="stat-card !p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${l.type === "WhatsApp" ? "bg-success/20" : "bg-info/20"}`}>
                {l.type === "WhatsApp" ? <MessageSquare className="w-4 h-4 text-success-foreground" /> : <Phone className="w-4 h-4 text-info-foreground" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{l.patient}</p>
                <p className="text-xs text-muted-foreground">{l.msg}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{l.time}<br />{l.date}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
