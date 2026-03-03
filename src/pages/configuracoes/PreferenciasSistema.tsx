import { motion } from "framer-motion";
import { Settings } from "lucide-react";

export default function PreferenciasSistema() {
  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Preferências do Sistema</h1>
        </div>

        {/* Geral */}
        <div className="stat-card !p-5 mb-4">
          <h2 className="text-sm font-bold text-foreground mb-4">Geral</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Fuso horário</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground">
                <option>(GMT-03:00) São Paulo</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Moeda</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground">
                <option>BRL - R$</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financeiro */}
        <div className="stat-card !p-5 mb-4">
          <h2 className="text-sm font-bold text-foreground mb-4">Financeiro</h2>
          <div className="space-y-4">
            {[
              { label: "Ocultar dados financeiros", desc: "Esconde informações financeiras da página inicial." },
              { label: "Usar DRE", desc: "Habilita as categorias do DRE." },
              { label: "Usar abertura de caixa", desc: "Habilita a abertura de caixa." },
              { label: "Mostrar apenas movimentações de Dinheiro no caixa", desc: "Apenas movimentações com método 'Dinheiro' no resumo do caixa." },
              { label: "Conciliação bancária", desc: "Habilita a conciliação bancária." },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <div className="w-10 h-6 rounded-full bg-muted relative cursor-pointer">
                  <div className="w-4 h-4 rounded-full bg-card shadow absolute top-1 left-1" />
                </div>
              </div>
            ))}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Categoria de receitas</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground">
                  <option>Receitas de serviços</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Método de receitas</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground">
                  <option>PIX</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Método de despesas</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground">
                  <option>PIX</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Conta de receitas</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-border/40 bg-card text-sm text-foreground">
                  <option>Banco padrão</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl border border-border/40 text-sm text-muted-foreground">Cancelar</button>
          <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">Salvar</button>
        </div>
      </motion.div>
    </div>
  );
}
