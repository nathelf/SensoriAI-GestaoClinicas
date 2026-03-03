import { motion } from "framer-motion";
import { CreditCard, Check, X } from "lucide-react";

const planos = [
  {
    nome: "Essencial",
    preco: "R$ 197/mês",
    features: ["Até 3 usuários", "Agenda Inteligente", "Fichas personalizadas", "Gestão de pacientes", "Agendamento online", "5 GB de armazenamento"],
    disabled: ["Envio automático de mensagens no WhatsApp"],
    current: true,
  },
  {
    nome: "Avançado",
    preco: "R$ 347/mês",
    features: ["Até 10 usuários", "Assinatura eletrônicas", "Gestão financeira completa", "Gestão de vendas (Pacotes)", "Controle de estoque completo", "Comissões automatizadas", "10 GB de armazenamento", "Painel de chamada"],
    disabled: [],
    current: false,
  },
  {
    nome: "Premium",
    preco: "R$ 497/mês",
    features: ["Usuários ilimitados", "Assinaturas eletrônicas ilimitadas", "CRM Integrado", "Emissão de NF", "Central no WhatsApp", "25 GB de armazenamento", "Painel de chamada"],
    disabled: [],
    current: false,
  },
];

export default function Assinatura() {
  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Assinatura</h1>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {planos.map((plano, i) => (
            <div key={i} className={`stat-card !p-5 ${plano.current ? "ring-2 ring-primary" : ""}`}>
              <h3 className="text-lg font-bold text-foreground mb-1">{plano.nome}</h3>
              <p className="text-2xl font-bold text-primary mb-4">{plano.preco}</p>
              <div className="space-y-2">
                {plano.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-success-foreground shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
                {plano.disabled.map((f, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-destructive-foreground shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <button className={`w-full mt-4 py-2.5 rounded-xl text-sm font-medium ${plano.current ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}>
                {plano.current ? "Plano atual" : "Assinar agora"}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
