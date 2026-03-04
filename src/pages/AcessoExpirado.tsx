import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, CreditCard, MessageCircle, ArrowRight } from "lucide-react";
import { SensoriAILogo } from "@/components/SensoriAILogo";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useAuth } from "@/hooks/useAuth";

/** URL do WhatsApp da SensoriAI para falar com consultor */
const LINK_CONSULTOR = "https://wa.me/5511999990000";

/** Caminho interno da página de assinatura. Altere para URL externa (Stripe checkout) se houver. */
const PATH_ASSINAR = "/auth";

/** Padrão de fundo: gradiente sutil + orbs de saúde/tecnologia (opacidade ~3%) */
const bgPatternStyle = {
  background: `
    radial-gradient(ellipse 80% 50% at 20% 40%, hsl(262 52% 70% / 0.03) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 80% 60%, hsl(210 55% 70% / 0.025) 0%, transparent 50%),
    radial-gradient(ellipse 40% 30% at 50% 80%, hsl(165 40% 70% / 0.02) 0%, transparent 40%),
    linear-gradient(180deg, hsl(220 14% 98.5%) 0%, hsl(220 12% 96%) 100%)
  `,
};

export default function AcessoExpirado() {
  const navigate = useNavigate();
  const { user, hasAccess, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /**
   * Variante A: Usuário tem acesso – botão volta ao painel
   */
  if (hasAccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100/90 dark:from-slate-950 dark:to-slate-900" style={bgPatternStyle}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div
            className="w-full max-w-md rounded-[24px] p-10 text-center animate-fade-in-up
              bg-white/70 dark:bg-card/70 backdrop-blur-[12px]
              border border-white/20 dark:border-white/10
              shadow-[0_8px_32px_rgba(0,0,0,0.08),0_0_1px_rgba(255,255,255,0.1)]"
          >
            <SensoriAILogo variant="full" iconClassName="w-8 h-8" className="justify-center mb-8" />
            <h1 className="text-2xl font-bold font-[700] text-foreground mb-3">Você tem acesso</h1>
            <p className="text-[15px] font-medium text-slate-600 dark:text-slate-400 mb-8">
              Sua assinatura está ativa. Acesse o painel para continuar.
            </p>
            <Link
              to="/dashboard"
              replace
              className="inline-flex items-center justify-center gap-2 w-full sm:min-w-[200px] h-12 px-6 rounded-xl
                bg-primary text-primary-foreground font-semibold
                transition-all duration-300 ease-out
                hover:scale-[1.02] hover:shadow-[0_0_24px_hsl(var(--primary)/0.4)]
                active:scale-[0.98]"
            >
              <ArrowRight className="w-5 h-5" />
              Ir para o painel
            </Link>
          </div>
        </div>
        <LandingFooter compact />
      </div>
    );
  }

  /**
   * Variante B: Acesso expirado – Assinar Plano + Falar com Consultor
   */
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100/90 dark:from-slate-950 dark:to-slate-900" style={bgPatternStyle}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className="w-full max-w-md rounded-[24px] p-10 text-center animate-fade-in-up
              bg-white/70 dark:bg-card/70 backdrop-blur-[12px]
            border border-white/20 dark:border-white/10
            shadow-[0_8px_32px_rgba(0,0,0,0.08),0_0_1px_rgba(255,255,255,0.1)]"
        >
          {/* Ícone de cadeado: círculo com gradiente + animação float */}
          <div
            className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center
              bg-gradient-to-br from-primary/20 via-primary/10 to-purple-500/20
              border border-primary/20
              animate-float"
          >
            <Lock className="w-10 h-10 text-primary" />
          </div>

          <SensoriAILogo variant="full" iconClassName="w-8 h-8" className="justify-center mb-8" />
          <h1 className="text-2xl sm:text-3xl font-bold font-[700] text-foreground mb-4">
            Acesso bloqueado
          </h1>
          <p className="text-[15px] font-medium text-slate-600 dark:text-slate-400 mb-10 max-w-sm mx-auto">
            Seu período de teste ou assinatura expirou. Escolha uma opção abaixo para continuar
            transformando a saúde com a SensoriAI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 w-full sm:min-w-[320px] mx-auto">
            <Link
              to={PATH_ASSINAR}
              className="flex-1 min-w-0 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl
                bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-semibold
                transition-all duration-300 ease-out
                hover:scale-[1.02] hover:shadow-[0_0_28px_hsl(var(--primary)/0.45)]
                active:scale-[0.98]"
            >
              <CreditCard className="w-5 h-5 shrink-0" />
              <span>Assinar plano agora</span>
            </Link>
            <a
              href={LINK_CONSULTOR}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-0 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl
                bg-transparent border-2 border-primary/40 font-semibold text-primary
                transition-all duration-300 ease-out
                hover:bg-primary/5 hover:border-primary/60
                active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              <span>Falar com consultor</span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-8 text-sm font-medium text-slate-500 hover:text-foreground transition-colors"
          >
            Voltar ao site
          </button>
        </div>
      </div>
      <LandingFooter compact className="flex justify-center" />
    </div>
  );
}
