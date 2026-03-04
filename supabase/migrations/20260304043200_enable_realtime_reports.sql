-- Configurar as tabelas para suportar Realtime no Supabase
-- Habilita REPLICA IDENTITY e adiciona ao publication padrão nativo 'supabase_realtime'

ALTER TABLE public.sales REPLICA IDENTITY FULL;
ALTER TABLE public.appointments REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'sales'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'appointments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
    END IF;
END $$;
