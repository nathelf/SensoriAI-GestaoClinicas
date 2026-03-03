import { motion } from "framer-motion";
import { Cake } from "lucide-react";

const aniversariantes = [
  { nome: "Clara Ribeiro", data: "05/03", idade: 32 },
  { nome: "Juliana Ferreira", data: "12/03", idade: 28 },
  { nome: "Ana Santos", data: "18/03", idade: 45 },
];

export default function Aniversariantes() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <Cake className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Aniversariantes do Mês</h1>
        </div>
        <div className="space-y-3">
          {aniversariantes.map((a, i) => (
            <div key={i} className="stat-card !p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                <Cake className="w-4 h-4 text-warning-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{a.nome}</p>
                <p className="text-xs text-muted-foreground">{a.data} · {a.idade} anos</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
