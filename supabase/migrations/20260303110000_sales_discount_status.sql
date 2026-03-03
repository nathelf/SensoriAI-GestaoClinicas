-- Adicionar discount e status à tabela sales (Vendas)
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS discount DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'finalizada';
