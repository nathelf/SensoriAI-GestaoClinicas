import { SensoriAILogo } from "@/components/SensoriAILogo";
import { cn } from "@/lib/utils";

/** Rodapé padrão das telas da landing (Landing, Sobre, etc.) — fino e delicado */
export function LandingFooter({ className, compact }: { className?: string; compact?: boolean } = {}) {
  return (
    <footer className={cn("relative z-10 border-t border-border/50 py-5 bg-card/50 backdrop-blur-sm shrink-0 shadow-[0_-1px_0_0_hsl(var(--border)/0.5)] flex flex-col items-center justify-center text-center", className)}>
      <div className="flex flex-col items-center justify-center w-full">
        <div className="flex items-center justify-center gap-2 mb-2">
          <SensoriAILogo variant="full" iconClassName={compact ? "w-4 h-4" : "w-5 h-5"} />
        </div>
        <p className={cn("text-foreground/75", compact ? "text-[12px]" : "text-sm")}>
          © 2026 SensoriAI. Desenvolvido para transformar a saúde.
        </p>
      </div>
    </footer>
  );
}
