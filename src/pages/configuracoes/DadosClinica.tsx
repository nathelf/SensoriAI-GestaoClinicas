import { motion } from "framer-motion";
import { Building } from "lucide-react";

export default function DadosClinica() {
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <Building className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Dados da Clínica</h1>
        </div>
        <div className="stat-card !p-5 space-y-4">
          {[
            { label: "Nome da Clínica", placeholder: "SensoriAI Estética", type: "text" },
            { label: "CNPJ", placeholder: "00.000.000/0001-00", type: "text" },
            { label: "Telefone", placeholder: "(11) 99999-0000", type: "tel" },
            { label: "Endereço", placeholder: "Rua Exemplo, 123 - São Paulo/SP", type: "text" },
            { label: "E-mail", placeholder: "contato@clinica.com", type: "email" },
          ].map((field, i) => (
            <div key={i}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{field.label}</label>
              <input type={field.type} placeholder={field.placeholder} className="w-full px-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground" />
            </div>
          ))}
          <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Salvar</button>
        </div>
      </motion.div>
    </div>
  );
}
