# Checklist antes do deploy (Vercel)

## 1. Variáveis de ambiente no Vercel
No painel do projeto → **Settings → Environment Variables**, defina:
- `VITE_SUPABASE_URL` — URL do projeto (ex.: `https://xxx.supabase.co`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` — chave **anon public** (Dashboard Supabase → Settings → API)

Sem isso o app pode carregar mas login/banco não funcionam.

---

## 2. Migrations no Supabase
Se você usa trial e onboarding, rode no **SQL Editor** do Supabase (na ordem):
- `supabase/migrations/20260303200000_trial_subscription.sql` (trial + RLS)

Depois, para **usuários já existentes** que devem seguir com acesso:
```sql
UPDATE public.profiles SET subscription_active = true;
```
(opcional; sem isso quem já existia fica com trial “expirado”)

---

## 3. Build local antes de dar deploy
```bash
npm run build
npm run preview
```
Abra o endereço que o `preview` mostrar e teste:
- Página inicial
- Login
- Uma tela logada (ex.: dashboard)

Se aparecer tela em branco ou erro no console (ex.: `forwardRef`), o mesmo tende a acontecer na Vercel.

---

## 4. Possíveis erros depois do deploy

| Problema | O que verificar |
|----------|------------------|
| Tela em branco + `forwardRef` no console | Build está com lucide-react no chunk "react". Se voltar, avise para ajustarmos. |
| Login não funciona / "Tempo esgotado" | Variáveis `VITE_SUPABASE_*` na Vercel e projeto Supabase ativo. |
| Após login, redireciona para "Acesso expirado" | Migration do trial aplicada? Se for usuário antigo, rodar `UPDATE profiles SET subscription_active = true`. |
| 403 ou dados vazios no app | RLS com `has_active_access()`: conferir se a migration do trial foi executada. |

---

## 5. vercel.json
Já está ok: `buildCommand`, `outputDirectory: "dist"`, `rewrites` para SPA.
