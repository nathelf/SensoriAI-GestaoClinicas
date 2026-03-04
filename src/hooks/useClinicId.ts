import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Retorna o clinic_id do usuário atual (primeira clínica vinculada em usuario_clinica).
 * Usado para multi-tenant em report_templates e outros módulos.
 * Admin global (role === 'admin') não precisa de clinica_id — retorna null sem fetch, evitando 500.
 */
export function useClinicId() {
  const { user, userRole } = useAuth();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setClinicId(null);
      setLoading(false);
      return;
    }
    if (userRole === "admin") {
      setClinicId(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('usuario_clinica')
        .select('clinica_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      if (!cancelled) {
        setClinicId(data?.clinica_id ?? null);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id, userRole]);

  return { clinicId, loading };
}
