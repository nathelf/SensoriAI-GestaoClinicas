import { useState } from 'react';

export interface ReportConfig {
  logoDataUrl: string;
  titulo: string;
  rodape: string;
  layout: 'grid' | 'lista';
  /** Dados da Unidade (endereço, telefone, etc.) - exibido no cabeçalho à direita */
  dadosUnidade: string;
}

const defaultConfig: ReportConfig = {
  logoDataUrl: '',
  titulo: 'Relatório de Performance',
  rodape: 'SensoriAI - Inteligência em Gestão de Clínicas',
  layout: 'lista',
  dadosUnidade: '',
};

export function useReportConfig() {
  const [config, setConfig] = useState<ReportConfig>(defaultConfig);
  return { config, setConfig };
}
