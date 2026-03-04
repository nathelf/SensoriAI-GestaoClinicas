import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClientUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseClientUrl || !supabaseServiceKey) {
      throw new Error("Variáveis de ambiente do Supabase não configuradas.");
    }

    const supabaseAdmin = createClient(supabaseClientUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const authHeader = req.headers.get("Authorization")!;
    if (!authHeader) throw new Error("Token de autorização ausente.");

    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !user) throw new Error("Erro ao validar token do usuário.");

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !roleData || roleData.role !== "admin") {
      return new Response(JSON.stringify({ error: "Acesso negado. Apenas admins." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { targetUserId, action, payload } = body;

    // AÇÕES DE CRIAÇÃO (não precisam de targetUserId previamente)
    if (action === "create-user") {
      const { email, password, display_name, clinica_id, role_id } = payload;
      if (!email || !password) throw new Error("Email e senha obrigatórios");

      const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name }
      });

      if (createError) throw new Error(`Erro Auth: ${createError.message}`);

      // Se passou clínica e perfil, vincula direto (Útil pra Super Admin jogando user num Tenant específico)
      if (clinica_id && role_id) {
        // O trigger de banco de dados cria uma clínica dummy, então deletamos ela baseado no owner_id gerado
        await supabaseAdmin.from("clinica_config").delete().eq("owner_id", createdUser.user.id);

        await supabaseAdmin.from("usuario_clinica").insert({
          user_id: createdUser.user.id,
          clinica_id: clinica_id,
          perfil_acesso_id: role_id
        });
      }

      return new Response(JSON.stringify({ success: true, user_id: createdUser.user.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // AÇÕES DE MANUTENÇÃO (precisam de targetUserId)
    if (!targetUserId) throw new Error("Parâmetro targetUserId é obrigatório para esta ação.");

    if (action === "update-email") {
      const { email } = payload;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, { email, email_confirm: true });
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update-password") {
      const { password } = payload;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, { password });
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "toggle-suspend") {
      const { is_suspended } = payload;
      // Baniu por 100 anos ou removeu banimento
      const banDuration = is_suspended ? "876000h" : "none";
      const { error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, { ban_duration: banDuration });
      if (error) throw new Error(`Erro ao suspender no Auth: ${error.message}`);

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "delete-user") {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("Ação não reconhecida.");
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
