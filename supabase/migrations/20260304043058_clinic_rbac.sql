-- 1. Tabela: clinica_config
CREATE TABLE IF NOT EXISTS public.clinica_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_clinica TEXT NOT NULL,
    assinatura_ativa BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS na clinica_config
ALTER TABLE public.clinica_config ENABLE ROW LEVEL SECURITY;

-- 2. Tabela: perfis_acesso
CREATE TABLE IF NOT EXISTS public.perfis_acesso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID NOT NULL REFERENCES public.clinica_config(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS em perfis_acesso
ALTER TABLE public.perfis_acesso ENABLE ROW LEVEL SECURITY;

-- 3. Tabela: modulos_permissao
CREATE TABLE IF NOT EXISTS public.modulos_permissao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_acesso_id UUID NOT NULL REFERENCES public.perfis_acesso(id) ON DELETE CASCADE,
    modulo TEXT NOT NULL, -- ex: 'dashboard', 'agenda', 'prontuarios', 'financeiro', 'estoque', 'configuracoes'
    acesso_liberado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(perfil_acesso_id, modulo)
);

-- Habilitar RLS em modulos_permissao
ALTER TABLE public.modulos_permissao ENABLE ROW LEVEL SECURITY;

-- 4. Tabela associativa: usuario_clinica
CREATE TABLE IF NOT EXISTS public.usuario_clinica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinica_id UUID NOT NULL REFERENCES public.clinica_config(id) ON DELETE CASCADE,
    perfil_acesso_id UUID REFERENCES public.perfis_acesso(id) ON DELETE SET NULL, -- o owner pode não ter perfil específico e ser root
    status TEXT DEFAULT 'ativo', -- 'ativo', 'inativo', 'pendente'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, clinica_id)
);

-- Habilitar RLS em usuario_clinica
ALTER TABLE public.usuario_clinica ENABLE ROW LEVEL SECURITY;


-- 5. Atualizando a RLS e Políticas

-- Politicas clinica_config
-- Donos podem ler e atualizar sua propria clinica, usuarios vinculados a clinica podem lê-la
CREATE POLICY "Donos gerenciam sua clinica" ON public.clinica_config
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Usuários leem a clinica que pertencem" ON public.clinica_config
    FOR SELECT USING (
        id IN (SELECT clinica_id FROM public.usuario_clinica WHERE user_id = auth.uid())
    );

-- Politicas usuario_clinica
-- Um usuario pode ler/editar os vinculos da propria clinica se for owner ou admin (vamos simplificar que owners veem tudo da clinica)
CREATE POLICY "Owner le e gerencia funcionarios da clinica" ON public.usuario_clinica
    FOR ALL USING (
        clinica_id IN (SELECT id FROM public.clinica_config WHERE owner_id = auth.uid())
    );

CREATE POLICY "Usuario le seu proprio vinculo" ON public.usuario_clinica
    FOR SELECT USING (auth.uid() = user_id);

-- Politicas perfis_acesso
CREATE POLICY "Owner le e edita perfis de sua clinica" ON public.perfis_acesso
    FOR ALL USING (
        clinica_id IN (SELECT id FROM public.clinica_config WHERE owner_id = auth.uid())
    );

CREATE POLICY "Usuario le perfis da sua clinica" ON public.perfis_acesso
    FOR SELECT USING (
        clinica_id IN (SELECT clinica_id FROM public.usuario_clinica WHERE user_id = auth.uid())
    );

-- Politicas modulos_permissao
CREATE POLICY "Owner le e edita permissoes dos perfis de sua clinica" ON public.modulos_permissao
    FOR ALL USING (
        perfil_acesso_id IN (
            SELECT id FROM public.perfis_acesso WHERE clinica_id IN (
                SELECT id FROM public.clinica_config WHERE owner_id = auth.uid()
            )
        )
    );

CREATE POLICY "Usuario le as permissoes da clinica" ON public.modulos_permissao
    FOR SELECT USING (
        perfil_acesso_id IN (
            SELECT id FROM public.perfis_acesso WHERE clinica_id IN (
                SELECT clinica_id FROM public.usuario_clinica WHERE user_id = auth.uid()
            )
        )
    );

-- FUNÇÕES AUXILIARES / TRIGGERS --

-- TRIGGER: Quando um novo profile for criado, e nao tiver clinica assinalada, cria uma clinica default pra ele e um vinculo.
-- Isso mantem compatibilidade retroativa com os usuarios de teste que criam contas diretamente.
CREATE OR REPLACE FUNCTION public.handle_new_user_clinic()
RETURNS TRIGGER AS $$
DECLARE
    new_clinic_id UUID;
    default_role_id UUID;
BEGIN
    -- Se o usuario novo tiver criado uma conta, inicializamos o tenant dele.
    -- (Nota futura: em um fluxo de convite, o usuario seria criado com metadados do convite pra nao criar clinica)
    
    INSERT INTO public.clinica_config (owner_id, nome_clinica, assinatura_ativa)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'clinic_name', 'Minha Clínica'), false)
    RETURNING id INTO new_clinic_id;

    -- Cria um perfil default de admin para essa clinica recem criada
    INSERT INTO public.perfis_acesso (clinica_id, nome, descricao)
    VALUES (new_clinic_id, 'Administrador', 'Acesso total ao sistema')
    RETURNING id INTO default_role_id;

    -- Libera todos os modulos pro Administrador
    INSERT INTO public.modulos_permissao (perfil_acesso_id, modulo, acesso_liberado)
    VALUES 
      (default_role_id, 'dashboard', true),
      (default_role_id, 'agenda', true),
      (default_role_id, 'prontuarios', true),
      (default_role_id, 'financeiro', true),
      (default_role_id, 'estoque', true),
      (default_role_id, 'configuracoes', true);

    -- Vincula o usuario root a clinica e ao perfil de administrador
    INSERT INTO public.usuario_clinica (user_id, clinica_id, perfil_acesso_id, status)
    VALUES (NEW.id, new_clinic_id, default_role_id, 'ativo');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Se o trigger ja existia com outro nome, apagamos pra por esse generalizado
DROP TRIGGER IF EXISTS on_auth_user_created_clinic ON auth.users;

CREATE TRIGGER on_auth_user_created_clinic
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_clinic();
