-- Trial de 3 dias e assinatura ativa para novos usuários
-- Regra: acesso permitido se (trial_expires_at >= now() OR subscription_active = true)

-- 1) Novos campos em profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN NOT NULL DEFAULT false;

-- 2) Backfill: perfis existentes sem trial_expires_at recebem created_at + 3 dias (ficam expirados)
--    Para manter acesso a usuários já existentes, rode: UPDATE profiles SET subscription_active = true WHERE ...
UPDATE public.profiles
SET trial_expires_at = created_at + interval '3 days'
WHERE trial_expires_at IS NULL;

-- Garantir que nenhum perfil fique com trial_expires_at nulo (novos inserts virão do trigger)
ALTER TABLE public.profiles
  ALTER COLUMN trial_expires_at SET DEFAULT (now() + interval '3 days');

-- 3) Função para RLS: retorna true se o usuário tem acesso (trial válido ou assinatura ativa)
CREATE OR REPLACE FUNCTION public.has_active_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT (p.trial_expires_at >= now() OR p.subscription_active)
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      LIMIT 1
    ),
    false
  );
$$;

-- 4) Trigger: ao criar novo usuário, definir trial_expires_at = now() + 3 dias
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url, trial_expires_at, subscription_active)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.email
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    now() + interval '3 days',
    false
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  INSERT INTO public.users_onboarding (user_id) VALUES (NEW.id);
  RETURN NEW;
END; $$;

-- 5) RLS: restringir acesso aos dados quando trial expirado (403 / vazio)
--    Perfis: mantemos SELECT sem has_active_access para o front ler trial_expires_at e mostrar paywall
--    Demais tabelas: exigir has_active_access() para SELECT/INSERT/UPDATE/DELETE

-- procedure_categories
DROP POLICY IF EXISTS "procedure_categories_own" ON public.procedure_categories;
CREATE POLICY "procedure_categories_own" ON public.procedure_categories FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- procedures
DROP POLICY IF EXISTS "procedures_own" ON public.procedures;
CREATE POLICY "procedures_own" ON public.procedures FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- patients
DROP POLICY IF EXISTS "patients_own" ON public.patients;
CREATE POLICY "patients_own" ON public.patients FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- professionals
DROP POLICY IF EXISTS "professionals_own" ON public.professionals;
CREATE POLICY "professionals_own" ON public.professionals FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- suppliers
DROP POLICY IF EXISTS "suppliers_own" ON public.suppliers;
CREATE POLICY "suppliers_own" ON public.suppliers FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- leads
DROP POLICY IF EXISTS "leads_own" ON public.leads;
CREATE POLICY "leads_own" ON public.leads FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- financial_categories
DROP POLICY IF EXISTS "financial_categories_own" ON public.financial_categories;
CREATE POLICY "financial_categories_own" ON public.financial_categories FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- accounts_receivable
DROP POLICY IF EXISTS "accounts_receivable_own" ON public.accounts_receivable;
CREATE POLICY "accounts_receivable_own" ON public.accounts_receivable FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- accounts_payable
DROP POLICY IF EXISTS "accounts_payable_own" ON public.accounts_payable;
CREATE POLICY "accounts_payable_own" ON public.accounts_payable FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- financial_accounts
DROP POLICY IF EXISTS "financial_accounts_own" ON public.financial_accounts;
CREATE POLICY "financial_accounts_own" ON public.financial_accounts FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- payment_methods
DROP POLICY IF EXISTS "payment_methods_own" ON public.payment_methods;
CREATE POLICY "payment_methods_own" ON public.payment_methods FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- rooms
DROP POLICY IF EXISTS "rooms_own" ON public.rooms;
CREATE POLICY "rooms_own" ON public.rooms FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- schedule_blocks
DROP POLICY IF EXISTS "schedule_blocks_own" ON public.schedule_blocks;
CREATE POLICY "schedule_blocks_own" ON public.schedule_blocks FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- booking_links
DROP POLICY IF EXISTS "booking_links_own" ON public.booking_links;
CREATE POLICY "booking_links_own" ON public.booking_links FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- products
DROP POLICY IF EXISTS "products_own" ON public.products;
CREATE POLICY "products_own" ON public.products FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- sales
DROP POLICY IF EXISTS "sales_own" ON public.sales;
CREATE POLICY "sales_own" ON public.sales FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- appointments
DROP POLICY IF EXISTS "appointments_own" ON public.appointments;
CREATE POLICY "appointments_own" ON public.appointments FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- packages
DROP POLICY IF EXISTS "packages_own" ON public.packages;
CREATE POLICY "packages_own" ON public.packages FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- attendance_forms
DROP POLICY IF EXISTS "attendance_forms_own" ON public.attendance_forms;
CREATE POLICY "attendance_forms_own" ON public.attendance_forms FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- certificate_models
DROP POLICY IF EXISTS "certificate_models_own" ON public.certificate_models;
CREATE POLICY "certificate_models_own" ON public.certificate_models FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- tags
DROP POLICY IF EXISTS "tags_own" ON public.tags;
CREATE POLICY "tags_own" ON public.tags FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- business_hours
DROP POLICY IF EXISTS "business_hours_own" ON public.business_hours;
CREATE POLICY "business_hours_own" ON public.business_hours FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- stock_orders
DROP POLICY IF EXISTS "stock_orders_own" ON public.stock_orders;
CREATE POLICY "stock_orders_own" ON public.stock_orders FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- clinic_documents
DROP POLICY IF EXISTS "clinic_documents_own" ON public.clinic_documents;
CREATE POLICY "clinic_documents_own" ON public.clinic_documents FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- commission_rates_sales
DROP POLICY IF EXISTS "commission_rates_sales_own" ON public.commission_rates_sales;
CREATE POLICY "commission_rates_sales_own" ON public.commission_rates_sales FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- commission_rates_attendance
DROP POLICY IF EXISTS "commission_rates_attendance_own" ON public.commission_rates_attendance;
CREATE POLICY "commission_rates_attendance_own" ON public.commission_rates_attendance FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- contacts
DROP POLICY IF EXISTS "contacts_own" ON public.contacts;
CREATE POLICY "contacts_own" ON public.contacts FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- signed_documents
DROP POLICY IF EXISTS "signed_documents_own" ON public.signed_documents;
CREATE POLICY "signed_documents_own" ON public.signed_documents FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());

-- signature_links
DROP POLICY IF EXISTS "signature_links_own" ON public.signature_links;
CREATE POLICY "signature_links_own" ON public.signature_links FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.has_active_access()) WITH CHECK (user_id = auth.uid() AND public.has_active_access());
