import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, CreditCard, MessageCircle } from "lucide-react";
import { SensoriAILogo } from "@/components/SensoriAILogo";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

/** Altere para URL da página de planos/pagamento se tiver */
const LINK_CONSULTOR = "https://wa.me/5511999990000";

export default function AcessoExpirado() {
  const navigate = useNavigate();
  const { user, hasAccess, loading } = useAuth();

  // Só redireciona se não estiver logado (para login). Não redireciona para dashboard
  // automaticamente, assim a tela não "fecha sozinha" e o usuário tem tempo de ler.
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

  // Se por acaso tiver acesso (ex.: assinou), mostra link para ir ao dashboard em vez de redirecionar sozinho
  if (hasAccess) {
    return (
      <div className="min-h-screen flex flex-col bg-[hsl(var(--pastel-ice))]">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/80 bg-white/80 dark:bg-card/90 backdrop-blur-2xl shadow-2xl p-8 text-center">
            <SensoriAILogo variant="full" iconClassName="w-8 h-8" className="justify-center mb-4" />
            <h1 className="text-xl font-bold text-foreground mb-2">Você tem acesso</h1>
            <p className="text-muted-foreground mb-6">Sua assinatura está ativa. Acesse o painel para continuar.</p>
            <Button asChild size="lg" className="w-full">
              <Link to="/dashboard">Ir para o painel</Link>
            </Button>
          </div>
        </div>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--pastel-ice))]">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/80 bg-white/80 dark:bg-card/90 backdrop-blur-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-muted border border-border">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <SensoriAILogo variant="full" iconClassName="w-8 h-8" className="justify-center mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Período de teste encerrado</h1>
          <p className="text-muted-foreground mb-8">
            Seu acesso de 3 dias chegou ao fim. Assine agora para continuar usando a SensoriAI na sua clínica ou fale com nosso consultor para um plano sob medida.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              size="lg"
              className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/auth" className="flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" />
                Assinar agora
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="flex-1 gap-2"
            >
              <a href={LINK_CONSULTOR} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5" />
                Falar com consultor
              </a>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Voltar ao site
          </button>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}
