-- Corrige recursão infinita nas políticas RLS entre clinica_config e usuario_clinica.
-- Usa funções SECURITY DEFINER para bypass de RLS nas verificações.

-- Função: usuário pode ler esta clínica? (owner OU tem vínculo em usuario_clinica)
-- SECURITY DEFINER permite ler as tabelas sem disparar RLS nas subqueries
CREATE OR REPLACE FUNCTION public.user_can_read_clinica(_clinica_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinica_config c WHERE c.id = _clinica_id AND c.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.usuario_clinica uc WHERE uc.clinica_id = _clinica_id AND uc.user_id = auth.uid()
  );
$$;

-- Função: usuário pode gerenciar (ALL) este vínculo usuario_clinica?
-- Owner da clínica pode gerenciar todos os vínculos dessa clínica
CREATE OR REPLACE FUNCTION public.user_can_manage_usuario_clinica(_clinica_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinica_config c WHERE c.id = _clinica_id AND c.owner_id = auth.uid()
  );
$$;

-- Função: usuário pode ler perfis desta clínica?
CREATE OR REPLACE FUNCTION public.user_can_read_perfis_clinica(_clinica_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinica_config c WHERE c.id = _clinica_id AND c.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.usuario_clinica uc WHERE uc.clinica_id = _clinica_id AND uc.user_id = auth.uid()
  );
$$;

-- Função: usuário é owner desta clínica? (para perfis e modulos)
CREATE OR REPLACE FUNCTION public.user_is_clinica_owner(_clinica_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.clinica_config c WHERE c.id = _clinica_id AND c.owner_id = auth.uid()
  );
$$;

-- ========== RECRIAR POLÍTICAS SEM RECURSÃO ==========

-- clinica_config
DROP POLICY IF EXISTS "Usuários leem a clinica que pertencem" ON public.clinica_config;
CREATE POLICY "Usuários leem a clinica que pertencem" ON public.clinica_config
  FOR SELECT TO authenticated
  USING (public.user_can_read_clinica(id));

-- usuario_clinica
DROP POLICY IF EXISTS "Owner le e gerencia funcionarios da clinica" ON public.usuario_clinica;
CREATE POLICY "Owner le e gerencia funcionarios da clinica" ON public.usuario_clinica
  FOR ALL USING (public.user_can_manage_usuario_clinica(clinica_id));

-- perfis_acesso
DROP POLICY IF EXISTS "Usuario le perfis da sua clinica" ON public.perfis_acesso;
CREATE POLICY "Usuario le perfis da sua clinica" ON public.perfis_acesso
  FOR SELECT TO authenticated
  USING (public.user_can_read_perfis_clinica(clinica_id));

DROP POLICY IF EXISTS "Owner le e edita perfis de sua clinica" ON public.perfis_acesso;
CREATE POLICY "Owner le e edita perfis de sua clinica" ON public.perfis_acesso
  FOR ALL USING (public.user_is_clinica_owner(clinica_id));

-- Função: usuário pode acessar este perfil_acesso_id? (evita recursão ao ler perfis_acesso)
CREATE OR REPLACE FUNCTION public.user_can_access_perfil(_perfil_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfis_acesso pa
    WHERE pa.id = _perfil_id
      AND (pa.clinica_id IN (SELECT id FROM public.clinica_config WHERE owner_id = auth.uid())
           OR EXISTS (SELECT 1 FROM public.usuario_clinica uc WHERE uc.clinica_id = pa.clinica_id AND uc.user_id = auth.uid()))
  );
$$;

-- modulos_permissao (usa função que lê perfis_acesso sem disparar RLS)
DROP POLICY IF EXISTS "Owner le e edita permissoes dos perfis de sua clinica" ON public.modulos_permissao;
CREATE POLICY "Owner le e edita permissoes dos perfis de sua clinica" ON public.modulos_permissao
  FOR ALL USING (public.user_can_access_perfil(perfil_acesso_id));

DROP POLICY IF EXISTS "Usuario le as permissoes da clinica" ON public.modulos_permissao;
CREATE POLICY "Usuario le as permissoes da clinica" ON public.modulos_permissao
  FOR SELECT USING (public.user_can_access_perfil(perfil_acesso_id));
