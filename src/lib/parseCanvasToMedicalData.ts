import type { Node, Edge } from '@xyflow/react';

/** Linha de tabela para o relatório (ProcedureTable) */
export interface ProcedureTableRow {
  procedimento: string;
  qtd: number;
  tendencia: string;
  receita: string;
}

/**
 * Mapeamento de tipos de bloco do Canvas para seções do relatório médico.
 * Bloco no Canvas → Correspondência no Relatório
 */
export interface MedicalReportData {
  /** Resumo de Performance / Indicadores Clínicos (Faturamento, métricas) */
  metrics: {
    faturamentoTotal: number;
    faturamentoFormatado: string;
    [key: string]: unknown;
  };
  /** Tratamentos - linhas para tabela profissional (Procedimento | Qtd | Tendência | Faturamento) */
  procedures: ProcedureTableRow[];
  /** Avaliação e Conduta / Parecer do Especialista (Insight IA) */
  aiInsight: string;
  /** Próximos Passos / Cronograma de Retorno (Agenda, Links) */
  nextSteps: Array<{ label: string; value?: string }>;
  /** Dados do paciente quando bloco patientSelector está presente e preenchido */
  patientContext?: {
    id: string;
    nome: string;
    email?: string;
    cpf?: string;
    dataNascimento?: string;
    historicoClinico?: string;
  };
}

const formatarMoeda = (val: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

/**
 * Filtra blocos de procedimentos e transforma em linhas de tabela para o PDF.
 * Suporta: data.category === 'procedures' com data.stats, ou type === 'table' com topProcedimentos.
 */
export function mapProceduresForReport(nodes: Node[]): ProcedureTableRow[] | null {
  const procNode =
    nodes.find((n) => (n.data?.category as string) === 'procedures') ??
    nodes.find((n) => n.type === 'table');

  if (!procNode) return null;

  const stats =
    (procNode.data?.stats as Array<{ nome: string; quantidade: number; crescimento?: string; valor_total?: number }> | undefined) ??
    (procNode.data?.topProcedimentos as Array<{ nome: string; quantidade: number; crescimento?: string; valor_total?: number }> | undefined);

  if (!stats || !Array.isArray(stats) || stats.length === 0) return null;

  return stats.map((item) => ({
    procedimento: item.nome,
    qtd: item.quantidade,
    tendencia: item.crescimento ?? '—',
    receita: formatarMoeda(item.valor_total ?? 0),
  }));
}

/**
 * Varre os nodes ativos no canvas e extrai conteúdo estruturado.
 * Usa data dos nós (valores numéricos, listas) em vez de imagens.
 * @param patientHistorico - Resumo de atendimentos do paciente (opcional)
 */
export function parseCanvasToMedicalData(
  nodes: Node[],
  edges: Edge[],
  options?: { patientHistorico?: string }
): MedicalReportData {
  const empty: MedicalReportData = {
    metrics: { faturamentoTotal: 0, faturamentoFormatado: formatarMoeda(0) },
    procedures: [],
    aiInsight: '',
    nextSteps: [],
  };

  for (const node of nodes) {
    switch (node.type) {
      case 'metrics': {
        const total = Number(node.data?.total ?? 0);
        empty.metrics = {
          faturamentoTotal: total,
          faturamentoFormatado: formatarMoeda(total),
        };
        break;
      }
      case 'table': {
        const rows = mapProceduresForReport([node]);
        if (rows) empty.procedures = rows;
        break;
      }
      case 'ai':
        empty.aiInsight = (node.data?.content as string) || '';
        break;
      case 'patientSelector': {
        const p = node.data?.selectedPatient as { id: string; name: string; email?: string; cpf?: string; birth_date?: string } | undefined;
        if (p) {
          empty.patientContext = {
            id: p.id,
            nome: p.name,
            email: p.email ?? undefined,
            cpf: p.cpf ?? undefined,
            dataNascimento: p.birth_date ?? undefined,
            historicoClinico: options?.patientHistorico,
          };
        }
        break;
      }
      case 'generic': {
        const label = (node.data?.label as string) || 'Item';
        const isAgenda =
          /agenda|link|bloqueio|cronograma/i.test(label) ||
          /consultas|retorno/i.test(label);
        if (isAgenda) {
          empty.nextSteps.push({
            label,
            value: (node.data?.value as string) ?? (node.data?.stats as string),
          });
        }
        break;
      }
      default:
        if ((node.data?.category as string) === 'procedures') {
          const rows = mapProceduresForReport([node]);
          if (rows) empty.procedures = rows;
        }
        break;
    }
  }

  return empty;
}
