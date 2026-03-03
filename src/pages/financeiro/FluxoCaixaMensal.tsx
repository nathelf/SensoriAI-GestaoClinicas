import { motion } from "framer-motion";
import { CalendarRange } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { semana: "Sem 1", entradas: 4200, saidas: 1800 },
  { semana: "Sem 2", entradas: 5600, saidas: 2200 },
  { semana: "Sem 3", entradas: 3800, saidas: 1500 },
  { semana: "Sem 4", entradas: 6100, saidas: 2800 },
];

export default function FluxoCaixaMensal() {
  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <CalendarRange className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Fluxo de Caixa Mensal</h1>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground mb-4">Março 2026</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(195, 20%, 90%)" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215, 12%, 50%)" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(195, 20%, 88%)", fontSize: "12px" }} />
                <Bar dataKey="entradas" fill="hsl(155, 45%, 70%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="saidas" fill="hsl(0, 65%, 80%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
