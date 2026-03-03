import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Calendar } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";

interface AccountReceivable { id: string; description: string; amount: number; paid_date: string | null; status: string; due_date: string; }
interface AccountPayable { id: string; description: string; amount: number; paid_date: string | null; status: string; due_date: string; }

type LineItem = { id: string; hora: string; descricao: string; valor: number; tipo: "entrada" | "saida" | "info" };

export default function FluxoCaixaDiario() {
  const { data: receber } = useCrud<AccountReceivable>({ table: "accounts_receivable" });
  const { data: pagar } = useCrud<AccountPayable>({ table: "accounts_payable" });
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);

  const items = useMemo((): LineItem[] => {
    const list: LineItem[] = [];
    const target = selectedDate;

    receber.filter(r => r.status === "pago" && r.paid_date === target).forEach(r => {
      list.push({
        id: `r-${r.id}`,
        hora: "—",
        descricao: r.description,
        valor: Number(r.amount),
        tipo: "entrada",
      });
    });
    pagar.filter(p => p.status === "pago" && p.paid_date === target).forEach(p => {
      list.push({
        id: `p-${p.id}`,
        hora: "—",
        descricao: p.description,
        valor: Number(p.amount),
        tipo: "saida",
      });
    });

    list.sort((a, b) => (b.tipo === "entrada" ? 1 : -1) - (a.tipo === "entrada" ? 1 : -1));
    return list;
  }, [receber, pagar, selectedDate]);

  const totais = useMemo(() => {
    const entradas = items.filter(i => i.tipo === "entrada").reduce((s, i) => s + i.valor, 0);
    const saidas = items.filter(i => i.tipo === "saida").reduce((s, i) => s + i.valor, 0);
    return { entradas, saidas, saldo: entradas - saidas };
  }, [items]);

  const dateLabel = useMemo(() => new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }), [selectedDate]);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Fluxo de Caixa Diário</h1>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border/40 bg-card text-sm text-foreground"
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{dateLabel}</p>
        {items.length === 0 ? (
          <div className="stat-card text-center py-12">
            <p className="text-muted-foreground text-sm">Nenhuma movimentação paga nesta data.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="stat-card !p-4 flex items-center gap-4">
                  <span className="text-xs text-muted-foreground w-12 shrink-0">{item.hora}</span>
                  <p className="text-sm font-medium text-foreground flex-1">{item.descricao}</p>
                  <span className={`text-sm font-bold ${item.tipo === "entrada" ? "text-success-foreground" : item.tipo === "saida" ? "text-destructive-foreground" : "text-info-foreground"}`}>
                    {item.tipo === "entrada" ? "+" : "-"}R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 stat-card flex flex-wrap gap-4 justify-between">
              <span className="text-sm text-muted-foreground">Entradas: <strong className="text-success-foreground">R$ {totais.entradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>
              <span className="text-sm text-muted-foreground">Saídas: <strong className="text-destructive-foreground">R$ {totais.saidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>
              <span className="text-sm text-muted-foreground">Saldo do dia: <strong className={totais.saldo >= 0 ? "text-success-foreground" : "text-destructive-foreground"}>R$ {totais.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></span>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
