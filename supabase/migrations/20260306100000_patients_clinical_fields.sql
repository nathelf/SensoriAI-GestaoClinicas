-- Expansão da tabela patients para relatório médico profissional (estilo Clinicarx)
-- Adiciona colunas essenciais para prontuário e relatório SensoriAI

-- Campos clínicos e identificação completa
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS tipo_sanguineo TEXT CHECK (tipo_sanguineo IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  ADD COLUMN IF NOT EXISTS alergias TEXT,
  ADD COLUMN IF NOT EXISTS observacoes_clinicas TEXT,
  ADD COLUMN IF NOT EXISTS endereco_completo TEXT,
  ADD COLUMN IF NOT EXISTS responsavel_nome TEXT,
  ADD COLUMN IF NOT EXISTS responsavel_cpf TEXT;

-- Comentários para documentação e contexto da IA
COMMENT ON COLUMN public.patients.alergias IS 'Lista de alergias relatadas pelo paciente para o relatório médico.';
COMMENT ON COLUMN public.patients.observacoes_clinicas IS 'Campo de texto livre para o parecer da Lorena Analista e memória do histórico.';
COMMENT ON COLUMN public.patients.tipo_sanguineo IS 'Tipo sanguíneo para identificação no cabeçalho do relatório médico.';
COMMENT ON COLUMN public.patients.responsavel_nome IS 'Nome do responsável legal - importante para pacientes menores de idade.';
COMMENT ON COLUMN public.patients.responsavel_cpf IS 'CPF do responsável legal.';
