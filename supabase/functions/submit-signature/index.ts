import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { token, signatureBase64, patientName, ip, userAgent } = body;
    if (!token || !signatureBase64) {
      return new Response(
        JSON.stringify({ error: "Token e assinatura são obrigatórios" }),
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
      .select("id, user_id, document_id, used_at, expires_at")
      .eq("token", token)
      .single();

    if (linkError || !link) {
      return new Response(
        JSON.stringify({ error: "Link inválido" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (link.used_at) {
      return new Response(
        JSON.stringify({ error: "Este link já foi utilizado" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (link.expires_at < new Date().toISOString()) {
      return new Response(
        JSON.stringify({ error: "Link expirado" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: doc } = await supabase
      .from("clinic_documents")
      .select("content")
      .eq("id", link.document_id)
      .single();

    const { data: inserted, error: insertError } = await supabase
      .from("signed_documents")
      .insert({
        user_id: link.user_id,
        document_id: link.document_id,
        patient_name: patientName || null,
        original_content: (doc as { content?: string } | null)?.content ?? "",
        signature_image_base64: signatureBase64,
        signed_at: new Date().toISOString(),
        ip_address: ip || null,
        user_agent: userAgent || null,
        status: "SIGNED",
      })
      .select("id")
      .single();

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabase.from("signature_links").update({ used_at: new Date().toISOString() }).eq("id", link.id);

    return new Response(
      JSON.stringify({ signedId: (inserted as { id: string }).id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
