-- ============================================================
-- SensoriAI - Patch: tabelas/colunas que podem estar faltando
-- Execute no SQL Editor do Supabase (Run). Pode rodar mais de uma vez.
-- ============================================================

-- 1) Relatórios personalizados – modelos salvos (evita PGRST205)
CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  layout_json JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "report_templates_own" ON public.report_templates;
CREATE POLICY "report_templates_own" ON public.report_templates FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
-- Trigger opcional (requer função update_updated_at_column)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_report_templates_updated_at ON public.report_templates;
    CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON public.report_templates
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 2) Vendas – colunas discount e status
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS discount DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'finalizada';

-- 3) Documentos da clínica – flag is_template
ALTER TABLE public.clinic_documents ADD COLUMN IF NOT EXISTS is_template BOOLEAN NOT NULL DEFAULT false;

-- 4) Links de assinatura (assinatura por link)
CREATE TABLE IF NOT EXISTS public.signature_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.clinic_documents(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_signature_links_token ON public.signature_links(token);
CREATE INDEX IF NOT EXISTS idx_signature_links_expires ON public.signature_links(expires_at);
ALTER TABLE public.signature_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "signature_links_own" ON public.signature_links;
CREATE POLICY "signature_links_own" ON public.signature_links FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 5) Documentos assinados (evidência da assinatura)
CREATE TABLE IF NOT EXISTS public.signed_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.clinic_documents(id) ON DELETE SET NULL,
  patient_name TEXT,
  original_content TEXT NOT NULL,
  signature_image_base64 TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'SIGNED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.signed_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "signed_documents_own" ON public.signed_documents;
CREATE POLICY "signed_documents_own" ON public.signed_documents FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 6) Auth: perfil com nome e avatar para Google/OAuth (display_name, avatar_url)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.email
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  INSERT INTO public.users_onboarding (user_id) VALUES (NEW.id);
  RETURN NEW;
END; $$;

-- 7) Pacientes – colunas clínicas para relatório médico (estilo Clinicarx)
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS tipo_sanguineo TEXT CHECK (tipo_sanguineo IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  ADD COLUMN IF NOT EXISTS alergias TEXT,
  ADD COLUMN IF NOT EXISTS observacoes_clinicas TEXT,
  ADD COLUMN IF NOT EXISTS endereco_completo TEXT,
  ADD COLUMN IF NOT EXISTS responsavel_nome TEXT,
  ADD COLUMN IF NOT EXISTS responsavel_cpf TEXT;
