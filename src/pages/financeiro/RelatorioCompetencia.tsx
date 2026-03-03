import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Calendar } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";

interface AccountReceivable { amount: number; paid_date: string | null; status: string; due_date: string; }
interface AccountPayable { amount: number; paid_date: string | null; status: string; due_date: string; }

export default function RelatorioCompetencia() {
  const { data: receber } = useCrud<AccountReceivable>({ table: "accounts_receivable" });
  const { data: pagar } = useCrud<AccountPayable>({ table: "accounts_payable" });
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const report = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const receitas = receber
      .filter(r => r.status === "pago" && r.paid_date)
      .filter(r => {
        const [ry, rm] = r.paid_date!.slice(0, 7).split("-").map(Number);
        return ry === y && rm === m;
      })
      .reduce((s, r) => s + Number(r.amount), 0);
    const despesas = pagar
      .filter(p => p.status === "pago" && p.paid_date)
      .filter(p => {
        const [py, pm] = p.paid_date!.slice(0, 7).split("-").map(Number);
        return py === y && pm === m;
      })
      .reduce((s, p) => s + Number(p.amount), 0);
    return { receitas, despesas, saldo: receitas - despesas };
  }, [receber, pagar, month]);

  const monthLabel = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }, [month]);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Relatório de Competência</h1>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="px-4 py-2 rounded-xl border border-border/40 bg-card text-sm text-foreground"
            />
          </div>
        </div>
        <div className="stat-card space-y-4">
          <p className="text-sm text-muted-foreground">Resultado em {monthLabel} (contas pagas no mês)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-success/10">
              <p className="text-xs text-muted-foreground">Receitas</p>
              <p className="text-xl font-bold text-success-foreground">R$ {report.receitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-4 rounded-xl bg-destructive/10">
              <p className="text-xs text-muted-foreground">Despesas</p>
              <p className="text-xl font-bold text-destructive-foreground">R$ {report.despesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-xs text-muted-foreground">Saldo do mês</p>
              <p className={`text-xl font-bold ${report.saldo >= 0 ? "text-success-foreground" : "text-destructive-foreground"}`}>
                R$ {report.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
