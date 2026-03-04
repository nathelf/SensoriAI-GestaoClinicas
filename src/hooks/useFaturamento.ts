import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export interface DateRange {
    from: Date;
    to: Date;
}

export function useFaturamento(dateRange: DateRange) {
    const [loading, setLoading] = useState(true);
    const [dados, setDados] = useState({
        total: 0,
        topProcedimentos: [] as { nome: string; quantidade: number }[],
        resumoParaIA: "",
    });

    const fetchDados = async () => {
        setLoading(true);
        try {
            const fromStr = startOfDay(dateRange.from).toISOString();
            const toStr = endOfDay(dateRange.to).toISOString();

            // 1. Total de vendas (status = 'finalizada' ou null)
            const { data: vendas, error: errVendas } = await supabase
                .from('sales')
                .select('total, status, sale_date')
                .gte('sale_date', fromStr.split('T')[0])
                .lte('sale_date', toStr.split('T')[0]);

            if (errVendas) throw errVendas;

            const vendasValidas = vendas.filter(v => !v.status || v.status === 'finalizada');
            const total = vendasValidas.reduce((acc, curr) => acc + Number(curr.total || 0), 0);

            // 2. Top Procedimentos via 'appointments' (agendado/realizado)
            const { data: appointments, error: errAppt } = await supabase
                .from('appointments')
                .select(`
          id,
          status,
          start_time,
          procedure_id,
          procedures ( name )
        `)
                .gte('start_time', fromStr)
                .lte('start_time', toStr);

            if (errAppt) throw errAppt;

            const procCount: Record<string, number> = {};
            appointments.forEach(app => {
                // Conta todos exceto cancelados
                if (app.status !== 'cancelado' && app.procedures && app.procedures.name) {
                    const name = app.procedures.name;
                    procCount[name] = (procCount[name] || 0) + 1;
                }
            });

            const topProcedimentos = Object.entries(procCount)
                .map(([nome, quantidade]) => ({ nome, quantidade }))
                .sort((a, b) => b.quantidade - a.quantidade)
                .slice(0, 3); // TOP 3

            // 3. Monta o contexto para IA
            const procedimentosTexto = topProcedimentos.length > 0
                ? topProcedimentos.map(p => `${p.nome}: ${p.quantidade} agendamentos`).join(', ')
                : 'Nenhum procedimento agendado';

            const resumoParaIA = `Faturamento total no período: R$ ${total.toFixed(2)}. Top 3 Procedimentos mais realizados: ${procedimentosTexto}. Por favor, analise a performance e sugira estratégias baseadas nesses dados específicos de clínica de estética para alavancar o faturamento. O período analisado é do dia ${dateRange.from.toLocaleDateString()} até ${dateRange.to.toLocaleDateString()}.`;

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
    }, [dateRange.from, dateRange.to]);

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
    }, [dateRange.from, dateRange.to]); // Refaz channel tb se mudar data, mas pode ser otimizado

    return { ...dados, loading, refetch: fetchDados };
}
