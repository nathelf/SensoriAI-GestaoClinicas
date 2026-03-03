import { motion } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "1 Fev", entradas: 0, saidas: 0 },
  { name: "8 Fev", entradas: 200, saidas: 100 },
  { name: "15 Fev", entradas: 400, saidas: 200 },
  { name: "20 Fev", entradas: 1800, saidas: 300 },
  { name: "25 Fev", entradas: 2800, saidas: 800 },
  { name: "1 Mar", entradas: 600, saidas: 400 },
  { name: "3 Mar", entradas: 800, saidas: 500 },
];

const stats = [
  { label: "Receitas", value: "R$ 6.320", icon: TrendingUp, color: "text-success-foreground" },
  { label: "Despesas", value: "-R$ 3.889", icon: TrendingDown, color: "text-destructive-foreground" },
  { label: "A receber", value: "R$ 2.680", icon: ArrowUpRight, color: "text-info-foreground" },
  { label: "A pagar", value: "-R$ 3.380", icon: ArrowDownRight, color: "text-warning-foreground" },
];

const accounts = [
  { name: "Banco padrão", type: "Conta Corrente", balance: "R$ 2.431,00" },
  { name: "Caixa", type: "Caixa", balance: "R$ 0,00" },
];

export default function Financeiro() {
  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground mb-1">Financeiro</h1>
        <p className="text-sm text-muted-foreground mb-4">Período: 01/02/2026 - 03/03/2026</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {stats.map((s, i) => {
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
            <h3 className="font-semibold text-foreground mb-4">Fluxo de Caixa</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(195, 20%, 90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(195, 20%, 88%)", fontSize: "12px" }} />
                  <Bar dataKey="entradas" fill="hsl(155, 45%, 70%)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="saidas" fill="hsl(0, 65%, 80%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="stat-card">
            <h3 className="font-semibold text-foreground mb-3">Contas Financeiras</h3>
            <div className="space-y-3">
              {accounts.map((acc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{acc.name}</p>
                    <p className="text-xs text-muted-foreground">{acc.type}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{acc.balance}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border/30">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Saldo total:</span>
                <span className="text-base font-bold text-foreground">R$ 2.431,00</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
