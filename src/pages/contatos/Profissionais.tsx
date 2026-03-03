import { motion } from "framer-motion";
import { UserCog, Plus } from "lucide-react";

const profissionais = [
  { nome: "Dra. Marina Oliveira", especialidade: "Harmonização Facial", crm: "CRM 12345" },
  { nome: "Dr. Rafael Costa", especialidade: "Dermatologia", crm: "CRM 67890" },
  { nome: "Dra. Camila Santos", especialidade: "Biomedicina Estética", crbm: "CRBM 54321" },
];

export default function Profissionais() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Profissionais</h1>
          </div>
          <button className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo
          </button>
        </div>
        <div className="space-y-3">
          {profissionais.map((p, i) => (
            <div key={i} className="stat-card !p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{p.nome.charAt(0)}{p.nome.split(" ").pop()?.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{p.nome}</p>
                <p className="text-xs text-muted-foreground">{p.especialidade}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
