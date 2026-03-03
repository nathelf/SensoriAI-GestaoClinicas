import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";

type Msg = { role: "user" | "assistant"; content: string };

function toGeminiContents(messages: Msg[]) {
  // Gemini: contents[] com role user/model e parts[{text}]
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.content ?? "") }],
  }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200, headers: corsHeaders });

  try {
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY não configurada nas secrets do Supabase." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const messages: Msg[] = Array.isArray(body?.messages) ? body.messages : [];

    const system = `Você é a Anna, assistente virtual inteligente da SensoriAI — uma plataforma SaaS para clínicas de estética.

Personalidade:
- Simpática, profissional e empática
- Português brasileiro natural
- Emojis com moderação

Capacidades:
- Ajudar o usuário a entender o sistema (Agenda, Atendimento, Financeiro, Estoque, Comissões, Contatos, Configurações e SensoriAI Lab)
- Guiar onboarding com próximos passos

Regras:
- Respostas curtas (máximo 3 parágrafos)
- Sempre sugerir próximos passos no final`;

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(
        GEMINI_API_KEY
      )}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: toGeminiContents(messages),
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      console.error("Gemini error:", resp.status, t);
      return new Response(JSON.stringify({ error: "Erro no Gemini", details: t.slice(0, 500) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join("") ?? "";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("anna-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});