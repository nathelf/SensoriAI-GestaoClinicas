import { motion } from "framer-motion";
import { Camera, Upload, Scan } from "lucide-react";

export default function SensoriAIAnalisador() {
  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-1">Análise Facial IA</h1>
        <p className="text-sm text-muted-foreground mb-6">Upload de foto para análise de simetria e áreas de intervenção</p>
        
        <div className="stat-card flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
            <Scan className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Envie uma foto frontal</p>
          <p className="text-xs text-muted-foreground mb-5">JPG, PNG até 10MB</p>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium min-h-[44px] flex items-center gap-2">
              <Upload className="w-4 h-4" /> Escolher Arquivo
            </button>
            <button className="px-5 py-2.5 bg-card border border-border/60 text-foreground rounded-xl text-sm font-medium min-h-[44px] flex items-center gap-2">
              <Camera className="w-4 h-4" /> Câmera
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
