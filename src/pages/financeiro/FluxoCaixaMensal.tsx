import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarRange, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useCrud } from "@/hooks/useCrud";

interface AccountReceivable { amount: number; paid_date: string | null; status: string; }
interface AccountPayable { amount: number; paid_date: string | null; status: string; }

export default function FluxoCaixaMensal() {
  const { data: receber } = useCrud<AccountReceivable>({ table: "accounts_receivable" });
  const { data: pagar } = useCrud<AccountPayable>({ table: "accounts_payable" });
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const chartData = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const weeks: Record<number, { entradas: number; saidas: number }> = { 1: { entradas: 0, saidas: 0 }, 2: { entradas: 0, saidas: 0 }, 3: { entradas: 0, saidas: 0 }, 4: { entradas: 0, saidas: 0 }, 5: { entradas: 0, saidas: 0 } };

    receber.filter(r => r.status === "pago" && r.paid_date).forEach(r => {
      const [ry, rm, rd] = r.paid_date!.slice(0, 10).split("-").map(Number);
      if (ry === y && rm === m) {
        const week = Math.min(5, Math.ceil(rd / 7));
        weeks[week].entradas += Number(r.amount) || 0;
      }
    });
    pagar.filter(p => p.status === "pago" && p.paid_date).forEach(p => {
      const [py, pm, pd] = p.paid_date!.slice(0, 10).split("-").map(Number);
      if (py === y && pm === m) {
        const week = Math.min(5, Math.ceil(pd / 7));
        weeks[week].saidas += Number(p.amount) || 0;
      }
    });

    return [1, 2, 3, 4, 5].map(w => ({
      semana: `Sem ${w}`,
      entradas: weeks[w].entradas,
      saidas: weeks[w].saidas,
    }));
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
            <CalendarRange className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Fluxo de Caixa Mensal</h1>
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
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-4">{monthLabel} (por semana)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(195, 20%, 90%)" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(195, 20%, 88%)", fontSize: "12px" }} />
                <Bar dataKey="entradas" name="Entradas" fill="hsl(155, 45%, 70%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="saidas" name="Saídas" fill="hsl(0, 65%, 80%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
