import type { Node, Edge } from '@xyflow/react';

export interface ReportContextMetadata {
  clinica: string;
  periodo: string;
  data_geracao: string;
}

export interface ReportContext {
  metadata: ReportContextMetadata;
  dados: Record<string, unknown>;
}

/**
 * Extrai o contexto de dados dos blocos conectados ao nó de Insight Inteligente (IA).
 * A ordem das conexões respeita os edges que apontam para o nó IA.
 * @param patientHistorico - Resumo de atendimentos do paciente (opcional)
 */
export function getReportContext(
  nodes: Node[],
  edges: Edge[],
  metadata: { clinica: string; periodo: string },
  options?: { patientHistorico?: string }
): ReportContext | null {
  const insightNode = nodes.find(
    (n) => n.type === 'ai' || (n.data?.label as string)?.includes?.('Insight')
  );
  if (!insightNode) return null;

  const connectedEdges = edges.filter((e) => e.target === insightNode.id);
  const sourceNodeIds = connectedEdges.map((e) => e.source);
  if (sourceNodeIds.length === 0) return null;

  const sourceNodes = nodes.filter((n) => sourceNodeIds.includes(n.id));
  const reportData: Record<string, unknown> = {};

  for (const node of sourceNodes) {
    const key = normalizarChave(node);
    const value = extrairDadosDoNode(node, options);
    if (value !== undefined) reportData[key] = value;
  }

  return {
    metadata: {
      clinica: metadata.clinica,
      periodo: metadata.periodo,
      data_geracao: new Date().toISOString(),
    },
    dados: reportData,
  };
}

function normalizarChave(node: Node): string {
  switch (node.type) {
    case 'metrics':
      return 'faturamento_total';
    case 'table':
      return 'top_procedimentos';
    case 'patientSelector':
      return 'paciente_selecionado';
    case 'generic':
      return (node.data?.label as string)?.toLowerCase?.().replace(/\s+/g, '_') || node.id;
    default:
      return node.type || node.id;
  }
}

function extrairDadosDoNode(node: Node, options?: { patientHistorico?: string }): unknown {
  switch (node.type) {
    case 'metrics':
      return {
        total: Number(node.data?.total ?? 0),
        valor_formatado: formatarMoeda(Number(node.data?.total ?? 0)),
      };
    case 'table': {
      const procs = (node.data?.topProcedimentos || []) as { nome: string; quantidade: number; crescimento?: string; valor_total?: number }[];
      return procs.map((p) => ({
        nome: p.nome,
        qtd: p.quantidade,
        crescimento: p.crescimento ?? '—',
        valor_total: p.valor_total ?? 0,
      }));
    }
    case 'patientSelector': {
      const p = node.data?.selectedPatient as Record<string, unknown> | undefined;
      if (!p || !p.id || !p.name) return undefined;
      return {
        id: p.id,
        nome: p.name,
        email: p.email,
        cpf: p.cpf,
        phone: p.phone,
        data_nascimento: p.birth_date,
        sexo: p.gender,
        tipo_sanguineo: p.tipo_sanguineo,
        alergias: p.alergias,
        observacoes_clinicas: p.observacoes_clinicas,
        responsavel_nome: p.responsavel_nome,
        responsavel_cpf: p.responsavel_cpf,
        historico_clinico: [options?.patientHistorico, p.observacoes_clinicas].filter(Boolean).join('\n\n') || 'Resumo disponível para a IA quando conectado.',
      };
    }
    case 'generic':
      return node.data?.value ?? node.data?.stats ?? { label: node.data?.label };
    default:
      return node.data?.value ?? node.data?.stats ?? node.data;
  }
}

function formatarMoeda(val: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
}
