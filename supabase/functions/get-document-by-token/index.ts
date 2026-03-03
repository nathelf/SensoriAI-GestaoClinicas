import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || (await req.json().then((b) => b?.token).catch(() => null));
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: link, error: linkError } = await supabase
      .from("signature_links")
      .select("id, document_id, expires_at, used_at")
      .eq("token", token)
      .single();

    if (linkError || !link) {
      return new Response(
        JSON.stringify({ error: "Link inválido ou expirado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString();
    if (link.used_at) {
      return new Response(
        JSON.stringify({ error: "Este link já foi utilizado" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (link.expires_at < now) {
      return new Response(
        JSON.stringify({ error: "Link expirado" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: doc, error: docError } = await supabase
      .from("clinic_documents")
      .select("id, title, document_type, content")
      .eq("id", link.document_id)
      .single();

    if (docError || !doc) {
      return new Response(
        JSON.stringify({ error: "Documento não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ document_id: doc.id, title: doc.title, document_type: doc.document_type, content: doc.content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
