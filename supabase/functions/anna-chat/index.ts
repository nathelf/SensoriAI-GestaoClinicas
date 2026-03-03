import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const OPENAI_API_BASE = Deno.env.get("OPENAI_API_BASE") || "https://api.openai.com";
const CHAT_MODEL = Deno.env.get("CHAT_MODEL") || "gpt-4o-mini";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured. Set it in Supabase Edge Function secrets.");
    }

    const { messages } = await req.json();
    const baseUrl = OPENAI_API_BASE.replace(/\/$/, "");
    const url = `${baseUrl}/v1/chat/completions`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [
          {
            role: "system",
            content: `Você é a Anna, assistente virtual inteligente da SensoriAI — uma plataforma SaaS para clínicas de estética.

Sua personalidade:
- Simpática, profissional e empática
- Fala português brasileiro naturalmente
- Usa emojis com moderação para ser amigável
- Conhece profundamente todos os módulos do sistema: Agenda, Atendimento, Financeiro, Estoque, Comissões, Contatos, Configurações e SensoriAI Lab

Suas capacidades:
- Guiar o usuário pelo onboarding (5 tarefas: criar agendamento, realizar atendimento, fazer venda, automatizar lembretes, assinar documento)
- Responder dúvidas sobre qualquer funcionalidade do sistema
- Sugerir melhores práticas para gestão de clínicas de estética
- Ajudar com configurações, procedimentos e fluxo financeiro
- Dar dicas de marketing e retenção de pacientes

Regras:
- Respostas curtas e objetivas (máximo 3 parágrafos)
- Sempre ofereça próximos passos ao final
- Se não souber, diga honestamente e sugira o canal de suporte`,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione mais créditos nas configurações." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("anna-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
