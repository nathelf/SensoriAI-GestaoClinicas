-- Gerenciamento de Usuários para Admin
-- 1. RPC para listar todos os usuários (JOIN auth.users, profiles, user_roles, usuario_clinica)
-- 2. Policy para admin ler todas as clínicas e vínculos (bypass quando admin não tem usuario_clinica)

-- RPC: Retorna lista completa de usuários (apenas para admins)
CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE (
  user_id uuid,
  email text,
  display_name text,
  clinic_name text,
  clinica_vinculada text,
  role text,
  subscription_active boolean,
  trial_expires_at timestamptz,
  is_suspended boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT 
    u.id AS user_id,
    u.email::text,
    p.display_name,
    p.clinic_name,
    (
      SELECT cc.nome_clinica
      FROM public.usuario_clinica uc
      JOIN public.clinica_config cc ON cc.id = uc.clinica_id
      WHERE uc.user_id = u.id
      LIMIT 1
    ) AS clinica_vinculada,
    (SELECT ur2.role::text FROM public.user_roles ur2 WHERE ur2.user_id = u.id ORDER BY (ur2.role = 'admin') DESC LIMIT 1) AS role,
    COALESCE(p.subscription_active, false) AS subscription_active,
    p.trial_expires_at,
    COALESCE(p.is_suspended, false) AS is_suspended,
    u.created_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE public.has_role(auth.uid(), 'admin'::public.app_role)
  ORDER BY u.created_at DESC;
$$;

-- Permissão para authenticated chamar a função
GRANT EXECUTE ON FUNCTION public.get_all_users_for_admin() TO authenticated;

-- Policy: Admin pode ler todas as clínicas (bypass para admin sem usuario_clinica)
DROP POLICY IF EXISTS "Admins can read all clinics" ON public.clinica_config;
CREATE POLICY "Admins can read all clinics" ON public.clinica_config
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Policy: Admin pode ler todos os vínculos usuario_clinica
DROP POLICY IF EXISTS "Admins can read all usuario_clinica" ON public.usuario_clinica;
CREATE POLICY "Admins can read all usuario_clinica" ON public.usuario_clinica
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Policy: Admin pode ler todos os perfis de acesso (para modal de criar usuário)
DROP POLICY IF EXISTS "Admins can read all perfis_acesso" ON public.perfis_acesso;
CREATE POLICY "Admins can read all perfis_acesso" ON public.perfis_acesso
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
