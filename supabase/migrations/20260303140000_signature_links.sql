-- Links temporários para assinatura (token único, expiração 24–48h)
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
CREATE POLICY "signature_links_own" ON public.signature_links FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
