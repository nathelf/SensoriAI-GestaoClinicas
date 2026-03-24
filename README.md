# SensoriAI - Gestão para Clínicas

Plataforma SaaS para gestão de clínicas: agenda, prontuário eletrônico, financeiro e IA integrada. Aplicável a qualquer segmento (médico, odontológico, terapêutico, entre outros).

## Tecnologias

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## Desenvolvimento local

Requisitos: Node.js e npm ([instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
git clone <URL_DO_REPOSITORIO>
cd SensoriAI-GestaoClinicas
npm i
npm run dev
```

## Variáveis de ambiente

- **Supabase**: configure no projeto Supabase (URL e anon key no frontend).
- **Anna (chat IA)**: na Edge Function `anna-chat`, defina os secrets:
  - `OPENAI_API_KEY` – chave de uma API compatível com OpenAI (OpenAI, Together, Groq, etc.).
  - `OPENAI_API_BASE` (opcional) – URL base da API, ex: `https://api.openai.com` ou `https://api.together.xyz`.
  - `CHAT_MODEL` (opcional) – modelo a usar, ex: `gpt-4o-mini`.

## Scripts

- `npm run dev` – servidor de desenvolvimento
- `npm run build` – build de produção
- `npm run preview` – pré-visualização do build
- `npm run lint` – ESLint
- `npm run test` – testes
