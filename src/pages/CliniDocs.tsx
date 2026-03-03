import { motion } from "framer-motion";
import { FileText, CheckCircle2, Clock, MoreVertical } from "lucide-react";

const docs = [
  { name: "Termo de Consentimento - Botox", patient: "Clara Ribeiro", date: "02/03/2026", status: "Assinado" },
  { name: "Termo de Consentimento - Preenchimento", patient: "Ana Santos", date: "28/02/2026", status: "Aguardando" },
  { name: "Contrato de Pacote", patient: "Mariana Costa", date: "15/02/2026", status: "Assinado" },
];

const statusStyles: Record<string, string> = {
  Assinado: "text-success-foreground bg-success/20",
  Aguardando: "text-warning-foreground bg-warning/30",
};

export default function CliniDocs() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Documentos</h1>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium min-h-[44px]">+ Novo Documento</button>
        </div>
        <div className="space-y-2">
          {docs.map((d, i) => (
            <div key={i} className="stat-card !p-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.patient} · {d.date}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${statusStyles[d.status]}`}>{d.status}</span>
              <button className="p-1"><MoreVertical className="w-4 h-4 text-muted-foreground" /></button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
