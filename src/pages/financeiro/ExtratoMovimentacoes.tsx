import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Calendar } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";

interface AccountReceivable { id: string; description: string; amount: number; due_date: string; paid_date: string | null; status: string; }
interface AccountPayable { id: string; description: string; amount: number; due_date: string; paid_date: string | null; status: string; }

type MovItem = { id: string; date: string; description: string; tipo: "entrada" | "saida"; amount: number; };

export default function ExtratoMovimentacoes() {
  const { data: receber } = useCrud<AccountReceivable>({ table: "accounts_receivable", orderBy: "due_date", ascending: false });
  const { data: pagar } = useCrud<AccountPayable>({ table: "accounts_payable", orderBy: "due_date", ascending: false });
  const [filterMonth, setFilterMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const movimentos = useMemo((): MovItem[] => {
    const list: MovItem[] = [];
    receber.filter(r => r.status === "pago" && r.paid_date).forEach(r => {
      list.push({
        id: `r-${r.id}`,
        date: r.paid_date!,
        description: r.description,
        tipo: "entrada",
        amount: Number(r.amount),
      });
    });
    pagar.filter(p => p.status === "pago" && p.paid_date).forEach(p => {
      list.push({
        id: `p-${p.id}`,
        date: p.paid_date!,
        description: p.description,
        tipo: "saida",
        amount: Number(p.amount),
      });
    });
    list.sort((a, b) => b.date.localeCompare(a.date));

    const [y, m] = filterMonth.split("-").map(Number);
    return list.filter(mov => {
      const [movY, movM] = mov.date.slice(0, 7).split("-").map(Number);
      return movY === y && movM === m;
    });
  }, [receber, pagar, filterMonth]);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Extrato de Movimentações</h1>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="month"
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border/40 bg-card text-sm text-foreground"
            />
          </div>
        </div>
        {movimentos.length === 0 ? (
          <div className="stat-card text-center py-12">
            <p className="text-muted-foreground text-sm">Nenhuma movimentação paga neste período. Contas marcadas como &quot;pago&quot; aparecem aqui.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {movimentos.map(m => (
              <div key={m.id} className="stat-card !p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{m.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString("pt-BR")}</p>
                </div>
                <span className={`text-sm font-bold ${m.tipo === "entrada" ? "text-success-foreground" : "text-destructive-foreground"}`}>
                  {m.tipo === "entrada" ? "+" : "-"}R$ {m.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
