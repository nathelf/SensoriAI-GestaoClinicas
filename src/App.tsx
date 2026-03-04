import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { AppLayout } from "./components/AppLayout";
import { RouteFallback } from "./components/RouteFallback";

const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Sobre = lazy(() => import("./pages/Sobre"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AssinarPorToken = lazy(() => import("./pages/AssinarPorToken"));
const AcessoExpirado = lazy(() => import("./pages/AcessoExpirado"));
const NotFound = lazy(() => import("./pages/NotFound"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Perfil = lazy(() => import("./pages/Perfil"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const NovoAtendimento = lazy(() => import("./pages/NovoAtendimento"));
const HistoricoProcedimentos = lazy(() => import("./pages/HistoricoProcedimentos"));
const GaleriaEvolucao = lazy(() => import("./pages/GaleriaEvolucao"));
const Agenda = lazy(() => import("./pages/Agenda"));
const AgendaBloqueios = lazy(() => import("./pages/AgendaBloqueios"));
const AgendaLinks = lazy(() => import("./pages/AgendaLinks"));
const Pacientes = lazy(() => import("./pages/Pacientes"));
const CliniDocs = lazy(() => import("./pages/CliniDocs"));
const DocumentoAssinatura = lazy(() => import("./pages/DocumentoAssinatura"));
const DocumentosConversor = lazy(() => import("./pages/DocumentosConversor"));
const Comunicacao = lazy(() => import("./pages/Comunicacao"));
const PacientesComunicacao = lazy(() => import("./pages/PacientesComunicacao"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const ContasReceber = lazy(() => import("./pages/financeiro/ContasReceber"));
const ContasPagar = lazy(() => import("./pages/financeiro/ContasPagar"));
const ExtratoMovimentacoes = lazy(() => import("./pages/financeiro/ExtratoMovimentacoes"));
const RelatorioCompetencia = lazy(() => import("./pages/financeiro/RelatorioCompetencia"));
const FluxoCaixaDiario = lazy(() => import("./pages/financeiro/FluxoCaixaDiario"));
const FluxoCaixaMensal = lazy(() => import("./pages/financeiro/FluxoCaixaMensal"));
const RelatorioCategorias = lazy(() => import("./pages/financeiro/RelatorioCategorias"));
const ContasFinanceiras = lazy(() => import("./pages/financeiro/ContasFinanceiras"));
const CategoriasContas = lazy(() => import("./pages/financeiro/CategoriasContas"));
const MetodosPagamento = lazy(() => import("./pages/financeiro/MetodosPagamento"));
const IntegracaoMaquininha = lazy(() => import("./pages/financeiro/IntegracaoMaquininha"));
const Vendas = lazy(() => import("./pages/Vendas"));
const Comissoes = lazy(() => import("./pages/Comissoes"));
const EmAberto = lazy(() => import("./pages/comissoes/EmAberto"));
const ComissoesFinalizadas = lazy(() => import("./pages/comissoes/Finalizadas"));
const TabelaVendas = lazy(() => import("./pages/comissoes/TabelaVendas"));
const TabelaAtendimento = lazy(() => import("./pages/comissoes/TabelaAtendimento"));
const RelatorioComissoes = lazy(() => import("./pages/comissoes/RelatorioComissoes"));
const Estoque = lazy(() => import("./pages/Estoque"));
const EstoquePedidos = lazy(() => import("./pages/EstoquePedidos"));
const SensoriAIChat = lazy(() => import("./pages/SensoriAIChat"));
const SensoriAIAnalisador = lazy(() => import("./pages/SensoriAIAnalisador"));
const SensoriAIConfig = lazy(() => import("./pages/SensoriAIConfig"));
const AlertasRetorno = lazy(() => import("./pages/AlertasRetorno"));
const Profissionais = lazy(() => import("./pages/contatos/Profissionais"));
const Fornecedores = lazy(() => import("./pages/contatos/Fornecedores"));
const Leads = lazy(() => import("./pages/contatos/Leads"));
const TodosContatos = lazy(() => import("./pages/contatos/TodosContatos"));
const Aniversariantes = lazy(() => import("./pages/contatos/Aniversariantes"));
const Frequencia = lazy(() => import("./pages/contatos/Frequencia"));
const MesclarContatos = lazy(() => import("./pages/contatos/MesclarContatos"));
const ConvidarColaboradores = lazy(() => import("./pages/contatos/ConvidarColaboradores"));
const PreferenciasSistema = lazy(() => import("./pages/configuracoes/PreferenciasSistema"));
const ConfiguracoesClinica = lazy(() => import("./pages/ConfiguracoesClinica"));
const DadosClinica = lazy(() => import("./pages/configuracoes/DadosClinica"));
const Assinatura = lazy(() => import("./pages/configuracoes/Assinatura"));
const Procedimentos = lazy(() => import("./pages/configuracoes/Procedimentos"));
const CategoriasProcedimentos = lazy(() => import("./pages/configuracoes/CategoriasProcedimentos"));
const Pacotes = lazy(() => import("./pages/configuracoes/Pacotes"));
const SalasAtendimento = lazy(() => import("./pages/configuracoes/SalasAtendimento"));
const FichasAtendimentos = lazy(() => import("./pages/configuracoes/FichasAtendimentos"));
const ModelosAtestados = lazy(() => import("./pages/configuracoes/ModelosAtestados"));
const Etiquetas = lazy(() => import("./pages/configuracoes/Etiquetas"));
const HorariosFuncionamento = lazy(() => import("./pages/configuracoes/HorariosFuncionamento"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/assinar" element={<AssinarPorToken />} />
              <Route path="/acesso-expirado" element={<AcessoExpirado />} />

              {/* Protected routes */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/alertas-retorno" element={<AlertasRetorno />} />
                <Route path="/novo-atendimento" element={<NovoAtendimento />} />
                <Route path="/historico" element={<HistoricoProcedimentos />} />
                <Route path="/galeria" element={<GaleriaEvolucao />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/agenda/bloqueios" element={<AgendaBloqueios />} />
                <Route path="/agenda/links" element={<AgendaLinks />} />
                <Route path="/pacientes" element={<Pacientes />} />
                <Route path="/clinidocs" element={<CliniDocs />} />
                <Route path="/documentos/conversor" element={<DocumentosConversor />} />
                <Route path="/documentos/assinatura/:id" element={<DocumentoAssinatura />} />
                <Route path="/comunicacao" element={<Comunicacao />} />
                <Route path="/pacientes/comunicacao" element={<PacientesComunicacao />} />
                {/* Financeiro */}
                <Route path="/financeiro" element={<Financeiro />} />
                <Route path="/financeiro/receber" element={<ContasReceber />} />
                <Route path="/financeiro/pagar" element={<ContasPagar />} />
                <Route path="/financeiro/extrato" element={<ExtratoMovimentacoes />} />
                <Route path="/financeiro/competencia" element={<RelatorioCompetencia />} />
                <Route path="/financeiro/caixa-diario" element={<FluxoCaixaDiario />} />
                <Route path="/financeiro/caixa-mensal" element={<FluxoCaixaMensal />} />
                <Route path="/financeiro/categorias" element={<RelatorioCategorias />} />
                <Route path="/financeiro/contas" element={<ContasFinanceiras />} />
                <Route path="/financeiro/categorias-contas" element={<CategoriasContas />} />
                <Route path="/financeiro/metodos" element={<MetodosPagamento />} />
                <Route path="/financeiro/maquininha" element={<IntegracaoMaquininha />} />
                <Route path="/vendas" element={<Vendas />} />
                {/* Comissões */}
                <Route path="/comissoes" element={<Comissoes />} />
                <Route path="/comissoes/aberto" element={<EmAberto />} />
                <Route path="/comissoes/finalizadas" element={<ComissoesFinalizadas />} />
                <Route path="/comissoes/tabela-vendas" element={<TabelaVendas />} />
                <Route path="/comissoes/tabela-atendimento" element={<TabelaAtendimento />} />
                <Route path="/comissoes/relatorio" element={<RelatorioComissoes />} />
                {/* Contatos */}
                <Route path="/contatos/profissionais" element={<Profissionais />} />
                <Route path="/contatos/fornecedores" element={<Fornecedores />} />
                <Route path="/contatos/leads" element={<Leads />} />
                <Route path="/contatos/todos" element={<TodosContatos />} />
                <Route path="/contatos/aniversariantes" element={<Aniversariantes />} />
                <Route path="/contatos/frequencia" element={<Frequencia />} />
                <Route path="/contatos/mesclar" element={<MesclarContatos />} />
                <Route path="/contatos/convidar" element={<ConvidarColaboradores />} />
                {/* Estoque */}
                <Route path="/estoque" element={<Estoque />} />
                <Route path="/estoque/pedidos" element={<EstoquePedidos />} />
                {/* SensoriAI */}
                <Route path="/sensori/chat" element={<SensoriAIChat />} />
                <Route path="/sensori/analisador" element={<SensoriAIAnalisador />} />
                <Route path="/sensori/config" element={<SensoriAIConfig />} />
                {/* Configurações */}
                <Route path="/configuracoes" element={<PreferenciasSistema />} />
                <Route path="/config-clinica" element={<ConfiguracoesClinica />} />
                <Route path="/configuracoes/clinica" element={<DadosClinica />} />
                <Route path="/configuracoes/assinatura" element={<Assinatura />} />
                <Route path="/configuracoes/procedimentos" element={<Procedimentos />} />
                <Route path="/configuracoes/categorias-procedimentos" element={<CategoriasProcedimentos />} />
                <Route path="/configuracoes/pacotes" element={<Pacotes />} />
                <Route path="/configuracoes/salas" element={<SalasAtendimento />} />
                <Route path="/configuracoes/fichas" element={<FichasAtendimentos />} />
                <Route path="/configuracoes/modelos" element={<ModelosAtestados />} />
                <Route path="/configuracoes/etiquetas" element={<Etiquetas />} />
                <Route path="/configuracoes/horarios" element={<HorariosFuncionamento />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
