import { motion } from "framer-motion";
import { Bot, Save } from "lucide-react";

export default function SensoriAIConfig() {
  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-1">Configurações da IA</h1>
        <p className="text-sm text-muted-foreground mb-6">Personalize o assistente de vendas</p>
        
        <div className="space-y-4">
          <div className="stat-card space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">System Prompt</h3>
            </div>
            <textarea
              rows={6}
              defaultValue="Você é um assistente de vendas gentil e profissional para uma clínica de estética. Seu objetivo é converter consultas em agendamentos. Use tom empático e destaque benefícios dos procedimentos."
              className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
          <div className="stat-card space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Tom de Voz</h3>
            <div className="flex flex-wrap gap-2">
              {["Profissional", "Empático", "Casual", "Técnico"].map((t) => (
                <button key={t} className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${t === "Empático" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border/60 text-muted-foreground hover:bg-muted"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm hover:opacity-90 transition-opacity min-h-[44px] flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Salvar Configurações
          </button>
        </div>
      </motion.div>
    </div>
  );
}
