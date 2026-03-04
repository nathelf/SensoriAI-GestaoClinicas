import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export interface DateRange {
    from: Date;
    to: Date;
}

/** Estrutura enriquecida para relatório médico (com tendência e receita) */
export interface TopProcedimentoStats {
    nome: string;
    quantidade: number;
    crescimento: string;       // ex: "+12%", "-2%", "—"
    valor_total: number;
}

export function useFaturamento(dateRange: DateRange, patientId?: string | null) {
    const [loading, setLoading] = useState(true);
    const [dados, setDados] = useState({
        total: 0,
        topProcedimentos: [] as TopProcedimentoStats[],
        resumoParaIA: "",
    });

    const fetchDados = async () => {
        setLoading(true);
        try {
            const fromStr = startOfDay(dateRange.from).toISOString();
            const toStr = endOfDay(dateRange.to).toISOString();
            const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) || 30;

            // 1. Total de vendas (status = 'finalizada' ou null). Se patientId, filtrar por paciente.
            let vendasQuery = supabase
                .from('sales')
                .select('total, status, sale_date, patient_id')
                .gte('sale_date', fromStr.split('T')[0])
                .lte('sale_date', toStr.split('T')[0]);
            if (patientId) vendasQuery = vendasQuery.eq('patient_id', patientId);
            const { data: vendas, error: errVendas } = await vendasQuery;

            if (errVendas) throw errVendas;

            const vendasValidas = vendas.filter(v => !v.status || v.status === 'finalizada');
            const total = vendasValidas.reduce((acc, curr) => acc + Number(curr.total || 0), 0);

            // 2. Top Procedimentos com valor e tendência (período atual). Se patientId, filtrar por paciente.
            let apptsQuery = supabase
                .from('appointments')
                .select(`
          id,
          status,
          start_time,
          procedure_id,
          patient_id,
          procedures ( name, price )
        `)
                .gte('start_time', fromStr)
                .lte('start_time', toStr);
            if (patientId) apptsQuery = apptsQuery.eq('patient_id', patientId);
            const { data: appointments, error: errAppt } = await apptsQuery;

            if (errAppt) throw errAppt;

            const prevFrom = startOfDay(subDays(dateRange.from, daysDiff)).toISOString();
            const prevTo = endOfDay(subDays(dateRange.from, 1)).toISOString();
            let prevApptsQuery = supabase
                .from('appointments')
                .select('status, procedure_id, procedures ( name )')
                .gte('start_time', prevFrom)
                .lte('start_time', prevTo);
            if (patientId) prevApptsQuery = prevApptsQuery.eq('patient_id', patientId);
            const { data: prevAppointments } = await prevApptsQuery;

            const procData: Record<string, { qtd: number; valor: number }> = {};
            appointments.forEach(app => {
                if (app.status !== 'cancelado' && app.procedures && (app.procedures as { name?: string }).name) {
                    const name = (app.procedures as { name: string }).name;
                    const price = Number((app.procedures as { price?: number })?.price ?? 0);
                    if (!procData[name]) procData[name] = { qtd: 0, valor: 0 };
                    procData[name].qtd += 1;
                    procData[name].valor += price;
                }
            });

            const prevProcCount: Record<string, number> = {};
            (prevAppointments || []).forEach(app => {
                if (app.status !== 'cancelado' && app.procedures && (app.procedures as { name?: string }).name) {
                    const name = (app.procedures as { name: string }).name;
                    prevProcCount[name] = (prevProcCount[name] || 0) + 1;
                }
            });

            const topProcedimentos: TopProcedimentoStats[] = Object.entries(procData)
                .map(([nome, { qtd, valor }]) => {
                    const prevQtd = prevProcCount[nome] ?? 0;
                    let crescimento = "—";
                    if (prevQtd > 0) {
                        const variacao = ((qtd - prevQtd) / prevQtd) * 100;
                        crescimento = variacao >= 0 ? `+${variacao.toFixed(0)}%` : `${variacao.toFixed(0)}%`;
                    }
                    return { nome, quantidade: qtd, crescimento, valor_total: valor };
                })
                .sort((a, b) => b.quantidade - a.quantidade)
                .slice(0, 8);

            // 3. Monta o contexto para IA
            const procedimentosTexto = topProcedimentos.length > 0
                ? topProcedimentos.map(p => `${p.nome}: ${p.quantidade} agend. (R$ ${p.valor_total.toFixed(2)})`).join('; ')
                : 'Nenhum procedimento agendado';

            const resumoParaIA = `Faturamento total no período: R$ ${total.toFixed(2)}. Top Procedimentos: ${procedimentosTexto}. Período: ${dateRange.from.toLocaleDateString()} até ${dateRange.to.toLocaleDateString()}. Analise e sugira estratégias para clínica estética.`;

            setDados({
                total,
                topProcedimentos,
                resumoParaIA
            });

        } catch (err) {
            console.error("Erro ao buscar dados do Canvas de Relatórios:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDados();
    }, [dateRange.from, dateRange.to, patientId]);

    useEffect(() => {
        // Escuta em tempo real mudanças na tabela sales
        const channelSales = supabase
            .channel('realtime_sales')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'sales' },
                (payload) => {
                    console.log("Mudança via Realtime em Vendas", payload);
                    fetchDados(); // Atualiza painel inteiro
                }
            )
            .subscribe();

        const channelAppts = supabase
            .channel('realtime_appts')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'appointments' },
                (payload) => {
                    console.log("Mudança via Realtime em Agenda", payload);
                    fetchDados(); // Atualiza painel inteiro
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channelSales);
            supabase.removeChannel(channelAppts);
        };
    }, [dateRange.from, dateRange.to, patientId]);

    return { ...dados, loading, refetch: fetchDados };
}
