/**
 * Modelos sugeridos para clínicas. Compatíveis com html2canvas/jspdf.
 * Placeholders: {{nome_paciente}}, {{data}}, {{cpf}}, {{idade}}, {{queixa_principal}}, {{procedimento}}, {{nome_profissional}}
 */
export interface ClinicTemplate {
  id: string;
  titulo: string;
  tipo: string;
  conteudo: string;
}

export const CLINIC_TEMPLATES: ClinicTemplate[] = [
  {
    id: "anamnese-01",
    titulo: "Ficha de Anamnese Geral",
    tipo: "ficha",
    conteudo: `<div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: auto; border: 1px solid #eee; padding: 40px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #9b87f5; margin-bottom: 5px;">Ficha de Anamnese</h1>
    <p style="font-size: 14px; color: #666;">SensoriAI - Prontuário Digital</p>
  </div>

  <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Paciente:</strong> {{nome_paciente}}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Data:</strong> {{data}}</td>
    </tr>
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>CPF:</strong> {{cpf}}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Idade:</strong> {{idade}}</td>
    </tr>
  </table>

  <h3 style="color: #9b87f5; border-bottom: 2px solid #9b87f5; padding-bottom: 5px;">1. Queixa Principal</h3>
  <p style="background: #f9f9f9; padding: 15px; border-radius: 8px; min-height: 50px;">{{queixa_principal}}</p>

  <h3 style="color: #9b87f5; border-bottom: 2px solid #9b87f5; padding-bottom: 5px;">2. Histórico Médico</h3>
  <ul style="list-style: none; padding: 0;">
    <li style="margin-bottom: 10px;"><strong>Alergias:</strong> ________________________________</li>
    <li style="margin-bottom: 10px;"><strong>Medicamentos em uso:</strong> ______________________</li>
    <li style="margin-bottom: 10px;"><strong>Doenças Crônicas:</strong> _________________________</li>
  </ul>

  <div style="margin-top: 50px; text-align: center; color: #999; font-size: 12px;">
    Documento gerado via SensoriAI Lab.
  </div>
</div>`,
  },
  {
    id: "tcle-01",
    titulo: "Termo de Consentimento Livre e Esclarecido (TCLE)",
    tipo: "termo",
    conteudo: `<div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: auto; border: 1px solid #eee; padding: 40px;">
  <h2 style="text-align: center; color: #9b87f5;">Termo de Consentimento Livre e Esclarecido</h2>
  
  <p>Eu, <strong>{{nome_paciente}}</strong>, abaixo assinado, dou pleno consentimento para a realização do procedimento/tratamento denominado <strong>{{procedimento}}</strong> na clínica SensoriAI.</p>

  <p>Declaro que fui informado(a) de forma clara sobre:</p>
  <ul>
    <li>Os objetivos e benefícios esperados do tratamento;</li>
    <li>Os riscos potenciais e possíveis efeitos colaterais;</li>
    <li>A liberdade de interromper o tratamento a qualquer momento sem prejuízo ao meu atendimento futuro.</li>
  </ul>

  <p style="margin-top: 30px;">Autorizo também o uso de meus dados clínicos e registros fotográficos para fins de acompanhamento de prontuário, respeitando as normas da LGPD.</p>
  
  <p style="text-align: right; margin-top: 40px;">Cascavel, {{data}}.</p>

  <div id="assinatura-area" style="margin-top: 60px; text-align: center; border-top: 1px solid #000; width: 300px; margin-left: auto; margin-right: auto; padding-top: 10px;">
    Assinatura do Paciente
  </div>
</div>`,
  },
  {
    id: "contrato-01",
    titulo: "Contrato de Prestação de Serviços",
    tipo: "contrato",
    conteudo: `<div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: auto; border: 1px solid #eee; padding: 40px;">
  <h1 style="text-align: center; color: #9b87f5;">Contrato de Prestação de Serviços</h1>
  <p>Entre a <strong>CLÍNICA</strong> e o(a) <strong>PACIENTE/CONTRATANTE</strong> {{nome_paciente}}, CPF {{cpf}}, firma-se o presente contrato:</p>
  <h3 style="color: #9b87f5; border-bottom: 2px solid #9b87f5; padding-bottom: 5px;">1. Objeto</h3>
  <p>Contratação de serviços de saúde estética conforme procedimentos e valores acordados.</p>
  <h3 style="color: #9b87f5; border-bottom: 2px solid #9b87f5; padding-bottom: 5px;">2. Valor e Forma de Pagamento</h3>
  <p>_________________________________________</p>
  <h3 style="color: #9b87f5; border-bottom: 2px solid #9b87f5; padding-bottom: 5px;">3. Obrigações da Clínica</h3>
  <p>Prestar os serviços com zelo técnico e ético, em ambiente adequado.</p>
  <h3 style="color: #9b87f5; border-bottom: 2px solid #9b87f5; padding-bottom: 5px;">4. Obrigações do Paciente</h3>
  <p>Fornecer informações verídicas, comparecer nos horários agendados e respeitar as orientações.</p>
  <p><strong>Data:</strong> {{data}}</p>
  <div style="margin-top: 40px; text-align: center; border-top: 1px solid #000; width: 300px; margin-left: auto; margin-right: auto; padding-top: 10px;">Assinatura do Paciente</div>
</div>`,
  },
];

export const DOCUMENT_TYPES = [
  { value: "ficha", label: "Ficha" },
  { value: "termo", label: "Termo" },
  { value: "contrato", label: "Contrato" },
  { value: "atestado", label: "Atestado" },
  { value: "prescricao", label: "Prescrição" },
] as const;
