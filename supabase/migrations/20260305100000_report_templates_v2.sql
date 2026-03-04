-- Report Templates v2: estrutura flexível + multi-tenant
-- Migra de layout_json para structure, adiciona config, clinic_id, description, is_favorite

-- 0. Criar tabela se não existir (instalação nova)
CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  layout_json JSONB DEFAULT '{"nodes":[],"edges":[]}',
  structure JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}',
  config JSONB DEFAULT '{}',
  description TEXT,
  clinic_id UUID REFERENCES public.clinica_config(id) ON DELETE SET NULL,
  is_favorite BOOLEAN DEFAULT false
);
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;

-- 1. Adicionar novas colunas (se tabela já existe com schema antigo)
ALTER TABLE public.report_templates ADD COLUMN IF NOT EXISTS structure JSONB;
ALTER TABLE public.report_templates ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.report_templates ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.report_templates ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinica_config(id) ON DELETE CASCADE;
ALTER TABLE public.report_templates ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;

-- 2. Migrar layout_json -> structure (se structure vazia e layout_json existe)
UPDATE public.report_templates
SET structure = layout_json
WHERE structure IS NULL AND layout_json IS NOT NULL;

-- 3. Garantir structure NOT NULL
UPDATE public.report_templates SET structure = '{"nodes":[],"edges":[]}'::jsonb WHERE structure IS NULL;
ALTER TABLE public.report_templates ALTER COLUMN structure SET NOT NULL;
ALTER TABLE public.report_templates ALTER COLUMN structure SET DEFAULT '{"nodes":[],"edges":[]}'::jsonb;

-- 4. Remover layout_json (opcional - manter por compatibilidade temporária ou dropar)
-- ALTER TABLE public.report_templates DROP COLUMN IF EXISTS layout_json;

-- 5. Populate clinic_id a partir de usuario_clinica onde possível
UPDATE public.report_templates rt
SET clinic_id = (SELECT clinica_id FROM public.usuario_clinica WHERE user_id = rt.user_id LIMIT 1)
WHERE rt.clinic_id IS NULL;

-- 6. Políticas RLS atualizadas (usuários veem modelos da sua clínica ou próprios)
DROP POLICY IF EXISTS "report_templates_own" ON public.report_templates;
DROP POLICY IF EXISTS "Usuários podem ver apenas os modelos da sua clínica" ON public.report_templates;
DROP POLICY IF EXISTS "Usuários podem criar modelos" ON public.report_templates;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios modelos" ON public.report_templates;

CREATE POLICY "Usuários podem ver modelos próprios ou da clínica"
  ON public.report_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar modelos"
  ON public.report_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios modelos"
  ON public.report_templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios modelos"
  ON public.report_templates FOR DELETE
  USING (auth.uid() = user_id);
