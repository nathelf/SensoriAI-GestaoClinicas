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
}

interface UserRole {
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: "admin" | "user" | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  userRole: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(null);
  const [loading, setLoading] = useState(true);

  /** Garante que o perfil existe no banco e está em sync com auth (email ou Google). */
  const ensureUserProfile = async (user: User) => {
    const meta = user.user_metadata ?? {};
    const display_name =
      meta.display_name ?? meta.full_name ?? meta.name ?? user.email ?? null;
    const avatar_url = meta.avatar_url ?? meta.picture ?? null;
    await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        display_name,
        avatar_url,
      },
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          try {
            await ensureUserProfile(session.user);
          } catch (_) {
            // upsert pode falhar se RLS não permitir; o trigger já criou o perfil
          }
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchRole(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          await ensureUserProfile(session.user);
        } catch (_) {}
        fetchProfile(session.user.id);
        fetchRole(session.user.id);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

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
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, userRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
