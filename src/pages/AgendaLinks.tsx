import { motion } from "framer-motion";
import { Link2, Copy, Instagram, MessageCircle } from "lucide-react";

export default function AgendaLinks() {
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-4">Links de Agendamento</h1>
        <div className="space-y-3">
          <div className="stat-card space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">Link de Agendamento Online</h3>
            </div>
            <div className="flex gap-2">
              <input readOnly value="https://sensori.ai/agendar/clinica-exemplo" className="flex-1 px-3 py-2.5 bg-muted rounded-xl text-sm text-muted-foreground" />
              <button className="p-2.5 bg-primary/10 rounded-xl hover:bg-primary/20">
                <Copy className="w-4 h-4 text-primary" />
              </button>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pastel-lavender/30 flex items-center justify-center">
              <Instagram className="w-5 h-5 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Link para Bio do Instagram</p>
              <p className="text-xs text-muted-foreground">Adicione ao seu perfil</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-success-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">WhatsApp Bot</p>
              <p className="text-xs text-muted-foreground">Agendamento automático</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
