import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Calendar, UserPlus, Users, Brain,
  ChevronDown, Stethoscope, DollarSign, Package,
  Settings, MessageSquare, FileText, Menu, X, Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavSection {
  title: string;
  icon: React.ElementType;
  basePath: string;
  items: { label: string; path: string }[];
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
      { label: "Documentos e Termos", path: "/clinidocs" },
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
    icon: Brain,
    basePath: "/sensori",
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
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-base text-foreground tracking-tight">Sensori</span>
              <span className="font-bold text-base text-primary tracking-tight">AI</span>
            </div>
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
                <button
                  onClick={() => toggleSection(section.title)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${sectionActive ? "bg-pastel-lavender text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-[18px] h-[18px]" />
                    <span>{section.title}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-7 mt-0.5 space-y-0.5 border-l-2 border-border/40 pl-3 py-1">
                        {section.items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={`block px-3 py-2 rounded-xl text-sm transition-all duration-200
                              ${isActive(item.path)
                                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                                : "text-muted-foreground hover:bg-pastel-lavender/60 hover:text-foreground"
                              }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
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
