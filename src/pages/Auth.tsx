import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Calendar,
  Stethoscope,
  DollarSign,
  Users,
  Package,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { SensoriAILogo } from "@/components/SensoriAILogo";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { supabase, hasSupabaseConfig } from "@/integrations/supabase/client";
import { toast } from "sonner";

const float = {
  y: [-6, 6, -6],
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const },
};

const floatSlow = {
  y: [-8, 8, -8],
  transition: { duration: 8, repeat: Infinity, ease: "easeInOut" as const },
};

const floatRotate = {
  y: [-5, 5, -5],
  rotate: [-2, 2, -2],
  transition: { duration: 7, repeat: Infinity, ease: "easeInOut" as const },
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const authModules: { icon: LucideIcon | "logo"; label: string; color: string; position: string; animation: "float" | "floatSlow" | "floatRotate" }[] = [
  { icon: Calendar, label: "Agenda", color: "bg-emerald-400/90 text-white shadow-emerald-400/40", position: "top-[12%] left-[8%]", animation: "float" },
  { icon: Stethoscope, label: "Prontuário", color: "bg-blue-400/90 text-white shadow-blue-400/40", position: "top-[25%] right-[5%]", animation: "floatSlow" },
  { icon: "logo", label: "IA", color: "bg-purple-400/90 text-white shadow-purple-400/40", position: "top-[8%] right-[22%]", animation: "floatRotate" },
  { icon: DollarSign, label: "Financeiro", color: "bg-amber-400/90 text-white shadow-amber-400/40", position: "bottom-[30%] left-[4%]", animation: "floatSlow" },
  { icon: Users, label: "Pacientes", color: "bg-rose-400/90 text-white shadow-rose-400/40", position: "bottom-[20%] right-[10%]", animation: "float" },
  { icon: Package, label: "Estoque", color: "bg-cyan-400/90 text-white shadow-cyan-400/40", position: "bottom-[35%] right-[18%]", animation: "floatRotate" },
  { icon: FileText, label: "Relatórios", color: "bg-violet-400/90 text-white shadow-violet-400/40", position: "top-[40%] left-[6%]", animation: "float" },
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const timeoutMs = 15000;
        const signInPromise = supabase.auth.signInWithPassword({ email, password });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Tempo esgotado. Verifique sua conexão e se a URL do Supabase está correta (VITE_SUPABASE_URL).")), timeoutMs)
        );
        const { data, error } = await Promise.race([signInPromise, timeoutPromise]);
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
        if (data?.session) {
          await new Promise((r) => setTimeout(r, 150));
        }
        navigate("/dashboard", { replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail para confirmar.");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro na autenticação";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--pastel-ice))]">
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden min-h-0">
      {/* Gradiente suave pastel de fundo */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--pastel-lavender)/0.6)] via-[hsl(var(--pastel-ice))] to-[hsl(var(--pastel-mint)/0.4)]" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary)/0.06) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary)/0.06) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Orbs pastel com neon suave */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(var(--pastel-lavender))] blur-[100px] opacity-70 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-[hsl(var(--pastel-mint))] blur-[90px] opacity-60 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[hsl(var(--primary)/0.12)] blur-[80px]" />
      </div>

      {/* Ícones dos módulos flutuando */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {authModules.map((mod, i) => (
          <motion.div
            key={mod.label}
            className={`absolute ${mod.position} w-14 h-14 rounded-2xl backdrop-blur-sm border border-white/50 flex items-center justify-center shadow-lg ${mod.color}`}
            style={{
              boxShadow: `0 0 24px -4px hsl(var(--primary)/0.25), 0 8px 20px -8px rgba(0,0,0,0.15)`,
            }}
            animate={mod.animation === "float" ? float : mod.animation === "floatSlow" ? floatSlow : floatRotate}
            transition={{ delay: i * 0.15, duration: mod.animation === "floatSlow" ? 8 : mod.animation === "floatRotate" ? 7 : 6, repeat: Infinity, ease: "easeInOut" }}
          >
            {mod.icon === "logo" ? (
              <SensoriAILogo variant="icon" iconClassName="w-7 h-7" noTextFallback />
            ) : (
              <mod.icon className="w-6 h-6" />
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo com neon pastel */}
        <motion.div {...fadeUp} className="text-center mb-10">
          <motion.div
            animate={float}
            className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6 relative overflow-hidden"
            style={{
              boxShadow: "0 0 40px hsl(var(--primary)/0.4), 0 0 80px hsl(var(--primary)/0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <SensoriAILogo variant="icon" iconClassName="w-14 h-14" noTextFallback />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Sensori
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] via-purple-500 to-[hsl(var(--primary))] bg-[length:200%_auto] animate-gradient">
              AI
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2 tracking-wide">Gestão inteligente para sua clínica</p>
        </motion.div>

        {/* Card glass pastel com neon suave */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative rounded-3xl p-8 pb-8 border border-white/80 bg-white/70 dark:bg-card/80 backdrop-blur-2xl shadow-2xl"
          style={{
            boxShadow: "0 0 0 1px rgba(255,255,255,0.8), 0 0 50px hsl(var(--primary)/0.12), 0 25px 50px -12px rgba(0,0,0,0.08)",
          }}
        >
          {!hasSupabaseConfig && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-900 dark:text-amber-200 text-sm">
              <p className="font-medium mb-1">Banco não configurado</p>
              <p>Defina <code className="bg-black/10 px-1 rounded">VITE_SUPABASE_URL</code> e <code className="bg-black/10 px-1 rounded">VITE_SUPABASE_PUBLISHABLE_KEY</code> no .env (local) ou nas variáveis de ambiente do Vercel e faça redeploy.</p>
            </div>
          )}
          <div className="flex rounded-2xl bg-muted/60 p-1.5 mb-8 border border-border/50">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isLogin
                  ? "bg-white dark:bg-card text-foreground shadow-md border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                !isLogin
                  ? "bg-white dark:bg-card text-foreground shadow-md border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <motion.div variants={fadeUp}>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Nome completo</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Seu nome"
                    required={!isLogin}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25 focus:outline-none transition-all duration-300 shadow-[0_0_0_0_1px_hsl(var(--primary)/0)] focus:shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                  />
                </div>
              </motion.div>
            )}

            <motion.div variants={fadeUp}>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25 focus:outline-none transition-all duration-300 shadow-[0_0_0_0_1px_hsl(var(--primary)/0)] focus:shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/25 focus:outline-none transition-all duration-300 shadow-[0_0_0_0_1px_hsl(var(--primary)/0)] focus:shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {isLogin && (
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-primary hover:underline transition-colors"
              >
                Esqueceu sua senha?
              </button>
            )}

            <motion.div variants={fadeUp}>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] text-primary-foreground bg-gradient-to-r from-[hsl(var(--primary))] to-purple-500 shadow-lg shadow-primary/30 hover:shadow-primary/40"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar conta"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-transparent px-3 text-xs text-muted-foreground">ou</span>
            </div>
          </div>

          <motion.div variants={fadeUp}>
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                      redirectTo: `${window.location.origin}/dashboard`,
                      queryParams: { access_type: "offline", prompt: "consent" },
                    },
                  });
                  if (error) {
                    toast.error(error.message || "Erro ao entrar com Google");
                    return;
                  }
                  if (data?.url) {
                    window.location.href = data.url;
                    return;
                  }
                  toast.error("Resposta inesperada do servidor. Tente novamente.");
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full py-3.5 rounded-xl border border-border bg-card text-foreground font-medium text-sm flex items-center justify-center gap-2.5 hover:bg-muted/50 hover:border-primary/30 transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_24px_hsl(var(--primary)/0.12)]"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {loading ? "Redirecionando..." : "Entrar com Google"}
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
      </div>
      <LandingFooter />
    </div>
  );
}
