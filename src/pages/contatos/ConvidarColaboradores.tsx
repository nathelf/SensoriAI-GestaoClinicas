import { motion } from "framer-motion";
import { UserPlus, Mail } from "lucide-react";

export default function ConvidarColaboradores() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Convidar Colaboradores</h1>
        </div>
        <div className="stat-card !p-5">
          <p className="text-sm text-muted-foreground mb-4">Envie um convite por e-mail para adicionar novos colaboradores à sua clínica.</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input placeholder="email@exemplo.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground" />
            </div>
            <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium shrink-0">Enviar convite</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
