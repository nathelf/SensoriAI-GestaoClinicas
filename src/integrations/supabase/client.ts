// src/integrations/supabase/client.ts
// This file creates the SINGLE Supabase client instance for the entire frontend.
// Do not create another createClient() anywhere else in the app.
//
// Variáveis: VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.
// A chave deve ser a "anon" (public) do Supabase: Dashboard do projeto →
// Settings → API → Project API keys → anon public (JWT que começa com eyJ).

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string)?.trim() || "";
const SUPABASE_PUBLISHABLE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string)?.trim() || "";

export const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

const authOptions = {
  storageKey: "sensoriai-auth",
  storage: localStorage,
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
} as const;

export const supabase = hasSupabaseConfig
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: authOptions })
  : createClient<Database>("https://placeholder.supabase.co", "placeholder-key", { auth: authOptions });