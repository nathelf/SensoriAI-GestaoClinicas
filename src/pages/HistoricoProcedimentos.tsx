import { motion } from "framer-motion";

const timeline = [
  { date: "02/03/2026", proc: "Botox - Testa e Glabela", prof: "Dra. Nathalia", notes: "30U aplicadas. Paciente tolerou bem.", product: "Toxina Botulínica 100U" },
  { date: "15/02/2026", proc: "Preenchimento Labial", prof: "Dra. Nathalia", notes: "1ml ácido hialurônico. Resultado natural.", product: "Ácido Hialurônico 1ml" },
  { date: "20/01/2026", proc: "Avaliação Inicial", prof: "Dra. Nathalia", notes: "Anamnese completa. Plano de tratamento definido.", product: "-" },
];

export default function HistoricoProcedimentos() {
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-4">Histórico Clínico</h1>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border/60" />
          <div className="space-y-4">
            {timeline.map((t, i) => (
              <div key={i} className="flex gap-4 relative">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0 z-10">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <div className="stat-card flex-1 !p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-foreground">{t.proc}</h4>
                    <span className="text-xs text-muted-foreground">{t.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{t.prof} · {t.product}</p>
                  <p className="text-sm text-foreground">{t.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
