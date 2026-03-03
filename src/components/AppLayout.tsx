import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { BottomTabBar } from "./BottomTabBar";
import { AnnaChat } from "./AnnaChat";
import { Menu, MessageCircle, LogOut, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

function isEmailConfirmed(user: { email_confirmed_at?: string | null }): boolean {
  return Boolean(user?.email_confirmed_at);
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, profile, userRole, loading, signOut } = useAuth();

  useEffect(() => {
    if (user && !isEmailConfirmed(user)) {
      signOut();
    }
  }, [user, signOut]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (!isEmailConfirmed(user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="mb-2">E-mail não confirmado. Redirecionando...</p>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  const initials = profile?.display_name
    ? profile.display_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border/30 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <span className="font-bold text-foreground">Sensori</span>
            <span className="font-bold text-primary">AI</span>
          </div>
          <div className="flex-1" />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-pastel-lavender flex items-center justify-center text-xs font-bold text-primary">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-foreground leading-tight">{profile?.display_name || user.email}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{userRole || "user"}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
            </button>

            {profileMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                <div className="absolute right-0 top-12 z-50 w-48 bg-card rounded-2xl shadow-lg border border-border/40 py-2">
                  <a href="/perfil" className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors">
                    <User className="w-4 h-4" /> Meu perfil
                  </a>
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive-foreground hover:bg-muted/60 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      <BottomTabBar />

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/5511999990000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 lg:bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-success hover:opacity-90 text-primary-foreground flex items-center justify-center shadow-lg transition-opacity"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Anna AI Chat */}
      <AnnaChat />
    </div>
  );
}
