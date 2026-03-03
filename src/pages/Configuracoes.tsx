import { motion } from "framer-motion";
import { Building, Users, CreditCard, Bell } from "lucide-react";

export default function Configuracoes() {
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-4">Configurações</h1>
        <div className="space-y-3">
          {[
            { icon: Building, title: "Perfil da Clínica", desc: "Nome, endereço, CNPJ, logo" },
            { icon: Users, title: "Usuários e Permissões", desc: "Gerenciar equipe e acessos" },
            { icon: CreditCard, title: "Plano e Assinatura", desc: "Plano atual, faturamento" },
            { icon: Bell, title: "Notificações", desc: "E-mail, push, WhatsApp" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="stat-card !p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
