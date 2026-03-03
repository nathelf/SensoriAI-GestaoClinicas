import { SensoriAILogo } from "@/components/SensoriAILogo";

/** Rodapé padrão das telas da landing (Landing, Sobre, etc.) — fino e delicado */
export function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-border/50 py-5 bg-card/50 backdrop-blur-sm text-center shrink-0 shadow-[0_-1px_0_0_hsl(var(--border)/0.5)]">
      <div className="flex items-center justify-center gap-2 mb-2">
        <SensoriAILogo variant="full" iconClassName="w-5 h-5" />
      </div>
      <p className="text-muted-foreground text-sm">© 2026 SensoriAI. Desenvolvido para transformar a saúde.</p>
    </footer>
  );
}
