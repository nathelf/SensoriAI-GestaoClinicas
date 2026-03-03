-- Documentos: flag is_template e tabela de documentos assinados
ALTER TABLE public.clinic_documents ADD COLUMN IF NOT EXISTS is_template BOOLEAN NOT NULL DEFAULT false;

-- signed_documents: documento final assinado com evidências
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
CREATE POLICY "signed_documents_own" ON public.signed_documents FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Permitir leitura pública por link (para página de assinatura compartilhada)
-- Opcional: policy para anon ler por token/link. Por simplicidade, a assinatura pode ser feita logado.
