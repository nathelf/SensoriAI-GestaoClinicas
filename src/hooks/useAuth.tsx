import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  clinic_name: string | null;
  phone: string | null;
  created_at: string;
  trial_expires_at: string | null;
  subscription_active: boolean;
}

interface UserRole {
  role: "admin" | "user";
}

export type ModulosPermitidos = Record<string, boolean>;

/**
 * Hierarquia de validação (checklist lógico):
 * 1. Admin: ignora assinatura → acesso liberado
 * 2. Assinatura ativa (subscription_active) → acesso liberado
 * 3. Trial: hoje <= trial_expires_at → acesso liberado
 * 4. Caso contrário → sem acesso
 */
function computeHasAccess(profile: Profile | null, userRole: "admin" | "user" | null): boolean {
  if (userRole === "admin") return true;
  if (!profile) return false;
  if (profile.subscription_active) return true;
  if (!profile.trial_expires_at) return false;
  return new Date(profile.trial_expires_at) >= new Date();
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: "admin" | "user" | null;
  loading: boolean;
  /** Se o usuário pode usar o app (trial válido ou assinatura ativa) */
  hasAccess: boolean;
  /** Permissões de módulos baseado no Perfil de Acesso do usuário */
  modulos: ModulosPermitidos;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  userRole: null,
  loading: true,
  hasAccess: false,
  modulos: {},
  signOut: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(null);
  const [modulos, setModulos] = useState<ModulosPermitidos>({});
  const [loading, setLoading] = useState(true);

  /** Garante que o perfil existe no banco e está em sync com auth (email ou Google). Trial 3 dias é definido no trigger ao criar usuário. */
  const ensureUserProfile = async (user: User) => {
    const meta = user.user_metadata ?? {};
    const display_name =
      meta.display_name ?? meta.full_name ?? meta.name ?? user.email ?? null;
    const avatar_url = meta.avatar_url ?? meta.picture ?? null;
    await supabase.from("profiles").upsert(
      { user_id: user.id, display_name, avatar_url },
      { onConflict: "user_id" }
    );
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data);
  };

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();
    setUserRole(data?.role as "admin" | "user" ?? "user");
  };

  const fetchModulos = async (userId: string) => {
    // Busca as permissoes do role atual do usuario na nova estrutura RBAC
    const { data } = await supabase.from("usuario_clinica").select("perfil_acesso_id").eq("user_id", userId).maybeSingle();
    let permissoes: ModulosPermitidos = {};
    if (data && data.perfil_acesso_id) {
      const { data: mods } = await supabase.from("modulos_permissao").select("modulo, acesso_liberado").eq("perfil_acesso_id", data.perfil_acesso_id);
      mods?.forEach(m => permissoes[m.modulo] = m.acesso_liberado);
    } else {
      // Se o usuario for root/owner e nao tiver perfil, damos acesso full
      permissoes = { dashboard: true, agenda: true, prontuarios: true, financeiro: true, estoque: true, configuracoes: true };
    }
    setModulos(permissoes);
  };

  /** Carrega profile e role. Usa maybeSingle para não falhar quando não há linha. Timeout 5s para evitar travamento. */
  const loadUserData = async (user: User) => {
    const timeout = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    try {
      await Promise.race([
        (async () => {
          await ensureUserProfile(user).catch(() => {});
          const [profileRes, roleRes] = await Promise.all([
            supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
            supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
          ]);
          setProfile(profileRes?.data ?? null);
          const role = (roleRes?.data?.role as "admin" | "user") ?? "user";
          setUserRole(role);
          if (role === "admin") {
            setModulos({ dashboard: true, agenda: true, prontuarios: true, financeiro: true, estoque: true, configuracoes: true });
          } else {
            fetchModulos(user.id).catch(() => {});
          }
        })(),
        timeout(5000),
      ]);
    } catch (e) {
      console.warn("loadUserData:", e);
      setProfile(null);
      setUserRole("user");
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session?.user) {
          setProfile(null);
          setUserRole(null);
          setModulos({});
          setLoading(false);
          return;
        }
        await loadUserData(session.user);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        setLoading(false);
        return;
      }
      await loadUserData(session.user);
      setLoading(false);
    }).catch(() => setLoading(false));

    const safetyTimer = setTimeout(() => setLoading(false), 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const signOut = async () => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserRole(null);
    setModulos({});
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, userRole, modulos, loading, hasAccess: computeHasAccess(profile, userRole), signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
