import { useState } from "react";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/sensoriai-logo.png";

export type SensoriAILogoVariant = "full" | "icon";

interface SensoriAILogoProps {
  /** "full" = logo + texto "Sensori AI"; "icon" = só a imagem do logo */
  variant?: SensoriAILogoVariant;
  /** Tamanho do ícone (lado do quadrado ou altura da img). Ex: "h-6 w-6", "h-8 w-8", "h-10 w-10" */
  iconClassName?: string;
  /** Classes no container (flex) */
  className?: string;
  /** Se true, usa apenas a imagem (sem fallback de texto); fallback é imagem quebrada silenciosa */
  noTextFallback?: boolean;
}

/**
 * Logo Sensori AI (imagem roxa: triângulo + círculo + arcos).
 * Coloque o arquivo do logo em public/sensoriai-logo.png.
 */
export function SensoriAILogo({
  variant = "full",
  iconClassName = "h-8 w-8",
  className,
  noTextFallback = false,
}: SensoriAILogoProps) {
  const [imgError, setImgError] = useState(false);
  const useFallback = noTextFallback ? false : imgError;

  if (useFallback) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div
          className={cn(
            "rounded-lg bg-primary flex items-center justify-center flex-shrink-0",
            iconClassName
          )}
        >
          <span className="text-primary-foreground font-bold text-[0.6em] leading-none">
            S
          </span>
        </div>
        {variant === "full" && (
          <span className="font-bold text-foreground tracking-tight">
            Sensori<span className="text-primary">AI</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src={LOGO_SRC}
        alt="Sensori AI"
        width={40}
        height={40}
        fetchPriority="high"
        className={cn(
          "object-contain flex-shrink-0",
          variant === "icon" ? iconClassName : iconClassName,
          "rounded-lg"
        )}
        onError={() => setImgError(true)}
      />
      {variant === "full" && (
        <span className="font-bold text-foreground tracking-tight whitespace-nowrap">
          Sensori<span className="text-primary">AI</span>
        </span>
      )}
    </div>
  );
}
