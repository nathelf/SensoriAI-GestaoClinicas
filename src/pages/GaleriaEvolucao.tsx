import { motion } from "framer-motion";
import { Image } from "lucide-react";

const gallery = [
  { patient: "Clara Ribeiro", proc: "Procedimento", date: "02/03/2026" },
  { patient: "Ana Santos", proc: "Avaliação", date: "28/02/2026" },
  { patient: "Mariana Costa", proc: "Retorno", date: "15/02/2026" },
];

export default function GaleriaEvolucao() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-4">Galeria de Evolução</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gallery.map((g, i) => (
            <div key={i} className="stat-card overflow-hidden !p-0">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="aspect-[3/4] bg-muted/60 flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                    <span className="text-[10px] text-muted-foreground">Antes</span>
                  </div>
                </div>
                <div className="aspect-[3/4] bg-muted/60 flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                    <span className="text-[10px] text-muted-foreground">Depois</span>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-foreground">{g.patient}</p>
                <p className="text-xs text-muted-foreground">{g.proc} · {g.date}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
