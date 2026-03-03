import { motion } from "framer-motion";
import { MessageSquare, Phone, Send } from "lucide-react";

export default function PacientesComunicacao() {
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-4">Comunicação com Pacientes</h1>
        <div className="stat-card space-y-4">
          <h3 className="font-semibold text-sm text-foreground">Enviar Mensagem em Massa</h3>
          <select className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm">
            <option>Todos os pacientes</option>
            <option>Pacientes com retorno pendente</option>
            <option>Pacientes VIP</option>
          </select>
          <textarea rows={3} placeholder="Digite sua mensagem..." className="w-full px-3 py-2.5 bg-card border border-border/60 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium min-h-[44px] flex items-center gap-2">
            <Send className="w-4 h-4" /> Enviar via WhatsApp
          </button>
        </div>
      </motion.div>
    </div>
  );
}
