import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ReportData } from '@/lib/buildReportData';
import type { ReportConfig } from '@/hooks/useReportConfig';
import { ReportHeader } from './ReportHeader';
import { ProcedureTable } from './ProcedureTable';

/* Estilo Clinicarx: sóbrio, bordas arredondadas, badges de status */
const colors = {
  primary: '#7c3aed',
  primaryLight: '#f5f3ff',
  success: '#22c55e',
  successBg: '#dcfce7',
  alert: '#ef4444',
  alertBg: '#fee2e2',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray400: '#9ca3af',
  gray600: '#4b5563',
  gray800: '#1e293b',
  white: '#ffffff',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 36,
    paddingHorizontal: 40,
    paddingBottom: 56,
  },
  band: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
    borderRadius: 8,
  },
  bandText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  bandSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 9,
    marginTop: 2,
  },
  /* Bloco de paciente - header dinâmico estilo Clinicarx */
  patientBlock: {
    backgroundColor: colors.gray100,
    padding: 16,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  patientHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray800,
    flex: 1,
  },
  patientCpfRight: {
    fontSize: 10,
    color: colors.gray600,
    textAlign: 'right',
  },
  patientTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  patientRow: {
    fontSize: 10,
    color: colors.gray800,
    marginBottom: 4,
  },
  patientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  patientGridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
  },
  patientLabel: {
    fontSize: 9,
    color: colors.gray600,
    marginRight: 6,
    width: 80,
  },
  patientValue: {
    fontSize: 10,
    color: colors.gray800,
  },
  alergiasBox: {
    backgroundColor: colors.alertBg,
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.alert,
  },
  /* Badge de status (Controlado / Alerta) */
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 9,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  badgeControlado: {
    backgroundColor: colors.successBg,
    color: colors.success,
  },
  badgeAlerta: {
    backgroundColor: colors.alertBg,
    color: colors.alert,
  },
  /* Grid lateral estilo Clinicarx */
  sectionRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.gray800,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  metricsCard: {
    backgroundColor: colors.primaryLight,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  metricsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 6,
  },
  aiSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fdfaff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  aiTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  aiText: {
    fontSize: 10,
    color: colors.gray800,
    lineHeight: 1.5,
    marginBottom: 6,
  },
  historicoTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.gray800,
    marginTop: 10,
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  footerLeft: {
    fontSize: 8,
    color: colors.gray400,
  },
  signatureLine: {
    marginTop: 20,
    width: 180,
    borderTopWidth: 1,
    borderTopColor: colors.gray600,
    paddingTop: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: colors.gray600,
  },
});

function stripMarkdown(text: string): string {
  return text
    .replace(/^###\s*/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .trim();
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+|\n/)
    .map((p) => stripMarkdown(p))
    .filter(Boolean);
}

interface ClinicMetricsProps {
  data: NonNullable<ReportData['metrics']>;
}

function ClinicMetrics({ data }: ClinicMetricsProps) {
  return (
    <View style={styles.column}>
      <Text style={styles.sectionTitle}>Resumo de Performance</Text>
      <View style={styles.metricsCard}>
        <Text style={{ fontSize: 9, color: colors.gray600 }}>Faturamento Total</Text>
        <Text style={styles.metricsValue}>{data.faturamentoFormatado}</Text>
      </View>
    </View>
  );
}

interface AIInsightSectionProps {
  text: string;
}

function AIInsightSection({ text }: AIInsightSectionProps) {
  if (!text) return null;

  const paragraphs = splitParagraphs(text);
  return (
    <View style={styles.aiSection}>
      <Text style={styles.aiTitle}>Parecer Estratégico (IA):</Text>
      {paragraphs.map((p, idx) => (
        <Text key={idx} style={styles.aiText}>
          {p}
        </Text>
      ))}
    </View>
  );
}

interface MedicalReportTemplateProps {
  data: ReportData;
  clinicConfig: ReportConfig;
  periodo: string;
  clinica: string;
  /** Status do paciente (opcional) - exibe badge verde/vermelho */
  patientStatus?: 'controlado' | 'alerta';
}

export function MedicalReportTemplate({
  data,
  clinicConfig,
  periodo,
  clinica,
  patientStatus,
}: MedicalReportTemplateProps) {
  const dataGeracao = new Date().toLocaleDateString('pt-BR');
  const rodape = (clinicConfig.rodape || 'SensoriAI').replace('{data}', dataGeracao);
  const address = clinicConfig.dadosUnidade?.trim() || undefined;

  const hasPatientHeader = !!data.patientHeader;
  const hasMetrics = data.metrics !== null;
  const hasTreatments = data.treatments !== null && data.treatments.length > 0;
  const hasAiInsight = data.aiInsight != null && data.aiInsight.length > 0;
  const hasNextSteps = data.nextSteps.length > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReportHeader
          logoUrl={clinicConfig.logoDataUrl || undefined}
          clinicName={clinica}
          address={address}
          reportDate={periodo}
        />

        <View style={styles.band}>
          <Text style={styles.bandText}>
            {clinicConfig.titulo || 'Relatório de Performance Clínica'}
          </Text>
          <Text style={styles.bandSubtext}>Emitido em {dataGeracao}</Text>
        </View>

        {/* Cabeçalho do paciente - layout Clinicarx: Nome no topo, CPF à direita */}
        {hasPatientHeader && data.patientHeader ? (
          <View style={styles.patientBlock}>
            <View style={styles.patientHeaderRow}>
              <Text style={styles.patientName}>{data.patientHeader.nome}</Text>
              {data.patientHeader.cpf && (
                <Text style={styles.patientCpfRight}>CPF: {data.patientHeader.cpf}</Text>
              )}
            </View>
            <View style={styles.patientGrid}>
              {data.patientHeader.idade && (
                <View style={styles.patientGridItem}>
                  <Text style={styles.patientLabel}>Idade:</Text>
                  <Text style={styles.patientValue}>{data.patientHeader.idade}</Text>
                </View>
              )}
              {data.patientHeader.sexo && (
                <View style={styles.patientGridItem}>
                  <Text style={styles.patientLabel}>Sexo:</Text>
                  <Text style={styles.patientValue}>{data.patientHeader.sexo}</Text>
                </View>
              )}
              {data.patientHeader.tipoSanguineo && (
                <View style={styles.patientGridItem}>
                  <Text style={styles.patientLabel}>Tipo Sanguíneo:</Text>
                  <Text style={styles.patientValue}>{data.patientHeader.tipoSanguineo}</Text>
                </View>
              )}
              {data.patientHeader.dataNascimento && (
                <View style={styles.patientGridItem}>
                  <Text style={styles.patientLabel}>Nascimento:</Text>
                  <Text style={styles.patientValue}>{data.patientHeader.dataNascimento}</Text>
                </View>
              )}
              {data.patientHeader.phone && (
                <View style={styles.patientGridItem}>
                  <Text style={styles.patientLabel}>Telefone:</Text>
                  <Text style={styles.patientValue}>{data.patientHeader.phone}</Text>
                </View>
              )}
              {data.patientHeader.email && (
                <View style={styles.patientGridItem}>
                  <Text style={styles.patientLabel}>E-mail:</Text>
                  <Text style={styles.patientValue}>{data.patientHeader.email}</Text>
                </View>
              )}
              {data.patientHeader.enderecoCompleto && (
                <View style={[styles.patientGridItem, { minWidth: '100%' }]}>
                  <Text style={styles.patientLabel}>Endereço:</Text>
                  <Text style={styles.patientValue}>{data.patientHeader.enderecoCompleto}</Text>
                </View>
              )}
              {(data.patientHeader.responsavelNome || data.patientHeader.responsavelCpf) && (
                <View style={[styles.patientGridItem, { minWidth: '100%' }]}>
                  <Text style={styles.patientLabel}>Responsável:</Text>
                  <Text style={styles.patientValue}>
                    {data.patientHeader.responsavelNome || ''}
                    {data.patientHeader.responsavelNome && data.patientHeader.responsavelCpf ? ' • CPF ' : ''}
                    {data.patientHeader.responsavelCpf || ''}
                  </Text>
                </View>
              )}
            </View>
            {data.patientHeader.alergias && (
              <View style={styles.alergiasBox}>
                <Text style={[styles.historicoTitle, { color: colors.alert }]}>Alergias:</Text>
                <Text style={styles.aiText}>{data.patientHeader.alergias}</Text>
              </View>
            )}
            {data.patientHeader.observacoesClinicas && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.historicoTitle}>Observações Clínicas:</Text>
                <Text style={styles.aiText}>{data.patientHeader.observacoesClinicas}</Text>
              </View>
            )}
            {data.patientHeader.historicoClinico && (
              <>
                <Text style={styles.historicoTitle}>Histórico de Atendimentos:</Text>
                <Text style={styles.aiText}>{data.patientHeader.historicoClinico}</Text>
              </>
            )}
            {patientStatus && (
              <View
                style={[
                  styles.badge,
                  patientStatus === 'controlado' ? styles.badgeControlado : styles.badgeAlerta,
                ]}
              >
                <Text>{patientStatus === 'controlado' ? 'Controlado' : 'Alerta'}</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Só renderiza seção de Métricas + Tratamentos quando os blocos existem no canvas */}
        {(hasMetrics || hasTreatments) && (
          <View style={styles.sectionRow}>
            {hasMetrics && data.metrics ? (
              <ClinicMetrics data={data.metrics} />
            ) : null}
            {hasTreatments ? (
              <View style={styles.column}>
                <Text style={styles.sectionTitle}>Análise de Tratamentos</Text>
                <ProcedureTable data={data.treatments!} />
              </View>
            ) : null}
          </View>
        )}

        {hasAiInsight && <AIInsightSection text={data.aiInsight!} />}

        {hasNextSteps && (
          <View style={[styles.aiSection, { marginTop: 12 }]}>
            <Text style={styles.aiTitle}>Próximos Passos</Text>
            {data.nextSteps.map((s, idx) => (
              <Text key={idx} style={styles.aiText}>
                {s.label}: {s.value || '-'}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>{rodape}</Text>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>Responsável técnico</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
