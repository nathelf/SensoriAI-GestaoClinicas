import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useClinicId } from './useClinicId';
import { toast } from 'sonner';
import type { Node, Edge } from '@xyflow/react';

/** Estrutura salva no Supabase (coluna structure) */
export interface ReportStructure {
  nodes: Node[];
  edges: Edge[];
}

export interface ReportTemplateConfig {
  logoUrl?: string;
  titulo?: string;
  rodape?: string;
  [key: string]: unknown;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string | null;
  /** Estrutura do canvas (nodes + edges). Fallback: layout_json (legado) */
  structure: ReportStructure;
  config?: ReportTemplateConfig | null;
  clinic_id?: string | null;
  is_favorite?: boolean;
  created_at: string;
  updated_at: string;
}

export function useReportTemplates() {
  const { user } = useAuth();
  const { clinicId } = useClinicId();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  /** Extrai nodes e edges de um template (structure ou layout_json legado) */
  const getStructureFromRow = (row: Record<string, unknown>): ReportStructure => {
    const struct = row.structure as ReportStructure | undefined;
    if (struct?.nodes && Array.isArray(struct.nodes) && struct.edges && Array.isArray(struct.edges)) {
      return { nodes: struct.nodes, edges: struct.edges };
    }
    const legacy = row.layout_json as ReportStructure | undefined;
    if (legacy?.nodes && Array.isArray(legacy.nodes) && legacy.edges && Array.isArray(legacy.edges)) {
      return { nodes: legacy.nodes, edges: legacy.edges };
    }
    return { nodes: [], edges: [] };
  };

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('report_templates')
      .select('id, name, description, structure, layout_json, config, clinic_id, is_favorite, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar modelos');
      console.error(error);
    } else {
      setTemplates(
        (data || []).map((row) => ({
          id: row.id,
          name: row.name,
          description: row.description ?? null,
          structure: getStructureFromRow(row),
          config: (row.config as ReportTemplateConfig) ?? null,
          clinic_id: row.clinic_id ?? null,
          is_favorite: row.is_favorite ?? false,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }))
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  /**
   * Salva o layout atual do React Flow como modelo.
   * Usa structure (e config opcional) na tabela report_templates.
   */
  const saveTemplate = async (
    name: string,
    nodes: Node[],
    edges: Edge[],
    options?: { description?: string; config?: ReportTemplateConfig }
  ): Promise<ReportTemplate | null> => {
    if (!user) return null;
    const structure: ReportStructure = { nodes, edges };
    const payload: Record<string, unknown> = {
      user_id: user.id,
      name,
      structure,
      config: options?.config ?? {},
      description: options?.description ?? null,
      is_favorite: false,
    };
    if (clinicId) payload.clinic_id = clinicId;

    const { data, error } = await supabase
      .from('report_templates')
      .insert(payload)
      .select()
      .single();

    if (error) {
      toast.error('Erro ao salvar modelo');
      console.error(error);
      return null;
    }
    toast.success('Modelo salvo com sucesso!');
    await fetchTemplates();
    return {
      ...data,
      structure: getStructureFromRow(data),
    } as ReportTemplate;
  };

  const updateTemplate = async (
    id: string,
    updates: { name?: string; description?: string; structure?: ReportStructure; config?: ReportTemplateConfig }
  ): Promise<boolean> => {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.name != null) payload.name = updates.name;
    if (updates.description != null) payload.description = updates.description;
    if (updates.structure != null) payload.structure = updates.structure;
    if (updates.config != null) payload.config = updates.config;

    const { error } = await supabase.from('report_templates').update(payload).eq('id', id);
    if (error) {
      toast.error('Erro ao atualizar modelo');
      console.error(error);
      return false;
    }
    toast.success('Modelo atualizado');
    await fetchTemplates();
    return true;
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('report_templates').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao excluir');
      console.error(error);
      return false;
    }
    toast.success('Modelo excluído');
    await fetchTemplates();
    return true;
  };

  /**
   * Retorna o layout pronto para aplicar no React Flow.
   * Limpa o canvas e aplica nodes/edges. Use em conjunto com setNodes/setEdges.
   */
  const loadTemplate = (template: ReportTemplate): { nodes: Node[]; edges: Edge[] } => {
    return {
      nodes: template.structure.nodes ?? [],
      edges: template.structure.edges ?? [],
    };
  };

  return {
    templates,
    loading,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    loadTemplate,
    refetch: fetchTemplates,
  };
}
