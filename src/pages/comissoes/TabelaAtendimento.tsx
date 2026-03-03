import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";

const tabela = [
  { procedimento: "Toxina Botulínica", percentual: "15%", tipo: "Atendimento" },
  { procedimento: "Preenchimento Labial", percentual: "12%", tipo: "Atendimento" },
  { procedimento: "Bioestimulador", percentual: "10%", tipo: "Atendimento" },
];

export default function TabelaAtendimento() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Tabela de Comissões de Atendimento</h1>
        </div>
        <div className="space-y-2">
          {tabela.map((t, i) => (
            <div key={i} className="stat-card !p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{t.procedimento}</span>
              <span className="text-sm font-bold text-purple-600">{t.percentual}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
