import { motion } from "framer-motion";
import { Users, Search } from "lucide-react";

const contatos = [
  { nome: "Clara Ribeiro", tipo: "Paciente", telefone: "(11) 99999-1234" },
  { nome: "Dra. Marina Oliveira", tipo: "Profissional", telefone: "(11) 99999-5678" },
  { nome: "Distribuidora Estética SP", tipo: "Fornecedor", telefone: "(11) 99999-0001" },
  { nome: "Fernanda Lima", tipo: "Lead", telefone: "(11) 99999-9876" },
  { nome: "Ana Santos", tipo: "Paciente", telefone: "(11) 99999-4321" },
];

export default function TodosContatos() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Todos os Contatos</h1>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input placeholder="Buscar contato..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground" />
        </div>
        <div className="space-y-2">
          {contatos.map((c, i) => (
            <div key={i} className="stat-card !p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{c.nome.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{c.nome}</p>
                <p className="text-xs text-muted-foreground">{c.telefone}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-lg bg-muted text-muted-foreground">{c.tipo}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
