import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, differenceInMilliseconds } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  DollarSign, Users, TrendingUp, CalendarClock, AlertTriangle, ChevronRight,
  Star, CheckCircle2, Info, Copy, X, ArrowRight,
  CalendarDays, Stethoscope, MessageCircle, Banknote, FileText, Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding, type OnboardingTaskKey } from "@/hooks/useOnboarding";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

const chartData = [
  { name: "27 Fev", entradas: 100, saidas: 50 },
  { name: "28 Fev", entradas: 150, saidas: 80 },
  { name: "1 Mar", entradas: 200, saidas: 100 },
  { name: "2 Mar", entradas: 2100, saidas: 300 },
  { name: "3 Mar", entradas: 800, saidas: 400 },
];

const diasMovimentados = [
  { dia: "D", value: 0 },
  { dia: "S", value: 1 },
  { dia: "T", value: 1 },
  { dia: "Q", value: 0 },
  { dia: "Q", value: 0 },
  { dia: "S", value: 0 },
  { dia: "S", value: 0 },
];

const stats = [
  { label: "Faturamento", value: "R$ 12.450", icon: DollarSign, change: "+12%", color: "bg-success/20 text-success-foreground" },
  { label: "Pacientes Hoje", value: "8", icon: Users, change: "+2", color: "bg-info/20 text-info-foreground" },
  { label: "Ticket Médio", value: "R$ 580", icon: TrendingUp, change: "+5%", color: "bg-accent text-accent-foreground" },
  { label: "Próx. Retornos", value: "14", icon: CalendarClock, change: "Esta semana", color: "bg-pastel-lavender text-primary" },
];

const stories = [
  { label: "Comece aqui!", icon: Sparkles, isNew: true },
  { label: "Agenda", icon: CalendarDays, isNew: false },
  { label: "Prontuário", icon: Stethoscope, isNew: false },
  { label: "CliniChat", icon: MessageCircle, isNew: false },
  { label: "Financeiro", icon: Banknote, isNew: false },
  { label: "CliniDocs", icon: FileText, isNew: false },
];

const upcomingAppointments = [
  { name: "Clara Ribeiro", procedure: "Anamnese, Avaliação", time: "14:00 - 15:00", color: "bg-pastel-lavender/40" },
  { name: "Ana Santos", procedure: "Botox - Testa", time: "15:30 - 16:00", color: "bg-pastel-mint/40" },
];

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const TRIAL_DAYS = 3;
const TASK_ROUTES: Record<OnboardingTaskKey, string> = {
  agendamento: "/agenda",
  atendimento: "/novo-atendimento",
  venda: "/vendas",
  lembretes: "/comunicacao",
  documento: "/clinidocs",
};

export default function Dashboard() {
  const { profile } = useAuth();
  const { tasks, progress, loading: onboardingLoading, allDone } = useOnboarding();
  const [storyOpen, setStoryOpen] = useState<number | null>(null);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  const [tick, setTick] = useState(0);
  const trialTimeline = useMemo(() => {
    const created = profile?.created_at ? new Date(profile.created_at) : null;
    const expires = profile?.trial_expires_at ? new Date(profile.trial_expires_at) : null;
    if (!created || !expires) return null;
    const now = new Date();
    const reminderDate = addDays(expires, -1);
    const totalMs = differenceInMilliseconds(expires, created);
    const elapsedMs = Math.min(differenceInMilliseconds(now, created), totalMs);
    const progressPercent = totalMs > 0 ? Math.min(100, (elapsedMs / totalMs) * 100) : 0;
    const steps = [
      { label: "Início do teste\ngrátis", date: created, active: true },
      { label: "Lembrete do\nfim do teste", date: reminderDate, active: now >= reminderDate },
      { label: "Fim do teste\ngrátis", date: expires, active: now >= expires },
    ];
    return { steps, progressPercent, created, expires };
  }, [profile?.created_at, profile?.trial_expires_at, tick]);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  const copyCoupon = () => {
    navigator.clipboard.writeText("trial-10off");
    toast.success("Cupom copiado!");
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Novidades Stories */}
      <motion.div {...fadeUp}>
        <h2 className="text-base font-bold text-foreground mb-4">Novidades</h2>
        <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
          {stories.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={i}
                onClick={() => setStoryOpen(i)}
                className="flex flex-col items-center gap-2 min-w-[80px] group"
              >
                <div className="relative p-[3px] rounded-full story-gradient">
                  <div className="bg-card p-[3px] rounded-full">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pastel-lavender/60 via-pastel-rose/40 to-pastel-lavender/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  {s.isNew && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-[10px] text-primary-foreground px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                      Novidade
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-medium text-center leading-tight">{s.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Story Modal */}
      <AnimatePresence>
        {storyOpen !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setStoryOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-3xl w-full max-w-sm aspect-[9/16] relative overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8"
            >
              <button onClick={() => setStoryOpen(null)} className="absolute top-4 right-4 p-1 rounded-full bg-muted/80 hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="absolute top-4 left-4 right-12 flex gap-1">
                {stories.map((_, idx) => (
                  <div key={idx} className={`h-1 flex-1 rounded-full ${idx === storyOpen ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
              <div className="w-20 h-20 rounded-full bg-pastel-lavender flex items-center justify-center mb-6">
                {(() => { const Icon = stories[storyOpen].icon; return <Icon className="w-10 h-10 text-primary" />; })()}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{stories[storyOpen].label}</h3>
              <p className="text-sm text-muted-foreground text-center">Descubra como usar este módulo para otimizar a gestão da sua clínica.</p>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStoryOpen(storyOpen > 0 ? storyOpen - 1 : null)}
                  className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setStoryOpen(storyOpen < stories.length - 1 ? storyOpen + 1 : null)}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                >
                  {storyOpen < stories.length - 1 ? "Próximo" : "Concluir"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trial Period + Reward */}
      <motion.div {...fadeUp} transition={{ delay: 0.03 }}>
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 stat-card !p-6">
            <h3 className="text-lg font-bold text-primary mb-1">
              {profile?.subscription_active
                ? "Sua assinatura está ativa"
                : "Seu período grátis já começou a contar!"}
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              {profile?.subscription_active
                ? "Você tem acesso completo à plataforma. Aproveite todas as ferramentas para sua clínica."
                : "Use estes dias para explorar as principais ferramentas e ver, na prática, como elas melhoram sua rotina e eleva o potencial da sua clínica."}
            </p>
            {trialTimeline ? (
              <div className="relative flex items-center justify-between">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted rounded-full -translate-y-1/2" />
                <div
                  className="absolute top-1/2 left-0 h-1 bg-primary rounded-full -translate-y-1/2 transition-[width] duration-300"
                  style={{ width: `${trialTimeline.progressPercent}%` }}
                />
                {trialTimeline.steps.map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Star className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center mt-2 whitespace-pre-line leading-tight">
                      {step.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(step.date, "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Carregando suas datas de trial…</p>
            )}
          </div>

          {allDone && (
            <div className="lg:col-span-2 rounded-3xl p-6 bg-gradient-to-br from-primary via-info to-primary text-primary-foreground flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-2 right-2 w-24 h-24 bg-warning/20 rounded-full blur-2xl" />
              <div className="absolute bottom-2 left-2 w-16 h-16 bg-pastel-lavender/30 rounded-full blur-xl" />
              <p className="text-lg font-bold mb-1 relative z-10">Sucesso! Você concluiu todas as tarefas e seu cupom já está disponível abaixo.</p>
              <button
                onClick={copyCoupon}
                className="mt-4 self-start flex items-center gap-2 bg-card/20 hover:bg-card/30 backdrop-blur-sm px-4 py-2.5 rounded-xl font-mono font-bold text-sm transition-colors relative z-10"
              >
                trial-10off
                <Copy className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Welcome Message */}
      <AnimatePresence>
        {!welcomeDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="stat-card !p-5 flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-pastel-lavender flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-primary">
                {(() => {
                  const firstName = profile?.display_name?.trim().split(/\s+/)[0] || profile?.email?.split("@")[0] || "";
                  const name = firstName ? `${firstName.charAt(0).toUpperCase()}${firstName.slice(1).toLowerCase()}, ` : "";
                  return `${name}em poucos minutos nós vamos aumentar a eficiência da sua clínica`;
                })()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Criei um passo a passo personalizado para preparar sua clínica e facilitar o início do seu trabalho. Pode ficar tranquilo(a), estarei ao seu lado em cada etapa.
              </p>
            </div>
            <button onClick={() => setWelcomeDismissed(true)} className="p-1 rounded-lg hover:bg-muted shrink-0">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Checklist */}
      <motion.div {...fadeUp} transition={{ delay: 0.08 }}>
        <div className="stat-card !p-0 overflow-hidden">
          <div className="p-5 pb-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-primary">
                  A cada passo concluído, mais praticidade no seu trabalho!
                </h3>
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Seu progresso</span>
                <div className="w-10 h-10 rounded-full border-2 border-success flex items-center justify-center">
                  <span className="text-xs font-bold text-success-foreground">{progress}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-5 mb-4 p-4 rounded-2xl bg-gradient-to-r from-info via-primary to-primary text-primary-foreground flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <p className="font-bold text-sm">Desbloqueie uma recompensa exclusiva concluindo todas as tarefas</p>
          </div>

          <div className="px-5 pb-5 space-y-1">
            {tasks.map((task, i) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors group">
                <CheckCircle2 className={`w-5 h-5 shrink-0 ${task.done ? "text-success-foreground" : "text-border"}`} />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium ${task.done ? "text-muted-foreground" : "text-foreground"}`}>
                    {i + 1}. {task.label}
                  </span>
                  {task.desc && <p className="text-xs text-muted-foreground mt-0.5">{task.desc}</p>}
                </div>
                {!task.done && (
                  <Link
                    to={TASK_ROUTES[task.key]}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Iniciar tarefa <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Help Section */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
        <h3 className="text-base font-bold text-foreground mb-1">Precisa de ajuda?</h3>
        <p className="text-sm text-muted-foreground mb-4">Escolha o melhor canal para o que precisa</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="stat-card !p-5">
            <MessageCircle className="w-6 h-6 text-muted-foreground mb-3" />
            <h4 className="font-bold text-foreground text-sm mb-1">Canais de suporte</h4>
            <p className="text-xs text-muted-foreground mb-4">Suporte sobre a plataforma, pagamentos e outros. Disponível todos os dias</p>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 rounded-xl border border-success text-success-foreground text-xs font-medium hover:bg-success/10 transition-colors">
                WhatsApp
              </button>
              <button className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-primary to-pastel-rose text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">
                Pedir à Anna
              </button>
            </div>
          </div>
          <div className="stat-card !p-5">
            <Info className="w-6 h-6 text-muted-foreground mb-3" />
            <h4 className="font-bold text-foreground text-sm mb-1">Dúvidas frequentes</h4>
            <p className="text-xs text-muted-foreground mb-4">As respostas para as principais dúvidas</p>
            <button className="w-full px-3 py-2 rounded-xl border border-border/60 text-muted-foreground text-xs font-medium hover:bg-muted/40 transition-colors">
              Acessar central de ajuda
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeUp} transition={{ delay: 0.12 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="stat-card">
              <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold text-foreground mt-0.5">{stat.value}</p>
              <p className="text-xs text-success-foreground mt-1">{stat.change}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Relatórios Section */}
      <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
        <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          Relatórios <Info className="w-4 h-4 text-muted-foreground" />
        </h3>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
              Agendamentos por profissional <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </p>
            <div className="flex flex-col items-center">
              <div className="h-40 w-full flex items-end justify-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 bg-primary/70 rounded-t-lg" style={{ height: "120px" }} />
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-2">NM</div>
                  <span className="text-xs text-muted-foreground mt-1">2</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
              Dias mais movimentados <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diasMovimentados}>
                  <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "hsl(220, 10%, 46%)" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Bar dataKey="value" fill="hsl(262, 52%, 65%)" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="stat-card">
            <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
              Horários mais movimentados <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </p>
            <div className="grid grid-cols-7 gap-1">
              {["16h", "17h", "18h", "19h", "20h", "21h", "22h", "23h"].map(hora => (
                <div key={hora} className="contents">
                  <span className="text-[10px] text-muted-foreground col-span-1 flex items-center">{hora}</span>
                  {[...Array(6)].map((_, j) => {
                    const isActive = (hora === "21h" && j === 0) || (hora === "22h" && j === 0);
                    return (
                      <div
                        key={j}
                        className={`aspect-square rounded-sm ${isActive ? "bg-primary" : "bg-muted/60"}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mt-4">
          <div className="stat-card flex flex-col items-center">
            <p className="text-sm font-semibold text-foreground mb-4 self-start flex items-center gap-1">
              Status por agendamento <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </p>
            <div className="w-32 h-32 rounded-full border-8 border-success flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">2</span>
              <span className="text-xs text-muted-foreground">Agendamentos</span>
            </div>
            <p className="text-xs text-muted-foreground mt-3">2 agendamentos no período</p>
          </div>

          <div className="stat-card flex flex-col items-center">
            <p className="text-sm font-semibold text-foreground mb-4 self-start flex items-center gap-1">
              Pacientes por sexo <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </p>
            <div className="w-32 h-32 rounded-full border-8 border-warning flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">2</span>
              <span className="text-xs text-muted-foreground">Pacientes</span>
            </div>
            <p className="text-xs text-muted-foreground mt-3">2 pacientes no período</p>
          </div>

          <div className="stat-card">
            <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-1">
              Faturamento comparado <Info className="w-3.5 h-3.5 text-muted-foreground" />
            </p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(220, 10%, 46%)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 46%)" }} tickFormatter={(v) => `R$ ${v >= 1000 ? `${v/1000}k` : v}`} />
                  <Tooltip />
                  <Bar dataKey="entradas" fill="hsl(262, 52%, 65%)" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Appointments & Alerts */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="grid lg:grid-cols-2 gap-4">
        <div className="stat-card">
          <h3 className="font-semibold text-foreground mb-3">Agendamentos das próximas 24h</h3>
          <div className="space-y-2">
            {upcomingAppointments.map((apt, i) => (
              <div key={i} className={`p-3 rounded-2xl ${apt.color}`}>
                <p className="font-medium text-sm text-foreground">{apt.name}</p>
                <p className="text-xs text-muted-foreground">{apt.procedure}</p>
                <p className="text-xs text-muted-foreground mt-1">{apt.time}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Alertas de Retorno</h3>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {[
              { name: "Mariana Costa", days: "15 dias pós-toxina", urgent: true },
              { name: "Juliana Alves", days: "30 dias pós-preenchimento", urgent: false },
              { name: "Renata Lima", days: "7 dias - revisão", urgent: true },
            ].map((alert, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40">
                <AlertTriangle className={`w-4 h-4 shrink-0 ${alert.urgent ? "text-destructive-foreground" : "text-warning-foreground"}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{alert.name}</p>
                  <p className="text-xs text-muted-foreground">{alert.days}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
