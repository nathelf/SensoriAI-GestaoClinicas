import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { AppLayout } from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Perfil from "./pages/Perfil";
import AdminPanel from "./pages/AdminPanel";
import NovoAtendimento from "./pages/NovoAtendimento";
import HistoricoProcedimentos from "./pages/HistoricoProcedimentos";
import GaleriaEvolucao from "./pages/GaleriaEvolucao";
import Agenda from "./pages/Agenda";
import AgendaBloqueios from "./pages/AgendaBloqueios";
import AgendaLinks from "./pages/AgendaLinks";
import Pacientes from "./pages/Pacientes";
import CliniDocs from "./pages/CliniDocs";
import Comunicacao from "./pages/Comunicacao";
import Financeiro from "./pages/Financeiro";
import Vendas from "./pages/Vendas";
import Comissoes from "./pages/Comissoes";
import EmAberto from "./pages/comissoes/EmAberto";
import ComissoesFinalizadas from "./pages/comissoes/Finalizadas";
import TabelaVendas from "./pages/comissoes/TabelaVendas";
import TabelaAtendimento from "./pages/comissoes/TabelaAtendimento";
import RelatorioComissoes from "./pages/comissoes/RelatorioComissoes";
import Estoque from "./pages/Estoque";
import EstoquePedidos from "./pages/EstoquePedidos";
import SensoriAIChat from "./pages/SensoriAIChat";
import SensoriAIAnalisador from "./pages/SensoriAIAnalisador";
import SensoriAIConfig from "./pages/SensoriAIConfig";
import AlertasRetorno from "./pages/AlertasRetorno";
import PacientesComunicacao from "./pages/PacientesComunicacao";
import NotFound from "./pages/NotFound";

// Financeiro sub-pages
import ContasReceber from "./pages/financeiro/ContasReceber";
import ContasPagar from "./pages/financeiro/ContasPagar";
import ExtratoMovimentacoes from "./pages/financeiro/ExtratoMovimentacoes";
import RelatorioCompetencia from "./pages/financeiro/RelatorioCompetencia";
import FluxoCaixaDiario from "./pages/financeiro/FluxoCaixaDiario";
import FluxoCaixaMensal from "./pages/financeiro/FluxoCaixaMensal";
import RelatorioCategorias from "./pages/financeiro/RelatorioCategorias";
import ContasFinanceiras from "./pages/financeiro/ContasFinanceiras";
import CategoriasContas from "./pages/financeiro/CategoriasContas";
import MetodosPagamento from "./pages/financeiro/MetodosPagamento";
import IntegracaoMaquininha from "./pages/financeiro/IntegracaoMaquininha";

// Contatos sub-pages
import Profissionais from "./pages/contatos/Profissionais";
import Fornecedores from "./pages/contatos/Fornecedores";
import Leads from "./pages/contatos/Leads";
import TodosContatos from "./pages/contatos/TodosContatos";
import Aniversariantes from "./pages/contatos/Aniversariantes";
import Frequencia from "./pages/contatos/Frequencia";
import MesclarContatos from "./pages/contatos/MesclarContatos";
import ConvidarColaboradores from "./pages/contatos/ConvidarColaboradores";

// Configurações sub-pages
import PreferenciasSistema from "./pages/configuracoes/PreferenciasSistema";
import DadosClinica from "./pages/configuracoes/DadosClinica";
import Assinatura from "./pages/configuracoes/Assinatura";
import Procedimentos from "./pages/configuracoes/Procedimentos";
import CategoriasProcedimentos from "./pages/configuracoes/CategoriasProcedimentos";
import Pacotes from "./pages/configuracoes/Pacotes";
import SalasAtendimento from "./pages/configuracoes/SalasAtendimento";
import FichasAtendimentos from "./pages/configuracoes/FichasAtendimentos";
import ModelosAtestados from "./pages/configuracoes/ModelosAtestados";
import Etiquetas from "./pages/configuracoes/Etiquetas";
import HorariosFuncionamento from "./pages/configuracoes/HorariosFuncionamento";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
