/**
 * Modelos sugeridos para clínicas. Preenchem o editor ao criar novo documento.
 * Placeholders: {{nome_paciente}}, {{data}}, {{cpf}}, {{procedimento}}, {{nome_profissional}}
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
    conteudo: `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h1 style="text-align: center; color: #9b87f5;">Ficha de Anamnese Geral</h1>
  <p><strong>Nome do Paciente:</strong> {{nome_paciente}}</p>
  <p><strong>Data:</strong> {{data}} | <strong>Profissional:</strong> {{nome_profissional}}</p>
  <hr/>
  <h3>1. Histórico de Queixas</h3>
  <p>[Descreva aqui o motivo principal da consulta]</p>
  <h3>2. Antecedentes Médicos</h3>
  <p><strong>Alergias:</strong> ________________________________</p>
  <p><strong>Medicamentos em uso:</strong> ______________________</p>
  <p><strong>Cirurgias prévias:</strong> _________________________</p>
  <h3>3. Hábitos de Vida</h3>
  <p>( ) Tabagismo ( ) Etilismo ( ) Atividade Física</p>
</div>`,
  },
  {
    id: "tcle-01",
    titulo: "Termo de Consentimento Livre e Esclarecido (TCLE)",
    tipo: "termo",
    conteudo: `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h1 style="text-align: center; color: #9b87f5;">Termo de Consentimento</h1>
  <p>Eu, <strong>{{nome_paciente}}</strong>, portador do CPF <strong>{{cpf}}</strong>, declaro que fui devidamente informado(a) sobre o procedimento <strong>{{procedimento}}</strong>, seus benefícios, riscos e alternativas.</p>
  <p>Compreendo que na prática de saúde não há garantias absolutas de resultados, mas autorizo a equipe da SensoriAI a realizar o atendimento proposto.</p>
  <p>Este consentimento é dado de forma livre e consciente para a data de {{data}}.</p>
</div>`,
  },
  {
    id: "contrato-01",
    titulo: "Contrato de Prestação de Serviços",
    tipo: "contrato",
    conteudo: `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h1 style="text-align: center; color: #9b87f5;">Contrato de Prestação de Serviços</h1>
  <p>Entre a <strong>CLÍNICA</strong> e o(a) <strong>PACIENTE/CONTRATANTE</strong> {{nome_paciente}}, CPF {{cpf}}, firma-se o presente contrato:</p>
  <h3>1. Objeto</h3>
  <p>Contratação de serviços de saúde estética conforme procedimentos e valores acordados.</p>
  <h3>2. Valor e Forma de Pagamento</h3>
  <p>_________________________________________</p>
  <h3>3. Obrigações da Clínica</h3>
  <p>Prestar os serviços com zelo técnico e ético, em ambiente adequado.</p>
  <h3>4. Obrigações do Paciente</h3>
  <p>Fornecer informações verídicas, comparecer nos horários agendados e respeitar as orientações.</p>
  <p><strong>Data:</strong> {{data}}</p>
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
