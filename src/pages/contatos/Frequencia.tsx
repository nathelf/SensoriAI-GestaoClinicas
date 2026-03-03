import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

const frequencia = [
  { nome: "Clara Ribeiro", visitas: 12, ultima: "01/03/2026" },
  { nome: "Ana Santos", visitas: 8, ultima: "15/02/2026" },
  { nome: "Mariana Costa", visitas: 6, ultima: "10/02/2026" },
  { nome: "Juliana Ferreira", visitas: 3, ultima: "20/01/2026" },
];

export default function Frequencia() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Frequência</h1>
        </div>
        <div className="space-y-2">
          {frequencia.map((f, i) => (
            <div key={i} className="stat-card !p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{f.nome}</p>
                <p className="text-xs text-muted-foreground">Última visita: {f.ultima}</p>
              </div>
              <span className="text-sm font-bold text-primary">{f.visitas} visitas</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
