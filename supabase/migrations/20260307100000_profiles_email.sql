-- Adiciona coluna email em profiles para cache rápido (opcional, usada no AdminPanel)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
