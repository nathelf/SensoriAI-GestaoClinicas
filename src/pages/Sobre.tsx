import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, ArrowRight, Target, LayoutDashboard, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SensoriAILogo } from "@/components/SensoriAILogo";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export default function Sobre() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased relative overflow-hidden">
      {/* Fundo tecnológico: grid + gradiente + glow */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.06)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.06)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_50%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] max-w-4xl h-[600px] bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[60%] max-w-2xl h-[400px] bg-primary/10 blur-3xl" />
      </div>

      {/* Header — mesmo estilo da Landing */}
      <header className="fixed top-0 w-full z-50 bg-background/80 dark:bg-background/90 backdrop-blur-xl border-b border-border/50 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <SensoriAILogo variant="full" iconClassName="w-10 h-10" className="group-hover:opacity-90 transition-opacity" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <span className="text-sm font-medium text-primary">Como trabalhamos</span>
            <a href="/#plataforma" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Recursos</a>
            <a href="/#relatorios" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Relatórios</a>
            <a href="/#suporte" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Suporte</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth"><Button variant="ghost" className="hidden sm:inline-flex font-medium">Entrar</Button></Link>
            <Link to="/auth">
              <Button className="rounded-full shadow-lg shadow-primary/25 gap-2 px-6">
                Teste Grátis <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero tecnológico */}
          <div className="text-center mb-24">
            <motion.p {...fadeUp} className="text-primary font-semibold uppercase tracking-[0.2em] text-xs mb-6 opacity-90">Sobre a empresa</motion.p>
            <motion.h1 {...fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight max-w-4xl mx-auto tracking-tight">
              Não entregamos apenas tecnologia. Entregamos{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-primary bg-[length:200%_auto] animate-gradient drop-shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                Inteligência Operacional Estratégica
              </span>
              .
            </motion.h1>
            <motion.div {...fadeUp} transition={{ delay: 0.05 }} className="mt-6 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Somos especialistas em ecossistemas de <strong className="text-foreground">IA verticalizada</strong> para transformar a gestão da sua clínica. Combinamos <strong className="text-foreground">Consultoria Personalizada</strong>, <strong className="text-foreground">Agentes Digitais Especializados</strong> e <strong className="text-foreground">Dashboards Inteligentes</strong> — a IA como colaborador de alto nível integrado ao core do seu negócio.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* O problema que resolvemos — card tech */}
            <motion.div {...fadeUp} className="space-y-6">
              <div className="rounded-2xl border border-border/60 bg-card/80 dark:bg-card/60 backdrop-blur-sm p-6 sm:p-8 shadow-lg shadow-primary/5 border-l-4 border-l-primary">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3 tracking-tight">
                  <span className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive font-bold text-sm">!</span>
                  O problema que resolvemos
                </h2>
                <p className="mt-4 text-muted-foreground">Clínicas em crescimento esbarram em quatro gargalos que limitam resultado e escalabilidade:</p>
                <ul className="mt-6 space-y-4">
                  {[
                    { title: "Decisões no escuro", desc: "Métricas espalhadas ou atrasadas — você decide sem visão em tempo real do negócio." },
                    { title: "Sobrecarga operacional", desc: "Muito tempo em tarefas repetitivas e processos manuais que poderiam ser automatizados." },
                    { title: "Dados fragmentados", desc: "Informações em planilhas, e-mails e sistemas que não conversam entre si." },
                    { title: "IA que não entende seu mercado", desc: "Soluções genéricas que não se adaptam à rotina e à linguagem da sua clínica." },
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      className="flex gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground">{item.title}</span>
                        <span className="text-muted-foreground"> — {item.desc}</span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* A Tríade SensoriAI — cards glass com glow */}
            <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="space-y-8">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Como trabalhamos</h2>
              <p className="text-muted-foreground">Três pilares que se reforçam: diagnóstico, operação e inteligência.</p>
              <div className="space-y-5">
                {[
                  { icon: Target, title: "1. Consultoria que desenha sob medida", text: "Cada clínica é única. Mapeamos sua operação, identificamos onde a IA gera mais retorno e desenhamos a solução para a sua dor — sem pacote engessado." },
                  { icon: LayoutDashboard, title: "2. Do quadro geral à tarefa do dia", text: "Conectamos visão estratégica (dashboards e indicadores) à execução no dia a dia (agentes e automações), com suporte técnico especializado no seu segmento." },
                  { icon: Bot, title: "3. IA que fala a língua da sua clínica", text: "Em vez de ferramentas soltas, um ecossistema integrado: IA treinada no seu contexto, menos retrabalho e decisões apoiadas em dados reais." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="flex gap-4 p-5 rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/5 hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1 tracking-tight">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="text-base sm:text-lg font-semibold text-primary text-center sm:text-left tracking-tight">
                SensoriAI: inteligência no seu contexto, eficiência no dia a dia, gestão com dados que importam.
              </p>
            </motion.div>
          </div>

          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="mt-24 text-center">
            <Link to="/">
              <Button variant="outline" size="lg" className="rounded-full gap-2">
                Voltar para a página inicial <ArrowRight className="w-4 h-4 rotate-180" />
              </Button>
            </Link>
          </motion.div>
        </div>
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
