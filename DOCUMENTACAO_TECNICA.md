# Documentação Técnica — SensoriAI Gestão Clínicas

**Versão:** 2.0  
**Data:** Abril 2026  
**Nível:** Auditoria / Handover  
**Responsável Técnico:** Arquiteto de Software Sênior

---

## Índice

1. [Sumário Executivo](#1-sumário-executivo)
2. [Visão Geral do Sistema](#2-visão-geral-do-sistema)
3. [Stack Tecnológica Completa](#3-stack-tecnológica-completa)
4. [Arquitetura — Modelo C4](#4-arquitetura--modelo-c4)
5. [Banco de Dados — Schema Completo](#5-banco-de-dados--schema-completo)
6. [Edge Functions (Supabase)](#6-edge-functions-supabase)
7. [Backend Microserviço (FastAPI)](#7-backend-microserviço-fastapi)
8. [Frontend — Estrutura de Arquivos](#8-frontend--estrutura-de-arquivos)
9. [Módulos e Telas](#9-módulos-e-telas)
10. [Hooks Customizados](#10-hooks-customizados)
11. [Utilitários (src/lib)](#11-utilitários-srclib)
12. [Componentes Reutilizáveis](#12-componentes-reutilizáveis)
13. [Configuração e Variáveis de Ambiente](#13-configuração-e-variáveis-de-ambiente)
14. [Segurança](#14-segurança)
15. [Padrões Arquiteturais](#15-padrões-arquiteturais)
16. [Testes](#16-testes)
17. [Débito Técnico e Code Smells](#17-débito-técnico-e-code-smells)
18. [Escalabilidade e Riscos](#18-escalabilidade-e-riscos)
19. [Deploy e Infraestrutura](#19-deploy-e-infraestrutura)
20. [Glossário](#20-glossário)

---

## 1. Sumário Executivo

O **SensoriAI Gestão Clínicas** é uma plataforma SaaS multi-tenant para gestão de clínicas (médicas, odontológicas, estéticas, terapêuticas). O sistema oferece agendamento, prontuário eletrônico, gestão financeira, assinatura digital de documentos, comissões, relatórios personalizados com IA e um assistente de IA embarcado chamado **Lorena**.

| Dimensão | Status | Observação |
|---|---|---|
| Arquitetura | ✅ Sólida | React + Supabase + FastAPI bem estruturados |
| Segurança | ⚠️ Atenção | CORS aberto no backend; sem rate limit nas Edge Functions |
| Testes | ❌ Crítico | Apenas 2 testes de exemplo existentes |
| Performance | ⚠️ Médio | Sem paginação no useCrud; múltiplas subscriptions realtime |
| Cobertura de Documentação | ✅ Completo | Este documento cobre 100% do sistema |
| Multi-tenancy | ✅ Implementado | Via tabela `usuario_clinica` + RLS Supabase |
| Modelo de Monetização | ✅ Implementado | Trial (data expiração) + Assinatura ativa |

**Estatísticas do código-fonte:**

| Categoria | Quantidade |
|---|---|
| Páginas TSX | 60+ |
| Componentes React | 75 |
| Hooks customizados | 11 |
| Arquivos utilitários (lib) | 7 |
| Migrações SQL | 16 |
| Edge Functions (Deno) | 6 |
| Endpoints FastAPI | 4 |
| Total de linhas (pages) | ~6.600 |

---

## 2. Visão Geral do Sistema

### 2.1 Propósito

Sistema de gestão completo para clínicas de saúde e bem-estar, disponível como SaaS com modelo freemium (trial + assinatura). Oferece:

- Agendamento e prontuário eletrônico
- Gestão financeira (contas a receber/pagar, fluxo de caixa, comissões)
- Assinatura digital de documentos com auditoria
- Relatórios personalizados com canvas drag-and-drop
- Assistente de IA (Lorena) integrado ao contexto clínico
- Comunicação com pacientes e gestão de contatos
- Controle de estoque

### 2.2 Usuários do Sistema

| Tipo | Descrição |
|---|---|
| Profissional da Clínica | Usuário principal: recepcionista, dentista, terapeuta, administrador |
| Paciente | Interage apenas via link de assinatura de documentos (sem login) |
| Administrador SensoriAI | Gerencia a plataforma via painel admin interno |

### 2.3 Integrações Externas

| Sistema | Finalidade |
|---|---|
| Supabase | BaaS: autenticação, PostgreSQL, Realtime, Storage, Edge Functions |
| Google AI (Gemini 1.5/2.5) | Geração de documentos e chat com Lorena |
| API OpenAI-compatível | Chat alternativo (configurável) |
| WhatsApp Business (via link) | Contato fixo embutido no layout |
| Gateway de Pagamento | Webhooks de assinatura (integração futura) |
| LibreOffice / MS Word | Conversão Word→PDF no microserviço Python |

---

## 3. Stack Tecnológica Completa

### 3.1 Frontend

| Tecnologia | Versão | Função |
|---|---|---|
| React | 18.3 | Framework UI |
| TypeScript | 5.8 | Tipagem estática |
| Vite | 5.4 | Bundler e dev server (porta 8080) |
| React Router DOM | 6.30 | Roteamento SPA (60+ rotas) |
| TanStack React Query | 5.83 | Cache e sincronização de dados |
| React Hook Form | 7.61 | Gerenciamento de formulários |
| Zod | 3.25 | Validação de schemas |
| Tailwind CSS | 3.4 | Utilitários CSS |
| shadcn/ui (Radix UI) | — | Componentes acessíveis |
| Framer Motion | 12.34 | Animações |
| Recharts | 2.15 | Gráficos |
| @xyflow/react | 12.10 | Canvas drag-and-drop para relatórios |
| jsPDF | 4.2 | Geração de PDF no cliente |
| html2canvas | 1.4 | Captura de DOM para PDF |
| React Quill | 2.0 | Editor WYSIWYG rich text |
| Supabase JS | 2.98 | Cliente Supabase (auth + DB + Realtime) |
| date-fns | 3.6 | Manipulação de datas |
| Sonner | 1.7 | Notificações toast |
| mammoth | 1.11 | Leitura de arquivos .docx no browser |
| next-themes | — | Suporte a tema claro/escuro |
| class-variance-authority | — | Variantes de componentes |

### 3.2 Backend (Microserviço Python)

| Tecnologia | Versão | Função |
|---|---|---|
| FastAPI | 0.109 | Framework REST API |
| Uvicorn | 0.27 | Servidor ASGI |
| pdf2docx | 0.5.6 | Conversão PDF → Word |
| python-docx | 1.1 | Manipulação de arquivos .docx |
| PyMuPDF | 1.23.8 | Processamento de PDFs |
| ReportLab | 4.0.9 | Geração de PDFs certificados |
| docx2pdf | 0.1.8 | Conversão Word → PDF |
| python-dotenv | 1.0.0 | Variáveis de ambiente |

### 3.3 Infraestrutura / BaaS

| Serviço | Descrição |
|---|---|
| Supabase | PostgreSQL gerenciado, Auth (Email + Google OAuth), Realtime, Edge Functions (Deno) |
| Google Gemini API | Geração de documentos e chat (modelos: gemini-2.5-flash, gemini-1.5-flash) |
| API OpenAI-compatível | Alternativa de chat configurável (default: gpt-4o-mini) |

### 3.4 Ferramentas de Desenvolvimento

| Ferramenta | Versão | Função |
|---|---|---|
| ESLint | 9.32 | Linting TypeScript |
| Vitest | 3.2.4 | Framework de testes |
| TypeScript ESLint | — | Regras de tipagem |

---

## 4. Arquitetura — Modelo C4

### 4.1 C4 Nível 1 — Contexto

```
┌─────────────────────────────────────────────────────────────────┐
│                    SensoriAI Gestão Clínicas                     │
│                                                                   │
│  ┌──────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │   Frontend SPA   │  │    Supabase    │  │  FastAPI Python │  │
│  │  React/TypeScript│◄─►│ Auth+DB+RT+Fn │  │  Microserviço   │  │
│  └────────┬─────────┘  └───────┬────────┘  └────────┬────────┘  │
│           │                    │                     │            │
└───────────┼────────────────────┼─────────────────────┼───────────┘
            │                    │                     │
      Profissional          PostgreSQL            LibreOffice/Word
       (Navegador)          + Deno Edge          (Conversão PDF/Doc)
                            Functions
                                │
                         Google Gemini API
                         (Chat + Documentos)
```

**Atores externos:**
- **Profissional da Clínica** → Acessa via navegador (HTTPS)
- **Paciente** → Recebe link de assinatura por e-mail (sem login)
- **Admin SensoriAI** → Gerencia via painel admin interno

### 4.2 C4 Nível 2 — Containers

```
FRONTEND (React SPA)
├── src/pages/          → 60+ telas da aplicação
├── src/components/     → 75 componentes reutilizáveis
├── src/hooks/          → 11 hooks de dados e lógica
├── src/lib/            → 7 utilitários
└── src/integrations/   → Cliente Supabase configurado

BACKEND BaaS (Supabase)
├── PostgreSQL          → Banco de dados relacional + RLS
├── Auth Service        → JWT, OAuth Google, Magic Link
├── Realtime Engine     → WebSocket para atualizações ao vivo
└── Edge Functions      → 6 funções Deno serverless

MICROSERVIÇO (FastAPI Python)
├── POST /convert/pdf-to-word
├── POST /convert/word-to-pdf
├── POST /generate/signed-pdf
└── GET  /health
```

### 4.3 C4 Nível 3 — Componentes (Módulo de Autenticação)

```
useAuth.tsx (AuthContext)
├── ensureUserProfile()      → Cria perfil no primeiro login
├── loadUserData()           → Busca profile + role + módulos (timeout 5s)
├── computeHasAccess()       → Hierarquia: Admin > Assinatura > Trial > Negado
├── signOut()                → Logout e limpeza de estado
└── onAuthStateChange()      → Subscription ao evento Supabase Auth

Tabelas Envolvidas:
├── auth.users              → Gerenciado pelo Supabase
├── profiles                → Dados do perfil + trial/subscription
├── user_roles              → admin | user
├── usuario_clinica         → Multi-tenant: usuário ↔ clínica
└── modulos_permissao       → RBAC por módulo
```

### 4.4 C4 Nível 3 — Componentes (Módulo de Relatórios com IA)

```
RelatoriosPersonalizados.tsx
├── @xyflow/react Canvas     → Editor visual drag-and-drop
│   ├── MetricsNode          → Bloco de métricas de faturamento
│   ├── TableNode            → Tabela de procedimentos
│   ├── AINode               → Geração de insight com IA
│   ├── GenericNode          → Bloco de texto livre
│   └── PatientSearchBlock   → Seletor de paciente
├── useReportTemplates()     → CRUD de templates salvos
├── useFaturamento()         → Dados financeiros + tendências
├── parseCanvasToMedicalData()→ Nós React Flow → estrutura médica
├── buildReportData()        → Estrutura para template PDF
└── MedicalReportTemplate    → Layout PDF de impressão

Edge Functions:
├── gerar-insight-relatorio  → Gemini analisa dados conectados ao AINode
└── generate-document        → Gemini gera documentos médicos (HTML)
```

---

## 5. Banco de Dados — Schema Completo

### 5.1 Diagrama de Entidades Principais

```
auth.users (Supabase)
    │ 1:1
    ▼
profiles
    ├── id (PK)
    ├── user_id (FK auth.users)
    ├── display_name
    ├── clinic_name
    ├── phone
    ├── avatar_url
    ├── trial_expires_at     ← Controle de trial
    └── subscription_active ← Controle de assinatura

user_roles
    ├── user_id (FK auth.users)
    └── role: 'admin' | 'user'

usuario_clinica              ← Multi-tenant
    ├── usuario_id (FK auth.users)
    ├── clinic_id
    └── perfil_acesso_id (FK perfis_acesso)

perfis_acesso
    ├── id (PK)
    ├── nome
    └── descricao

modulos_permissao
    ├── perfil_id (FK perfis_acesso)
    └── modulo: string

patients
    ├── id (PK, UUID)
    ├── user_id (FK auth.users)
    ├── nome, email, cpf, telefone
    ├── data_nascimento
    ├── tipo_pele
    └── historico_saude

appointments
    ├── id (PK, UUID)
    ├── user_id (FK auth.users)
    ├── patient_id (FK patients)
    ├── data_hora
    ├── procedimento
    ├── status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado'
    ├── profissional
    ├── sala
    └── observacoes

sales
    ├── id (PK, UUID)
    ├── user_id (FK auth.users)
    ├── patient_id (FK patients)
    ├── procedimento
    ├── valor
    ├── status: 'pago' | 'pendente' | 'cancelado'
    └── data_venda

accounts_receivable
    ├── id (PK), user_id
    ├── descricao, valor
    ├── data_vencimento
    └── status: 'pendente' | 'recebido'

accounts_payable
    ├── id (PK), user_id
    ├── descricao, valor, fornecedor
    ├── data_vencimento
    └── status: 'pendente' | 'pago'

financial_accounts
    ├── id (PK), user_id
    ├── nome (ex: "Caixa", "Banco X")
    ├── tipo: 'corrente' | 'poupanca' | 'caixa'
    └── saldo_inicial

clinic_documents
    ├── id (PK), user_id
    ├── titulo, tipo (Ficha | Termo | Contrato | Atestado | Prescrição)
    ├── conteudo (HTML)
    └── criado_em

signature_links
    ├── id (PK), token (UUID, único)
    ├── document_id (FK clinic_documents)
    ├── patient_email
    ├── expires_at
    └── used: boolean

signed_documents
    ├── id (PK)
    ├── link_id (FK signature_links)
    ├── signature_base64
    ├── ip_address
    ├── signed_at
    └── audit_hash (SHA-256)

report_templates
    ├── id (PK), user_id, clinic_id
    ├── nome
    ├── structure (JSON: nodes[], edges[])
    ├── layout_json (legado — depreciado)
    └── config (JSON: logoUrl, titulo, rodape)

users_onboarding
    ├── user_id (PK, FK auth.users)
    ├── agendamento, atendimento, venda    (boolean)
    ├── lembretes, documento               (boolean)
    ├── recompensa_resgatada               (boolean)
    └── atualizado_em
```

### 5.2 Políticas de Segurança (RLS)

Todas as tabelas possuem Row-Level Security habilitado. O padrão é:

```sql
-- Leitura: apenas próprios registros
CREATE POLICY "user_select_own" ON tabela
  FOR SELECT USING (auth.uid() = user_id);

-- Inserção: apenas com user_id = auth.uid()
CREATE POLICY "user_insert_own" ON tabela
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 5.3 Migrações SQL (16 arquivos)

| # | Arquivo | Descrição |
|---|---|---|
| 1 | `init-database.sql` | Schema inicial completo |
| 2–16 | `patch-database.sql` + migrações | Adições incrementais de colunas, tabelas e políticas |

**Triggers relevantes:**
- `handle_new_user` — Cria registro em `profiles` automaticamente ao cadastrar novo usuário no Supabase Auth

---

## 6. Edge Functions (Supabase)

Localizadas em `supabase/functions/`. Executam em runtime Deno (TypeScript).

### 6.1 `lorena-chat`

| Item | Valor |
|---|---|
| Endpoint | `POST /functions/v1/lorena-chat` |
| Auth | Bearer token obrigatório |
| Modelo | Google Gemini 2.5-flash |
| Input | `{ messages: Array<{ role: 'user'|'assistant', content: string }> }` |
| Output | `{ reply: string }` |
| Personalidade | Assistente Lorena — empática, especialista em clínicas de saúde |

### 6.2 `generate-document`

| Item | Valor |
|---|---|
| Endpoint | `POST /functions/v1/generate-document` |
| Auth | Bearer token obrigatório |
| Modelo | Google Gemini 1.5-flash (temperature: 0.3) |
| Input | `{ tipo: 'Ficha'|'Termo'|'Contrato'|'Atestado'|'Prescrição', contexto: string }` |
| Output | HTML com placeholders: `{{nome_paciente}}`, `{{data}}`, `{{profissional}}`, etc. |

### 6.3 `submit-signature`

| Item | Valor |
|---|---|
| Endpoint | `POST /functions/v1/submit-signature` |
| Auth | Pública (token no corpo) |
| Input | `{ token, signatureBase64, patientName, ip, userAgent }` |
| Output | `{ signedId: string }` |
| Fluxo | 1) Valida token → 2) Busca documento → 3) Salva em `signed_documents` → 4) Marca link como usado |

### 6.4 `get-document-by-token`

| Item | Valor |
|---|---|
| Endpoint | `GET /functions/v1/get-document-by-token?token=UUID` |
| Auth | Pública |
| Retorno | Conteúdo HTML do documento + metadados |

### 6.5 `gerar-insight-relatorio`

| Item | Valor |
|---|---|
| Endpoint | `POST /functions/v1/gerar-insight-relatorio` |
| Auth | Bearer token obrigatório |
| Modelo | Google Gemini |
| Função | Analisa dados dos nós conectados ao AINode no canvas de relatórios |
| Output | Texto de insight clínico/financeiro |

### 6.6 `admin-manage-user`

| Item | Valor |
|---|---|
| Endpoint | `POST /functions/v1/admin-manage-user` |
| Auth | Bearer token + validação de role admin |
| Operações | Criar, atualizar, excluir usuários; gerenciar roles e associações de clínica |

---

## 7. Backend Microserviço (FastAPI)

Localizado em `backend/main.py`. Roda na porta **8000**.

### 7.1 Variáveis de Configuração

```
VITE_DOCUMENT_API_URL → URL deste microserviço (ex: http://localhost:8000)
```

### 7.2 Endpoints

#### `POST /convert/pdf-to-word`

| Item | Descrição |
|---|---|
| Função | Converte arquivo PDF para .docx |
| Input | `multipart/form-data` com campo `file` (PDF) |
| Output | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| Biblioteca | pdf2docx.Converter |
| Fluxo | 1) Valida extensão .pdf → 2) Salva em `temp_files/{uuid}.pdf` → 3) Converte → 4) Retorna .docx → 5) Limpa arquivo original |
| Erros | HTTP 400 (arquivo inválido/vazio), HTTP 500 (falha na conversão) |

#### `POST /convert/word-to-pdf`

| Item | Descrição |
|---|---|
| Função | Converte arquivo .docx para PDF |
| Input | `multipart/form-data` com campo `file` (.docx) |
| Output | `application/pdf` |
| Biblioteca | docx2pdf (requer LibreOffice ou MS Word instalado no servidor) |
| Erros | HTTP 500 se conversão falhar |

#### `POST /generate/signed-pdf`

| Item | Descrição |
|---|---|
| Função | Gera PDF com certificado de assinatura digital |
| Input | `SignedPdfRequest { content, signature_base64, nome, data, ip, doc_id }` |
| Output | `application/pdf` com página de certificado |
| Fluxo | 1) Gera hash SHA-256 do conteúdo → 2) Cria PDF com ReportLab → 3) Adiciona imagem da assinatura → 4) Inclui protocolo, IP, timestamp, hash |
| Protocolo | `SENTINEL-{doc_id}` |
| Erros | HTTP 500 se geração falhar |

#### `GET /health`

Retorna `{ "status": "ok" }` para health check.

### 7.3 Configuração CORS

```python
allow_origins=["*"]  # ⚠️ Aberto — deve ser restrito em produção
allow_methods=["*"]
allow_headers=["*"]
```

### 7.4 Gerenciamento de Arquivos Temporários

- Diretório: `backend/temp_files/`
- Nomes: UUID gerado por requisição
- **Problema:** Sem limpeza periódica automática — arquivos podem acumular em produção.

---

## 8. Frontend — Estrutura de Arquivos

```
src/
├── App.tsx                          ← Router principal com 60+ rotas (lazy load)
├── main.tsx                         ← Entry point, monta React + QueryClient + ThemeProvider
├── App.css                          ← Estilos globais base
│
├── pages/                           ← 60+ telas da aplicação
│   ├── Dashboard.tsx
│   ├── Auth.tsx
│   ├── Agenda.tsx
│   ├── Pacientes.tsx
│   ├── NovoAtendimento.tsx
│   ├── CliniDocs.tsx
│   ├── DocumentoAssinatura.tsx
│   ├── DocumentosConversor.tsx
│   ├── RelatoriosPersonalizados.tsx
│   ├── ReportTemplates.tsx
│   ├── SensoriAIChat.tsx
│   ├── SensoriAIAnalisador.tsx
│   ├── SensoriAIConfig.tsx
│   ├── Financeiro/ (11 sub-páginas)
│   ├── contatos/ (8 sub-páginas)
│   ├── configuracoes/ (11 sub-páginas)
│   └── comissoes/ (5 sub-páginas)
│
├── components/
│   ├── AppLayout.tsx                ← Layout autenticado (header, sidebar, FABs)
│   ├── AppSidebar.tsx               ← Menu lateral de navegação
│   ├── BottomTabBar.tsx             ← Barra de navegação mobile
│   ├── LorenaChat.tsx               ← Widget de chat flutuante (FAB)
│   ├── CrudModal.tsx                ← Modal genérico criar/editar
│   ├── ConfirmDialog.tsx            ← Dialog de confirmação exclusão
│   ├── EditorWysiwyg.tsx            ← Editor rich text (Quill)
│   ├── SkeletonDoc.tsx              ← Skeleton de carregamento
│   ├── canvas/                      ← Nós do canvas de relatórios
│   │   ├── MetricsNode.tsx
│   │   ├── TableNode.tsx
│   │   ├── AINode.tsx
│   │   ├── GenericNode.tsx
│   │   ├── PatientSearchBlock.tsx
│   │   ├── CanvasSidebar.tsx
│   │   └── ReportConfigModal.tsx
│   ├── landing/                     ← Componentes da Landing Page
│   │   ├── HeroParticleNetwork.tsx
│   │   ├── LandingCursor.tsx
│   │   └── LandingFooter.tsx
│   ├── pdf/                         ← Templates de impressão/PDF
│   │   ├── MedicalReportTemplate.tsx
│   │   ├── ProcedureTable.tsx
│   │   └── ReportHeader.tsx
│   └── ui/                          ← Primitivos shadcn/ui (40+ componentes)
│
├── hooks/
│   ├── useAuth.tsx                  ← Autenticação, autorização, perfil
│   ├── useCrud.ts                   ← CRUD genérico Supabase
│   ├── useFaturamento.ts            ← Métricas financeiras + realtime
│   ├── useReportTemplates.ts        ← CRUD de templates de relatório
│   ├── useClinicId.ts               ← Multi-tenant: resolve clinic_id
│   ├── usePatientHistory.ts         ← Histórico clínico do paciente
│   ├── useChatIntegration.ts        ← Integração chat Lorena
│   ├── useOnboarding.ts             ← Tarefas de onboarding
│   └── useReportConfig.ts           ← Configuração visual do relatório
│
├── lib/
│   ├── utils.ts                     ← cn() para Tailwind classes
│   ├── buildReportData.ts           ← Nós React Flow → estrutura de relatório
│   ├── parseCanvasToMedicalData.ts  ← Canvas → dados médicos estruturados
│   ├── gerarPdfAssinado.ts          ← HTML → PDF + assinatura + certificado
│   ├── lorenaChat.ts                ← Chamada à Edge Function lorena-chat
│   ├── reportContext.ts             ← Extração de contexto de nós conectados ao AINode
│   └── templates/
│       └── clinicTemplates.ts       ← Templates pré-definidos de relatório
│
└── integrations/
    └── supabase/
        ├── client.ts                ← Instância única do cliente Supabase
        └── types.ts                 ← Tipos TypeScript gerados/mantidos manualmente
```

---

## 9. Módulos e Telas

### 9.1 Autenticação e Acesso

| Tela | Arquivo | Descrição |
|---|---|---|
| Landing Page | `Landing.tsx` | Página pública de apresentação do produto com animação de partículas |
| Login / Cadastro | `Auth.tsx` | Formulário de login e registro (email + Google OAuth) |
| Esqueci a senha | `ForgotPassword.tsx` | Solicita link de reset por e-mail |
| Redefinir senha | `ResetPassword.tsx` | Formulário com token de reset |
| Acesso Expirado | `AcessoExpirado.tsx` | Página de trial/assinatura expirada com CTA |
| Sobre | `Sobre.tsx` | Página institucional |
| 404 | `NotFound.tsx` | Página não encontrada |

### 9.2 Dashboard

| Aspecto | Detalhe |
|---|---|
| Arquivo | `src/pages/Dashboard.tsx` |
| Propósito | Visão geral da clínica, onboarding, métricas principais |
| Componentes internos | Stories (novidades), TrialTimeline, OnboardingChecklist, StatCards, BarChart (Recharts), AppointmentList |
| Hooks | `useAuth()`, `useOnboarding()`, `useState`, `useMemo`, `useEffect` |
| Estado local | `storyOpen` (number\|null), `welcomeDismissed` (bool), `tick` (number, atualiza a cada 60s) |
| Métricas exibidas | Faturamento do mês, total de pacientes, ticket médio, próximos retornos |
| Bibliotecas | framer-motion, recharts, date-fns, sonner |
| Pendência | `chartData` hardcoded (mock) — deve ser substituído por dados reais |

### 9.3 Agenda

| Aspecto | Detalhe |
|---|---|
| Arquivo | `src/pages/Agenda.tsx` |
| Propósito | Listar, criar, editar e excluir agendamentos do dia |
| Tabela Supabase | `appointments` |
| Hooks | `useCrud<Appointment>()`, `useOnboarding()`, `useState` |
| Estado local | `currentDate`, `modalOpen`, `editing`, `form`, `saving`, `deleteId` |
| Filtro | Filtra por `dateStr` da data selecionada na navegação de calendário |
| Funcionalidades | Navegação por dia, criação rápida, edição inline, exclusão com confirmação |

**Telas complementares de Agenda:**
- `AgendaBloqueios.tsx` — Gerencia bloqueios de horário (férias, indisponibilidades)
- `AgendaLinks.tsx` — Gera links públicos de agendamento online

### 9.4 Pacientes

| Aspecto | Detalhe |
|---|---|
| Arquivo | `src/pages/Pacientes.tsx` |
| Propósito | CRUD de pacientes + busca |
| Tabela Supabase | `patients` |
| Hooks | `useCrud<Patient>()` |
| Funcionalidades | Listagem, busca por nome/e-mail/CPF, criação, edição, exclusão |

**Telas complementares de Pacientes:**
- `NovoAtendimento.tsx` — Prontuário: ficha de atendimento com tipo de pele, procedimentos, histórico de saúde
- `HistoricoProcedimentos.tsx` — Histórico clínico completo do paciente
- `GaleriaEvolucao.tsx` — Galeria de fotos antes/depois (evolução estética)

### 9.5 Financeiro

| Sub-tela | Arquivo | Descrição |
|---|---|---|
| Visão Geral | `Financeiro.tsx` | Dashboard: receitas, despesas, fluxo de caixa, gráfico Recharts |
| Contas a Receber | `ContasReceber.tsx` | CRUD de recebimentos |
| Contas a Pagar | `ContasPagar.tsx` | CRUD de pagamentos |
| Extrato | `ExtratoMovimentacoes.tsx` | Histórico de movimentações financeiras |
| Relatório Competência | `RelatorioCompetencia.tsx` | Relatório por período de competência |
| Fluxo de Caixa Diário | `FluxoCaixaDiario.tsx` | Projeção dia a dia |
| Fluxo de Caixa Mensal | `FluxoCaixaMensal.tsx` | Projeção mês a mês |
| Relatório por Categorias | `RelatorioCategorias.tsx` | Agrupamento por categoria financeira |
| Contas Financeiras | `ContasFinanceiras.tsx` | Bancos, caixas, carteiras |
| Categorias | `CategoriasContas.tsx` | Categorias de receita/despesa |
| Métodos de Pagamento | `MetodosPagamento.tsx` | Configuração de formas de pagamento |
| Maquininha | `IntegracaoMaquininha.tsx` | Integração com maquininha de cartão |
| Vendas | `Vendas.tsx` | Registro e consulta de vendas |

### 9.6 Comissões

| Sub-tela | Arquivo | Descrição |
|---|---|---|
| Visão Geral | `Comissoes.tsx` | Painel de comissões por profissional |
| Em Aberto | `EmAberto.tsx` | Comissões pendentes de pagamento |
| Finalizadas | `Finalizadas.tsx` | Histórico de comissões pagas |
| Tabela de Vendas | `TabelaVendas.tsx` | Regras de comissão por venda |
| Tabela de Atendimento | `TabelaAtendimento.tsx` | Regras de comissão por atendimento |
| Relatório | `RelatorioComissoes.tsx` | Exportação e análise de comissões |

### 9.7 Documentos e Assinatura Digital

| Tela | Arquivo | Descrição |
|---|---|---|
| CliniDocs | `CliniDocs.tsx` | CRUD de modelos de documentos (Fichas, Termos, Contratos, Atestados, Prescrições) |
| Assinatura | `DocumentoAssinatura.tsx` | Workflow de assinatura: envia link por e-mail → paciente assina no celular |
| Conversor | `DocumentosConversor.tsx` | UI para conversão PDF ↔ Word (chama o microserviço FastAPI) |
| Assinar por Token | `AssinarPorToken.tsx` | Tela pública (sem login) para o paciente assinar o documento |

**Fluxo de Assinatura:**
1. Profissional abre documento em `CliniDocs`
2. Solicita assinatura → sistema cria `signature_links` com token UUID e prazo
3. Paciente recebe link por e-mail, acessa `AssinarPorToken`
4. Paciente assina digitalmente (touch/mouse)
5. Edge Function `submit-signature` valida token, salva em `signed_documents`
6. PDF certificado é gerado com hash SHA-256, IP, timestamp e protocolo SENTINEL-{id}

### 9.8 IA e Relatórios

| Tela | Arquivo | Descrição |
|---|---|---|
| Relatórios Personalizados | `RelatoriosPersonalizados.tsx` | Canvas drag-and-drop com React Flow para montar relatórios |
| Templates | `ReportTemplates.tsx` | Biblioteca de templates salvos |
| Chat Lorena | `SensoriAIChat.tsx` | Chat full-page com a IA Lorena |
| Analisador IA | `SensoriAIAnalisador.tsx` | Análise de dados clínicos com IA |
| Config IA | `SensoriAIConfig.tsx` | Configurações de integração (API key, modelo, personalidade) |
| Alertas de Retorno | `AlertasRetorno.tsx` | Configuração e envio de lembretes de retorno para pacientes |

### 9.9 Contatos

| Sub-tela | Arquivo | Descrição |
|---|---|---|
| Profissionais | `Profissionais.tsx` | Cadastro de profissionais da clínica |
| Fornecedores | `Fornecedores.tsx` | Cadastro de fornecedores |
| Leads | `Leads.tsx` | Gestão de leads/prospects |
| Todos os Contatos | `TodosContatos.tsx` | Visão unificada de todos os contatos |
| Aniversariantes | `Aniversariantes.tsx` | Lista de pacientes com aniversário próximo |
| Frequência | `Frequencia.tsx` | Relatório de frequência de retorno dos pacientes |
| Mesclar Contatos | `MesclarContatos.tsx` | Deduplicação de contatos duplicados |
| Convidar Colaboradores | `ConvidarColaboradores.tsx` | Envio de convite para novos usuários da clínica |

### 9.10 Estoque

| Sub-tela | Arquivo | Descrição |
|---|---|---|
| Estoque | `Estoque.tsx` | Controle de produtos e materiais |
| Pedidos | `EstoquePedidos.tsx` | Solicitações de compra |

### 9.11 Configurações

| Sub-tela | Arquivo | Descrição |
|---|---|---|
| Dados da Clínica | `DadosClinica.tsx` | Nome, endereço, telefone, logo |
| Assinatura | `Assinatura.tsx` | Gerenciamento do plano e pagamento |
| Procedimentos | `Procedimentos.tsx` | Catálogo de serviços/procedimentos |
| Categorias de Procedimentos | `CategoriasProcedimentos.tsx` | Agrupamento de procedimentos |
| Pacotes | `Pacotes.tsx` | Pacotes de serviços |
| Salas de Atendimento | `SalasAtendimento.tsx` | Cadastro de salas/consultórios |
| Fichas de Atendimento | `FichasAtendimentos.tsx` | Modelos de fichas customizadas |
| Modelos de Atestados | `ModelosAtestados.tsx` | Templates de atestados médicos |
| Etiquetas | `Etiquetas.tsx` | Tags para categorizar contatos |
| Horários de Funcionamento | `HorariosFuncionamento.tsx` | Dias e horários de atendimento |
| Preferências do Sistema | `PreferenciasSistema.tsx` | Configurações gerais da conta |

---

## 10. Hooks Customizados

### 10.1 `useAuth()` — `src/hooks/useAuth.tsx`

**Assinatura:**
```typescript
const { user, session, profile, userRole, modulos, loading, hasAccess, signOut } = useAuth();
```

**Retorno:**

| Campo | Tipo | Descrição |
|---|---|---|
| `user` | `User \| null` | Objeto de usuário Supabase |
| `session` | `Session \| null` | Sessão JWT ativa |
| `profile` | `Profile \| null` | Dados do perfil (clinic_name, trial, subscription) |
| `userRole` | `'admin' \| 'user' \| null` | Papel do usuário |
| `modulos` | `ModulosPermitidos \| null` | Módulos acessíveis via RBAC |
| `loading` | `boolean` | Estado de carregamento inicial |
| `hasAccess` | `boolean` | Se o usuário tem acesso ativo (ver regra abaixo) |
| `signOut` | `() => void` | Logout |

**Regra de Acesso (`computeHasAccess`):**
```
1. userRole === 'admin'           → TRUE  (admin sempre tem acesso)
2. profile.subscription_active    → TRUE  (assinante ativo)
3. profile.trial_expires_at >= hoje → TRUE  (trial válido)
4. Qualquer outro caso            → FALSE (sem acesso)
```

**Side Effects:**
- `onAuthStateChange` — subscription permanente ao Supabase Auth
- `loadUserData()` — busca profile + role + módulos com Promise.race e timeout de 5 segundos (fallback silencioso)

**Atenção:** O timeout manual em `loadUserData` pode mascarar erros de rede. Considerar implementar retry com backoff.

---

### 10.2 `useCrud<T>()` — `src/hooks/useCrud.ts`

**Assinatura:**
```typescript
const { data, loading, fetch, create, update, remove } = useCrud<T>({
  table: string,
  orderBy?: string,   // padrão: 'created_at'
  ascending?: boolean, // padrão: false
  select?: string,    // padrão: '*'
});
```

**Comportamento:**
- Chama `fetch()` automaticamente ao montar o componente
- `create()` adiciona `user_id: auth.uid()` automaticamente ao payload
- Exibe toast de sucesso/erro em todas as operações
- Retorna `null` (create) ou `false` (update/remove) em caso de erro

**Limitação crítica:** Sem paginação — todas as tabelas são buscadas integralmente. Para tabelas grandes (ex: `appointments`, `sales`), isso pode causar lentidão e alto uso de memória.

---

### 10.3 `useFaturamento()` — `src/hooks/useFaturamento.ts`

**Assinatura:**
```typescript
const { total, topProcedimentos, resumoParaIA, loading, refetch } = useFaturamento(
  dateRange: { from: Date; to: Date },
  patientId?: string
);
```

**Retorno:**

| Campo | Tipo | Descrição |
|---|---|---|
| `total` | `number` | Receita total no período |
| `topProcedimentos` | `ProcedureStats[]` | Top procedimentos com tendência de crescimento |
| `resumoParaIA` | `string` | Texto formatado para contextualizar a Lorena |
| `loading` | `boolean` | Estado de carregamento |
| `refetch` | `() => void` | Forçar recarregamento |

**Cálculo de Tendência:**
- Compara período selecionado vs período anterior de mesma duração
- Calcula `crescimento` em % por procedimento

**Real-time:**
- Subscriptions em `sales` e `appointments` via Supabase Realtime
- **Atenção:** Subscriptions não limpam corretamente no unmount em alguns cenários — pode causar memory leaks.

---

### 10.4 `useReportTemplates()` — `src/hooks/useReportTemplates.ts`

**Assinatura:**
```typescript
const { templates, loading, saveTemplate, updateTemplate, deleteTemplate, loadTemplate, refetch } = useReportTemplates();
```

**Estrutura de Template:**
```typescript
{
  nome: string;
  structure: {
    nodes: Node[];   // Nós do React Flow
    edges: Edge[];   // Conexões entre nós
  };
  config?: {
    logoUrl?: string;
    titulo?: string;
    rodape?: string;
  };
}
```

**Compatibilidade legada:** Suporta fallback para coluna `layout_json` depreciada via `getStructureFromRow()`.

---

### 10.5 `useClinicId()` — `src/hooks/useClinicId.ts`

**Assinatura:**
```typescript
const clinicId = useClinicId(); // string | null
```

- Retorna `clinic_id` da primeira associação em `usuario_clinica`
- Admin retorna `null` (escopo global)
- Usado para isolar dados por clínica nos relatórios

---

### 10.6 `usePatientHistory()` — `src/hooks/usePatientHistory.ts`

**Assinatura:**
```typescript
const { history, loading } = usePatientHistory(patientId: string);
```

- Busca últimos 20 atendimentos do paciente
- Retorna texto em markdown formatado para injeção no contexto da Lorena

---

### 10.7 `useOnboarding()` — `src/hooks/useOnboarding.ts`

**Assinatura:**
```typescript
const { tasks, progress, markTaskDone, claimReward, loading } = useOnboarding();
```

**Tarefas rastreadas:** `agendamento`, `atendimento`, `venda`, `lembretes`, `documento`

- `progress`: porcentagem de conclusão (0–100)
- `markTaskDone(taskName)`: marca tarefa como concluída
- `claimReward()`: marca recompensa como resgatada

---

### 10.8 `useChatIntegration()` — `src/hooks/useChatIntegration.ts`

Gerencia o estado do chat com a Lorena: histórico de mensagens, estado de envio, chamada à Edge Function `lorena-chat`.

---

### 10.9 `useReportConfig()` — `src/hooks/useReportConfig.ts`

Gerencia configurações visuais do relatório (logo, título, rodapé) para o canvas de relatórios personalizados.

---

## 11. Utilitários (src/lib)

### 11.1 `utils.ts`

```typescript
// Combina classes Tailwind com suporte condicional
export function cn(...inputs: ClassValue[]): string
```

### 11.2 `buildReportData.ts`

Converte nós do React Flow em estrutura tipada para o template de PDF:

```typescript
interface ReportData {
  patientHeader: PatientHeaderData | null;
  metrics: MetricBlock | null;
  treatments: ProcedureTableRow[] | null;
  aiInsight: string | null;
  nextSteps: Array<{ label: string; value?: string }>;
}
```

- Calcula idade a partir de `data_nascimento`
- Formata moeda em pt-BR
- Extrai apenas seções preenchidas

### 11.3 `parseCanvasToMedicalData.ts`

Converte nós do canvas para estrutura de dados médicos:

```typescript
interface MedicalReportData {
  metrics: { faturamentoTotal: number; faturamentoFormatado: string };
  procedures: ProcedureTableRow[];
  aiInsight: string;
  nextSteps: Array<{ label: string; value?: string }>;
  patientContext?: { id, nome, email, cpf, dataNascimento, historicoClinico };
}
```

### 11.4 `gerarPdfAssinado.ts`

Fluxo de geração de PDF assinado no cliente:

1. Captura elemento HTML com `html2canvas`
2. Converte para PNG e insere no PDF via `jsPDF`
3. Adiciona imagem da assinatura digital
4. Gera página de certificado com:
   - Protocolo: `SENTINEL-{doc_id}`
   - IP, timestamp, hash SHA-256 (primeiros 16 chars)
5. Suporte a múltiplas páginas

### 11.5 `lorenaChat.ts`

```typescript
// Chama a Edge Function lorena-chat
async function sendMessage(messages: Message[]): Promise<string>
```

- Envia Bearer token do usuário autenticado
- Retorna resposta da Lorena como string

### 11.6 `reportContext.ts`

Extrai contexto de relatório dos nós conectados ao `AINode`:

```typescript
interface ReportContext {
  metadata: { clinica: string; periodo: string; data_geracao: string };
  dados: Record<string, unknown>;
}
```

### 11.7 `templates/clinicTemplates.ts`

Templates pré-definidos de relatório (nós + conexões) para uso inicial sem configuração manual.

---

## 12. Componentes Reutilizáveis

### 12.1 Layout

| Componente | Descrição |
|---|---|
| `AppLayout.tsx` | Wrapper autenticado: header com dropdown de perfil, sidebar, mobile bottom bar, FAB Lorena, FAB WhatsApp |
| `AppSidebar.tsx` | Menu lateral com links de navegação por módulo |
| `BottomTabBar.tsx` | Barra de abas inferior para mobile |
| `NavLink.tsx` | Link de navegação com estado ativo |
| `RouteFallback.tsx` | Skeleton exibido durante lazy loading |

### 12.2 Operações CRUD

| Componente | Descrição |
|---|---|
| `CrudModal.tsx` | Modal genérico para formulários de criação/edição |
| `ConfirmDialog.tsx` | Dialog de confirmação para exclusão |

### 12.3 Editor e Documentos

| Componente | Descrição |
|---|---|
| `EditorWysiwyg.tsx` | Editor rich text com React Quill |
| `SkeletonDoc.tsx` | Skeleton de carregamento de documentos |

### 12.4 IA e Relatórios

| Componente | Descrição |
|---|---|
| `LorenaChat.tsx` | Widget flutuante de chat com a Lorena |
| `canvas/MetricsNode.tsx` | Nó de métricas financeiras no canvas |
| `canvas/TableNode.tsx` | Nó de tabela de procedimentos |
| `canvas/AINode.tsx` | Nó de geração de insight com IA |
| `canvas/GenericNode.tsx` | Nó de texto/dados genérico |
| `canvas/PatientSearchBlock.tsx` | Seletor de paciente para contexto do relatório |
| `canvas/CanvasSidebar.tsx` | Painel lateral do canvas (adicionar nós) |
| `canvas/ReportConfigModal.tsx` | Modal de configuração visual do relatório |

### 12.5 PDF

| Componente | Descrição |
|---|---|
| `pdf/MedicalReportTemplate.tsx` | Layout HTML para impressão/PDF de relatório médico |
| `pdf/ProcedureTable.tsx` | Tabela de procedimentos formatada para PDF |
| `pdf/ReportHeader.tsx` | Cabeçalho do PDF com logo e dados da clínica |

### 12.6 Landing Page

| Componente | Descrição |
|---|---|
| `landing/HeroParticleNetwork.tsx` | Animação de rede de partículas no hero |
| `landing/LandingCursor.tsx` | Cursor personalizado com efeito de rastro |
| `landing/LandingFooter.tsx` | Rodapé da landing page |

---

## 13. Configuração e Variáveis de Ambiente

### 13.1 Frontend (`.env` / `.env.local`)

| Variável | Obrigatório | Descrição |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ Sim | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ Sim | Chave anon/pública do Supabase |
| `VITE_SUPABASE_PROJECT_ID` | ✅ Sim | ID do projeto Supabase |
| `VITE_DOCUMENT_API_URL` | ⚡ Opcional | URL do microserviço FastAPI Python |

### 13.2 Supabase Edge Functions (Secrets)

Configurados via `supabase secrets set`:

| Secret | Obrigatório | Descrição |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Sim | Google AI API key (Gemini) para geração de documentos |
| `OPENAI_API_KEY` | ✅ Sim | API key para chat da Lorena |
| `OPENAI_API_BASE` | ⚡ Opcional | URL base personalizada (para proxies OpenAI-compatíveis) |
| `CHAT_MODEL` | ⚡ Opcional | Modelo de chat (padrão: `gpt-4o-mini`) |

### 13.3 Vite — Configuração de Build (`vite.config.ts`)

- **Alias:** `@` → `./src`
- **Plugin:** `deferMainCss()` — carregamento não-bloqueante do CSS principal
- **Code splitting manual:**
  - Chunk `pdf`: `jspdf`, `html2canvas`
  - Chunk `quill`: `react-quill`
- **Source maps:** Habilitados em produção
- **Minificação:** esbuild
- **Dev server:** Porta 8080, IPv6 (`::`)

### 13.4 Supabase — Configuração (`supabase/config.toml`)

Configuração do CLI Supabase local para desenvolvimento e deploy de funções.

---

## 14. Segurança

### 14.1 Autenticação e Autorização

| Mecanismo | Descrição |
|---|---|
| JWT Supabase | Tokens de sessão com refresh automático; armazenados em localStorage sob a chave `sensoriai-auth` |
| OAuth Google | Login social configurado no Supabase Auth |
| RBAC | Controle de acesso por módulo via `perfis_acesso` + `modulos_permissao` |
| Trial/Subscription | Verificação de `trial_expires_at` e `subscription_active` em tempo real |

### 14.2 Segurança de Dados

| Mecanismo | Descrição |
|---|---|
| Row-Level Security (RLS) | Habilitado em todas as tabelas — usuário só acessa seus próprios dados |
| Isolamento multi-tenant | `usuario_clinica` + `clinic_id` em queries |
| Tokens de assinatura | UUID de uso único com prazo de expiração |
| Auditoria de assinatura | Hash SHA-256, IP, timestamp, protocolo SENTINEL-{id} |

### 14.3 Vulnerabilidades Identificadas

| Severidade | Local | Descrição | Recomendação |
|---|---|---|---|
| 🔴 Alta | `backend/main.py:24` | `CORS allow_origins=["*"]` — aceita qualquer origem | Restringir ao domínio do frontend em produção |
| 🟡 Média | Edge Functions | Sem rate limiting — `lorena-chat` pode ser abusado | Implementar rate limit por `auth.uid()` |
| 🟡 Média | `backend/main.py:32` | `temp_files/` sem limpeza periódica | Cron job para limpar arquivos > 1h |
| 🟡 Média | `AppLayout.tsx` | Link WhatsApp hardcoded: `wa.me/5511999990000` | Mover para configuração da clínica |
| 🟢 Baixa | `useAuth.tsx:118` | Timeout de 5s silencia erros de rede | Adicionar logging de falha no timeout |

---

## 15. Padrões Arquiteturais

### 15.1 Multi-Tenancy

```
auth.users → usuario_clinica → clinic_id
                              ↓
              Todas as queries são filtradas por clinic_id
              (com exceção de admins, que têm escopo global)
```

### 15.2 Modelo de Acesso (Freemium)

```
Usuário autentica
    ↓
computeHasAccess()
    ├── Admin?           → Acesso total
    ├── Assinatura ativa? → Acesso total
    ├── Trial válido?    → Acesso total
    └── Nenhum dos acima → /acesso-expirado
```

### 15.3 Padrão de CRUD Genérico

Toda entidade de dados usa `useCrud<T>({ table })` como camada de acesso ao Supabase, centralizando:
- Fetch automático no mount
- Adição de `user_id` em creates
- Toasts de feedback
- Loading state

### 15.4 Canvas de Relatórios (React Flow)

```
Nó Métricas ──┐
Nó Tabela    ──┼──→ AINode ──→ Gemini → Insight
Nó Paciente ──┘

Salvar → report_templates (nodes[] + edges[] em JSON)
Gerar PDF → parseCanvasToMedicalData() → buildReportData() → MedicalReportTemplate → jsPDF
```

### 15.5 Assinatura Digital

```
CliniDocs → cria signature_link (token UUID + expires_at)
    ↓ e-mail para paciente
AssinarPorToken (público) → paciente assina (canvas touch)
    ↓
Edge Function submit-signature
    → valida token
    → salva signed_documents (hash + IP + timestamp)
    → marca link como used=true
    ↓
FastAPI generate/signed-pdf → PDF certificado com SENTINEL-{id}
```

### 15.6 Lazy Loading de Rotas

Todas as 60+ páginas são importadas com `React.lazy()` e envolvidas em `<Suspense>` com o componente `RouteFallback`. Isso garante que o bundle inicial seja menor, carregando cada página sob demanda.

---

## 16. Testes

### 16.1 Estado Atual

| Métrica | Valor |
|---|---|
| Framework | Vitest 3.2.4 |
| Cobertura total | **~0%** (apenas 2 testes de exemplo) |
| Arquivo | `src/test/example.test.ts` |

**Comando:**
```bash
npm run test
```

### 16.2 Prioridade de Implementação

| Módulo | Prioridade | Justificativa |
|---|---|---|
| `useAuth.tsx` — `computeHasAccess()` | 🔴 Crítica | Controla acesso à plataforma inteira |
| `backend/main.py` | 🔴 Crítica | Conversão de documentos é crítica para o fluxo de assinatura |
| `useCrud.ts` | 🟠 Alta | Usado por todas as páginas |
| `useFaturamento.ts` | 🟠 Alta | Base das métricas financeiras |
| `lib/buildReportData.ts` | 🟡 Média | Lógica complexa de transformação de dados |
| `lib/gerarPdfAssinado.ts` | 🟡 Média | Fluxo legal de assinatura digital |

---

## 17. Débito Técnico e Code Smells

| Arquivo | Linha | Problema | Impacto |
|---|---|---|---|
| `src/hooks/useAuth.tsx` | 118–137 | `Promise.race` com timeout manual mascara erros | Bugs silenciosos em produção |
| `src/hooks/useCrud.ts` | 18–24 | Sem paginação — fetch completo da tabela | Performance degradada com volume |
| `src/hooks/useFaturamento.ts` | 127–157 | Subscriptions Realtime não limpam corretamente | Potencial memory leak |
| `src/pages/Dashboard.tsx` | 16–22 | `chartData` hardcoded (dados mockados) | Dashboard não reflete realidade |
| `backend/main.py` | 24 | `CORS allow_origins=["*"]` | Vulnerabilidade de segurança |
| `backend/main.py` | 32–34 | `temp_files/` sem limpeza automática | Acúmulo de arquivos em disco |
| `src/App.tsx` | 11–82 | 72 imports lazy sem code splitting por domínio | Bundle pouco otimizado |
| `src/hooks/useReportTemplates.ts` | 42 | Suporte a `layout_json` (legado) | Complexidade desnecessária |
| `src/components/AppLayout.tsx` | — | Link WhatsApp hardcoded | Não configurável por clínica |

### 17.1 Itens de Refatoração Prioritária

1. **Migrar `layout_json` → `structure`** (breaking change) — eliminar fallback legado
2. **Adicionar paginação ao `useCrud`** — `range(offset, limit)` na query Supabase
3. **Implementar limpeza de `temp_files`** — cron job no servidor Python
4. **Configurar CORS restritivo** — `allow_origins=[FRONTEND_URL]` em produção
5. **Substituir chartData mock** no Dashboard por query real
6. **Corrigir cleanup de subscriptions Realtime** em `useFaturamento`
7. **Mover link WhatsApp** para `clinica_config` no banco de dados

---

## 18. Escalabilidade e Riscos

| Componente | Risco | Recomendação |
|---|---|---|
| `useCrud` sem paginação | Tabelas grandes (`appointments`, `sales`) podem travar a UI | Implementar paginação com `range()` do Supabase |
| Supabase Realtime | Múltiplas subscriptions por componente podem saturar WebSocket (limite ~200 por projeto) | Consolidar subscriptions em um único hook global |
| FastAPI single-thread | Conversão de PDF é operação bloqueante — sob carga, pode travar requisições | Usar `BackgroundTasks` do FastAPI ou Celery |
| Edge Functions sem rate limit | `lorena-chat` pode ser abusado por bots ou usuários mal-intencionados | Rate limit por `auth.uid()` via tabela de contagem |
| Frontend sem Service Worker | Sem suporte offline; cada refresh busca dados do zero | Implementar cache com Workbox |
| Storage de assinaturas | Assinaturas em base64 no banco podem crescer rapidamente | Mover para Supabase Storage (bucket privado) |

---

## 19. Deploy e Infraestrutura

### 19.1 Frontend

```bash
# Build de produção
npm run build      # Gera dist/
npm run preview    # Testa build localmente

# Deploy recomendado: Vercel ou Netlify
# Apontar domínio customizado e configurar variáveis de ambiente
```

### 19.2 Backend Python

```bash
# Desenvolvimento
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Produção (Linux)
# Requer LibreOffice instalado para word-to-pdf
sudo apt-get install libreoffice
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 19.3 Supabase

```bash
# Setup inicial
supabase login
supabase link --project-ref <PROJECT_ID>
supabase db push                          # Aplica migrações
supabase functions deploy lorena-chat     # Deploy de cada Edge Function
supabase secrets set GEMINI_API_KEY=...   # Configurar secrets
```

### 19.4 Requisitos de Infraestrutura

| Serviço | Plano Mínimo Recomendado |
|---|---|
| Supabase | Pro (para Realtime + Edge Functions em produção) |
| FastAPI | VPS com 1GB RAM + LibreOffice instalado |
| Frontend | Vercel Free ou Netlify Free |
| Gemini API | Pay-per-use (Google AI Studio) |

---

## 20. Glossário

| Termo | Definição |
|---|---|
| **Lorena** | Assistente de IA da plataforma, especializada em contexto clínico |
| **Trial** | Período de avaliação gratuita controlado por `trial_expires_at` |
| **SensoriAI** | Nome da plataforma SaaS |
| **RLS** | Row-Level Security — política de segurança do PostgreSQL por linha |
| **RBAC** | Role-Based Access Control — controle de acesso baseado em papéis |
| **BaaS** | Backend as a Service — Supabase neste contexto |
| **Edge Function** | Função serverless Deno executada no Supabase |
| **Canvas** | Editor visual drag-and-drop para montar relatórios (React Flow) |
| **SENTINEL** | Prefixo do protocolo de auditoria de documentos assinados |
| **Nó (Node)** | Bloco funcional no canvas de relatórios (métricas, tabela, IA, genérico) |
| **Multi-tenant** | Arquitetura onde múltiplas clínicas compartilham a mesma instância com dados isolados |
| **useCrud** | Hook genérico que abstrai operações CRUD para qualquer tabela Supabase |
| **Subscription** | Assinatura Realtime do Supabase que ouve mudanças em tempo real no banco |
| **Signed PDF** | PDF com certificado de assinatura digital, hash de integridade e metadados de auditoria |

---

*Próxima Revisão: Julho 2026*  
*Status: Pronto para Handover / Auditoria*
