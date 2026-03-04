-- Adiciona uma flag de suspensão na tabela profiles para refletir na UI o status de banimento do Auth.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;
