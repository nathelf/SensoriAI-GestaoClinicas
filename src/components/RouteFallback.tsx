/** Fallback mínimo para Suspense (lazy routes) — melhora FCP/LCP */
export function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background" aria-hidden>
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
