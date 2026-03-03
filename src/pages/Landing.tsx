import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  Calendar,
  Stethoscope,
  DollarSign,
  FileText,
  BarChart3,
  Users,
  Package,
  Check,
  ArrowRight,
  Workflow,
  MessageSquare,
  Clock,
  Heart,
  ChevronRight,
  ChevronDown,
  Rocket,
  Activity,
  Bot,
  Instagram,
  Linkedin,
  Twitter,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SensoriAILogo } from "@/components/SensoriAILogo";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeroParticleNetwork } from "@/components/landing/HeroParticleNetwork";
import { LandingCursor } from "@/components/landing/LandingCursor";

// --- Animações Premium ---
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
};
const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const floatAnimation1 = { y: [-15, 15, -15], rotate: [-2, 2, -2], transition: { duration: 6, repeat: Infinity, ease: [0.42, 0, 0.58, 1] as const } };
const floatAnimation2 = { y: [15, -15, 15], rotate: [2, -2, 2], transition: { duration: 7, repeat: Infinity, ease: [0.42, 0, 0.58, 1] as const } };
const floatAnimation3 = { y: [-10, 10, -10], x: [-10, 10, -10], transition: { duration: 8, repeat: Infinity, ease: [0.42, 0, 0.58, 1] as const } };

// --- Dados ---
const systemModules: { icon: LucideIcon; title: string; tagline: string; items: string[]; featured?: boolean; color: string; useLogo?: boolean }[] = [
  { icon: Bot, title: "SensoriAI Lab", tagline: "IA que entra no seu fluxo, não num cantinho.", items: ["Assistente que conversa com o paciente e sugere próximos passos", "Resumos de evolução em um clique", "Análise facial integrada ao prontuário"], featured: true, color: "text-purple-500 bg-purple-500/10", useLogo: true },
  { icon: Stethoscope, title: "Prontuário", tagline: "Histórico que acompanha o paciente de verdade.", items: ["Evolução clínica sem formulário infinito", "Prescrições e laudos no mesmo lugar", "Tudo anexado e rastreável"], color: "text-blue-500 bg-blue-500/10" },
  { icon: Calendar, title: "Agenda", tagline: "Menos buraco na agenda, menos no-show.", items: ["Vários profissionais, uma agenda só", "Lembrete e confirmação por WhatsApp", "Encaixe sem quebrar a cabeça"], color: "text-emerald-500 bg-emerald-500/10" },
  { icon: DollarSign, title: "Financeiro", tagline: "Caixa e faturamento sem surpresa no fim do mês.", items: ["Fluxo de caixa na palma da mão", "Split de pagamento entre equipe", "Menos glosa, mais previsibilidade"], color: "text-amber-500 bg-amber-500/10" },
  { icon: Users, title: "Pacientes", tagline: "Quem está frio, quem está quente — e quem merece um retorno.", items: ["Régua de relacionamento que você entende", "Aniversariantes e campanhas na hora", "Taxa de retorno em um clique"], color: "text-rose-500 bg-rose-500/10" },
  { icon: Package, title: "Estoque", tagline: "Produto que não some no meio do mês.", items: ["Baixa no atendimento, sem planilha paralela", "Aviso antes de acabar o produto", "Inventário que fecha sem drama"], color: "text-cyan-500 bg-cyan-500/10" },
];

/** Demonstração interativa: arrastar do ponto roxo do bloco de cima até o de baixo para “conectar” */
const DROP_RADIUS_PX = 56;

function RelatoriosDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceDotRef = useRef<HTMLDivElement>(null);
  const targetDotRef = useRef<HTMLDivElement>(null);
  const [connected, setConnected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);

  const getPosInContainer = useCallback((el: HTMLElement | null) => {
    if (!el || !containerRef.current) return null;
    const cr = containerRef.current.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    return { x: er.left - cr.left + er.width / 2, y: er.top - cr.top + er.height / 2 };
  }, []);

  const startDrag = useCallback(() => {
    const pos = getPosInContainer(sourceDotRef.current);
    if (pos) {
      setIsDragging(true);
      setDragPos(pos);
      posRef.current = pos;
    }
  }, [getPosInContainer]);

  useEffect(() => {
    if (!isDragging) return;
    const target = targetDotRef.current;
    const targetCenter = target ? getPosInContainer(target) : null;

    const flushPos = () => {
      rafIdRef.current = null;
      setDragPos({ ...posRef.current });
    };

    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      if (targetCenter) {
        const dist = Math.hypot(mx - targetCenter.x, my - targetCenter.y);
        if (dist <= DROP_RADIUS_PX) {
          posRef.current = targetCenter;
          if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
          setDragPos(targetCenter);
          return;
        }
      }
      posRef.current = { x: mx, y: my };
      if (rafIdRef.current === null) rafIdRef.current = requestAnimationFrame(flushPos);
    };
    const onUp = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      if (targetCenter) {
        const dist = Math.hypot(mx - targetCenter.x, my - targetCenter.y);
        if (dist <= DROP_RADIUS_PX) setConnected(true);
      }
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      setIsDragging(false);
      setDragPos(null);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isDragging, getPosInContainer]);

  const lineStart = getPosInContainer(sourceDotRef.current);
  const targetCenter = getPosInContainer(targetDotRef.current);
  const lineEnd = connected ? targetCenter : dragPos;
  const showLine = (isDragging && dragPos) || connected;
  const canDraw = showLine && lineStart && lineEnd;

  return (
    <div ref={containerRef} className="lg:col-span-3 relative h-[450px] rounded-2xl bg-[#F8F9FB] dark:bg-muted/10 border border-border overflow-hidden cursor-auto">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
      {!connected && !isDragging && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground z-20">Arraste do ponto roxo até o outro bloco para conectar</p>
      )}
      {/* Linha: posições lidas dos refs para alinhar exatamente nos centros das bolinhas */}
      {canDraw && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: "visible" }}>
          <path
            d={`M ${lineStart.x} ${lineStart.y} C ${lineStart.x + 60} ${lineStart.y}, ${lineEnd.x - 60} ${lineEnd.y}, ${lineEnd.x} ${lineEnd.y}`}
            stroke="#a855f7"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={connected ? "0" : "6 6"}
          />
        </svg>
      )}
      {/* Bloco superior */}
      <div className="absolute top-12 left-10 w-72 bg-white dark:bg-card rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border p-4 z-10">
        <div className="flex items-center gap-3 mb-4">
          <Stethoscope className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-foreground">Histórico do Paciente</span>
        </div>
        <div className="space-y-2.5">
          <div className="h-2 w-full bg-muted/60 rounded-full" />
          <div className="h-2 w-2/3 bg-muted/60 rounded-full" />
        </div>
        <div
          ref={sourceDotRef}
          role="button"
          tabIndex={0}
          onMouseDown={(e) => { e.preventDefault(); startDrag(); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); startDrag(); } }}
          className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow-sm cursor-grab active:cursor-grabbing hover:scale-110 transition-transform pointer-events-auto"
          aria-label="Arraste até o bloco Resumo com IA para conectar"
        />
      </div>
      {/* Bloco inferior */}
      <div className="absolute bottom-16 right-10 w-72 bg-white dark:bg-card rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-border p-4 z-10">
        <div
          ref={targetDotRef}
          className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow-sm pointer-events-none"
          aria-hidden
        />
        <div className="flex items-center gap-3 mb-4">
          <SensoriAILogo variant="icon" iconClassName="w-5 h-5" noTextFallback />
        </div>
        <div className="space-y-2.5">
          <div className="h-2 w-full bg-purple-100 dark:bg-purple-900/30 rounded-full" />
          <div className="h-2 w-full bg-purple-100 dark:bg-purple-900/30 rounded-full" />
          <div className="h-2 w-1/2 bg-purple-100 dark:bg-purple-900/30 rounded-full" />
        </div>
        {connected && (
          <p className="mt-3 text-sm text-primary font-medium">Conectado. É assim que você liga os blocos na plataforma.</p>
        )}
      </div>
    </div>
  );
}

type AssistantChoice = null | "saved" | "declined";

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [assistantChoice, setAssistantChoice] = useState<AssistantChoice>(null);

  /** Posição do mouse para a rede de partículas (repulsão) - atualizada globalmente */
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Orb que segue o mouse (luz neon no fundo)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const orbX = useSpring(mouseX, springConfig);
  const orbY = useSpring(mouseY, springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mousePosRef.current = { x: clientX, y: clientY };
    mouseX.set((clientX - innerWidth / 2) * 0.25);
    mouseY.set((clientY - innerHeight / 2) * 0.25);
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [user, loading, navigate]);

  useEffect(() => {
    const onGlobalMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onGlobalMouseMove);
    return () => window.removeEventListener("mousemove", onGlobalMouseMove);
  }, []);

  if (loading) return null;

  return (
    <div
      className="min-h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20 cursor-none"
      onMouseEnter={() => setCursorVisible(true)}
      onMouseLeave={() => setCursorVisible(false)}
    >
      <LandingCursor visible={cursorVisible} />

      {/* --- Hero background: grid + rede de partículas + orb --- */}
      <div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.06)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,hsl(var(--primary)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.08)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black_40%,transparent_100%)]" />
        <HeroParticleNetwork mousePosRef={mousePosRef} />
        {/* Orb suave que segue o cursor - discreto em ambos os temas */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 w-[70vmin] h-[70vmin] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20 dark:opacity-25"
          style={{
            x: orbX,
            y: orbY,
            background: "radial-gradient(circle, hsl(var(--primary)/0.35) 0%, hsl(var(--primary)/0.15) 45%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <div className="absolute top-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-primary/5 dark:bg-primary/10 blur-[100px] animate-pulse" />
        <div className="absolute top-[25%] right-[-5%] w-[30vw] h-[30vw] rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-[100px] animate-pulse" style={{ animationDuration: "4s", animationDirection: "reverse" }} />
      </div>

      {/* Menu Social lateral fixo (visível apenas xl+) */}
      <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-5" aria-label="Redes sociais">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10" aria-label="Instagram">
          <Instagram className="w-5 h-5" />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10" aria-label="LinkedIn">
          <Linkedin className="w-5 h-5" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10" aria-label="Twitter">
          <Twitter className="w-5 h-5" />
        </a>
      </nav>

      {/* --- Header --- */}
      <header className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500 border-b",
        scrolled ? "bg-background/80 backdrop-blur-xl border-border/50 shadow-sm py-3" : "bg-transparent border-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <SensoriAILogo variant="full" iconClassName="w-10 h-10" className="group-hover:opacity-90 transition-opacity" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/sobre" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Como trabalhamos</Link>
            <a href="#plataforma" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Recursos Personalizados
            </a>
            <a href="#relatorios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Relatórios em Blocos</a>
            <a href="#suporte" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Suporte</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth"><Button variant="ghost" className="hidden sm:inline-flex font-medium">Entrar</Button></Link>
            <Link to="/auth">
              <Button className="rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 gap-2 px-6 relative overflow-hidden group">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                Teste Grátis <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-24 sm:pt-32">
        {/* --- Hero Section (Dark Mode Premium): orb segue o mouse nesta área --- */}
        <section
          className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-visible"
          onMouseMove={handleMouseMove}
        >
          
          {/* Blocos Flutuantes Premium (Efeito Glassmorphism 3D) */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block z-0">
            <motion.div animate={floatAnimation1} className="absolute top-[20%] left-[10%] w-56 p-4 rounded-2xl bg-white/60 dark:bg-card/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Calendar className="w-6 h-6 text-emerald-600" /></div>
              <div>
                <div className="h-2 w-16 bg-muted-foreground/20 rounded-full mb-2" />
                <div className="h-2 w-24 bg-muted-foreground/20 rounded-full" />
              </div>
            </motion.div>

            <motion.div animate={floatAnimation2} className="absolute top-[40%] right-[8%] w-64 p-5 rounded-2xl bg-white/60 dark:bg-card/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Activity className="w-6 h-6 text-primary" /></div>
               <div className="flex-1">
                 <div className="flex justify-between items-end mb-2">
                   <div className="h-3 w-12 bg-primary/40 rounded-sm" />
                   <div className="h-6 w-8 bg-primary/20 rounded-sm" />
                 </div>
                 <div className="flex justify-between items-end">
                   <div className="h-3 w-16 bg-muted-foreground/20 rounded-sm" />
                   <div className="h-8 w-8 bg-primary/60 rounded-sm" />
                 </div>
               </div>
            </motion.div>

            <motion.div animate={floatAnimation3} className="absolute bottom-[20%] left-[15%] w-48 p-4 rounded-2xl bg-white/60 dark:bg-card/60 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Bot className="w-5 h-5 text-primary" /></div>
               <div className="h-2.5 w-20 bg-primary/30 rounded-full" />
            </motion.div>
          </div>

          <div className="max-w-5xl mx-auto text-center relative z-10 mt-10">
            {/* Banner: Plataforma ativa • +2.400 clínicas confiam */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: "spring" }} className="inline-flex items-center gap-2.5 rounded-full bg-foreground/10 dark:bg-foreground/5 border border-border/50 backdrop-blur-md px-5 py-2.5 text-sm font-medium text-foreground mb-8 shadow-sm cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Plataforma personalizada para o seu fluxo de trabalho
            </motion.div>
            
            {/* Título: "Sua clínica." / "Suas regras." (gradiente) / "Seu futuro." */}
            <motion.h1 variants={staggerContainer} initial="initial" animate="animate" className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[1.05]">
              <motion.span variants={fadeUp} className="block">Sua clínica.</motion.span>
              <motion.span
                variants={fadeUp}
                className="block mt-2 text-transparent bg-clip-text bg-[linear-gradient(90deg,#6b21a8_0%,#7e22ce_35%,#a855f7_65%,#a855f7_100%)] bg-[length:200%_auto] animate-gradient drop-shadow-[0_0_20px_rgba(168,85,247,0.25)] dark:drop-shadow-[0_0_28px_rgba(168,85,247,0.4)]"
              >
                Suas regras.
              </motion.span>
              <motion.span variants={fadeUp} className="block mt-2">Seu futuro.</motion.span>
            </motion.h1>
            
            <motion.p {...fadeUp} transition={{ delay: 0.2, duration: 0.8 }} className="mt-8 text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              Liberte-se de softwares engessados. <strong className="font-semibold text-foreground">Arraste blocos, conecte dados</strong> e crie uma plataforma gerencial desenhada para o seu fluxo com IA nativa. <strong className="font-semibold text-foreground">Modelo customizado</strong> para o que sua clínica precisa.
            </motion.p>
            
            <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.8 }} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth" className="w-full sm:w-auto relative group inline-flex order-2 sm:order-1">
                <motion.span
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full sm:w-auto h-14 px-8 text-base rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors gap-2.5 font-semibold flex items-center justify-center cursor-pointer shadow-lg shadow-primary/25"
                >
                  <Rocket className="w-4 h-4" /> Iniciar gratuitamente
                </motion.span>
              </Link>
              <a href="#relatorios" className="w-full sm:w-auto order-1 sm:order-2">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 rounded-full border-foreground/30 bg-foreground/5 hover:bg-foreground/10 text-foreground gap-2.5 font-semibold">
                  Ver demonstração <ChevronDown className="w-4 h-4" />
                </Button>
              </a>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.35, duration: 0.8 }} className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm font-medium text-foreground">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Sem cartão de crédito
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Cancele quando quiser
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Suporte humanizado e especializado 24/7
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Dados protegidos (LGPD)
              </span>
            </motion.div>
          </div>

          {/* Faixa integrações: 4 blocos de 25% cada = loop sem espaço em branco */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="group absolute bottom-4 left-0 right-0 w-full overflow-hidden border-y border-border/20 bg-background/30 backdrop-blur-md py-3">
            <div className="flex w-[400%] landing-marquee will-change-transform">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="shrink-0 w-1/4 flex items-center justify-evenly opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="shrink-0 text-sm font-bold uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 shrink-0"/> Relatórios Automatizados </span>
                  <span className="shrink-0 text-sm font-bold uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"/> Agenda Dinâmica </span>
                  <span className="shrink-0 text-sm font-bold uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"/> Prontuários Inteligentes</span>
                  <span className="shrink-0 text-sm font-bold uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 shrink-0"/> Integração com IA Personalizada </span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* --- Destaque: Relatórios Drag & Drop --- */}
        <section id="relatorios" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">Relatórios que você <span className="text-primary">desenha</span></h2>
              <p className="mt-4 text-xl text-muted-foreground">Conecte fontes de dados visualmente e gere insights com arrastar e soltar.</p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
              className="relative rounded-[2rem] overflow-hidden border border-border/60 bg-white/50 dark:bg-card/40 backdrop-blur-3xl p-8 lg:p-12 shadow-2xl"
            >
              <div className="grid lg:grid-cols-5 gap-12 items-center relative z-10">
                <div className="lg:col-span-2 space-y-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 mb-2">
                    <Workflow className="w-7 h-7" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground leading-tight">
                    Conecte blocos e deixe a IA gerar o relatório.
                  </h3>
                  <p className="text-muted-foreground">Arraste do ponto roxo abaixo para ligar os blocos e ver como funciona.</p>
                  <ul className="space-y-5">
                    {[
                      "Vincule Histórico do Paciente à nossa IA para enriquecer relatórios.",
                      "Resumos narrativos em PDF em um clique.",
                      "Templates reutilizáveis para toda a equipe.",
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-lg text-foreground/80 font-medium">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <RelatoriosDemo />
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- Recursos / O que sua clínica ganha --- */}
        <section id="plataforma" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                O que sua clínica ganha na prática
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Cada módulo resolve um pedaço do seu dia — da agenda ao caixa, do prontuário ao estoque. A IA não fica num cantinho: ela entra no meio do processo.
              </p>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "0px 0px -80px 0px", amount: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {systemModules.map((mod, i) => (
                <motion.div
                  key={`${mod.title}-${i}`}
                  variants={fadeUp}
                  className={cn(
                    "group rounded-2xl p-6 sm:p-7 transition-all duration-300 border bg-card/80 backdrop-blur-sm",
                    "hover:-translate-y-1 hover:shadow-lg hover:border-primary/30",
                    mod.featured && "ring-1 ring-primary/20 border-primary/30 bg-gradient-to-br from-purple-500/5 to-transparent"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-5", mod.color)}>
                    {mod.useLogo ? <SensoriAILogo variant="icon" iconClassName="w-7 h-7" noTextFallback /> : <mod.icon className="w-6 h-6" />}
                  </div>
                  <h3 className="text-xl font-bold text-foreground tracking-tight">{mod.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground font-medium leading-snug">{mod.tagline}</p>
                  <ul className="mt-4 space-y-2.5">
                    {mod.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground group-hover:text-foreground/90 transition-colors">
                        <ChevronRight className="w-4 h-4 text-primary/60 shrink-0 mt-0.5" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* --- SEÇÃO SUPORTE (Focado em IA Humanizada) --- */}
        <section id="suporte" className="py-32 bg-primary/5 border-y border-border/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", bounce: 0.5 }} className="inline-flex w-16 h-16 rounded-full bg-white dark:bg-card shadow-md items-center justify-center mb-8 p-2">
                  <SensoriAILogo variant="icon" iconClassName="w-10 h-10" noTextFallback />
                </motion.div>
                <motion.h2 variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-6">
                  Suporte <span className="text-primary">humanizado</span>, movido a Inteligência Artificial.
                </motion.h2>
                <motion.p variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Esqueça as filas de espera de call centers. Nossa IA foi treinada com a essência do nosso time: ela resolve problemas, cria alertas e tira dúvidas em segundos, de forma natural e precisa.
                </motion.p>
                <motion.div variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3 bg-white dark:bg-card px-5 py-4 rounded-2xl shadow-sm border border-border hover:shadow-md transition-all">
                    <Zap className="w-8 h-8 text-yellow-500" /> {/* Ícone de raio = velocidade */}
                    <div>
                      <div className="font-bold text-lg">&lt; 3 seg</div>
                      <div className="text-sm text-muted-foreground">Tempo de resposta</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white dark:bg-card px-5 py-4 rounded-2xl shadow-sm border border-border hover:shadow-md transition-all">
                    <Heart className="w-8 h-8 text-rose-500" />
                    <div>
                      <div className="font-bold text-lg">Resolução 24/7</div>
                      <div className="text-sm text-muted-foreground">Sem fila de espera</div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Mockup Chat IA */}
              <div className="relative">
                <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7 }} className="bg-white dark:bg-card rounded-[2rem] shadow-2xl border border-border overflow-hidden">
                  
                  {/* Header do Chat IA */}
                  <div className="bg-muted/30 px-6 py-4 border-b border-border flex items-center justify-between relative z-20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-inner overflow-hidden">
                         <SensoriAILogo variant="icon" iconClassName="w-6 h-6" noTextFallback />
                      </div>
                      <div>
                        <div className="font-bold text-sm">SensoriAI - Assistente Virtual</div>
                        <div className="text-xs text-primary flex items-center gap-1 font-medium">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                          Processando requisições...
                        </div>
                      </div>
                    </div>
                    {/* Badge de IA no topo direito */}
                    <div className="hidden sm:flex text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">
                      Powered by AI
                    </div>
                  </div>

                  {/* Corpo do Chat Animado */}
                  <div className="p-6 flex flex-col gap-4 bg-[#F8F9FB] dark:bg-background/50 h-[300px] overflow-hidden relative z-10">
                    
                    {/* Mensagem 1 (Usuário) */}
                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.5 }} className="self-end bg-foreground text-background px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[80%] text-sm shadow-md origin-bottom-right">
                      Preciso gerar um relatório de faturamento do mês passado agrupado por convênio, como eu faço?
                    </motion.div>
                    
                    {/* Indicador de Digitação IA (Rápido) */}
                    <motion.div initial={{ opacity: 0, y: 10, display: "none" }} whileInView={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10], display: ["flex", "flex", "flex", "none"] }} viewport={{ once: true }} transition={{ duration: 1.5, times: [0, 0.1, 0.9, 1], delay: 1 }} className="self-start bg-white dark:bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm gap-1.5 items-center h-[42px] origin-bottom-left">
                      <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.4, delay: 0 }} />
                      <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.4, delay: 0.1 }} />
                      <motion.div className="w-1.5 h-1.5 bg-primary rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.4, delay: 0.2 }} />
                    </motion.div>
                    
                    {/* Mensagem 2 (Resposta IA) */}
                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 2.5 }} className="self-start bg-white dark:bg-card border border-primary/20 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%] text-sm shadow-sm flex flex-col gap-2 origin-bottom-left">
                       <div className="flex items-center gap-2 mb-1">
                         <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                           <SensoriAILogo variant="icon" iconClassName="w-4 h-4" noTextFallback />
                         </div>
                         <span className="font-semibold text-primary text-xs uppercase tracking-wide">Ação pronta</span>
                       </div>
                      <p className="text-foreground leading-relaxed">
                        {assistantChoice === null && "Eu montei o modelo para você! Arraste o bloco "}
                        {assistantChoice === null && <><strong>"Faturamento Consolidado"</strong> para a tela e conecte com o bloco <strong>"Filtro por Convênio"</strong>. Quer que eu salve esse template na sua galeria?</>}
                        {assistantChoice === "saved" && "Template salvo na sua galeria! Em Relatórios você encontra esse modelo pronto para usar quando quiser."}
                        {assistantChoice === "declined" && "Sem problemas. O modelo continua disponível para você montar o relatório quando quiser."}
                      </p>
                      
                      {assistantChoice === null ? (
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setAssistantChoice("saved")}
                            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all"
                          >
                            Sim, salvar
                          </button>
                          <button
                            type="button"
                            onClick={() => setAssistantChoice("declined")}
                            className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-medium cursor-pointer hover:bg-muted/80 active:scale-[0.98] transition-all"
                          >
                            Não, obrigado
                          </button>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-primary font-medium flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          {assistantChoice === "saved" ? "Salvo na galeria" : "Entendido"}
                        </p>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* Efeito luminoso radial de fundo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 to-purple-500/10 blur-[80px] -z-10 rounded-full opacity-70 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* --- CTA Final --- */}
        <section className="py-32 relative text-center px-4">
          <h2 className="text-5xl font-black text-foreground mb-6">Pronto para a evolução?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Junte-se às clínicas que estão automatizando processos e focando no que importa: o paciente.
          </p>
          <Link to="/auth">
            <Button size="lg" className="h-16 px-12 text-lg rounded-full shadow-2xl shadow-primary/40 hover:scale-105 hover:shadow-primary/60 transition-all duration-300 gap-3">
              Criar conta gratuita agora <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-border py-12 bg-card text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <SensoriAILogo variant="full" iconClassName="w-6 h-6" />
        </div>
        <p className="text-muted-foreground">© 2026 SensoriAI. Desenvolvido para transformar a saúde.</p>
      </footer>
    </div>
  );
}