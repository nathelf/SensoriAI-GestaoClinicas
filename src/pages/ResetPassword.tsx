import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { SensoriAILogo } from "@/components/SensoriAILogo";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      navigate("/auth");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Senha atualizada com sucesso!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 min-h-0">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 overflow-hidden">
            <SensoriAILogo variant="icon" iconClassName="w-10 h-10" noTextFallback />
          </div>
          <h1 className="text-xl font-bold text-foreground">Nova senha</h1>
        </div>
        <div className="stat-card !p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nova senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/40 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 outline-none" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50">
              {loading ? "Atualizando..." : "Atualizar senha"}
            </button>
          </form>
        </div>
      </motion.div>
      </div>
      <LandingFooter />
    </div>
  );
}
