import { useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCrud } from "@/hooks/useCrud";
import { Link } from "react-router-dom";

interface AccountReceivable { id: string; amount: number; status: string; due_date: string; paid_date?: string | null; }
interface AccountPayable { id: string; amount: number; status: string; due_date: string; paid_date?: string | null; }
interface FinancialAccount { id: string; name: string; account_type: string; balance: number; }

export default function Financeiro() {
  const { data: receber } = useCrud<AccountReceivable>({ table: "accounts_receivable", orderBy: "due_date", ascending: true });
  const { data: pagar } = useCrud<AccountPayable>({ table: "accounts_payable", orderBy: "due_date", ascending: true });
  const { data: accounts } = useCrud<FinancialAccount>({ table: "financial_accounts" });

  const stats = useMemo(() => {
    const receitas = receber.filter(r => r.status === "pago").reduce((s, r) => s + Number(r.amount), 0);
    const despesas = pagar.filter(p => p.status === "pago").reduce((s, p) => s + Number(p.amount), 0);
    const aReceber = receber.filter(r => r.status !== "pago").reduce((s, r) => s + Number(r.amount), 0);
    const aPagar = pagar.filter(p => p.status !== "pago").reduce((s, p) => s + Number(p.amount), 0);
    return {
      receitas,
      despesas,
      aReceber,
      aPagar,
      saldoTotal: accounts.reduce((s, a) => s + Number(a.balance), 0),
    };
  }, [receber, pagar, accounts]);

  const chartData = useMemo(() => {
    const today = new Date();
    const list: { name: string; key: string; entradas: number; saidas: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      list.push({ name: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }), key, entradas: 0, saidas: 0 });
    }
    const byKey = Object.fromEntries(list.map(l => [l.key, l]));
    receber.filter(r => r.status === "pago").forEach(r => {
      const key = r.paid_date?.toString().slice(0, 10);
      if (key && byKey[key]) byKey[key].entradas += Number(r.amount) || 0;
    });
    pagar.filter(p => p.status === "pago").forEach(p => {
      const key = p.paid_date?.toString().slice(0, 10);
      if (key && byKey[key]) byKey[key].saidas += Number(p.amount) || 0;
    });
    return list;
  }, [receber, pagar]);

  const periodLabel = useMemo(() => {
    const hoje = new Date();
    const ini = new Date(hoje);
    ini.setDate(ini.getDate() - 6);
    return `${ini.toLocaleDateString("pt-BR")} - ${hoje.toLocaleDateString("pt-BR")}`;
  }, []);

  const statCards = [
    { label: "Receitas", value: `R$ ${stats.receitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-success-foreground" },
    { label: "Despesas", value: `-R$ ${stats.despesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: TrendingDown, color: "text-destructive-foreground" },
    { label: "A receber", value: `R$ ${stats.aReceber.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: ArrowUpRight, color: "text-info-foreground" },
    { label: "A pagar", value: `-R$ ${stats.aPagar.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: ArrowDownRight, color: "text-warning-foreground" },
  ];

  const accountTypes: Record<string, string> = {
    conta_corrente: "Conta Corrente",
    caixa: "Caixa",
    poupanca: "Poupança",
    investimento: "Investimento",
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-1">Financeiro</h1>
        <p className="text-sm text-muted-foreground mb-4">Período: {periodLabel}</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="stat-card">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 stat-card">
            <h3 className="font-semibold text-foreground mb-4">Fluxo de Caixa (últimos 7 dias)</h3>
            <div className="h-56">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(195, 20%, 90%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(195, 20%, 88%)", fontSize: "12px" }} />
                    <Bar dataKey="entradas" name="Entradas" fill="hsl(155, 45%, 70%)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="saidas" name="Saídas" fill="hsl(0, 65%, 80%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Sem movimentações no período.</div>
              )}
            </div>
          </div>

          <div className="stat-card">
            <h3 className="font-semibold text-foreground mb-3">Contas Financeiras</h3>
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma conta. <Link to="/financeiro/contas" className="text-primary underline">Cadastrar</Link></p>
            ) : (
              <>
                <div className="space-y-3">
                  {accounts.slice(0, 4).map(acc => (
                    <div key={acc.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{acc.name}</p>
                        <p className="text-xs text-muted-foreground">{accountTypes[acc.account_type] || acc.account_type}</p>
                      </div>
                      <span className="text-sm font-semibold text-foreground">R$ {Number(acc.balance).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-border/30">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Saldo total:</span>
                    <span className="text-base font-bold text-foreground">R$ {stats.saldoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
