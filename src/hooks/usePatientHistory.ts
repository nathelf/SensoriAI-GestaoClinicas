import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Busca o histórico clínico do paciente (appointments realizados) para enriquecer
 * o patientContext nos relatórios e no contexto da IA.
 */
export function usePatientHistory(patientId: string | null | undefined) {
  const [historico, setHistorico] = useState<string>('');

  useEffect(() => {
    if (!patientId) {
      setHistorico('');
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          id, start_time, status, procedure_id,
          procedures ( name )
        `)
        .eq('patient_id', patientId)
        .order('start_time', { ascending: false })
        .limit(20);

      if (cancelled) return;

      if (!appointments || appointments.length === 0) {
        setHistorico('Nenhum atendimento registrado.');
        return;
      }

      const realizados = appointments.filter((a) => a.status === 'realizado' || !a.status);
      const linhas = realizados.slice(0, 10).map((a) => {
        const data = a.start_time
          ? format(new Date(a.start_time), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
          : '—';
        const proc = (a.procedures as { name?: string })?.name ?? 'Procedimento';
        return `• ${data}: ${proc}`;
      });
      setHistorico(linhas.join('\n'));
    })();
    return () => { cancelled = true; };
  }, [patientId]);

  return historico;
}
