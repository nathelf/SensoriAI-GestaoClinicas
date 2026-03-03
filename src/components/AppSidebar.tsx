import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Calendar, UserPlus, Users,
  ChevronDown, Stethoscope, DollarSign, Package,
  Settings, MessageSquare, FileText, Menu, X, Shield
} from "lucide-react";
import { SensoriAILogo } from "@/components/SensoriAILogo";
import { useAuth } from "@/hooks/useAuth";

interface NavSection {
  title: string;
  icon: React.ElementType;
  basePath: string;
  items: { label: string; path: string }[];
  useLogo?: boolean;
}

const navSections: NavSection[] = [
  {
    title: "Dashboard",
    icon: Home,
    basePath: "/",
    items: [
      { label: "Visão Geral", path: "/" },
      { label: "Alertas de Retorno", path: "/alertas-retorno" },
    ],
  },
  {
    title: "Atendimento",
    icon: Stethoscope,
    basePath: "/atendimento",
    items: [
      { label: "Novo Atendimento", path: "/novo-atendimento" },
      { label: "Histórico Clínico", path: "/historico" },
      { label: "Galeria de Evolução", path: "/galeria" },
    ],
  },
  {
    title: "Agenda",
    icon: Calendar,
    basePath: "/agenda",
    items: [
      { label: "Calendário Geral", path: "/agenda" },
      { label: "Bloqueios de Horário", path: "/agenda/bloqueios" },
      { label: "Links de Agendamento", path: "/agenda/links" },
    ],
  },
  {
    title: "Contatos",
    icon: Users,
    basePath: "/contatos",
    items: [
      { label: "Pacientes", path: "/pacientes" },
      { label: "Profissionais", path: "/contatos/profissionais" },
      { label: "Fornecedores", path: "/contatos/fornecedores" },
      { label: "Leads", path: "/contatos/leads" },
      { label: "Todos os contatos", path: "/contatos/todos" },
      { label: "Aniversariantes", path: "/contatos/aniversariantes" },
      { label: "Frequência", path: "/contatos/frequencia" },
      { label: "Mesclar contatos", path: "/contatos/mesclar" },
      { label: "Convidar colaboradores", path: "/contatos/convidar" },
    ],
  },
  {
    title: "Documentos",
    icon: FileText,
    basePath: "/documentos",
    items: [
      { label: "Documentos e Termos", path: "/clinidocs" },
      { label: "Conversor de Documentos", path: "/documentos/conversor" },
      { label: "Comunicação", path: "/comunicacao" },
    ],
  },
  {
    title: "Financeiro",
    icon: DollarSign,
    basePath: "/financeiro",
    items: [
      { label: "Visão Geral", path: "/financeiro" },
      { label: "Contas a receber", path: "/financeiro/receber" },
      { label: "Contas a pagar", path: "/financeiro/pagar" },
      { label: "Extrato de movimentações", path: "/financeiro/extrato" },
      { label: "Relatório de competência", path: "/financeiro/competencia" },
      { label: "Fluxo de caixa diário", path: "/financeiro/caixa-diario" },
      { label: "Fluxo de caixa mensal", path: "/financeiro/caixa-mensal" },
      { label: "Relatório de categorias", path: "/financeiro/categorias" },
      { label: "Contas financeiras", path: "/financeiro/contas" },
      { label: "Categorias de contas", path: "/financeiro/categorias-contas" },
      { label: "Métodos de pagamento", path: "/financeiro/metodos" },
      { label: "Integração maquininha", path: "/financeiro/maquininha" },
      { label: "Vendas & Pacotes", path: "/vendas" },
    ],
  },
  {
    title: "Comissões",
    icon: DollarSign,
    basePath: "/comissoes",
    items: [
      { label: "Visão Geral", path: "/comissoes" },
      { label: "Em aberto", path: "/comissoes/aberto" },
      { label: "Finalizadas", path: "/comissoes/finalizadas" },
      { label: "Tabela de comissões de vendas", path: "/comissoes/tabela-vendas" },
      { label: "Tabela de comissões de atendimento", path: "/comissoes/tabela-atendimento" },
      { label: "Relatório de comissões", path: "/comissoes/relatorio" },
    ],
  },
  {
    title: "Estoque",
    icon: Package,
    basePath: "/estoque",
    items: [
      { label: "Inventário", path: "/estoque" },
      { label: "Pedidos", path: "/estoque/pedidos" },
    ],
  },
  {
    title: "SensoriAI Lab",
    icon: MessageSquare,
    basePath: "/sensori",
    useLogo: true,
    items: [
      { label: "Assistente de Vendas", path: "/sensori/chat" },
      { label: "Análise Facial IA", path: "/sensori/analisador" },
      { label: "Config. IA", path: "/sensori/config" },
    ],
  },
  {
    title: "Configurações",
    icon: Settings,
    basePath: "/configuracoes",
    items: [
      { label: "Preferências do sistema", path: "/configuracoes" },
      { label: "Dados da clínica", path: "/configuracoes/clinica" },
      { label: "Assinatura", path: "/configuracoes/assinatura" },
      { label: "Procedimentos", path: "/configuracoes/procedimentos" },
      { label: "Categorias de procedimentos", path: "/configuracoes/categorias-procedimentos" },
      { label: "Pacotes", path: "/configuracoes/pacotes" },
      { label: "Salas de atendimento", path: "/configuracoes/salas" },
      { label: "Fichas de atendimentos", path: "/configuracoes/fichas" },
      { label: "Modelos de atestados", path: "/configuracoes/modelos" },
      { label: "Etiquetas", path: "/configuracoes/etiquetas" },
      { label: "Horários de funcionamento", path: "/configuracoes/horarios" },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { userRole } = useAuth();
  
  const sections = userRole === "admin" 
    ? [navSections[0], { title: "Admin", icon: Shield, basePath: "/admin", items: [{ label: "Painel Administrativo", path: "/admin" }] }, ...navSections.slice(1)]
    : navSections;

  const [expanded, setExpanded] = useState<string | null>(() => {
    const active = sections.find((s) =>
      s.items.some((i) => i.path === location.pathname)
    );
    return active?.title ?? "Dashboard";
  });

  useEffect(() => {
    const active = sections.find((s) =>
      s.items.some((i) => i.path === location.pathname)
    );
    if (active) setExpanded(active.title);
  }, [location.pathname]);

  const toggleSection = (title: string) => {
    setExpanded((prev) => (prev === title ? null : title));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border/40 flex flex-col
          lg:relative lg:translate-x-0 transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-border/30">
          <Link to="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <SensoriAILogo variant="full" iconClassName="w-9 h-9" />
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-muted">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expanded === section.title;
            const sectionActive = section.items.some((i) => isActive(i.path));

            return (
              <div key={section.title}>
                <motion.button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${sectionActive ? "bg-pastel-lavender text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
                >
                  <div className="flex items-center gap-2.5">
                    {"useLogo" in section && section.useLogo ? (
                      <SensoriAILogo variant="icon" iconClassName="w-[18px] h-[18px]" noTextFallback />
                    ) : (
                      <Icon className="w-[18px] h-[18px]" />
                    )}
                    <span>{section.title}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </motion.button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        initial="closed"
                        animate="open"
                        variants={{
                          open: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
                          closed: {},
                        }}
                        className="ml-7 mt-0.5 space-y-0.5 border-l-2 border-border/40 pl-3 py-1"
                      >
                        {section.items.map((item) => {
                          const active = isActive(item.path);
                          return (
                            <motion.div
                              key={item.path}
                              variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: -8 } }}
                              className="relative"
                            >
                              {active && (
                                <motion.div
                                  layoutId="sidebarActiveIndicator"
                                  className="absolute inset-0 rounded-xl bg-[#9b87f5] text-white"
                                  style={{ zIndex: 0 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}
                              <Link
                                to={item.path}
                                onClick={onClose}
                                className={`relative z-10 flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors
                                  ${active ? "text-white shadow-sm" : "text-muted-foreground hover:bg-[#9b87f5]/10 hover:text-foreground"}`}
                              >
                                {item.label}
                              </Link>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
}
