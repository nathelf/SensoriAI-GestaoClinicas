# Configuração do Supabase - SensoriAI

## 1. Variáveis de ambiente (já configuradas)

O arquivo `.env` foi atualizado com seu projeto:

- **URL:** https://qdolsrosokpbclmtfjgh.supabase.co  
- **Chave (Publishable key):** configurada em `VITE_SUPABASE_PUBLISHABLE_KEY`

Se o login não funcionar, use a **chave anon/public** no lugar da Publishable key:

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard) → seu projeto  
2. **Project Settings** (ícone de engrenagem) → **API**  
3. Em **Project API keys**, copie a chave **anon** (public)  
4. Cole no `.env` em `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 2. Criar o banco de dados (tabelas e políticas)

Você pode fazer de um destes jeitos:

### Opção A – SQL Editor (recomendado)

1. Acesse o projeto: https://supabase.com/dashboard/project/qdolsrosokpbclmtfjgh  
2. No menu lateral, abra **SQL Editor**  
3. Clique em **New query**  
4. Abra o arquivo `supabase/init-database.sql` deste repositório  
5. Copie todo o conteúdo e cole no editor  
6. Clique em **Run** (ou Ctrl+Enter)

Se aparecer erro de “já existe” (por exemplo, tipo `app_role` ou tabela), ignore essa parte ou execute só os trechos que ainda não rodaram.

### Opção B – Supabase CLI

Se tiver o [Supabase CLI](https://supabase.com/docs/guides/cli) instalado e logado:

```bash
# Vincular ao projeto (só uma vez)
supabase link --project-ref qdolsrosokpbclmtfjgh

# Aplicar todas as migrations
supabase db push
```

---

## 3. Autenticação (Auth)

1. No dashboard: **Authentication** → **Providers**  
2. **Email:** já habilitado por padrão  
3. **Google (opcional):** ative e preencha Client ID e Client Secret do [Google Cloud Console](https://console.cloud.google.com/apis/credentials)  
4. Em **URL Configuration**, confira:
   - **Site URL:** a URL do seu app (ex.: `http://localhost:8080` em dev)  
   - **Redirect URLs:** inclua a mesma URL (ex.: `http://localhost:8080`)

---

## 3.1. Documentos e Termos (se aparecer "Erro ao criar")

Se ao criar ou editar um documento aparecer **"Erro ao criar"** e no console: `Could not find the 'is_template' column`:

1. Abra o **SQL Editor** no Supabase.
2. Execute:

```sql
ALTER TABLE public.clinic_documents ADD COLUMN IF NOT EXISTS is_template BOOLEAN NOT NULL DEFAULT false;
```

3. Depois rode de novo a criação do documento.

---

## 4. Chat da Anna (Edge Function)

Para o chat usar IA:

1. **Edge Functions** → **anna-chat** → **Secrets**  
2. Crie o secret **OPENAI_API_KEY** com sua chave de uma API compatível com OpenAI (OpenAI, Together, Groq, etc.)  
3. Opcional: **OPENAI_API_BASE** (URL base) e **CHAT_MODEL** (modelo)

## 4.1. Documentos – Gerar com IA (Edge Function generate-document)

Para o botão **"Gerar com IA"** em Documentos e Termos:

1. **Edge Functions** → **generate-document** → **Secrets**  
2. Crie o secret **GEMINI_API_KEY** com sua chave do [Google AI Studio](https://aistudio.google.com/).  
3. Faça o deploy da função (Supabase CLI: `supabase functions deploy generate-document`).

Se aparecer **erro de CORS** ao gerar com IA no navegador, confira se a Edge Function está deployada e se a **Site URL** em **Authentication** → **URL Configuration** inclui sua origem (ex.: `http://localhost:8080`).

---

## 5. Conversor de Documentos (Backend Python – opcional)

Para **conversão PDF ↔ Word** com alta fidelidade (tabelas, formatação), use o microserviço em Python:

1. Entre na pasta **backend**: `cd backend`
2. Crie e ative o ambiente virtual: `python -m venv venv` e depois `.\venv\Scripts\activate` (Windows) ou `source venv/bin/activate` (Mac/Linux)
3. Instale as dependências: `pip install -r requirements.txt`
4. Inicie o serviço: `uvicorn main:app --reload --port 8000`
5. No **.env** do frontend, adicione: `VITE_DOCUMENT_API_URL=http://localhost:8000`

Detalhes e requisitos (ex.: LibreOffice para Word→PDF no Linux) estão em **backend/README.md**.

---

## 5. Testar

1. Rode o app: `npm run dev`  
2. Acesse a tela de login e crie uma conta ou entre com e-mail/senha  
3. Após o login, o app deve carregar dados (pacientes, procedimentos, etc.) do Supabase

Se algo falhar, confira o **Browser Console** (F12) e, no Supabase, **Logs** (Authentication e API).
