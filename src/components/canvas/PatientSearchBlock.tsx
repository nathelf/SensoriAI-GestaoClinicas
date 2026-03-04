import { NodeProps } from '@xyflow/react';
import { User, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { NodeHandle } from './NodeHandle';
import { NodeDeleteButton } from './NodeDeleteButton';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

/** Interface alinhada à tabela patients do Supabase (inclui campos clínicos) */
export interface Patient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  birth_date: string | null;
  gender: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  tipo_sanguineo?: string | null;
  alergias?: string | null;
  observacoes_clinicas?: string | null;
  endereco_completo?: string | null;
  responsavel_nome?: string | null;
  responsavel_cpf?: string | null;
}

export function PatientSearchBlock({ id, data }: NodeProps) {
  const [query, setQuery] = useState((data?.searchQuery as string) || '');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = data?.selectedPatient as Patient | null;
  const hasOpenedModal = useRef(false);

  // Ao montar o bloco, abre o modal obrigatório: "Para qual paciente deseja gerar este relatório?"
  useEffect(() => {
    if (!selected && !hasOpenedModal.current) {
      hasOpenedModal.current = true;
      setModalOpen(true);
      setQuery('');
    }
  }, [selected]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setPatients([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from('patients')
      .select('id, name, email, phone, cpf, birth_date, gender, address, city, state, zip_code, tipo_sanguineo, alergias, observacoes_clinicas, endereco_completo, responsavel_nome, responsavel_cpf')
      .ilike('name', `%${query}%`)
      .limit(10)
      .then(({ data: rows, error }) => {
        if (cancelled) return;
        if (error) {
          console.error(error);
          setPatients([]);
        } else {
          setPatients((rows || []) as Patient[]);
        }
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [query]);

  const handleSelect = (p: Patient) => {
    data?.onPatientSelect?.(p);
    setQuery(p.name);
    setModalOpen(false);
  };

  const openSearchModal = () => {
    setModalOpen(true);
    setQuery('');
  };

  return (
    <div
      ref={containerRef}
      className="bg-card border border-border/60 rounded-2xl shadow-sm min-w-[280px] p-5 relative"
    >
      <NodeDeleteButton nodeId={id} />
      <NodeHandle position="top" />
      <NodeHandle position="right" />
      <NodeHandle position="bottom" />
      <NodeHandle position="left" />

      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <User size={18} />
        </div>
        <span className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Perfil do Paciente
        </span>
      </div>

      {selected ? (
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{selected.name}</p>
          {selected.email && (
            <p className="text-xs text-muted-foreground">{selected.email}</p>
          )}
          {selected.cpf && (
            <p className="text-xs text-muted-foreground">CPF: {selected.cpf}</p>
          )}
          <button
            type="button"
            onClick={openSearchModal}
            className="text-xs text-primary hover:underline mt-1"
          >
            Trocar paciente
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Nenhum paciente selecionado.</p>
          <button
            type="button"
            onClick={openSearchModal}
            className="text-sm font-medium text-primary hover:underline"
          >
            Selecionar paciente →
          </button>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Para qual paciente deseja gerar este relatório?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Digite o nome do paciente..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 h-10"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
              {loading ? (
                <p className="p-4 text-sm text-muted-foreground text-center">Buscando...</p>
              ) : patients.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  {query.length < 2 ? 'Digite 2+ caracteres para buscar' : 'Nenhum paciente encontrado'}
                </p>
              ) : (
                patients.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="w-full text-left p-4 hover:bg-muted/60 text-sm border-b border-border/50 last:border-0 transition-colors"
                    onClick={() => handleSelect(p)}
                  >
                    <span className="font-medium text-foreground">{p.name}</span>
                    {p.email && (
                      <span className="text-muted-foreground text-xs block mt-0.5">{p.email}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <p className="text-[10px] text-muted-foreground mt-2">
        Dados do paciente serão incluídos no topo do relatório e no parecer da IA.
      </p>
    </div>
  );
}
