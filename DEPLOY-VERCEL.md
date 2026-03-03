# Deploy na Vercel

O projeto está pronto para deploy na Vercel (Vite + React + React Router).

## O que já está configurado

- **vercel.json** – rewrite para SPA: rotas como `/dashboard`, `/auth`, `/sobre` etc. servem `index.html` e o React Router cuida do restante.
- **Build** – a Vercel detecta Vite e usa `npm run build` → saída em `dist/`.

## Variáveis de ambiente na Vercel

No painel do projeto na Vercel: **Settings → Environment Variables**. Use os mesmos nomes do seu `.env`:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Sim | Chave anônima (public) do Supabase |
| `VITE_SUPABASE_PROJECT_ID` | Opcional | ID do projeto (se você usar em algum lugar) |
| `VITE_DOCUMENT_API_URL` | Opcional | URL do backend do conversor PDF/Word (se usar) |

**Importante:** no Supabase, em **Authentication → URL Configuration**, adicione a URL da Vercel em **Redirect URLs** (ex.: `https://seu-projeto.vercel.app/**`).

## Como fazer o deploy

1. Conecte o repositório Git ao projeto na Vercel (ou use `vercel` no terminal).
2. Configure as variáveis acima.
3. Deploy automático a cada push na branch configurada (ex.: `main`).

Se usar apenas o front e o Supabase, não é necessário configurar servidor; a Vercel serve o `dist/` como estático.
