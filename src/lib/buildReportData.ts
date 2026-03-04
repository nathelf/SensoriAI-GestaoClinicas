import type { Node, Edge } from '@xyflow/react';

/** Linha de tabela para o relatório */
export interface ProcedureTableRow {
  procedimento: string;
  qtd: number;
  tendencia: string;
  receita: string;
}

/** Bloco de métrica no canvas */
export interface MetricBlock {
  faturamentoTotal: number;
  faturamentoFormatado: string;
  [key: string]: unknown;
}

/** Dados do paciente para cabeçalho do relatório médico (estilo Clinicarx) */
export interface PatientHeaderData {
  id: string;
  nome: string;
  email?: string;
  cpf?: string;
  phone?: string;
  dataNascimento?: string;
  idade?: string;
  sexo?: string;
  tipoSanguineo?: string;
  alergias?: string;
  observacoesClinicas?: string;
  enderecoCompleto?: string;
  responsavelNome?: string;
  responsavelCpf?: string;
  historicoClinico?: string;
}

/** Estrutura dinâmica do relatório - só inclui o que está no canvas */
export interface ReportData {
  /** Só presente se existir bloco patientSelector com paciente selecionado */
  patientHeader: PatientHeaderData | null;
  /** Só presente se existir bloco metrics no canvas */
  metrics: MetricBlock | null;
  /** Só presente se existir bloco table no canvas E com dados */
  treatments: ProcedureTableRow[] | null;
  /** Só presente se existir bloco ai no canvas */
  aiInsight: string | null;
  /** Próximos passos (blocos generic tipo agenda) */
  nextSteps: Array<{ label: string; value?: string }>;
}

const formatarMoeda = (val: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

function calcularIdade(birthDate: string | undefined): string {
  if (!birthDate) return '';
  const hoje = new Date();
  const nasc = new Date(birthDate);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return `${idade} anos`;
}

/**
 * Constrói o objeto de dados do relatório APENAS com o que existe no canvas.
 * Seções vazias não são incluídas - evita blocos genéricos no PDF.
 */
export function buildReportData(
  nodes: Node[],
  options?: { patientHistorico?: string }
): ReportData {
  const result: ReportData = {
    patientHeader: null,
    metrics: null,
    treatments: null,
    aiInsight: null,
    nextSteps: [],
  };

  for (const node of nodes) {
    switch (node.type) {
      case 'patientSelector': {
        const p = node.data?.selectedPatient as Record<string, unknown> | undefined;
        if (p && typeof p.id === 'string' && typeof p.name === 'string') {
          result.patientHeader = {
            id: p.id as string,
            nome: p.name as string,
            email: (p.email as string) ?? undefined,
            cpf: (p.cpf as string) ?? undefined,
            phone: (p.phone as string) ?? undefined,
            dataNascimento: (p.birth_date as string) ?? undefined,
            idade: calcularIdade(p.birth_date as string | undefined),
            sexo: (p.gender as string) ?? undefined,
            tipoSanguineo: (p.tipo_sanguineo as string) ?? undefined,
            alergias: (p.alergias as string) ?? undefined,
            observacoesClinicas: (p.observacoes_clinicas as string) ?? undefined,
            enderecoCompleto:
              (p.endereco_completo as string) ??
              [p.address, p.city, p.state, p.zip_code].filter(Boolean).join(', ') ||
              undefined,
            responsavelNome: (p.responsavel_nome as string) ?? undefined,
            responsavelCpf: (p.responsavel_cpf as string) ?? undefined,
            historicoClinico: options?.patientHistorico,
          };
        }
        break;
      }
      case 'metrics': {
        const total = Number(node.data?.total ?? 0);
        result.metrics = {
          faturamentoTotal: total,
          faturamentoFormatado: formatarMoeda(total),
        };
        break;
      }
      case 'table': {
        const stats = (node.data?.topProcedimentos || node.data?.stats) as
          | Array<{ nome: string; quantidade: number; crescimento?: string; valor_total?: number }>
          | undefined;
        if (stats && Array.isArray(stats) && stats.length > 0) {
          result.treatments = stats.map((item) => ({
            procedimento: item.nome,
            qtd: item.quantidade,
            tendencia: item.crescimento ?? '—',
            receita: formatarMoeda(item.valor_total ?? 0),
          }));
        }
        break;
      }
      case 'ai':
        result.aiInsight = (node.data?.content as string) || null;
        break;
      case 'generic': {
        const label = (node.data?.label as string) || 'Item';
        const isAgenda = /agenda|link|bloqueio|cronograma|consultas|retorno/i.test(label);
        if (isAgenda) {
          result.nextSteps.push({
            label,
            value: (node.data?.value as string) ?? (node.data?.stats as string),
          });
        }
        break;
      }
      default:
        if ((node.data?.category as string) === 'procedures') {
          const stats = node.data?.stats as Array<{ nome: string; quantidade: number; crescimento?: string; valor_total?: number }> | undefined;
          if (stats && Array.isArray(stats) && stats.length > 0) {
            result.treatments = stats.map((item) => ({
              procedimento: item.nome,
              qtd: item.quantidade,
              tendencia: item.crescimento ?? '—',
              receita: formatarMoeda(item.valor_total ?? 0),
            }));
          }
        }
        break;
    }
  }

  return result;
}
