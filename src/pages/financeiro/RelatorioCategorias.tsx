import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Tag } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";

interface AccountReceivable { amount: number; category_id: string | null; status: string; paid_date: string | null; }
interface AccountPayable { amount: number; category_id: string | null; status: string; paid_date: string | null; }
interface Category { id: string; name: string; category_type: string; }

export default function RelatorioCategorias() {
  const { data: receber } = useCrud<AccountReceivable>({ table: "accounts_receivable" });
  const { data: pagar } = useCrud<AccountPayable>({ table: "accounts_payable" });
  const { data: categories } = useCrud<Category>({ table: "financial_categories" });
  const [tipo, setTipo] = useState<"receita" | "despesa">("receita");

  const report = useMemo(() => {
    const byCategory: Record<string, number> = {};
    const source = tipo === "receita"
      ? receber.filter(r => r.status === "pago" && r.paid_date)
      : pagar.filter(p => p.status === "pago" && p.paid_date);
    source.forEach(item => {
      const catId = item.category_id || "_sem";
      byCategory[catId] = (byCategory[catId] || 0) + Number(item.amount);
    });
    const total = Object.values(byCategory).reduce((s, v) => s + v, 0);
    const list = Object.entries(byCategory).map(([id, valor]) => ({
      id,
      name: id === "_sem" ? "Sem categoria" : categories.find(c => c.id === id)?.name || "—",
      valor,
      percent: total > 0 ? Math.round((valor / total) * 100) : 0,
    }));
    list.sort((a, b) => b.valor - a.valor);
    return { list, total };
  }, [receber, pagar, categories, tipo]);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Relatório de Categorias</h1>
          </div>
          <div className="flex rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setTipo("receita")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tipo === "receita" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Receitas
            </button>
            <button
              type="button"
              onClick={() => setTipo("despesa")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tipo === "despesa" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Despesas
            </button>
          </div>
        </div>
        {report.list.length === 0 ? (
          <div className="stat-card text-center py-12">
            <Tag className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Nenhuma movimentação paga por categoria neste tipo. Cadastre categorias e associe às contas.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {report.list.map(c => (
              <div key={c.id} className="stat-card !p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                  <span className="text-sm font-bold text-foreground">R$ {c.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${tipo === "receita" ? "bg-success/70" : "bg-destructive/70"}`}
                    style={{ width: `${c.percent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{c.percent}% do total</p>
              </div>
            ))}
            <div className="stat-card !p-4 border-t-2 border-primary/30">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total ({tipo === "receita" ? "receitas" : "despesas"})</span>
                <span className="text-lg font-bold text-foreground">R$ {report.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
