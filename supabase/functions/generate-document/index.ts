import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY não configurada. Defina no Supabase Edge Function secrets." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { titulo, tipo } = await req.json();
    const tipoLabel = { ficha: "Ficha", termo: "Termo", contrato: "Contrato", atestado: "Atestado", prescricao: "Prescrição" }[tipo] || tipo;

    const systemInstruction = `Você é um assistente especializado em gestão clínica e documentos jurídicos de saúde. Sua tarefa é gerar modelos de documentos formais. Use placeholders no formato {{nome_paciente}}, {{data}}, {{cpf}}, {{procedimento}}, {{nome_profissional}}. Use estilos inline quando útil (ex: color: #9b87f5 para títulos). Responda APENAS com o HTML do documento, sem comentários nem explicações.`;

    const userPrompt = `Gere um modelo de documento do tipo "${tipoLabel}" com o título "${titulo || tipoLabel}". O documento deve ser profissional, em HTML, com placeholders {{nome_paciente}}, {{data}}, {{cpf}}, {{procedimento}}, {{nome_profissional}} onde aplicável. Retorne somente o HTML.`;

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ error: "Erro ao chamar Gemini", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      return new Response(
        JSON.stringify({ error: "Resposta vazia do Gemini", raw: data }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ content: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
