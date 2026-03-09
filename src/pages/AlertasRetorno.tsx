import { motion } from "framer-motion";
import { AlertTriangle, CalendarClock, Phone } from "lucide-react";

const alerts = [
  { name: "Mariana Costa", proc: "Procedimento", days: 15, date: "18/03/2026", phone: "(11) 97777-9012", urgent: true },
  { name: "Juliana Alves", proc: "Retorno", days: 30, date: "01/04/2026", phone: "(11) 96666-3456", urgent: false },
  { name: "Renata Lima", proc: "Procedimento", days: 7, date: "10/03/2026", phone: "(11) 95555-7890", urgent: true },
  { name: "Fernanda Souza", proc: "Retorno", days: 60, date: "02/05/2026", phone: "(11) 94444-1234", urgent: false },
];

export default function AlertasRetorno() {
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-1">Alertas de Retorno</h1>
        <p className="text-sm text-muted-foreground mb-4">Pacientes que precisam de acompanhamento</p>
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`stat-card !p-4 flex items-center gap-3 ${a.urgent ? "border-destructive/30" : ""}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.urgent ? "bg-destructive/20" : "bg-accent/60"}`}>
                {a.urgent ? <AlertTriangle className="w-4 h-4 text-destructive-foreground" /> : <CalendarClock className="w-4 h-4 text-accent-foreground" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.proc} · Retorno em {a.days} dias ({a.date})</p>
              </div>
              <button className="p-2 rounded-xl bg-success/20 hover:bg-success/30">
                <Phone className="w-4 h-4 text-success-foreground" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
